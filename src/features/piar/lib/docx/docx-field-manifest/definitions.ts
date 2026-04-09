/**
 * Builds the DOCX field manifest from the PIAR schema and assessment
 * catalogs.
 *
 * The manifest is the shared lookup table used by the DOCX instrumenters
 * and importer fallback path.
 */

import {
  COMPETENCIAS_GRUPOS,
  VALORACION_ASPECTOS,
} from '@piar-digital-app/features/piar/content/assessment-catalogs';
import {
  PIAR_SCHEMA_FIELD_DEFINITIONS,
  type PIARSchemaFieldDefinition,
} from '@piar-digital-app/features/piar/model/piar-schema';
import { createDefinition, humanizeIdentifier } from './helpers';
import type { DocxControlKind, DocxFieldDefinition } from './types';

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

const DOCX_RICH_TEXT_PATHS = new Set<string>();
const DOCX_LABEL_OVERRIDES = new Map<string, string>();

function addRichTextPaths(paths: readonly string[]): void {
  for (const path of paths) {
    DOCX_RICH_TEXT_PATHS.add(path);
  }
}

function addLabelOverride(path: string, label: string): void {
  DOCX_LABEL_OVERRIDES.set(path, label);
}

function addIndexedFieldOverrides(
  prefix: string,
  count: number,
  labelPrefix: string,
  fieldLabels: Readonly<Record<string, string>>,
  richTextFields: ReadonlySet<string> = new Set<string>(),
): void {
  for (let index = 0; index < count; index += 1) {
    for (const [field, fieldLabel] of Object.entries(fieldLabels)) {
      const path = `${prefix}.${index}.${field}`;
      addLabelOverride(path, `${labelPrefix} ${index + 1} · ${fieldLabel}`);

      if (richTextFields.has(field)) {
        DOCX_RICH_TEXT_PATHS.add(path);
      }
    }
  }
}

function addGroupedFieldOverrides(
  prefix: string,
  groupLabel: string,
  fieldLabels: Readonly<Record<string, string>>,
  richTextFields: ReadonlySet<string> = new Set<string>(),
): void {
  for (const [field, fieldLabel] of Object.entries(fieldLabels)) {
    const path = `${prefix}.${field}`;
    addLabelOverride(path, `${groupLabel} · ${fieldLabel}`);

    if (richTextFields.has(field)) {
      DOCX_RICH_TEXT_PATHS.add(path);
    }
  }
}

addRichTextPaths([
  'student.capacidades',
  'student.gustosIntereses',
  'student.expectativasEstudiante',
  'student.expectativasFamilia',
  'student.redesApoyo',
  'student.otrasObservaciones',
  'entornoHogar.quienesApoyaCrianza',
  'entornoHogar.personasConQuienVive',
  'entornoEducativo.noVinculacionMotivo',
  'entornoEducativo.institucionesAnteriores',
  'entornoEducativo.observacionesHistorial',
  'entornoEducativo.programasCuales',
  'valoracionPedagogica.observacionesGenerales',
  'competenciasDispositivos.observacionesCompetencias',
  'descripcionHabilidades',
  'estrategiasAcciones',
  'firmas.firmantePIAR',
  'firmas.firmanteAcudiente',
  'acta.equipoDirectivosDocentes',
  'acta.compromisos',
  'acta.firmaEstudiante',
  'acta.firmaAcudiente',
  'acta.firmaDocentes',
  'acta.firmaDirectivo',
]);

addLabelOverride('valoracionPedagogica.observacionesGenerales', 'Observaciones generales');
addLabelOverride('competenciasDispositivos.observacionesCompetencias', 'Observaciones de competencias y dispositivos');
addLabelOverride('descripcionHabilidades', 'Descripción de habilidades y destrezas');
addLabelOverride('estrategiasAcciones', 'Estrategias y acciones');
addLabelOverride('fechaProximaRevision', 'Fecha próxima revisión');
addLabelOverride('firmas.firmantePIAR', 'Firmante PIAR');
addLabelOverride('firmas.firmanteAcudiente', 'Firmante acudiente');
addLabelOverride('acta.equipoDirectivosDocentes', 'Equipo directivos y docentes');
addLabelOverride('acta.familiaParticipante', 'Familia participante');
addLabelOverride('acta.parentescoFamiliaParticipante', 'Parentesco familia participante');
addLabelOverride('acta.compromisos', 'Compromisos');
addLabelOverride('acta.firmaEstudiante', 'Firma estudiante');
addLabelOverride('acta.firmaAcudiente', 'Firma acudiente');
addLabelOverride('acta.firmaDocentes', 'Firma docentes');
addLabelOverride('acta.firmaDirectivo', 'Firma directivo');

