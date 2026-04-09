/**
 * Shared DOCX field-value serializer/deserializer used by generation and
 * import fallback validation.
 */

import { normalizeLineBreaks } from './helpers';
import type {
  DeserializedDocxFieldValue,
  DocxFieldDefinition,
  DocxFieldValueParseResult,
} from './types';

interface DeserializeDocxFieldValueOptions {
  invalidBooleanPolicy?: 'reject' | 'null';
  invalidAllowedValuePolicy?: 'reject' | 'as-is';
}

const DOCX_BOOLEAN_TRUE = 'Sí';
const DOCX_BOOLEAN_FALSE = 'No';

function normalizeBooleanToken(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseDocxBoolean(
  rawValue: string,
  invalidBooleanPolicy: NonNullable<DeserializeDocxFieldValueOptions['invalidBooleanPolicy']>,
): DocxFieldValueParseResult {
  if (rawValue === '') {
    return { ok: true, value: null };
  }

  const normalized = normalizeBooleanToken(rawValue);
  if (rawValue === DOCX_BOOLEAN_TRUE || rawValue === 'true' || normalized === 'si') {
    return { ok: true, value: true };
  }

  if (rawValue === DOCX_BOOLEAN_FALSE || rawValue === 'false' || normalized === 'no') {
    return { ok: true, value: false };
  }

  if (invalidBooleanPolicy === 'null') {
    return { ok: true, value: null };
  }

  return { ok: false };
}

function parseDocxNullableString(
  definition: DocxFieldDefinition,
  rawValue: string,
  invalidAllowedValuePolicy: NonNullable<DeserializeDocxFieldValueOptions['invalidAllowedValuePolicy']>,
): DocxFieldValueParseResult {
  const trimmed = rawValue.trim();
  if (trimmed === '') {
    return { ok: true, value: null };
  }

  if (
    definition.allowedValues
    && !definition.allowedValues.has(trimmed)
    && invalidAllowedValuePolicy === 'reject'
  ) {
    return { ok: false };
  }

  return { ok: true, value: trimmed };
}

export function deserializeDocxFieldValue(
  definition: DocxFieldDefinition,
  rawValue: string,
  options: DeserializeDocxFieldValueOptions = {},
): DocxFieldValueParseResult {
  const normalizedValue = normalizeLineBreaks(rawValue);

  switch (definition.valueType) {
    case 'boolean':
      return parseDocxBoolean(normalizedValue.trim(), options.invalidBooleanPolicy ?? 'reject');
    case 'nullableString':
      return parseDocxNullableString(
        definition,
        normalizedValue,
        options.invalidAllowedValuePolicy ?? 'reject',
      );
    case 'string':
    default:
      return { ok: true, value: normalizedValue };
  }
}

function serializeDocxBoolean(value: boolean | null): string {
  if (value === null) {
    return '';
  }

  return value ? DOCX_BOOLEAN_TRUE : DOCX_BOOLEAN_FALSE;
}

export function serializeDocxFieldValue(
  definition: DocxFieldDefinition,
  value: DeserializedDocxFieldValue | undefined,
): string {
  switch (definition.valueType) {
    case 'boolean':
      return serializeDocxBoolean((value as boolean | null | undefined) ?? null);
    case 'nullableString':
      return typeof value === 'string' ? value : '';
    case 'string':
    default:
      return typeof value === 'string' ? value : '';
  }
}
