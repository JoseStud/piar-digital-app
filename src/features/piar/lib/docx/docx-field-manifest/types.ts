/**
 * Type definitions for field manifest entries and DOCX import
 * validation results.
 */

import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

/** Control rendering modes used by the DOCX template. */
export type DocxControlKind = 'plain' | 'rich';
/** Value coercion modes used by the field manifest. */
export type DocxValueType = 'string' | 'boolean' | 'nullableString';
/** Deserialized values produced while reading DOCX field content. */
export type DeserializedDocxFieldValue = string | boolean | null;
/** Binding modes that control how a field is represented in Word. */
export type DocxBindingMode = 'text' | 'richText' | 'checkboxPair' | 'checkboxGroup';

/** One field entry in the DOCX manifest. */
export interface DocxFieldDefinition {
  path: string;
  segments: string[];
  section: string;
  label: string;
  kind: DocxControlKind;
  valueType: DocxValueType;
  bindingMode: DocxBindingMode;
  optionTokens?: readonly string[];
  allowedValues?: ReadonlySet<string>;
}

/** Successful parse result for a field value. */
export interface DocxFieldValueParseSuccess {
  ok: true;
  value: DeserializedDocxFieldValue;
}

/** Failed parse result for a field value. */
export interface DocxFieldValueParseFailure {
  ok: false;
}

/** Parse result union for a field value. */
export type DocxFieldValueParseResult = DocxFieldValueParseSuccess | DocxFieldValueParseFailure;

/** Validation summary produced when reading a DOCX field map. */
export interface ValidatedDocxFieldMap {
  data: PIARFormDataV2 | null;
  invalidPaths: string[];
  checkboxConflictPaths: string[];
  missingPaths: string[];
  presentPaths: string[];
  recognizedFieldCount: number;
}