for (const group of [
  { key: 'atencionMedica', label: 'Atención médica', length: 3 },
  { key: 'tratamientoTerapeutico', label: 'Tratamiento terapéutico', length: 3 },
  { key: 'medicamentos', label: 'Medicamentos', length: 2 },
] as const) {
  for (let index = 0; index < group.length; index += 1) {
    addLabelOverride(`entornoSalud.${group.key}.${index}.aplica`, `${group.label} ${index + 1} · Aplica`);
    addLabelOverride(`entornoSalud.${group.key}.${index}.cual`, `${group.label} ${index + 1} · Cuál`);
    addLabelOverride(`entornoSalud.${group.key}.${index}.frecuencia`, `${group.label} ${index + 1} · Frecuencia`);
    addLabelOverride(`entornoSalud.${group.key}.${index}.horario`, `${group.label} ${index + 1} · Horario`);
  }
}

for (const aspecto of VALORACION_ASPECTOS) {
  for (const question of aspecto.questions) {
    addLabelOverride(
      `valoracionPedagogica.${aspecto.key}.respuestas.${question.id}`,
      `${aspecto.label} · ${question.label}`,
    );
  }

  addLabelOverride(
    `valoracionPedagogica.${aspecto.key}.intensidad`,
    `${aspecto.label} · Intensidad de apoyo`,
  );
  addLabelOverride(
    `valoracionPedagogica.${aspecto.key}.observacion`,
    `${aspecto.label} · Observación`,
  );
  DOCX_RICH_TEXT_PATHS.add(`valoracionPedagogica.${aspecto.key}.observacion`);
}

for (const group of COMPETENCIAS_GRUPOS) {
  for (const item of group.items) {
    addLabelOverride(
      `competenciasDispositivos.${group.key}.${item.id}`,
      `${group.label} · ${item.label}`,
    );
  }
}

addIndexedFieldOverrides(
  'ajustes',
  5,
  'Ajuste',
  {
    area: 'Área',
    barreras: 'Barreras',
    tipoAjuste: 'Tipo de ajuste',
    apoyoRequerido: 'Apoyo requerido',
    descripcion: 'Descripción',
    seguimiento: 'Seguimiento',
  },
  new Set(['barreras', 'tipoAjuste', 'apoyoRequerido', 'descripcion', 'seguimiento']),
);

addIndexedFieldOverrides(
  'firmas.docentes',
  9,
  'Docente',
  {
    nombre: 'Nombre',
    area: 'Área',
    firma: 'Firma',
  },
  new Set(['firma']),
);

for (const role of [
  { key: 'docenteOrientador', label: 'Docente orientador' },
  { key: 'docenteApoyoPedagogico', label: 'Docente apoyo pedagógico' },
  { key: 'coordinadorPedagogico', label: 'Coordinador pedagógico' },
] as const) {
  addGroupedFieldOverrides(
    `firmas.${role.key}`,
    role.label,
    {
      nombre: 'Nombre',
      area: 'Área',
      firma: 'Firma',
    },
    new Set(['firma']),
  );
}

addIndexedFieldOverrides(
  'acta.actividades',
  5,
  'Actividad',
  {
    nombre: 'Nombre',
    descripcion: 'Descripción',
    frecuencia: 'Frecuencia',
  },
  new Set(['descripcion']),
);

function getDocxFieldSection(path: string): string {
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

function getDocxFieldLabel(definition: PIARSchemaFieldDefinition): string {
  const override = DOCX_LABEL_OVERRIDES.get(definition.path);
  if (override) {
    return override;
  }

  return humanizeIdentifier(definition.segments[definition.segments.length - 1]);
}

function getDocxFieldKind(path: string): DocxControlKind {
  return DOCX_RICH_TEXT_PATHS.has(path) ? 'rich' : 'plain';
}

function buildDocxFieldDefinitions(): DocxFieldDefinition[] {
  return PIAR_SCHEMA_FIELD_DEFINITIONS.map((definition) =>
    createDefinition(
      definition.path,
      getDocxFieldSection(definition.path),
      getDocxFieldLabel(definition),
      definition.valueType,
      getDocxFieldKind(definition.path),
      definition.allowedValues,
    ));
}

const DOCX_FIELD_DEFINITIONS = buildDocxFieldDefinitions();

/** Fast lookup from field path to manifest definition. */
export const DOCX_FIELD_DEFINITION_MAP = new Map(
  DOCX_FIELD_DEFINITIONS.map((definition) => [definition.path, definition]),
);
/** Manifest definitions grouped by section name for the instrumenters. */
export const DOCX_FIELD_DEFINITIONS_BY_SECTION = DOCX_FIELD_DEFINITIONS.reduce<Map<string, DocxFieldDefinition[]>>((sections, definition) => {
  const entries = sections.get(definition.section);
  if (entries) {
    entries.push(definition);
  } else {
    sections.set(definition.section, [definition]);
  }
  return sections;
}, new Map());

/** Flat list of every DOCX field definition. */
export { DOCX_FIELD_DEFINITIONS };
