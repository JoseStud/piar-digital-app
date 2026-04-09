/**
 * Resolves DOCX section names for PIAR schema paths.
 *
 * The manifest builder uses this to keep DOCX-specific grouping rules
 * separate from the canonical PIAR schema definitions.
 */

const DOCX_SECTION_BY_TOP_LEVEL_PATH = new Map<string, string>([
  ['header', 'Información General'],
  ['student', 'Información del Estudiante'],
  ['entornoSalud', 'Entorno de Salud'],
  ['entornoHogar', 'Entorno del Hogar'],
  ['entornoEducativo', 'Entorno Educativo'],
  ['valoracionPedagogica', 'Valoración Pedagógica'],
  ['competenciasDispositivos', 'Competencias y Dispositivos'],
  ['ajustes', 'Ajustes Razonables'],
  ['firmas', 'Firmas'],
  ['acta', 'Acta de Acuerdo'],
]);

const DOCX_HABILIDADES_SECTION_PATHS = new Set([
  'descripcionHabilidades',
  'estrategiasAcciones',
  'fechaProximaRevision',
]);

/** Resolves the DOCX section heading used for a manifest path. */
export function resolveDocxFieldSection(path: string): string {
  if (DOCX_HABILIDADES_SECTION_PATHS.has(path)) {
    return 'Habilidades y Estrategias';
  }

  const topLevelPath = path.split('.', 1)[0];
  const section = DOCX_SECTION_BY_TOP_LEVEL_PATH.get(topLevelPath);
  if (section) {
    return section;
  }

  throw new Error(`Missing DOCX section mapping for PIAR schema path "${path}".`);
}
