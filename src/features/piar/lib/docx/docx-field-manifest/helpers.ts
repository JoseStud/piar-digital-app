import type {
  DocxBindingMode,
  DocxControlKind,
  DocxFieldDefinition,
  DocxValueType,
} from './types';

export function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n/g, '\n');
}

export function humanizeIdentifier(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

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
