import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';

const DEFAULT_TEMPLATE_SOURCE_NAME = 'la implementación anfitriona';

function readEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function getConfiguredDocxTemplateSource(): PIARDocxTemplateSource | undefined {
  const url = readEnvValue('NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_URL');
  if (!url) {
    return undefined;
  }

  return {
    kind: 'url',
    url,
    sourceName: readEnvValue('NEXT_PUBLIC_PIAR_DOCX_TEMPLATE_SOURCE_NAME') ?? DEFAULT_TEMPLATE_SOURCE_NAME,
  };
}
