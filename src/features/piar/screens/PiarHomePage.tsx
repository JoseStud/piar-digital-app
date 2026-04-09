/**
 * Workflow root for the `/diligenciar` route.
 *
 * Thin render wrapper around `usePiarWorkflow`.
 *
 * @see ./AppStartScreen.tsx
 * @see ./FormWorkspace.tsx
 * @see ./usePiarWorkflow.ts
 */
'use client';

import { lazy, Suspense } from 'react';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';
import { AppStartScreen } from '@piar-digital-app/features/piar/screens/AppStartScreen';
import { ConfirmDialog } from '@piar-digital-app/shared/ui/ConfirmDialog';
import { usePiarWorkflow } from './usePiarWorkflow';

const loadFormWorkspace = () =>
  import('@piar-digital-app/features/piar/screens/FormWorkspace').then((mod) => ({ default: mod.FormWorkspace }));

const FormWorkspace = lazy(loadFormWorkspace);

interface PiarHomePageProps {
  docxTemplate?: PIARDocxTemplateSource;
}

export function PiarHomePage({ docxTemplate }: PiarHomePageProps) {
  const workflow = usePiarWorkflow({ docxTemplate });

  if (workflow.mode === 'start' || workflow.mode === 'restore-prompt') {
    return (
      <AppStartScreen
        mode={workflow.mode}
        storageNotice={workflow.storageNotice}
        docxTemplateSourceName={workflow.docxTemplateSourceName}
        onStartNew={workflow.handleStartNew}
        onRestoreAccept={workflow.handleRestoreAccept}
        onRestoreDecline={workflow.handleRestoreDecline}
        onImport={workflow.handleImport}
      />
    );
  }

  return (
    <>
      <Suspense fallback={<main className="min-h-screen bg-surface" />}>
        <FormWorkspace
          formKey={workflow.formKey}
          initialData={workflow.initialFormData}
          storageNotice={workflow.storageNotice}
          dataCorrectionNotice={workflow.dataCorrectionNotice}
          docxTemplate={docxTemplate}
          docxTemplateSourceName={workflow.docxTemplateSourceName}
          getData={workflow.getFormData}
          onDataChange={workflow.handleDataChange}
          onClearProgress={workflow.handleClearProgress}
          onReturnToStart={workflow.handleReturnToStart}
        />
      </Suspense>
      <ConfirmDialog
        open={workflow.isClearDialogOpen}
        tone="danger"
        title="Limpiar formulario"
        description="Se borrará el progreso guardado en este navegador y el formulario volverá a quedar en blanco."
        bullets={[
          'Se eliminarán los cambios locales que todavía no haya exportado.',
          'Si necesita conservar una copia, descargue un respaldo antes de continuar.',
        ]}
        cancelLabel="Cancelar"
        confirmLabel="Sí, limpiar"
        onCancel={() => {
          if (!workflow.isExportingBackup) {
            workflow.handleClearProgressCancel();
          }
        }}
        onConfirm={workflow.handleClearProgressConfirm}
        cancelDisabled={workflow.isExportingBackup}
        confirmDisabled={workflow.isExportingBackup}
        auxiliaryAction={{
          label: 'Exportar respaldo',
          onClick: workflow.handleExportBackupBeforeClear,
          disabled: workflow.isExportingBackup,
          loading: workflow.isExportingBackup,
        }}
      >
        {workflow.clearDialogMessage ? (
          <p className={workflow.clearDialogMessage.tone === 'error' ? 'text-sm text-error' : 'text-sm text-on-surface-variant'}>
            {workflow.clearDialogMessage.text}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
