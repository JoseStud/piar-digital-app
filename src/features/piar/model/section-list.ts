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
  { id: 'ajustes', label: 'Ajustes Razonables' },
  { id: 'firmas', label: 'Firmas' },
  { id: 'acta', label: 'Acta de Acuerdo' },
] as const;

export type PiarSectionId = (typeof SECTION_LIST)[number]['id'];
