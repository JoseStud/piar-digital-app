import {
  createEmptyPIARFormDataV2,
  type PIARFormDataV2,
} from '@piar-digital-app/features/piar/model/piar';
import { DOCX_FIELD_DEFINITIONS } from './definitions';
import { normalizeLineBreaks, setDeepValue } from './helpers';
import type { DocxFieldDefinition } from './types';

function normalizeBoolean(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function deserializeFieldValue(definition: DocxFieldDefinition, rawValue: string): string | boolean | null {
  const normalized = normalizeLineBreaks(rawValue);

  switch (definition.valueType) {
    case 'boolean': {
      const trimmed = normalized.trim();
      if (trimmed === '') {
        return null;
      }

      const normalizedBool = normalizeBoolean(trimmed);

      // Accept case/accent variants: "Sí", "SÍ", "sí", "SI", "si"
      if (trimmed === 'Sí' || trimmed === 'true' || normalizedBool === 'si') {
        return true;
      }

      // Accept case variants: "No", "NO", "no"
      if (trimmed === 'No' || trimmed === 'false' || normalizedBool === 'no') {
        return false;
      }

      // Unknown tokens become null (no answer) rather than false (a meaningful answer).
      // This prevents silent data corruption where "X" or "maybe" becomes "No".
      return null;
    }
    case 'nullableString':
      return normalized.trim() === '' ? null : normalized.trim();
    case 'string':
    default:
      return normalized;
  }
}

export function buildPIARDataFromFieldMap(rawFieldValues: ReadonlyMap<string, string>): PIARFormDataV2 {
  const data = createEmptyPIARFormDataV2();

  for (const definition of DOCX_FIELD_DEFINITIONS) {
    const rawValue = rawFieldValues.get(definition.path);
    if (rawValue === undefined) {
      continue;
    }

    setDeepValue(data, definition.segments, deserializeFieldValue(definition, rawValue));
  }

  return data;
}
