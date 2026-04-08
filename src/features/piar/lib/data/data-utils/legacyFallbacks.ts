/**
 * Helpers for converting legacy field shapes into V2 shapes.
 *
 * These utilities exist because older PIAR payloads and early shipped
 * code paths did not cleanly separate V1 and V2 field names. Importers
 * use them to repair legacy data silently rather than rejecting it.
 */
/** Splits a legacy full-name string into separate given-name and surname values. */
export function splitLegacyStudentName(fullName: string): { nombres: string; apellidos: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { nombres: '', apellidos: '' };
  }

  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) {
    return { nombres: trimmed, apellidos: '' };
  }

  return {
    nombres: trimmed.slice(0, lastSpace),
    apellidos: trimmed.slice(lastSpace + 1),
  };
}

/** Prefers the first non-empty string, falling back to the alternate string or an empty value. */
export function preferNonEmptyString(primary: unknown, fallback: unknown): string {
  if (typeof primary === 'string' && primary.trim() !== '') {
    return primary;
  }

  if (typeof fallback === 'string') {
    return fallback;
  }

  return '';
}
