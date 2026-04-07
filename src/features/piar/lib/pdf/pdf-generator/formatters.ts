import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

export function formatBool(value: boolean | null): string {
  if (value === null) return '—';
  return value ? 'Sí' : 'No';
}

export function formatStudentFullName(student: PIARFormDataV2['student']): string {
  return [student.nombres.trim(), student.apellidos.trim()].filter(Boolean).join(' ');
}
