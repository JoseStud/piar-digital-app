/**
 * Spanish-locale value formatters used by every PDF section.
 *
 * Examples: tri-state booleans to "Si" / "No" / "Sin respuesta",
 * date strings to DD/MM/YYYY, blank-or-missing to an em dash. Keep these
 * pure (no I/O, no React) so the same formatters can be reused by the
 * DOCX generator if needed.
 */
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

/** Formats tri-state booleans for the Spanish PDF output. */
export function formatBool(value: boolean | null): string {
  if (value === null) return '—';
  return value ? 'Sí' : 'No';
}

/** Joins the student's trimmed first and last names for display. */
export function formatStudentFullName(student: PIARFormDataV2['student']): string {
  return [student.nombres.trim(), student.apellidos.trim()].filter(Boolean).join(' ');
}
