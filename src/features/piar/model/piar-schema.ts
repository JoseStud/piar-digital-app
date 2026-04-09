import {
  COMPETENCIAS_GRUPOS,
  INTENSIDAD_OPTIONS,
  VALORACION_ASPECTOS,
} from '@piar-digital-app/features/piar/content/assessment-catalogs';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

export type PIARSchemaLeafValueType = 'string' | 'boolean' | 'nullableString' | 'version';

export interface PIARSchemaFieldDefinition {
  path: string;
  segments: string[];
  valueType: Exclude<PIARSchemaLeafValueType, 'version'>;
  allowedValues?: ReadonlySet<string>;
  required: boolean;
}

export interface PIARSchemaLeafNode {
  kind: 'leaf';
  valueType: PIARSchemaLeafValueType;
  allowedValues?: ReadonlySet<string>;
  required: boolean;
}

export interface PIARSchemaBranchNode {
  kind: 'branch';
  containerType: 'object' | 'array';
  children: Map<string, PIARSchemaNode>;
}

export type PIARSchemaNode = PIARSchemaLeafNode | PIARSchemaBranchNode;

const PIAR_SCHEMA_FIELD_DEFINITIONS: PIARSchemaFieldDefinition[] = [];
const PIAR_ALLOWED_REGIMEN_VALUES = new Set(['contributivo', 'subsidiado', 'otro']);
const PIAR_ALLOWED_ESTADO_GRADO_VALUES = new Set(['aprobado', 'sinTerminar']);
const PIAR_SUPPORTED_INTENSITIES = new Set<string>(INTENSIDAD_OPTIONS.map((option) => option.value));

function addSchemaField(
  path: string,
  valueType: PIARSchemaFieldDefinition['valueType'],
  options?: {
    allowedValues?: ReadonlySet<string>;
    required?: boolean;
  },
): void {
  PIAR_SCHEMA_FIELD_DEFINITIONS.push({
    path,
    segments: path.split('.'),
    valueType,
    allowedValues: options?.allowedValues,
    required: options?.required ?? true,
  });
}

function addStringFields(
  prefix: string,
  fields: readonly string[],
  options?: {
    required?: boolean;
  },
): void {
  for (const field of fields) {
    addSchemaField(`${prefix}.${field}`, 'string', options);
  }
}

function addBooleanFields(
  prefix: string,
  fields: readonly string[],
  options?: {
    required?: boolean;
  },
): void {
  for (const field of fields) {
    addSchemaField(`${prefix}.${field}`, 'boolean', options);
  }
}

function addNullableStringFields(
  prefix: string,
  fields: readonly string[],
  allowedValuesByField: Partial<Record<string, ReadonlySet<string>>> = {},
  options?: {
    required?: boolean;
  },
): void {
  for (const field of fields) {
    addSchemaField(`${prefix}.${field}`, 'nullableString', {
      required: options?.required,
      allowedValues: allowedValuesByField[field],
    });
  }
}

addStringFields('header', [
  'fechaDiligenciamiento',
  'lugarDiligenciamiento',
  'nombrePersonaDiligencia',
  'rolPersonaDiligencia',
  'institucionEducativa',
  'sede',
  'jornada',
]);

addStringFields('student', [
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
]);

addBooleanFields('student', [
  'vinculadoSistemaAnterior',
  'victimaConflicto',
  'centroProteccion',
  'grupoEtnico',
]);

addBooleanFields('entornoSalud', [
  'afiliacionSalud',
  'diagnosticoMedico',
  'apoyosTecnicos',
]);

addNullableStringFields('entornoSalud', ['regimen'], {
  regimen: PIAR_ALLOWED_REGIMEN_VALUES,
});

addStringFields('entornoSalud', [
  'regimenCual',
  'eps',
  'lugarAtencionEmergencia',
  'diagnosticoCual',
  'sectorSaludFrecuencia',
  'tratamientoMedicoCual',
  'apoyosTecnicosCuales',
]);

for (const group of [
  { key: 'atencionMedica', length: 3 },
  { key: 'tratamientoTerapeutico', length: 3 },
  { key: 'medicamentos', length: 2 },
] as const) {
  for (let index = 0; index < group.length; index += 1) {
    addSchemaField(`entornoSalud.${group.key}.${index}.aplica`, 'boolean');
    addSchemaField(`entornoSalud.${group.key}.${index}.cual`, 'string');
    addSchemaField(`entornoSalud.${group.key}.${index}.frecuencia`, 'string');
    addSchemaField(`entornoSalud.${group.key}.${index}.horario`, 'string');
  }
}

addStringFields('entornoHogar', [
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
]);

addBooleanFields('entornoHogar', ['estaBajoProteccion']);

addBooleanFields('entornoEducativo', [
  'vinculadoOtraInstitucion',
  'recibeInformePedagogico',
  'programasComplementarios',
]);

addNullableStringFields('entornoEducativo', ['estadoGrado'], {
  estadoGrado: PIAR_ALLOWED_ESTADO_GRADO_VALUES,
});

addStringFields('entornoEducativo', [
  'noVinculacionMotivo',
  'institucionesAnteriores',
  'ultimoGradoCursado',
  'observacionesHistorial',
  'institucionInforme',
  'programasCuales',
  'medioTransporte',
  'distanciaTiempo',
]);

