import type { PIARFormDataV2 } from '@/features/piar/model/piar';
import { DOCX_FIELD_DEFINITIONS } from './definitions';
import { getDeepValue } from './helpers';
import type { DocxFieldDefinition } from './types';

const DOCX_BOOLEAN_TRUE = 'Sí';
const DOCX_BOOLEAN_FALSE = 'No';

function serializeFieldValue(definition: DocxFieldDefinition, data: PIARFormDataV2): string {
  const rawValue = getDeepValue(data, definition.segments);

  switch (definition.valueType) {
    case 'boolean':
      return serializeDocxBoolean((rawValue as boolean | null | undefined) ?? null);
    case 'nullableString':
      return typeof rawValue === 'string' ? rawValue : '';
    case 'string':
    default:
      return typeof rawValue === 'string' ? rawValue : '';
  }
}

function serializeDocxBoolean(value: boolean | null): string {
  if (value === null) {
    return '';
  }

  return value ? DOCX_BOOLEAN_TRUE : DOCX_BOOLEAN_FALSE;
}

export function buildDocxFieldValueMap(data: PIARFormDataV2): Map<string, string> {
  const entries = DOCX_FIELD_DEFINITIONS.map((definition) => [definition.path, serializeFieldValue(definition, data)] as const);
  return new Map(entries);
}
