/**
 * Resolves DOCX field labels and control kinds from declarative metadata.
 *
 * This keeps Word-specific presentation rules out of the PIAR schema
 * while still compiling them into fast manifest lookup tables.
 */

import {
  COMPETENCIAS_GRUPOS,
  VALORACION_ASPECTOS,
} from '@piar-digital-app/features/piar/content/assessment-catalogs';
import type { PIARSchemaFieldDefinition } from '@piar-digital-app/features/piar/model/piar-schema';
import { humanizeIdentifier } from './helpers';
import type { DocxControlKind } from './types';

interface DocxFieldPresentationOverride {
  path: string;
  label?: string;
  richText?: boolean;
}

interface IndexedFieldPresentationDescriptor {
  prefix: string;
  count: number;
  labelPrefix: string;
  fieldLabels: Readonly<Record<string, string>>;
  richTextFields?: readonly string[];
}

interface GroupedFieldPresentationDescriptor {
  prefix: string;
  groupLabel: string;
  fieldLabels: Readonly<Record<string, string>>;
  richTextFields?: readonly string[];
}

const DOCX_DIRECT_FIELD_OVERRIDES: readonly DocxFieldPresentationOverride[] = [
  { path: 'student.capacidades', richText: true },
  { path: 'student.gustosIntereses', richText: true },
  { path: 'student.expectativasEstudiante', richText: true },
  { path: 'student.expectativasFamilia', richText: true },
  { path: 'student.redesApoyo', richText: true },
  { path: 'student.otrasObservaciones', richText: true },
  { path: 'entornoHogar.quienesApoyaCrianza', richText: true },
  { path: 'entornoHogar.personasConQuienVive', richText: true },
  { path: 'entornoEducativo.noVinculacionMotivo', richText: true },
  { path: 'entornoEducativo.institucionesAnteriores', richText: true },
  { path: 'entornoEducativo.observacionesHistorial', richText: true },
  { path: 'entornoEducativo.programasCuales', richText: true },
  {
    path: 'valoracionPedagogica.observacionesGenerales',
    label: 'Observaciones generales',
    richText: true,
  },
  {
    path: 'competenciasDispositivos.observacionesCompetencias',
    label: 'Observaciones de competencias y dispositivos',
    richText: true,
  },
  {
    path: 'descripcionHabilidades',
    label: 'Descripción de habilidades y destrezas',
    richText: true,
  },
  {
    path: 'estrategiasAcciones',
    label: 'Estrategias y acciones',
    richText: true,
  },
  {
    path: 'fechaProximaRevision',
    label: 'Fecha próxima revisión',
  },
  {
    path: 'firmas.firmantePIAR',
    label: 'Firmante PIAR',
    richText: true,
  },
  {
    path: 'firmas.firmanteAcudiente',
    label: 'Firmante acudiente',
    richText: true,
  },
  {
    path: 'acta.equipoDirectivosDocentes',
    label: 'Equipo directivos y docentes',
    richText: true,
  },
  {
    path: 'acta.familiaParticipante',
    label: 'Familia participante',
  },
  {
    path: 'acta.parentescoFamiliaParticipante',
    label: 'Parentesco familia participante',
  },
  {
    path: 'acta.compromisos',
    label: 'Compromisos',
    richText: true,
  },
  {
    path: 'acta.firmaEstudiante',
    label: 'Firma estudiante',
    richText: true,
  },
  {
    path: 'acta.firmaAcudiente',
    label: 'Firma acudiente',
    richText: true,
  },
  {
    path: 'acta.firmaDocentes',
    label: 'Firma docentes',
    richText: true,
  },
  {
    path: 'acta.firmaDirectivo',
    label: 'Firma directivo',
    richText: true,
  },
];

const DOCX_INDEXED_FIELD_DESCRIPTORS: readonly IndexedFieldPresentationDescriptor[] = [
  {
    prefix: 'entornoSalud.atencionMedica',
    count: 3,
    labelPrefix: 'Atención médica',
    fieldLabels: {
      aplica: 'Aplica',
      cual: 'Cuál',
      frecuencia: 'Frecuencia',
      horario: 'Horario',
    },
  },
  {
    prefix: 'entornoSalud.tratamientoTerapeutico',
    count: 3,
    labelPrefix: 'Tratamiento terapéutico',
    fieldLabels: {
      aplica: 'Aplica',
      cual: 'Cuál',
      frecuencia: 'Frecuencia',
      horario: 'Horario',
    },
  },
  {
    prefix: 'entornoSalud.medicamentos',
    count: 2,
    labelPrefix: 'Medicamentos',
    fieldLabels: {
      aplica: 'Aplica',
      cual: 'Cuál',
      frecuencia: 'Frecuencia',
      horario: 'Horario',
    },
  },
  {
    prefix: 'ajustes',
    count: 5,
    labelPrefix: 'Ajuste',
    fieldLabels: {
      area: 'Área',
      barreras: 'Barreras',
      tipoAjuste: 'Tipo de ajuste',
      apoyoRequerido: 'Apoyo requerido',
      descripcion: 'Descripción',
      seguimiento: 'Seguimiento',
    },
    richTextFields: ['barreras', 'tipoAjuste', 'apoyoRequerido', 'descripcion', 'seguimiento'],
  },
  {
    prefix: 'firmas.docentes',
    count: 9,
    labelPrefix: 'Docente',
    fieldLabels: {
      nombre: 'Nombre',
      area: 'Área',
      firma: 'Firma',
    },
    richTextFields: ['firma'],
  },
  {
    prefix: 'acta.actividades',
    count: 5,
    labelPrefix: 'Actividad',
    fieldLabels: {
      nombre: 'Nombre',
      descripcion: 'Descripción',
      frecuencia: 'Frecuencia',
    },
    richTextFields: ['descripcion'],
  },
];

