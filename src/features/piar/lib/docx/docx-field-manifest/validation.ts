import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { DOCX_CHECKBOX_CONFLICT_TOKEN } from '@piar-digital-app/features/piar/lib/docx/docx-shared/constants';
import { DOCX_FIELD_DEFINITIONS } from './definitions';
import { normalizeLineBreaks, setDeepValue } from './helpers';
import type {
  DocxFieldDefinition,
  DocxFieldValueParseResult,
  ValidatedDocxFieldMap,
} from './types';

const DOCX_BOOLEAN_TRUE = 'Sí';
const DOCX_BOOLEAN_FALSE = 'No';

function normalizeBoolean(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseDocxBoolean(rawValue: string): DocxFieldValueParseResult {
  if (rawValue === '') {
    return { ok: true, value: null };
  }

  const normalized = normalizeBoolean(rawValue);

  // Accept case/accent variants: "Sí", "SÍ", "sí", "SI", "si"
  if (rawValue === DOCX_BOOLEAN_TRUE || rawValue === 'true' || normalized === 'si') {
    return { ok: true, value: true };
  }

  // Accept case variants: "No", "NO", "no"
  if (rawValue === DOCX_BOOLEAN_FALSE || rawValue === 'false' || normalized === 'no') {
    return { ok: true, value: false };
  }

  return { ok: false };
}

function deserializeFieldValue(definition: DocxFieldDefinition, rawValue: string): DocxFieldValueParseResult {
  switch (definition.valueType) {
    case 'boolean':
      return parseDocxBoolean(rawValue.trim());
    case 'nullableString':
      if (rawValue.trim() === '') {
        return { ok: true, value: null };
      }

      if (definition.allowedValues && !definition.allowedValues.has(rawValue.trim())) {
        return { ok: false };
      }

      return { ok: true, value: rawValue.trim() };
    case 'string':
    default:
      return { ok: true, value: rawValue };
  }
}

export function validateDocxFieldMap(rawFieldValues: ReadonlyMap<string, string>): ValidatedDocxFieldMap {
  const data = createEmptyPIARFormDataV2();
  const invalidPaths: string[] = [];
  const checkboxConflictPaths: string[] = [];
  const missingPaths: string[] = [];
  const presentPaths: string[] = [];
  let recognizedFieldCount = 0;

  for (const definition of DOCX_FIELD_DEFINITIONS) {
    const rawValue = rawFieldValues.get(definition.path);
    if (rawValue === undefined) {
      missingPaths.push(definition.path);
      continue;
    }

    recognizedFieldCount += 1;
    const normalizedValue = normalizeLineBreaks(rawValue);
    if (normalizedValue === DOCX_CHECKBOX_CONFLICT_TOKEN) {
      checkboxConflictPaths.push(definition.path);
      continue;
    }

    const parsedValue = deserializeFieldValue(definition, normalizedValue);
    if (!parsedValue.ok) {
      invalidPaths.push(definition.path);
      continue;
    }

    setDeepValue(data, definition.segments, parsedValue.value);
    presentPaths.push(definition.path);
  }

  // Return data even when fields are missing - missing fields use defaults.
  // Only reject when values are invalid (unparseable/corrupt).
  return {
    data: invalidPaths.length === 0 ? data : null,
    invalidPaths,
    checkboxConflictPaths,
    missingPaths,
    presentPaths,
    recognizedFieldCount,
  };
}
