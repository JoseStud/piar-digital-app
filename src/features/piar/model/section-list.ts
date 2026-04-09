/**
 * Ordered list of form sections used by the navigation/progress UI to render a sidebar and compute active state.
 */
export const SECTION_LIST = [
  { id: 'info-general', label: 'Info General' },
  { id: 'estudiante', label: 'Estudiante' },
  { id: 'salud', label: 'Entorno Salud' },
  { id: 'hogar', label: 'Entorno Hogar' },
  { id: 'educativo', label: 'Entorno Educativo' },
  { id: 'valoracion', label: 'Valoración Pedagógica' },
  { id: 'competencias', label: 'Competencias' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'estrategias', label: 'Estrategias' },
  { id: 'firmantes-piar', label: 'Firmantes PIAR' },
  { id: 'ajustes', label: 'Ajustes Razonables' },
  { id: 'firmas-docentes', label: 'Firmas Docentes' },
  { id: 'firmas-especiales', label: 'Firmas Especiales' },
  { id: 'acta', label: 'Acta de Acuerdo' },
] as const;

/** Stable identifier for a form section in the sidebar and scroll-spy logic. */
export type PiarSectionId = (typeof SECTION_LIST)[number]['id'];
