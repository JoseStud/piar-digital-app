/**
 * Workflow state machine for the `/diligenciar` route.
 *
 * Owns the three-mode state machine: `start` (landing/upload),
 * `restore-prompt` (saved-draft confirmation), and `form` (the
 * long-form editor). Holds the canonical PIARFormDataV2 in state,
 * mirrors it through `formDataRef` so unload-time flushes can read the
 * latest data without re-rendering, and exposes the callbacks used by
 * `PiarHomePage`.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import type {
  PIARImportSuccess,
  PIARImportWarning,
} from '@piar-digital-app/features/piar/lib/portable/piar-import';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

type Mode = 'start' | 'restore-prompt' | 'form';

interface ClearDialogMessage {
  tone: 'default' | 'error';
  text: string;
}

function buildDataCorrectionNotice(
  source: 'importacion' | 'restauracion',
  warnings: readonly PIARImportWarning[],
): string | null {
  if (warnings.length === 0) {
    return null;
  }

  const noun = warnings.length === 1 ? 'ajuste' : 'ajustes';
  const sourceLabel = source === 'importacion' ? 'importación' : 'restauración';
  return `La ${sourceLabel} corrigió ${warnings.length} ${noun} en los datos. Se conservaron los valores válidos y el resto volvió a los valores predeterminados.`;
}

function getDocxTemplateSourceName(docxTemplate?: PIARDocxTemplateSource): string | null {
  const sourceName = docxTemplate?.sourceName.trim();
  return sourceName ? sourceName : null;
}

function loadFormWorkspace() {
  return import('@piar-digital-app/features/piar/screens/FormWorkspace').then((mod) => ({ default: mod.FormWorkspace }));
}

export interface UsePiarWorkflowOptions {
  docxTemplate?: PIARDocxTemplateSource;
}

export interface UsePiarWorkflowResult {
  mode: Mode;
  initialFormData: PIARFormDataV2;
  formKey: number;
  storageNotice: string | null;
  dataCorrectionNotice: string | null;
  isClearDialogOpen: boolean;
  isExportingBackup: boolean;
  clearDialogMessage: ClearDialogMessage | null;
  docxTemplateSourceName: string | null;
  getFormData: () => PIARFormDataV2;
  handleStartNew: () => Promise<void>;
  handleRestoreAccept: () => Promise<void>;
  handleRestoreDecline: () => void;
  handleImport: (result: PIARImportSuccess) => Promise<void>;
  handleDataChange: (data: PIARFormDataV2) => void;
  handleClearProgress: () => void;
  handleClearProgressCancel: () => void;
  handleClearProgressConfirm: () => void;
  handleReturnToStart: () => Promise<void>;
  handleExportBackupBeforeClear: () => Promise<void>;
}

export function usePiarWorkflow({ docxTemplate }: UsePiarWorkflowOptions = {}): UsePiarWorkflowResult {
  const [mode, setMode] = useState<Mode>('start');
  const [initialFormData, setInitialFormData] = useState<PIARFormDataV2>(createEmptyPIARFormDataV2());
  const [formKey, setFormKey] = useState(0);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [dataCorrectionNotice, setDataCorrectionNotice] = useState<string | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [clearDialogMessage, setClearDialogMessage] = useState<ClearDialogMessage | null>(null);
  const formDataRef = useRef<PIARFormDataV2>(initialFormData);
  const docxTemplateSourceName = getDocxTemplateSourceName(docxTemplate);

  const getFormData = useCallback(() => formDataRef.current, []);

  const replaceCurrentFormData = useCallback((data: PIARFormDataV2) => {
    setInitialFormData(data);
    formDataRef.current = data;
  }, []);

  const openForm = useCallback(() => {
    setFormKey((currentKey) => currentKey + 1);
    setMode('form');
  }, []);

  const resetToEmptyForm = useCallback((options?: { closeClearDialog?: boolean }) => {
    replaceCurrentFormData(createEmptyPIARFormDataV2());
    setDataCorrectionNotice(null);

    if (options?.closeClearDialog) {
      setClearDialogMessage(null);
      setIsClearDialogOpen(false);
    }

    openForm();
  }, [openForm, replaceCurrentFormData]);

  const saveWithNotice = useCallback(async (data: PIARFormDataV2) => {
    const result = await ProgressStore.save(data);
    // why: ProgressStore.save returns Spanish messages for every error
    // code via buildStorageFailureMessage, so we surface result.message
    // unchanged. We do NOT branch on result.code — every failure mode
    // is already user-readable.
    if (!result.ok) {
      setStorageNotice(`${result.message} Puede reintentar y exportar un respaldo antes de cerrar.`);
      return result;
    }
    ProgressStore.clearUnloadRecovery();
    setStorageNotice(null);
    return result;
  }, []);

  const handleStartNew = useCallback(async () => {
    const loaded = await ProgressStore.loadWithStatus();
    if (loaded.ok) {
      replaceCurrentFormData(loaded.data);
      setStorageNotice(null);
      setDataCorrectionNotice(buildDataCorrectionNotice('restauracion', loaded.warnings));
      setMode('restore-prompt');
      return;
    }

    if (loaded.code !== 'not_found') {
      setStorageNotice(`${loaded.message} Puede iniciar un formulario nuevo y exportar respaldos periodicos.`);
    }

    resetToEmptyForm();
  }, [replaceCurrentFormData, resetToEmptyForm]);

  const handleRestoreAccept = useCallback(async () => {
    await saveWithNotice(formDataRef.current);
    openForm();
  }, [openForm, saveWithNotice]);

  const handleRestoreDecline = useCallback(() => {
    ProgressStore.clear();
    resetToEmptyForm();
  }, [resetToEmptyForm]);

  const handleImport = useCallback(async (result: PIARImportSuccess) => {
    await saveWithNotice(result.data);
    replaceCurrentFormData(result.data);
    setDataCorrectionNotice(buildDataCorrectionNotice('importacion', result.warnings));
    openForm();
  }, [openForm, replaceCurrentFormData, saveWithNotice]);

  const handleDataChange = useCallback((data: PIARFormDataV2) => {
    formDataRef.current = data;
  }, []);

  const handleClearProgress = useCallback(() => {
    setClearDialogMessage(null);
    setIsClearDialogOpen(true);
  }, []);

  const handleClearProgressCancel = useCallback(() => {
    setIsClearDialogOpen(false);
    setClearDialogMessage(null);
  }, []);

  const handleClearProgressConfirm = useCallback(() => {
    ProgressStore.clear();
    resetToEmptyForm({ closeClearDialog: true });
  }, [resetToEmptyForm]);

  const handleReturnToStart = useCallback(async () => {
    const result = await saveWithNotice(formDataRef.current);
    if (!result.ok) {
      setStorageNotice(`${result.message} Mantuvimos el formulario abierto para que pueda exportar un respaldo antes de salir.`);
      return;
    }
    setMode('start');
  }, [saveWithNotice]);

  const handleExportBackupBeforeClear = useCallback(async () => {
    const data = formDataRef.current;
    setIsExportingBackup(true);
    setClearDialogMessage(null);

    await saveWithNotice(data);

    try {
      const { downloadPIARPortableFile } = await import('@piar-digital-app/features/piar/lib/portable/download');
      if (docxTemplate) {
        await downloadPIARPortableFile('docx', data, { docxTemplate });
      } else {
        await downloadPIARPortableFile('docx', data);
      }
      setClearDialogMessage({
        tone: 'default',
        text: 'Se descargó un respaldo editable en DOCX. Puede continuar con la limpieza cuando quiera.',
      });
    } catch (error) {
      console.error('Error exporting DOCX backup before clearing the form:', error);
      setClearDialogMessage({
        tone: 'error',
        text: 'No se pudo exportar el respaldo. Intente de nuevo antes de limpiar.',
      });
    } finally {
      setIsExportingBackup(false);
    }
  }, [docxTemplate, saveWithNotice]);

  useEffect(() => {
    if (mode !== 'form') {
      void loadFormWorkspace();
    }
  }, [mode]);

  return {
    mode,
    initialFormData,
    formKey,
    storageNotice,
    dataCorrectionNotice,
    isClearDialogOpen,
    isExportingBackup,
    clearDialogMessage,
    docxTemplateSourceName,
    getFormData,
    handleStartNew,
    handleRestoreAccept,
    handleRestoreDecline,
    handleImport,
    handleDataChange,
    handleClearProgress,
    handleClearProgressCancel,
    handleClearProgressConfirm,
    handleReturnToStart,
    handleExportBackupBeforeClear,
  };
}
