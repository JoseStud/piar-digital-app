'use client';

import { useState, useCallback, useRef, DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import type {
  PIARImportErrorCode,
  PIARImportSuccess,
} from '@piar-digital-app/features/piar/lib/portable/piar-import';
import { detectPIARPortableFormat } from '@piar-digital-app/features/piar/lib/portable/format';
import { Button } from '@piar-digital-app/shared/ui/Button';
import { SurfaceCard } from '@piar-digital-app/shared/ui/SurfaceCard';
import { cx } from '@piar-digital-app/shared/lib/cx';

/** Maximum file size for uploads (20 MB) */
const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

interface UploadZoneProps {
  onImport: (result: PIARImportSuccess) => void | Promise<void>;
}

function getImportErrorMessage(code: PIARImportErrorCode): string {
  switch (code) {
    case 'unsupported_version':
      return 'Este archivo usa una versión incompatible de la aplicación.';
    case 'corrupt_or_incomplete_data':
      return 'El archivo contiene datos PIAR incompletos o corruptos.';
    case 'not_piar':
    default:
      return 'Este archivo no contiene datos PIAR generados por esta aplicación.';
  }
}

export function UploadZone({ onImport }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        setError('El archivo es demasiado grande. El tamaño máximo es 20 MB.');
        resetInput();
        return;
      }

      const format = detectPIARPortableFormat(file);
      if (!format) {
        setError('Solo se aceptan archivos DOCX o PDF.');
        resetInput();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const result = format === 'docx'
          ? await (await import('@piar-digital-app/features/piar/lib/docx/docx-importer')).importPIARDocx(bytes)
          : await (await import('@piar-digital-app/features/piar/lib/pdf/pdf-importer')).importPIARPdf(bytes);

        if (result.ok) {
          await onImport(result);
        } else {
          setError(getImportErrorMessage(result.code));
        }
      } catch {
        setError('Error al leer el archivo seleccionado.');
      } finally {
        setLoading(false);
        resetInput();
      }
    },
    [onImport, resetInput],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!loading) {
      inputRef.current?.click();
    }
  }, [loading]);

  return (
    <SurfaceCard
      role="button"
      tabIndex={0}
      aria-label="Importar DOCX o PDF PIAR generado anteriormente"
      aria-busy={loading}
      onClick={handleClick}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tone="low"
      className={cx(
        'cursor-pointer border-2 border-dashed p-8 text-center transition-colors',
        isDragging
          ? 'border-action bg-action-subtle/30'
          : 'border-action/40 hover:bg-surface-container',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <svg aria-hidden="true" viewBox="0 0 40 40" className="mx-auto mb-3 h-10 w-10 text-action/60" fill="none">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 27V15m0 0-4.5 4.5M20 15l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-on-surface font-semibold">
        {loading ? 'Procesando...' : 'Importar DOCX o PDF PIAR generado anteriormente'}
      </p>
      <p className="mt-1 text-sm text-on-surface-variant">Arrastra el archivo aquí o haz clic para seleccionar</p>
      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="pointer-events-none"
          aria-hidden="true"
          tabIndex={-1}
        >
          Seleccionar archivo
        </Button>
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">
        Puede restaurar DOCX estructurados y PDFs con copia recuperable generados por esta aplicación.
      </p>
      {error && (
        <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-error-container px-2 py-1 text-sm text-on-error-container" role="alert">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M10 5.8v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="10" cy="13.9" r="1" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}
    </SurfaceCard>
  );
}
