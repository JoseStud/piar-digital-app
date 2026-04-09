/**
 * Pure inline-validation helpers for the PIAR form.
 *
 * These helpers are intentionally small and dependency-free so they can
 * be reused from blur handlers without pulling validation logic into the
 * section components themselves.
 */

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function validateFecha(value: string): string | null {
  const trimmed = value.trim();
  if (isBlank(trimmed)) {
    return 'La fecha debe tener el formato AAAA-MM-DD o DD/MM/AAAA.';
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const localizedMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  let year: number;
  let month: number;
  let day: number;

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (localizedMatch) {
    day = Number(localizedMatch[1]);
    month = Number(localizedMatch[2]);
    year = Number(localizedMatch[3]);
  } else {
    return 'La fecha debe tener el formato AAAA-MM-DD o DD/MM/AAAA.';
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime())
    || date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return 'La fecha debe ser valida.';
  }

  return null;
}

export function validateNumericId(value: string): string | null {
  const trimmed = value.trim();
  if (isBlank(trimmed)) {
    return 'El número de identificación no puede estar vacío.';
  }

  if (!/^\d+$/.test(trimmed)) {
    return 'El número de identificación solo debe contener dígitos, sin puntos ni espacios.';
  }

  return null;
}

export function validateNotEmpty(value: string, fieldLabel: string): string | null {
  if (isBlank(value)) {
    return `El campo ${fieldLabel} no puede estar vacío.`;
  }

  return null;
}

export function validateAge(value: string): string | null {
  const trimmed = value.trim();
  if (isBlank(trimmed)) {
    return 'La edad debe estar entre 1 y 25 años.';
  }

  const match = trimmed.match(/^(\d{1,2})(?:\s*(?:años?|anos?))?$/i);
  if (!match) {
    return 'La edad debe escribirse como un número entre 1 y 25 años.';
  }

  const age = Number(match[1]);
  if (!Number.isInteger(age) || age < 1 || age > 25) {
    return 'La edad debe estar entre 1 y 25 años.';
  }

  return null;
}
