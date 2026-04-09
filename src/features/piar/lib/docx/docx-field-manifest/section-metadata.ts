/**
 * Resolves DOCX section names for PIAR schema paths using the
 * reconciled visible export layout.
 */

const DOCX_DIRECT_SECTION_BY_PATH = new Map<string, string>([
  ['descripcionHabilidades', 'Descripción de Habilidades y Destrezas del Estudiante'],
  ['estrategiasAcciones', 'Estrategias y/o Acciones a Desarrollar con el Estudiante'],
  ['fechaProximaRevision', 'Estrategias y/o Acciones a Desarrollar con el Estudiante'],
  ['firmas.firmantePIAR', 'Firmantes del PIAR'],
  ['firmas.firmanteAcudiente', 'Firmantes del PIAR'],
]);

const DOCX_SECTION_PREFIXES: readonly [prefix: string, section: string][] = [
  ['firmas.docentes.', 'Firmas Docentes'],
  ['firmas.docenteOrientador.', 'Firmas Especiales'],
  ['firmas.docenteApoyoPedagogico.', 'Firmas Especiales'],
  ['firmas.coordinadorPedagogico.', 'Firmas Especiales'],
];

const DOCX_SECTION_BY_TOP_LEVEL_PATH = new Map<string, string>([
  ['header', 'Información General'],
  ['student', 'Información del Estudiante'],
  ['entornoSalud', 'Entorno de Salud'],
  ['entornoHogar', 'Entorno del Hogar'],
  ['entornoEducativo', 'Entorno Educativo'],
  ['valoracionPedagogica', 'Valoración Pedagógica'],
  ['competenciasDispositivos', 'Competencias y Dispositivos'],
  ['ajustes', 'Ajustes Razonables'],
  ['acta', 'Acta de Acuerdo'],
]);

/** Resolves the DOCX section heading used for a manifest path. */
export function resolveDocxFieldSection(path: string): string {
  const directSection = DOCX_DIRECT_SECTION_BY_PATH.get(path);
  if (directSection) {
    return directSection;
  }

  for (const [prefix, section] of DOCX_SECTION_PREFIXES) {
    if (path.startsWith(prefix)) {
      return section;
    }
  }

  const topLevelPath = path.split('.', 1)[0];
  const section = DOCX_SECTION_BY_TOP_LEVEL_PATH.get(topLevelPath);
  if (section) {
    return section;
  }

  throw new Error(`Missing DOCX section mapping for PIAR schema path "${path}".`);
}
