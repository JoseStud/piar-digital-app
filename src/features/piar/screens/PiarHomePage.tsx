'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createEmptyPIARFormDataV2, type PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import type {
  PIARImportSuccess,
  PIARImportWarning,
} from '@piar-digital-app/features/piar/lib/portable/piar-import';
import { AppStartScreen } from '@piar-digital-app/features/piar/screens/AppStartScreen';
import { ConfirmDialog } from '@piar-digital-app/shared/ui/ConfirmDialog';

const loadFormWorkspace = () =>
  import('@piar-digital-app/features/piar/screens/FormWorkspace').then((mod) => ({ default: mod.FormWorkspace }));

const FormWorkspace = lazy(loadFormWorkspace);

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
  return `La ${source} corrigio ${warnings.length} ${noun} en los datos. Se conservaron los valores validos y el resto volvio a los valores predeterminados.`;
}

export function PiarHomePage() {
  const [mode, setMode] = useState<Mode>('start');
  const [initialFormData, setInitialFormData] = useState<PIARFormDataV2>(createEmptyPIARFormDataV2());
  const [formKey, setFormKey] = useState(0);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [dataCorrectionNotice, setDataCorrectionNotice] = useState<string | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [clearDialogMessage, setClearDialogMessage] = useState<ClearDialogMessage | null>(null);
  const formDataRef = useRef<PIARFormDataV2>(initialFormData);

  // Sync ref when initialFormData changes (e.g., after "Empezar nuevo" or import)
  useEffect(() => {
    formDataRef.current = initialFormData;
  }, [initialFormData]);

  const getFormData = useCallback(() => formDataRef.current, []);

  const saveWithNotice = useCallback((data: PIARFormDataV2) => {
    const result = ProgressStore.save(data);
    if (!result.ok) {
      setStorageNotice(`${result.message} Puede reintentar y exportar un respaldo antes de cerrar.`);
      return result;
    }
    setStorageNotice(null);
    return result;
  }, []);

  const handleStartNew = useCallback(() => {
    const loaded = ProgressStore.loadWithStatus();
    if (loaded.ok) {
      setInitialFormData(loaded.data);
      formDataRef.current = loaded.data;
      setStorageNotice(null);
      setDataCorrectionNotice(buildDataCorrectionNotice('restauracion', loaded.warnings));
      setMode('restore-prompt');
      return;
    }

    if (loaded.code !== 'not_found') {
      setStorageNotice(`${loaded.message} Puede iniciar un formulario nuevo y exportar respaldos periodicos.`);
    }

    setDataCorrectionNotice(null);
    const empty = createEmptyPIARFormDataV2();
    setInitialFormData(empty);
    formDataRef.current = empty;
    setFormKey((currentKey) => currentKey + 1);
    setMode('form');
  }, []);

  const handleRestoreAccept = useCallback(() => {
    saveWithNotice(formDataRef.current);
    setFormKey((currentKey) => currentKey + 1);
    setMode('form');
  }, [saveWithNotice]);

  const handleRestoreDecline = useCallback(() => {
    ProgressStore.clear();
    const empty = createEmptyPIARFormDataV2();
    setInitialFormData(empty);
    formDataRef.current = empty;
    setDataCorrectionNotice(null);
    setFormKey((currentKey) => currentKey + 1);
    setMode('form');
  }, []);

  const handleImport = useCallback((result: PIARImportSuccess) => {
    saveWithNotice(result.data);
    setInitialFormData(result.data);
    formDataRef.current = result.data;
    setDataCorrectionNotice(buildDataCorrectionNotice('importacion', result.warnings));
    setFormKey((currentKey) => currentKey + 1);
    setMode('form');
  }, [saveWithNotice]);

  const handleDataChange = useCallback((data: PIARFormDataV2) => {
    formDataRef.current = data;
  }, []);

  const handleClearProgress = useCallback(() => {
    setClearDialogMessage(null);
    setIsClearDialogOpen(true);
  }, []);

  const handleClearProgressConfirm = useCallback(() => {
    ProgressStore.clear();
    const empty = createEmptyPIARFormDataV2();
    setInitialFormData(empty);
    formDataRef.current = empty;
    setDataCorrectionNotice(null);
    setFormKey((currentKey) => currentKey + 1);
    setClearDialogMessage(null);
    setIsClearDialogOpen(false);
  }, []);

  const handleReturnToStart = useCallback(() => {
    const result = saveWithNotice(formDataRef.current);
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

    saveWithNotice(data);

    try {
      await (await import('@piar-digital-app/features/piar/lib/portable/download')).downloadPIARPortableFile('docx', data);
      setClearDialogMessage({
        tone: 'default',
        text: 'Se descargo un respaldo editable en DOCX. Puede continuar con la limpieza cuando quiera.',
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
  }, [saveWithNotice]);

  useEffect(() => {
    if (mode !== 'form') {
      void loadFormWorkspace();
    }
  }, [mode]);

  if (mode === 'start' || mode === 'restore-prompt') {
    return (
      <AppStartScreen
        mode={mode}
        storageNotice={storageNotice}
        onStartNew={handleStartNew}
        onRestoreAccept={handleRestoreAccept}
        onRestoreDecline={handleRestoreDecline}
        onImport={handleImport}
      />
    );
  }

  return (
    <>
      <Suspense fallback={<main className="min-h-screen bg-surface" />}>
        <FormWorkspace
          formKey={formKey}
          initialData={initialFormData}
          storageNotice={storageNotice}
          dataCorrectionNotice={dataCorrectionNotice}
          getData={getFormData}
          onDataChange={handleDataChange}
          onClearProgress={handleClearProgress}
          onReturnToStart={handleReturnToStart}
        />
      </Suspense>
      <ConfirmDialog
        open={isClearDialogOpen}
        tone="danger"
        title="Limpiar formulario"
        description="Se borrara el progreso guardado en este navegador y el formulario volvera a quedar en blanco."
        bullets={[
          'Se eliminaran los cambios locales que todavia no haya exportado.',
          'Si necesita conservar una copia, descargue un respaldo antes de continuar.',
        ]}
        cancelLabel="Cancelar"
        confirmLabel="Si, limpiar"
        onCancel={() => {
          if (!isExportingBackup) {
            setIsClearDialogOpen(false);
            setClearDialogMessage(null);
          }
        }}
        onConfirm={handleClearProgressConfirm}
        cancelDisabled={isExportingBackup}
        confirmDisabled={isExportingBackup}
        auxiliaryAction={{
          label: 'Exportar respaldo',
          onClick: handleExportBackupBeforeClear,
          disabled: isExportingBackup,
          loading: isExportingBackup,
        }}
      >
        {clearDialogMessage ? (
          <p className={clearDialogMessage.tone === 'error' ? 'text-sm text-error' : 'text-sm text-on-surface-variant'}>
            {clearDialogMessage.text}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
