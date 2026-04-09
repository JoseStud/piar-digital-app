import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe } from 'vitest';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sharedWorkspaceTemplatePath = path.resolve(currentDir, '../../../../../../../new_template.docx');
const configuredTemplatePath = process.env.PIAR_TEST_DOCX_TEMPLATE_PATH?.trim();

if (configuredTemplatePath && !existsSync(configuredTemplatePath)) {
  throw new Error(`PIAR_TEST_DOCX_TEMPLATE_PATH does not exist: ${configuredTemplatePath}`);
}

const resolvedTemplatePath = configuredTemplatePath
  ?? (existsSync(sharedWorkspaceTemplatePath) ? sharedWorkspaceTemplatePath : undefined);

let cachedTemplateBytes: Uint8Array | null = null;

export const describeWithDocxTemplate = resolvedTemplatePath ? describe : describe.skip;

export function getTestDocxTemplateBytes(): Uint8Array {
  if (!resolvedTemplatePath) {
    throw new Error('No DOCX test template configured. Set PIAR_TEST_DOCX_TEMPLATE_PATH or place the shared fixture at ~/architecture/new_template.docx.');
  }

  if (!cachedTemplateBytes) {
    cachedTemplateBytes = new Uint8Array(readFileSync(resolvedTemplatePath));
  }

  return cachedTemplateBytes.slice();
}

export function getTestDocxTemplateSource(
  sourceName = 'Ministerio de Educación Nacional',
): PIARDocxTemplateSource {
  return {
    kind: 'bytes',
    bytes: getTestDocxTemplateBytes(),
    sourceName,
  };
}
