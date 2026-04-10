/**
 * Ordered list of form sections used by the navigation/progress UI to render a sidebar and compute active state.
 */
export const SECTION_LIST = [
  { id: 'info-general', label: 'Anexo 1 · Info General' },
  { id: 'estudiante', label: 'Anexo 1 · Estudiante' },
  { id: 'salud', label: 'Anexo 1 · Entorno Salud' },
  { id: 'hogar', label: 'Anexo 1 · Entorno Hogar' },
  { id: 'educativo', label: 'Anexo 1 · Entorno Educativo' },
  { id: 'valoracion', label: 'Anexo 2 · Valoración Pedagógica' },
  { id: 'competencias', label: 'Anexo 2 · Competencias' },
  { id: 'habilidades', label: 'Anexo 2 · Habilidades' },
  { id: 'estrategias', label: 'Anexo 2 · Estrategias' },
  { id: 'firmantes-piar', label: 'Anexo 2 · Firmantes PIAR' },
  { id: 'ajustes', label: 'Anexo 2 · Ajustes Razonables' },
  { id: 'firmas-docentes', label: 'Anexo 2 · Firmas Docentes' },
  { id: 'firmas-especiales', label: 'Anexo 2 · Firmas Especiales' },
  { id: 'acta', label: 'Anexo 3 · Acta de Acuerdo' },
] as const;

/** Stable identifier for a form section in the sidebar and scroll-spy logic. */
export type PiarSectionId = (typeof SECTION_LIST)[number]['id'];
