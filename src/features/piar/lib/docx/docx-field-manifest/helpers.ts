/**
 * Small utilities for walking PIAR form data by path string and
 * coercing values for DOCX storage.
 */

import type {
  DocxBindingMode,
  DocxControlKind,
  DocxFieldDefinition,
  DocxValueType,
} from './types';

/** Normalizes Windows line endings to the DOCX newline convention. */
export function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n/g, '\n');
}

/** Turns an identifier into a human-readable label. */
export function humanizeIdentifier(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

/** Builds one manifest entry from its path, section, and value shape. */
export function createDefinition(
  path: string,
  section: string,
  label: string,
  valueType: DocxValueType,
  kind: DocxControlKind = 'plain',
  allowedValues?: ReadonlySet<string>,
): DocxFieldDefinition {
  let bindingMode: DocxBindingMode;
  let optionTokens: readonly string[] | undefined;

  if (valueType === 'boolean') {
    bindingMode = 'checkboxPair';
    optionTokens = ['true', 'false'];
  } else if (allowedValues && allowedValues.size > 0) {
    bindingMode = 'checkboxGroup';
    optionTokens = Array.from(allowedValues);
  } else {
    bindingMode = kind === 'rich' ? 'richText' : 'text';
  }

  return {
    path,
    segments: path.split('.'),
    section,
    label,
    kind,
    valueType,
    bindingMode,
    optionTokens,
    allowedValues,
  };
}

/** Reads a deep property value from a POJO using dot-separated segments. */
export function getDeepValue(source: unknown, segments: readonly string[]): unknown {
  let current: unknown = source;
  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }

    const key = /^\d+$/.test(segment) ? Number(segment) : segment;
    current = (current as Record<string | number, unknown>)[key];
  }

  return current;
}

/** Writes a deep property value into a POJO using dot-separated segments. */
export function setDeepValue(target: unknown, segments: readonly string[], value: unknown): void {
  let current = target as Record<string | number, unknown>;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const rawKey = segments[index];
    const key = /^\d+$/.test(rawKey) ? Number(rawKey) : rawKey;
    current = current[key] as Record<string | number, unknown>;
  }

  const lastSegment = segments[segments.length - 1];
  const lastKey = /^\d+$/.test(lastSegment) ? Number(lastSegment) : lastSegment;
  current[lastKey] = value;
}
