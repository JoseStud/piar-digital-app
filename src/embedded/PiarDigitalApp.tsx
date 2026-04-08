'use client';

import { PiarHomePage } from '@piar-digital-app/features/piar/screens/PiarHomePage';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';

export type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';

export interface PiarDigitalAppProps {
  docxTemplate?: PIARDocxTemplateSource;
}

export function PiarDigitalApp({ docxTemplate }: PiarDigitalAppProps) {
  return <PiarHomePage docxTemplate={docxTemplate} />;
}
