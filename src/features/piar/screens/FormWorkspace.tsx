import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';
import { ErrorBoundary } from '@piar-digital-app/features/piar/components/feedback/ErrorBoundary';
import { PIARForm } from '@piar-digital-app/features/piar/components/form/PIARForm';
import { DownloadButton } from '@piar-digital-app/features/piar/components/pdf/DownloadButton';
import { Button } from '@piar-digital-app/shared/ui/Button';
import { SectionShell } from '@piar-digital-app/shared/ui/SectionShell';
import { SurfaceCard } from '@piar-digital-app/shared/ui/SurfaceCard';

interface FormWorkspaceProps {
  formKey: number;
  initialData: PIARFormDataV2;
  storageNotice: string | null;
  dataCorrectionNotice: string | null;
  docxTemplate?: PIARDocxTemplateSource;
  docxTemplateSourceName: string | null;
  getData: () => PIARFormDataV2;
  onDataChange: (data: PIARFormDataV2) => void;
  onClearProgress: () => void;
  onReturnToStart: () => void;
}

export function FormWorkspace({
  formKey,
  initialData,
  storageNotice,
  dataCorrectionNotice,
  docxTemplate,
  docxTemplateSourceName,
  getData,
  onDataChange,
  onClearProgress,
  onReturnToStart,
}: FormWorkspaceProps) {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <SectionShell className="bg-surface-container-low px-4 py-3 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="typ-title text-xl text-on-surface">PIAR Digital</h1>
              <p className="text-xs text-on-surface-variant">Progreso cifrado y guardado automaticamente en su navegador</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Si este dispositivo es compartido, exporte un respaldo y limpie el formulario al terminar.
              </p>
              {storageNotice && <p className="mt-1 text-xs text-on-surface-variant">{storageNotice}</p>}
              {dataCorrectionNotice && <p className="mt-1 text-xs text-on-surface-variant">{dataCorrectionNotice}</p>}
              {docxTemplateSourceName && (
                <p className="mt-1 text-xs text-on-surface-variant">
                  Usando la plantilla proporcionada por {docxTemplateSourceName}.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={onReturnToStart} variant="ghost">
                Volver
              </Button>
              <Button onClick={onClearProgress} variant="danger">
                Limpiar formulario
              </Button>
            </div>
          </div>
        </SectionShell>

        <SectionShell className="bg-surface-container-low px-3 py-3 md:px-4 md:py-4">
          <SurfaceCard tone="lowest" className="p-4 md:p-6">
            <ErrorBoundary>
              <PIARForm key={formKey} initialData={initialData} onDataChange={onDataChange} />
            </ErrorBoundary>
          </SurfaceCard>
        </SectionShell>

        <SectionShell className="bg-surface-container-low px-3 py-3 md:px-4 md:py-4">
          <SurfaceCard tone="lowest" className="p-4 md:p-6">
            <DownloadButton getData={getData} docxTemplate={docxTemplate} />
          </SurfaceCard>
        </SectionShell>
      </div>
    </main>
  );
}
