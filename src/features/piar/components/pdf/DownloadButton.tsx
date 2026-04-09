/**
 * Two-button export control for PIAR drafts (DOCX editable + PDF).
 *
 * Saves the current form to encrypted localStorage immediately before
 * generating the export so the freshest state is in storage when the
 * download dialog opens. Surfaces a Spanish error notice if the save
 * fails — the export still proceeds because the in-memory snapshot is
 * authoritative for the file content. Owns two confirm dialogs: a
 * one-time PDF round-trip caveat and a missing-context warning when
 * student name + institución are blank.
 *
 * @see ../../lib/portable/download.ts
 * @see ../../lib/persistence/progress-store.ts
 */
'use client';

import { memo, useState } from 'react';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';
import type { PIARPortableFormat } from '@piar-digital-app/features/piar/lib/portable/format';
import { safeLocalStorageGet, safeLocalStorageSet } from '@piar-digital-app/shared/lib/storage-safe';
import { Button } from '@piar-digital-app/shared/ui/Button';
import { ConfirmDialog } from '@piar-digital-app/shared/ui/ConfirmDialog';

interface DownloadButtonProps {
  getData: () => PIARFormDataV2;
  docxTemplate?: PIARDocxTemplateSource;
}

const EXPORT_WARNING_ACK_KEY = 'piar-pdf-recovery-warning-ack';
const LEGACY_EXPORT_WARNING_ACK_KEY = 'piar-editable-pdf-warning-ack';

type DownloadDialogState =
  | {
      kind: 'pdf-warning';
      request: ExportRequest;
      skipFutureWarnings: boolean;
    }
  | {
      kind: 'missing-context';
      request: ExportRequest;
    };

type ExportPreflightKind = DownloadDialogState['kind'];

interface ExportRequest {
  data: PIARFormDataV2;
  format: PIARPortableFormat;
  resolvedPreflights?: Partial<Record<ExportPreflightKind, true>>;
}

function hasAcknowledgedExportWarning(): boolean {
  return (
    safeLocalStorageGet(EXPORT_WARNING_ACK_KEY) === 'true'
    || safeLocalStorageGet(LEGACY_EXPORT_WARNING_ACK_KEY) === 'true'
  );
}

function acknowledgeExportWarning(): void {
  safeLocalStorageSet(EXPORT_WARNING_ACK_KEY, 'true');
}

function isExportContextMissing(data: PIARFormDataV2): boolean {
  const nombreVal = `${data.student.nombres} ${data.student.apellidos}`.trim();
  const institucionVal = data.header.institucionEducativa;
  return !nombreVal.trim() && !institucionVal.trim();
}

function hasResolvedPreflight(request: ExportRequest, kind: ExportPreflightKind): boolean {
  return request.resolvedPreflights?.[kind] === true;
}

function resolveExportPreflight(request: ExportRequest, kind: ExportPreflightKind): ExportRequest {
  return {
    ...request,
    resolvedPreflights: {
      ...request.resolvedPreflights,
      [kind]: true,
    },
  };
}

function getPdfWarningDialog(request: ExportRequest): DownloadDialogState | null {
  if (request.format !== 'pdf' || hasResolvedPreflight(request, 'pdf-warning') || hasAcknowledgedExportWarning()) {
    return null;
  }

  return {
    kind: 'pdf-warning',
    request,
    skipFutureWarnings: false,
  };
}

function getMissingContextDialog(request: ExportRequest): DownloadDialogState | null {
  if (hasResolvedPreflight(request, 'missing-context') || !isExportContextMissing(request.data)) {
    return null;
  }

  return {
    kind: 'missing-context',
    request,
  };
}

function getExportPreflightDialog(request: ExportRequest): DownloadDialogState | null {
  return getPdfWarningDialog(request) ?? getMissingContextDialog(request);
}

