import {
  COMPETENCIAS_GRUPOS,
  INTENSIDAD_OPTIONS,
  VALORACION_ASPECTOS,
} from '@/features/piar/content/assessment-catalogs';
import { createDefinition, humanizeIdentifier } from './helpers';
import type { DocxFieldDefinition } from './types';

const DOCX_FIELD_DEFINITIONS: DocxFieldDefinition[] = [];
const DOCX_ALLOWED_REGIMEN_VALUES = new Set(['contributivo', 'subsidiado', 'otro']);
const DOCX_ALLOWED_ESTADO_GRADO_VALUES = new Set(['aprobado', 'sinTerminar']);
export const DOCX_SUPPORTED_INTENSITIES = new Set<string>(INTENSIDAD_OPTIONS.map((option) => option.value));

function addStringFields(
  section: string,
  prefix: string,
  fields: readonly string[],
  richFields = new Set<string>(),
) {
  for (const field of fields) {
    const path = `${prefix}.${field}`;
    DOCX_FIELD_DEFINITIONS.push(
      createDefinition(
        path,
        section,
        humanizeIdentifier(field),
        'string',
        richFields.has(field) ? 'rich' : 'plain',
      ),
    );
  }
}

function addBooleanFields(section: string, prefix: string, fields: readonly string[]) {
  for (const field of fields) {
    DOCX_FIELD_DEFINITIONS.push(
      createDefinition(
        `${prefix}.${field}`,
        section,
        humanizeIdentifier(field),
        'boolean',
      ),
    );
  }
}

