/**
 * Helpers for the tri-state boolean SELECT pattern used throughout the form.
 *
 * `boolNullToString` and `stringToBoolNull` are the conversion pair.
 * `BOOL_SELECT_CLASS` is the shared Tailwind class string so every
 * occurrence renders identically without each section component
 * re-declaring it.
 */
/** Converts a tri-state boolean into the string value used by select inputs. */
export function boolNullToString(val: boolean | null): string {
  if (val === null) return '';
  return val ? 'true' : 'false';
}

/** Converts the select input string value back into a tri-state boolean. */
export function stringToBoolNull(val: string): boolean | null {
  if (val === '') return null;
  return val === 'true';
}

/** Shared class string for tri-state boolean select controls. */
export const BOOL_SELECT_CLASS =
  'typ-body w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/40 focus-visible:outline-offset-1';