export const DownloadButton = memo(function DownloadButton({ getData, docxTemplate }: DownloadButtonProps) {
  const [exportingFormat, setExportingFormat] = useState<PIARPortableFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DownloadDialogState | null>(null);

  const runDownload = async (format: PIARPortableFormat, data: PIARFormDataV2) => {
    setExportingFormat(format);
    setError(null);

    try {
      const saveResult = await ProgressStore.save(data);
      // why: ProgressStore.save's `result.message` is already a Spanish
      // user-facing string covering every save error code (including
      // crypto_unavailable, key_unavailable, encryption_failed). We do
      // not branch on result.code here — the message is sufficient.
      // Export still proceeds because the in-memory data is the source
      // of truth for the generated file.
      if (!saveResult.ok) {
        console.warn('Failed to save progress before export:', saveResult.code, saveResult.message);
        setError(`${saveResult.message} El archivo se generará de todos modos.`);
      } else {
        ProgressStore.clearUnloadRecovery();
      }
      const { downloadPIARPortableFile } = await import('@piar-digital-app/features/piar/lib/portable/download');
      if (format === 'docx' && docxTemplate) {
        await downloadPIARPortableFile(format, data, { docxTemplate });
      } else {
        await downloadPIARPortableFile(format, data);
      }
    } catch (err) {
      console.error(`Error generating ${format.toUpperCase()}:`, err);
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('template') || errorMessage.includes('document.xml')) {
        setError(`Error al cargar la plantilla ${format.toUpperCase()}. Recargue la página e intente de nuevo.`);
      } else if (errorMessage.includes('generateAsync') || errorMessage.includes('ZIP')) {
        setError(`Error al generar el archivo ${format.toUpperCase()}. Intente de nuevo.`);
      } else if (format === 'pdf' && (errorMessage.includes('PDFDocument') || errorMessage.includes('pdf-lib'))) {
        setError('Error al generar el PDF. Intente de nuevo.');
      } else {
        setError(`Error al generar el ${format.toUpperCase()}. Intente de nuevo.`);
      }
    } finally {
      setExportingFormat(null);
    }
  };

  const proceedExport = async (request: ExportRequest) => {
    const preflightDialog = getExportPreflightDialog(request);
    if (preflightDialog) {
      setDialogState(preflightDialog);
      return;
    }

    setDialogState(null);
    await runDownload(request.format, request.data);
  };

  const handleDownload = async (format: PIARPortableFormat) => {
    setError(null);
    await proceedExport({ format, data: getData() });
  };

  const handleDialogConfirm = async () => {
    if (!dialogState) {
      return;
    }

    if (dialogState.kind === 'pdf-warning' && dialogState.skipFutureWarnings) {
      acknowledgeExportWarning();
    }

    const nextRequest = resolveExportPreflight(dialogState.request, dialogState.kind);
    setDialogState(null);
    await proceedExport(nextRequest);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            onClick={() => handleDownload('docx')}
            disabled={exportingFormat !== null}
            fullWidth
            size="lg"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
              <path d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {exportingFormat === 'docx' ? 'Generando DOCX editable...' : 'Generar DOCX editable'}
          </Button>
          <Button
            onClick={() => handleDownload('pdf')}
            disabled={exportingFormat !== null}
            fullWidth
            size="lg"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
              <path d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {exportingFormat === 'pdf' ? 'Generando PDF...' : 'Generar PDF'}
          </Button>
        </div>
        <div className="space-y-1 text-center text-xs text-on-surface-variant">
          <p>El DOCX editable conserva los datos PIAR en XML incrustado para permitir la reimportación desde Word.</p>
          <p>Solo se garantiza el round-trip de los cambios hechos dentro de los campos estructurados del DOCX.</p>
          <p>El PDF conserva una copia recuperable de la información para restaurarla después en esta aplicación.</p>
        </div>
        {error && (
          <p className="mt-2 flex items-center justify-center gap-2 text-sm text-error" role="alert">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 5.8v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="13.9" r="1" fill="currentColor" />
            </svg>
            {error}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={dialogState?.kind === 'pdf-warning'}
        tone="info"
        title="Antes de exportar a PDF"
        description="Esta exportacion conserva una copia recuperable del PIAR para que pueda restaurarla mas adelante."
        bullets={[
          'La restauracion recupera la copia incrustada por esta aplicacion; no lee cambios hechos sobre el PDF visible.',
          'Use el PDF como documento final o respaldo portable, no como una fuente editable para round-trip.',
        ]}
        confirmLabel="Continuar con PDF"
        onCancel={() => setDialogState(null)}
        onConfirm={handleDialogConfirm}
        checkbox={dialogState?.kind === 'pdf-warning' ? {
          label: 'No volver a mostrar este aviso',
          checked: dialogState.skipFutureWarnings,
          onChange: (checked) => {
            setDialogState((currentState) => {
              if (!currentState || currentState.kind !== 'pdf-warning') {
                return currentState;
              }

              return {
                ...currentState,
                skipFutureWarnings: checked,
              };
            });
          },
        } : undefined}
      />

      <ConfirmDialog
        open={dialogState?.kind === 'missing-context'}
        tone="info"
        title="Faltan datos clave antes de exportar"
        description="El nombre del estudiante y la institucion educativa estan vacios en este formulario."
        bullets={[
          'El archivo se descargara con un nombre generico si continua ahora.',
          'Puede completar esos datos mas tarde y generar una version final cuando quiera.',
        ]}
        confirmLabel="Generar de todos modos"
        onCancel={() => setDialogState(null)}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
});
