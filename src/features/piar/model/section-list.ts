/**
 * Ordered list of form sections used by the navigation/progress UI to render a sidebar and compute active state.
 */
export const ANNEX_LIST = [
  { id: 'anexo-1', label: 'Anexo 1' },
  { id: 'anexo-2', label: 'Anexo 2' },
  { id: 'anexo-3', label: 'Anexo 3' },
] as const;

export const SECTION_LIST = [
  { id: 'info-general', annexId: 'anexo-1', annexLabel: 'Anexo 1', navLabel: 'Info General', title: 'Información General' },
  { id: 'estudiante', annexId: 'anexo-1', annexLabel: 'Anexo 1', navLabel: 'Estudiante', title: 'Datos del Estudiante' },
  { id: 'salud', annexId: 'anexo-1', annexLabel: 'Anexo 1', navLabel: 'Entorno Salud', title: 'Entorno Salud' },
  { id: 'hogar', annexId: 'anexo-1', annexLabel: 'Anexo 1', navLabel: 'Entorno Hogar', title: 'Entorno Hogar' },
  { id: 'educativo', annexId: 'anexo-1', annexLabel: 'Anexo 1', navLabel: 'Entorno Educativo', title: 'Entorno Educativo' },
  { id: 'valoracion', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Valoración Pedagógica', title: 'Valoración Pedagógica' },
  { id: 'competencias', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Competencias', title: 'Competencias y Dispositivos de Aprendizaje' },
  { id: 'habilidades', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Habilidades', title: 'Descripción de Habilidades y Destrezas del Estudiante' },
  { id: 'estrategias', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Estrategias', title: 'Estrategias y/o Acciones a Desarrollar con el Estudiante' },
  { id: 'firmantes-piar', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Firmantes PIAR', title: 'Firmantes del PIAR' },
  { id: 'ajustes', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Ajustes Razonables', title: 'Ajustes Razonables' },
  { id: 'firmas-docentes', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Firmas Docentes', title: 'Firmas Docentes' },
  { id: 'firmas-especiales', annexId: 'anexo-2', annexLabel: 'Anexo 2', navLabel: 'Firmas Especiales', title: 'Firmas Especiales' },
  { id: 'acta', annexId: 'anexo-3', annexLabel: 'Anexo 3', navLabel: 'Acta de Acuerdo', title: 'Acta de Acuerdo' },
] as const;

/** Stable identifier for a form section in the sidebar and scroll-spy logic. */
export type PiarSectionId = (typeof SECTION_LIST)[number]['id'];
