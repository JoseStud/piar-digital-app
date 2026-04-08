/** Spanish date/string formatters used by the acta sub-components. */
import type { StudentV2 } from '@piar-digital-app/features/piar/model/piar';

export function formatStudentFullName(student: StudentV2): string {
  return [student.nombres.trim(), student.apellidos.trim()].filter(Boolean).join(' ');
}

export function formatSedeJornada(sede: string, jornada: string): string {
  return [sede.trim(), jornada.trim()].filter(Boolean).join(' · ');
}