function addNullableStringFields(
  section: string,
  prefix: string,
  fields: readonly string[],
  allowedValuesByField: Partial<Record<string, ReadonlySet<string>>> = {},
) {
  for (const field of fields) {
    DOCX_FIELD_DEFINITIONS.push(
      createDefinition(
        `${prefix}.${field}`,
        section,
        humanizeIdentifier(field),
        'nullableString',
        'plain',
        allowedValuesByField[field],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Section: Header Fields
// ─────────────────────────────────────────────

addStringFields('Información General', 'header', [
  'fechaDiligenciamiento',
  'lugarDiligenciamiento',
  'nombrePersonaDiligencia',
  'rolPersonaDiligencia',
  'institucionEducativa',
  'sede',
  'jornada',
]);

// ─────────────────────────────────────────────
// Section: Student Fields
// ─────────────────────────────────────────────

addStringFields('Información del Estudiante', 'student', [
  'nombres',
  'apellidos',
  'tipoIdentificacion',
  'numeroIdentificacion',
  'lugarNacimiento',
  'fechaNacimiento',
  'edad',
  'grado',
  'gradoAspiraIngresar',
  'departamento',
  'municipio',
  'barrio',
  'direccion',
  'telefono',
  'correo',
  'victimaConflictoRegistro',
  'centroProteccionLugar',
  'grupoEtnicoCual',
  'capacidades',
  'gustosIntereses',
  'expectativasEstudiante',
  'expectativasFamilia',
  'redesApoyo',
  'otrasObservaciones',
], new Set([
  'capacidades',
  'gustosIntereses',
  'expectativasEstudiante',
  'expectativasFamilia',
  'redesApoyo',
  'otrasObservaciones',
]));

addBooleanFields('Información del Estudiante', 'student', [
  'vinculadoSistemaAnterior',
  'victimaConflicto',
  'centroProteccion',
  'grupoEtnico',
]);

addBooleanFields('Entorno de Salud', 'entornoSalud', [
  'afiliacionSalud',
  'diagnosticoMedico',
  'apoyosTecnicos',
]);

// ─────────────────────────────────────────────
// Section: Entorno Salud
// ─────────────────────────────────────────────

addNullableStringFields('Entorno de Salud', 'entornoSalud', ['regimen'], {
  regimen: DOCX_ALLOWED_REGIMEN_VALUES,
});

addStringFields('Entorno de Salud', 'entornoSalud', [
  'regimenCual',
  'eps',
  'lugarAtencionEmergencia',
  'diagnosticoCual',
  'sectorSaludFrecuencia',
  'tratamientoMedicoCual',
  'apoyosTecnicosCuales',
]);

for (const group of [
  { key: 'atencionMedica', label: 'Atención médica', length: 3 },
  { key: 'tratamientoTerapeutico', label: 'Tratamiento terapéutico', length: 3 },
  { key: 'medicamentos', label: 'Medicamentos', length: 2 },
] as const) {
  for (let index = 0; index < group.length; index += 1) {
    DOCX_FIELD_DEFINITIONS.push(
      createDefinition(
        `entornoSalud.${group.key}.${index}.aplica`,
        'Entorno de Salud',
        `${group.label} ${index + 1} · Aplica`,
        'boolean',
      ),
      createDefinition(
        `entornoSalud.${group.key}.${index}.cual`,
        'Entorno de Salud',
        `${group.label} ${index + 1} · Cuál`,
        'string',
      ),
      createDefinition(
        `entornoSalud.${group.key}.${index}.frecuencia`,
        'Entorno de Salud',
        `${group.label} ${index + 1} · Frecuencia`,
        'string',
      ),
      createDefinition(
        `entornoSalud.${group.key}.${index}.horario`,
        'Entorno de Salud',
        `${group.label} ${index + 1} · Horario`,
        'string',
      ),
    );
  }
}

addStringFields('Entorno del Hogar', 'entornoHogar', [
  'nombreMadre',
  'ocupacionMadre',
  'nivelEducativoMadre',
  'nombrePadre',
  'ocupacionPadre',
  'nivelEducativoPadre',
  'nombreCuidador',
  'parentescoCuidador',
  'nivelEducativoCuidador',
  'telefonoCuidador',
  'correoCuidador',
  'numHermanos',
  'lugarQueOcupa',
  'quienesApoyaCrianza',
  'personasConQuienVive',
  'subsidioEntidad',
  'subsidioCual',
], new Set(['quienesApoyaCrianza', 'personasConQuienVive']));

addBooleanFields('Entorno del Hogar', 'entornoHogar', [
  'estaBajoProteccion',
]);

// ─────────────────────────────────────────────
// Section: Entorno Educativo
// ─────────────────────────────────────────────

addBooleanFields('Entorno Educativo', 'entornoEducativo', [
  'vinculadoOtraInstitucion',
  'recibeInformePedagogico',
  'programasComplementarios',
]);

addNullableStringFields('Entorno Educativo', 'entornoEducativo', ['estadoGrado'], {
  estadoGrado: DOCX_ALLOWED_ESTADO_GRADO_VALUES,
});

addStringFields('Entorno Educativo', 'entornoEducativo', [
  'noVinculacionMotivo',
  'institucionesAnteriores',
  'ultimoGradoCursado',
  'observacionesHistorial',
  'institucionInforme',
  'programasCuales',
  'medioTransporte',
  'distanciaTiempo',
], new Set(['noVinculacionMotivo', 'institucionesAnteriores', 'observacionesHistorial', 'programasCuales']));

// ─────────────────────────────────────────────
// Section: Valoracion Pedagogica
// ─────────────────────────────────────────────

for (const aspecto of VALORACION_ASPECTOS) {
  for (const question of aspecto.questions) {
    DOCX_FIELD_DEFINITIONS.push(
      createDefinition(
        `valoracionPedagogica.${aspecto.key}.respuestas.${question.id}`,
        'Valoración Pedagógica',
        `${aspecto.label} · ${question.label}`,
        'boolean',
      ),
    );
  }

  DOCX_FIELD_DEFINITIONS.push(
    createDefinition(
      `valoracionPedagogica.${aspecto.key}.intensidad`,
      'Valoración Pedagógica',
      `${aspecto.label} · Intensidad de apoyo`,
      'nullableString',
      'plain',
      DOCX_SUPPORTED_INTENSITIES,
    ),
    createDefinition(
      `valoracionPedagogica.${aspecto.key}.observacion`,
      'Valoración Pedagógica',
      `${aspecto.label} · Observación`,
      'string',
      'rich',
    ),
  );
}

DOCX_FIELD_DEFINITIONS.push(
  createDefinition(
    'valoracionPedagogica.observacionesGenerales',
    'Valoración Pedagógica',
    'Observaciones generales',
    'string',
    'rich',
  ),
);

// ─────────────────────────────────────────────
// Section: Competencias y Dispositivos
// ─────────────────────────────────────────────

for (const group of COMPETENCIAS_GRUPOS) {
  for (const item of group.items) {
    DOCX_FIELD_DEFINITIONS.push(
      createDefinition(
        `competenciasDispositivos.${group.key}.${item.id}`,
        'Competencias y Dispositivos',
        `${group.label} · ${item.label}`,
        'boolean',
      ),
    );
  }
}

DOCX_FIELD_DEFINITIONS.push(
  createDefinition(
    'competenciasDispositivos.observacionesCompetencias',
    'Competencias y Dispositivos',
    'Observaciones de competencias y dispositivos',
    'string',
    'rich',
  ),
);

// ─────────────────────────────────────────────
// Section: Narrativas y Planeacion
// ─────────────────────────────────────────────

DOCX_FIELD_DEFINITIONS.push(
  createDefinition(
    'descripcionHabilidades',
    'Habilidades y Estrategias',
    'Descripción de habilidades y destrezas',
    'string',
    'rich',
  ),
  createDefinition(
    'estrategiasAcciones',
    'Habilidades y Estrategias',
    'Estrategias y acciones',
    'string',
    'rich',
  ),
  createDefinition(
    'fechaProximaRevision',
    'Habilidades y Estrategias',
    'Fecha próxima revisión',
    'string',
  ),
);

for (let index = 0; index < 5; index += 1) {
  DOCX_FIELD_DEFINITIONS.push(
    createDefinition(`ajustes.${index}.area`, 'Ajustes Razonables', `Ajuste ${index + 1} · Área`, 'string'),
    createDefinition(`ajustes.${index}.barreras`, 'Ajustes Razonables', `Ajuste ${index + 1} · Barreras`, 'string', 'rich'),
    createDefinition(`ajustes.${index}.tipoAjuste`, 'Ajustes Razonables', `Ajuste ${index + 1} · Tipo de ajuste`, 'string', 'rich'),
    createDefinition(`ajustes.${index}.apoyoRequerido`, 'Ajustes Razonables', `Ajuste ${index + 1} · Apoyo requerido`, 'string', 'rich'),
    createDefinition(`ajustes.${index}.descripcion`, 'Ajustes Razonables', `Ajuste ${index + 1} · Descripción`, 'string', 'rich'),
    createDefinition(`ajustes.${index}.seguimiento`, 'Ajustes Razonables', `Ajuste ${index + 1} · Seguimiento`, 'string', 'rich'),
  );
}

// ─────────────────────────────────────────────
// Section: Firmas
// ─────────────────────────────────────────────

for (let index = 0; index < 9; index += 1) {
  DOCX_FIELD_DEFINITIONS.push(
    createDefinition(`firmas.docentes.${index}.nombre`, 'Firmas', `Docente ${index + 1} · Nombre`, 'string'),
    createDefinition(`firmas.docentes.${index}.area`, 'Firmas', `Docente ${index + 1} · Área`, 'string'),
    createDefinition(`firmas.docentes.${index}.firma`, 'Firmas', `Docente ${index + 1} · Firma`, 'string', 'rich'),
  );
}

for (const role of [
  { key: 'docenteOrientador', label: 'Docente orientador' },
  { key: 'docenteApoyoPedagogico', label: 'Docente apoyo pedagógico' },
  { key: 'coordinadorPedagogico', label: 'Coordinador pedagógico' },
] as const) {
  DOCX_FIELD_DEFINITIONS.push(
    createDefinition(`firmas.${role.key}.nombre`, 'Firmas', `${role.label} · Nombre`, 'string'),
    createDefinition(`firmas.${role.key}.area`, 'Firmas', `${role.label} · Área`, 'string'),
    createDefinition(`firmas.${role.key}.firma`, 'Firmas', `${role.label} · Firma`, 'string', 'rich'),
  );
}

DOCX_FIELD_DEFINITIONS.push(
  createDefinition('firmas.firmantePIAR', 'Firmas', 'Firmante PIAR', 'string', 'rich'),
  createDefinition('firmas.firmanteAcudiente', 'Firmas', 'Firmante acudiente', 'string', 'rich'),
);

// ─────────────────────────────────────────────
// Section: Acta de Acuerdo
// ─────────────────────────────────────────────

DOCX_FIELD_DEFINITIONS.push(
  createDefinition('acta.equipoDirectivosDocentes', 'Acta de Acuerdo', 'Equipo directivos y docentes', 'string', 'rich'),
  createDefinition('acta.familiaParticipante', 'Acta de Acuerdo', 'Familia participante', 'string'),
  createDefinition('acta.parentescoFamiliaParticipante', 'Acta de Acuerdo', 'Parentesco familia participante', 'string'),
  createDefinition('acta.compromisos', 'Acta de Acuerdo', 'Compromisos', 'string', 'rich'),
);

for (let index = 0; index < 5; index += 1) {
  DOCX_FIELD_DEFINITIONS.push(
    createDefinition(`acta.actividades.${index}.nombre`, 'Acta de Acuerdo', `Actividad ${index + 1} · Nombre`, 'string'),
    createDefinition(`acta.actividades.${index}.descripcion`, 'Acta de Acuerdo', `Actividad ${index + 1} · Descripción`, 'string', 'rich'),
    createDefinition(`acta.actividades.${index}.frecuencia`, 'Acta de Acuerdo', `Actividad ${index + 1} · Frecuencia`, 'string'),
  );
}

DOCX_FIELD_DEFINITIONS.push(
  createDefinition('acta.firmaEstudiante', 'Acta de Acuerdo', 'Firma estudiante', 'string', 'rich'),
  createDefinition('acta.firmaAcudiente', 'Acta de Acuerdo', 'Firma acudiente', 'string', 'rich'),
  createDefinition('acta.firmaDocentes', 'Acta de Acuerdo', 'Firma docentes', 'string', 'rich'),
  createDefinition('acta.firmaDirectivo', 'Acta de Acuerdo', 'Firma directivo', 'string', 'rich'),
);

export const DOCX_FIELD_DEFINITION_MAP = new Map(
  DOCX_FIELD_DEFINITIONS.map((definition) => [definition.path, definition]),
);
export const DOCX_FIELD_DEFINITIONS_BY_SECTION = DOCX_FIELD_DEFINITIONS.reduce<Map<string, DocxFieldDefinition[]>>((sections, definition) => {
  const entries = sections.get(definition.section);
  if (entries) {
    entries.push(definition);
  } else {
    sections.set(definition.section, [definition]);
  }
  return sections;
}, new Map());

export { DOCX_FIELD_DEFINITIONS };
