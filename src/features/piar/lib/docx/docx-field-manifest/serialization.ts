/**
 * Serializes PIAR form data into the DOCX field-value map used by the
 * generator.
 */

import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { DOCX_FIELD_DEFINITIONS } from './definitions';
import { getDeepValue } from './helpers';
import { serializeDocxFieldValue } from './codec';

/** Builds the path-to-string map consumed by DOCX XML builders. */
export function buildDocxFieldValueMap(data: PIARFormDataV2): Map<string, string> {
  const entries = DOCX_FIELD_DEFINITIONS.map((definition) => [
    definition.path,
    serializeDocxFieldValue(
      definition,
      getDeepValue(data, definition.segments) as string | boolean | null | undefined,
    ),
  ] as const);
  return new Map(entries);
}
