/**
 * Workflow route (`/diligenciar`). Renders `PiarHomePage`, which owns
 * the form mode state machine and the lazy-loaded form workspace.
 *
 * @see ../../features/piar/screens/PiarHomePage.tsx
 */
import { getConfiguredDocxTemplateSource } from '@piar-digital-app/app/configured-docx-template';
import { PiarHomePage } from '@piar-digital-app/features/piar/screens/PiarHomePage';

/** Workflow route that keeps the form experience separate from `/`. */
export default function DiligenciarPage() {
  return <PiarHomePage docxTemplate={getConfiguredDocxTemplateSource()} />;
}
