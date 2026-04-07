import type { PIARFormDataV2 } from '@/features/piar/model/piar';

export type DocxControlKind = 'plain' | 'rich';
export type DocxValueType = 'string' | 'boolean' | 'nullableString';
export type DeserializedDocxFieldValue = string | boolean | null;
export type DocxBindingMode = 'text' | 'richText' | 'checkboxPair' | 'checkboxGroup';

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

export interface DocxFieldValueParseSuccess {
  ok: true;
  value: DeserializedDocxFieldValue;
}

export interface DocxFieldValueParseFailure {
  ok: false;
}

export type DocxFieldValueParseResult = DocxFieldValueParseSuccess | DocxFieldValueParseFailure;

export interface ValidatedDocxFieldMap {
  data: PIARFormDataV2 | null;
  invalidPaths: string[];
  checkboxConflictPaths: string[];
  missingPaths: string[];
  presentPaths: string[];
  recognizedFieldCount: number;
}
