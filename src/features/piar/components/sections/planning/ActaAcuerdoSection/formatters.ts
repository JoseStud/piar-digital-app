import type { StudentV2 } from '@/features/piar/model/piar';

export function formatStudentFullName(student: StudentV2): string {
  return [student.nombres.trim(), student.apellidos.trim()].filter(Boolean).join(' ');
}

export function formatSedeJornada(sede: string, jornada: string): string {
  return [sede.trim(), jornada.trim()].filter(Boolean).join(' · ');
}
