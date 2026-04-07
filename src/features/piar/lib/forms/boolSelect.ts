export function boolNullToString(val: boolean | null): string {
  if (val === null) return '';
  return val ? 'true' : 'false';
}

export function stringToBoolNull(val: string): boolean | null {
  if (val === '') return null;
  return val === 'true';
}

export const BOOL_SELECT_CLASS =
  'typ-body w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/40 focus-visible:outline-offset-1';
