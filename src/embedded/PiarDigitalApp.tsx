/** Embeddable entry point — exports the workflow page as a React component for host pages that want to mount the PIAR editor outside Next.js. */
'use client';

import { PiarHomePage } from '@piar-digital-app/features/piar/screens/PiarHomePage';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';

export type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';

export interface PiarDigitalAppProps {
  docxTemplate?: PIARDocxTemplateSource;
}

/** Mounts the PIAR workflow inside a host application. */
export function PiarDigitalApp({ docxTemplate }: PiarDigitalAppProps) {
  return <PiarHomePage docxTemplate={docxTemplate} />;
}