const DOCX_GROUPED_FIELD_DESCRIPTORS: readonly GroupedFieldPresentationDescriptor[] = [
  {
    prefix: 'firmas.docenteOrientador',
    groupLabel: 'Docente orientador',
    fieldLabels: {
      nombre: 'Nombre',
      area: 'Área',
      firma: 'Firma',
    },
    richTextFields: ['firma'],
  },
  {
    prefix: 'firmas.docenteApoyoPedagogico',
    groupLabel: 'Docente apoyo pedagógico',
    fieldLabels: {
      nombre: 'Nombre',
      area: 'Área',
      firma: 'Firma',
    },
    richTextFields: ['firma'],
  },
  {
    prefix: 'firmas.coordinadorPedagogico',
    groupLabel: 'Coordinador pedagógico',
    fieldLabels: {
      nombre: 'Nombre',
      area: 'Área',
      firma: 'Firma',
    },
    richTextFields: ['firma'],
  },
];

function buildIndexedFieldOverrides(
  descriptor: IndexedFieldPresentationDescriptor,
): DocxFieldPresentationOverride[] {
  const richTextFields = new Set(descriptor.richTextFields ?? []);

  return Array.from({ length: descriptor.count }, (_, index) =>
    Object.entries(descriptor.fieldLabels).map(([field, fieldLabel]) => ({
      path: `${descriptor.prefix}.${index}.${field}`,
      label: `${descriptor.labelPrefix} ${index + 1} · ${fieldLabel}`,
      richText: richTextFields.has(field),
    }))).flat();
}

function buildGroupedFieldOverrides(
  descriptor: GroupedFieldPresentationDescriptor,
): DocxFieldPresentationOverride[] {
  const richTextFields = new Set(descriptor.richTextFields ?? []);

  return Object.entries(descriptor.fieldLabels).map(([field, fieldLabel]) => ({
    path: `${descriptor.prefix}.${field}`,
    label: `${descriptor.groupLabel} · ${fieldLabel}`,
    richText: richTextFields.has(field),
  }));
}

function buildValoracionAspectOverrides(): DocxFieldPresentationOverride[] {
  return VALORACION_ASPECTOS.flatMap((aspecto) => [
    ...aspecto.questions.map((question) => ({
      path: `valoracionPedagogica.${aspecto.key}.respuestas.${question.id}`,
      label: `${aspecto.label} · ${question.label}`,
    })),
    {
      path: `valoracionPedagogica.${aspecto.key}.intensidad`,
      label: `${aspecto.label} · Intensidad de apoyo`,
    },
    {
      path: `valoracionPedagogica.${aspecto.key}.observacion`,
      label: `${aspecto.label} · Observación`,
      richText: true,
    },
  ]);
}

function buildCompetenciaOverrides(): DocxFieldPresentationOverride[] {
  return COMPETENCIAS_GRUPOS.flatMap((group) =>
    group.items.map((item) => ({
      path: `competenciasDispositivos.${group.key}.${item.id}`,
      label: `${group.label} · ${item.label}`,
    })));
}

function compileDocxFieldPresentation(
  overrides: readonly DocxFieldPresentationOverride[],
): {
  labelOverrides: ReadonlyMap<string, string>;
  richTextPaths: ReadonlySet<string>;
} {
  const labelOverrides = new Map<string, string>();
  const richTextPaths = new Set<string>();

  for (const override of overrides) {
    if (override.label) {
      labelOverrides.set(override.path, override.label);
    }

    if (override.richText) {
      richTextPaths.add(override.path);
    }
  }

  return { labelOverrides, richTextPaths };
}

const DOCX_FIELD_PRESENTATION = compileDocxFieldPresentation([
  ...DOCX_DIRECT_FIELD_OVERRIDES,
  ...DOCX_INDEXED_FIELD_DESCRIPTORS.flatMap(buildIndexedFieldOverrides),
  ...DOCX_GROUPED_FIELD_DESCRIPTORS.flatMap(buildGroupedFieldOverrides),
  ...buildValoracionAspectOverrides(),
  ...buildCompetenciaOverrides(),
]);

/** Resolves the display label for a DOCX manifest field definition. */
export function resolveDocxFieldLabel(definition: PIARSchemaFieldDefinition): string {
  const override = DOCX_FIELD_PRESENTATION.labelOverrides.get(definition.path);
  if (override) {
    return override;
  }

  return humanizeIdentifier(definition.segments[definition.segments.length - 1]);
}

/** Resolves whether a DOCX manifest field should use plain or rich text. */
export function resolveDocxFieldKind(path: string): DocxControlKind {
  return DOCX_FIELD_PRESENTATION.richTextPaths.has(path) ? 'rich' : 'plain';
}