for (const aspecto of VALORACION_ASPECTOS) {
  for (const question of aspecto.questions) {
    addSchemaField(`valoracionPedagogica.${aspecto.key}.respuestas.${question.id}`, 'boolean', {
      required: false,
    });
  }

  addSchemaField(`valoracionPedagogica.${aspecto.key}.intensidad`, 'nullableString', {
    allowedValues: PIAR_SUPPORTED_INTENSITIES,
  });
  addSchemaField(`valoracionPedagogica.${aspecto.key}.observacion`, 'string');
}

addSchemaField('valoracionPedagogica.observacionesGenerales', 'string');

for (const group of COMPETENCIAS_GRUPOS) {
  for (const item of group.items) {
    addSchemaField(`competenciasDispositivos.${group.key}.${item.id}`, 'boolean', {
      required: false,
    });
  }
}

addSchemaField('competenciasDispositivos.observacionesCompetencias', 'string');
addSchemaField('descripcionHabilidades', 'string');
addSchemaField('estrategiasAcciones', 'string');
addSchemaField('fechaProximaRevision', 'string');

for (let index = 0; index < 5; index += 1) {
  addSchemaField(`ajustes.${index}.area`, 'string');
  addSchemaField(`ajustes.${index}.barreras`, 'string');
  addSchemaField(`ajustes.${index}.tipoAjuste`, 'string');
  addSchemaField(`ajustes.${index}.apoyoRequerido`, 'string');
  addSchemaField(`ajustes.${index}.descripcion`, 'string');
  addSchemaField(`ajustes.${index}.seguimiento`, 'string');
}

for (let index = 0; index < 9; index += 1) {
  addSchemaField(`firmas.docentes.${index}.nombre`, 'string');
  addSchemaField(`firmas.docentes.${index}.area`, 'string');
  addSchemaField(`firmas.docentes.${index}.firma`, 'string');
}

for (const role of [
  'docenteOrientador',
  'docenteApoyoPedagogico',
  'coordinadorPedagogico',
] as const) {
  addSchemaField(`firmas.${role}.nombre`, 'string');
  addSchemaField(`firmas.${role}.area`, 'string');
  addSchemaField(`firmas.${role}.firma`, 'string');
}

addSchemaField('firmas.firmantePIAR', 'string');
addSchemaField('firmas.firmanteAcudiente', 'string');
addSchemaField('acta.equipoDirectivosDocentes', 'string');
addSchemaField('acta.familiaParticipante', 'string');
addSchemaField('acta.parentescoFamiliaParticipante', 'string');
addSchemaField('acta.compromisos', 'string');

for (let index = 0; index < 5; index += 1) {
  addSchemaField(`acta.actividades.${index}.nombre`, 'string');
  addSchemaField(`acta.actividades.${index}.descripcion`, 'string');
  addSchemaField(`acta.actividades.${index}.frecuencia`, 'string');
}

addSchemaField('acta.firmaEstudiante', 'string');
addSchemaField('acta.firmaAcudiente', 'string');
addSchemaField('acta.firmaDocentes', 'string');
addSchemaField('acta.firmaDirectivo', 'string');

function isNumericSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function createBranchNode(containerType: PIARSchemaBranchNode['containerType']): PIARSchemaBranchNode {
  return {
    kind: 'branch',
    containerType,
    children: new Map(),
  };
}

function buildSchemaTree(): PIARSchemaBranchNode {
  const root = createBranchNode('object');

  for (const definition of PIAR_SCHEMA_FIELD_DEFINITIONS) {
    let current = root;

    for (let index = 0; index < definition.segments.length; index += 1) {
      const segment = definition.segments[index];
      const isLeaf = index === definition.segments.length - 1;

      if (isLeaf) {
        current.children.set(segment, {
          kind: 'leaf',
          valueType: definition.valueType,
          allowedValues: definition.allowedValues,
          required: definition.required,
        });
        continue;
      }

      const nextSegment = definition.segments[index + 1];
      const expectedContainerType = isNumericSegment(nextSegment) ? 'array' : 'object';
      const existing = current.children.get(segment);

      if (!existing) {
        const branch = createBranchNode(expectedContainerType);
        current.children.set(segment, branch);
        current = branch;
        continue;
      }

      if (existing.kind !== 'branch') {
        throw new Error(`Invalid PIAR schema branch at ${definition.path}`);
      }

      current = existing;
    }
  }

  root.children.set('_version', {
    kind: 'leaf',
    valueType: 'version',
    required: true,
  });

  return root;
}

export const PIAR_SCHEMA_FIELD_PATHS = PIAR_SCHEMA_FIELD_DEFINITIONS.map((definition) => definition.path);

export const PIAR_TOP_LEVEL_SECTION_KEYS = new Set<keyof Omit<PIARFormDataV2, '_version'>>([
  'header',
  'student',
  'entornoSalud',
  'entornoHogar',
  'entornoEducativo',
  'valoracionPedagogica',
  'competenciasDispositivos',
  'ajustes',
  'firmas',
  'acta',
]);

export const PIAR_SCHEMA_TREE = buildSchemaTree();

export { PIAR_SCHEMA_FIELD_DEFINITIONS };
