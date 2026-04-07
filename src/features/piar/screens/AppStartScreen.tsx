'use client';

import Link from 'next/link';
import type { PIARImportSuccess } from '@/features/piar/lib/portable/piar-import';
import { UploadZone } from '@/features/piar/components/pdf/UploadZone';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

interface AppStartScreenProps {
  mode: 'start' | 'restore-prompt';
  storageNotice: string | null;
  onStartNew: () => void;
  onRestoreAccept: () => void;
  onRestoreDecline: () => void;
  onImport: (result: PIARImportSuccess) => void;
}

export function AppStartScreen({
  mode,
  storageNotice,
  onStartNew,
  onRestoreAccept,
  onRestoreDecline,
  onImport,
}: AppStartScreenProps) {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col justify-center gap-6">
        <header className="space-y-4">
          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border border-border-warm bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
          >
            Volver a la pagina principal
          </Link>
          <div className="space-y-3">
            <p className="typ-label text-xs uppercase tracking-[0.14em] text-primary">Aplicacion PIAR</p>
            <h1 className="text-4xl font-headline font-extrabold leading-tight tracking-tight text-on-surface md:text-5xl">
              Diligenciar PIAR
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Empiece un formulario nuevo, importe un DOCX/PDF generado por PIAR Digital o restaure el
              progreso guardado en este navegador.
            </p>
          </div>
        </header>

        {storageNotice ? (
          <SurfaceCard tone="lowest" className="max-w-3xl p-4 text-sm text-on-surface-variant">
            {storageNotice}
          </SurfaceCard>
        ) : null}

        <ConfirmDialog
          open={mode === 'restore-prompt'}
          role="dialog"
          tone="info"
          title="Progreso encontrado"
          description="Se encontro progreso guardado anteriormente. Puede restaurarlo o empezar un formulario nuevo."
          confirmLabel="Restaurar"
          cancelLabel="Empezar nuevo"
          onConfirm={onRestoreAccept}
          onCancel={onRestoreDecline}
          initialFocus="confirm"
        />

        <section
          aria-labelledby="app-start-heading"
          className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        >
          <SurfaceCard tone="lowest" className="flex flex-col justify-between gap-6 p-6 md:p-8">
            <div className="space-y-3">
              <p className="typ-label text-xs uppercase tracking-[0.14em] text-primary">Nuevo PIAR</p>
              <h2 id="app-start-heading" className="text-2xl font-headline font-bold text-on-surface">
                Crear formulario
              </h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Trabaje el PIAR en un espacio dedicado al formulario. El progreso se guarda localmente
                y puede exportarse como respaldo.
              </p>
            </div>
            <Button onClick={onStartNew} fullWidth size="lg">
              Comenzar PIAR Nuevo
            </Button>
          </SurfaceCard>

          <section aria-label="Importar PIAR existente" className="space-y-3">
            <div className="space-y-2">
              <p className="typ-label text-xs uppercase tracking-[0.14em] text-primary">Restaurar</p>
              <h2 className="text-2xl font-headline font-bold text-on-surface">Importar archivo</h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Restaure un DOCX estructurado o un PDF con copia recuperable generado por esta aplicacion.
              </p>
            </div>
            <UploadZone onImport={onImport} />
          </section>
        </section>

        <p className="max-w-3xl text-xs leading-relaxed text-on-surface-variant">
          El contenido del PIAR se procesa localmente en este navegador. Si este dispositivo es compartido,
          exporte un respaldo y limpie el formulario al terminar.
        </p>
      </div>
    </main>
  );
}
