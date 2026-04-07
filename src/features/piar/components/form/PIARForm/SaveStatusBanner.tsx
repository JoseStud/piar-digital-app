import { Button } from '@/shared/ui/Button';
import { cx } from '@/shared/lib/cx';
import type { SaveIndicatorState } from './usePIARAutosave';

interface SaveStatusBannerProps {
  saveState: SaveIndicatorState;
  saveMessage: string | null;
  onRetry: () => void;
}

function StatusIcon({
  tone,
}: {
  tone: 'ok' | 'saving' | 'idle' | 'error';
}) {
  if (tone === 'ok') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6.5 10.2 9 12.6l4.5-4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (tone === 'error') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 5.8v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10" cy="13.9" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (tone === 'saving') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" opacity="0.35" />
        <path d="M10 10V6.7m0 3.3 2.6 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="10" r="1.4" fill="currentColor" />
    </svg>
  );
}

function StatusBadge({
  tone,
  text,
}: {
  tone: 'ok' | 'saving' | 'idle' | 'error';
  text: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm typ-label',
        tone === 'ok' && 'bg-primary-fixed text-primary',
        tone === 'saving' && 'bg-surface-container text-on-surface',
        tone === 'idle' && 'bg-surface-container text-on-surface-variant',
        tone === 'error' && 'bg-error-container text-on-error-container',
      )}
    >
      <StatusIcon tone={tone} />
      {text}
    </span>
  );
}

export function SaveStatusBanner({ saveState, saveMessage, onRetry }: SaveStatusBannerProps) {
  return (
    <div
      className="mb-4 rounded-xl bg-surface-container-low px-3 py-3"
      aria-live={saveState === 'failed' ? 'assertive' : 'polite'}
      role={saveState === 'failed' ? 'alert' : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="typ-label text-sm text-on-surface">Estado de guardado:</span>
        {saveState === 'saved' && <StatusBadge tone="ok" text="Guardado" />}
        {saveState === 'saving' && <StatusBadge tone="saving" text="Guardando..." />}
        {saveState === 'failed' && <StatusBadge tone="error" text="Error al guardar" />}
        {saveState === 'idle' && <StatusBadge tone="idle" text="Sin cambios recientes" />}
      </div>
      {saveState === 'failed' && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-on-error-container">
          <span className="inline-flex items-center gap-2 rounded-lg bg-error-container px-2 py-1">
            <StatusIcon tone="error" />
            {saveMessage ?? 'No fue posible guardar en este navegador.'}
          </span>
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="bg-error-container text-on-error-container"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M14.5 5.5A6 6 0 1 0 16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M14.5 2v3.5H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Reintentar
          </Button>
          <span className="text-on-surface-variant">
            Puede exportar un DOCX o PDF desde la sección inferior antes de salir.
          </span>
        </div>
      )}
    </div>
  );
}
