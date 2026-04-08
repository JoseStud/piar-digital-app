/**
 * The single source of truth for PIAR form data shape and version.
 *
 * `PIARFormDataV2` is the canonical root type. Every persistence layer,
 * importer, exporter, and form section reads and writes this shape.
 * `PIAR_DATA_VERSION = 2` is the version number that ships in storage
 * envelopes and DOCX/PDF embedded payloads - bump it ONLY for breaking
 * changes (removing or re-typing a field). Additive changes (new
 * optional fields with defaults) do not require a version bump but
 * MUST be defaulted in `createEmptyPIARFormDataV2` and handled by
 * `deepMergeWithDefaultsV2` in `lib/data/data-utils/`.
 *
 * Boolean tri-state fields (`true` / `false` / `null`) are pervasive:
 * `null` means "sin respuesta" and is the default. Do not coerce nulls
 * to false anywhere in the data model.
 *
 * Fixed-length tuple fields (e.g. `ajustes: [_,_,_,_,_]`,
 * `firmas.docentes[9]`) must always be assigned as full tuples, never
 * as variable-length arrays.
 *
 * @see ../lib/data/data-utils/deepMergeWithDefaultsV2.ts
 * @see ../lib/data/data-utils/sectionMergers.ts
 * @see ../content/assessment-catalogs.ts
 */
export const PIAR_DATA_VERSION = 2;

/** String union helper that preserves autocomplete while allowing legacy or free-text grade values. */
type LooseStringWithSuggestions<T extends string> = T | (string & {});
/** Numeric school grade values from 1 through 11. */
type NumericSchoolGrade = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
/** School grade values with the degree symbol suffix used in the UI. */
type DecoratedSchoolGrade = `${NumericSchoolGrade}°`;

/** Student identification types accepted by the PIAR form. */
export type TipoIdentificacion = 'TI' | 'CC' | 'CE' | 'RC' | 'NUIP' | 'PEP' | 'PPT' | 'otro' | '';

/** School schedule values accepted by the PIAR form. */
export type Jornada = 'mañana' | 'tarde' | 'nocturna' | 'completa' | 'finde' | '';

/** Grade values used throughout the PIAR form, including legacy free-text inputs. */
export type Grado = LooseStringWithSuggestions<
  '' | 'Preescolar' | 'Transición' | NumericSchoolGrade | DecoratedSchoolGrade
>;

// ─────────────────────────────────────────────
// V2 Type Definitions
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Section: Header Fields
// ─────────────────────────────────────────────
/** Top-of-form metadata: fecha, lugar, persona que diligencia, rol, institución, sede, jornada. */
export interface HeaderV2 {
  fechaDiligenciamiento: string;        // was fechaElaboracion
  lugarDiligenciamiento: string;        // NEW
  nombrePersonaDiligencia: string;      // NEW
  rolPersonaDiligencia: string;         // NEW
  institucionEducativa: string;         // unchanged
  sede: string;                         // moved from top-level
  jornada: Jornada;                     // moved from top-level
}

// ─────────────────────────────────────────────
// Section: Student Fields
// ─────────────────────────────────────────────
/** Student identity, demographics, tri-state condition flags, and narrative description fields. */
export interface StudentV2 {
  nombres: string;                      // split from nombre
  apellidos: string;                    // split from nombre
  tipoIdentificacion: TipoIdentificacion; // NEW: "TI" | "CC" | "RC" | "Otro"
  numeroIdentificacion: string;         // was identificacion
  lugarNacimiento: string;              // NEW
  fechaNacimiento: string;              // NEW
  edad: string;                         // unchanged
  grado: Grado;                         // unchanged
  gradoAspiraIngresar: Grado;           // NEW: grade student aspires to enter (PIAR_Gov.pdf)
  vinculadoSistemaAnterior: boolean | null; // NEW
  departamento: string;                 // NEW
  municipio: string;                    // NEW
  barrio: string;                       // NEW
  direccion: string;                    // unchanged
  telefono: string;                     // split from contacto
  correo: string;                       // split from contacto / NEW
  victimaConflicto: boolean | null;     // NEW
  victimaConflictoRegistro: string;     // NEW: registry/details if victimaConflicto=true (PIAR_Gov.pdf)
  centroProteccion: boolean | null;     // NEW
  centroProteccionLugar: string;        // NEW: which center if centroProteccion=true (PIAR_Gov.pdf)
  grupoEtnico: boolean | null;          // NEW
  grupoEtnicoCual: string;              // NEW: which ethnic group if grupoEtnico=true (PIAR_Gov.pdf)
  capacidades: string;
  gustosIntereses: string;
  expectativasEstudiante: string;
  expectativasFamilia: string;
  redesApoyo: string;
  otrasObservaciones: string;
}

// ─────────────────────────────────────────────
// Section: Entorno Salud
// ─────────────────────────────────────────────
/** One repeated health-support row in the 3/3/2 fixed-length tuples. */
export interface EntornoSaludRow {
  aplica: boolean | null;
  cual: string;
  frecuencia: string;
  horario: string;
}

/** Health environment: afiliación, diagnóstico, support row tuples, and assistive technology selections. */
export interface EntornoSaludData {
  afiliacionSalud: boolean | null;
  regimen: 'contributivo' | 'subsidiado' | 'otro' | null;
  regimenCual: string;
  eps: string;                          // NEW: specific health insurance provider (PIAR_Gov.pdf)
  lugarAtencionEmergencia: string;
  diagnosticoMedico: boolean | null;
  diagnosticoCual: string;
  sectorSaludFrecuencia: string;        // NEW: health sector frequency details (PIAR_Gov.pdf)
  tratamientoMedicoCual: string;        // NEW: specific medical treatment details (PIAR_Gov.pdf)
  atencionMedica: [EntornoSaludRow, EntornoSaludRow, EntornoSaludRow];
  tratamientoTerapeutico: [EntornoSaludRow, EntornoSaludRow, EntornoSaludRow];
  medicamentos: [EntornoSaludRow, EntornoSaludRow];
  apoyosTecnicos: boolean | null;
  apoyosTecnicosCuales: string;
}

// ─────────────────────────────────────────────
// Section: Entorno Hogar
// ─────────────────────────────────────────────
/** Home environment: mother/father/caregiver fields plus household composition and protection details. */
export interface EntornoHogarData {
  nombreMadre: string;
  ocupacionMadre: string;
  nivelEducativoMadre: string;
  nombrePadre: string;
  ocupacionPadre: string;
  nivelEducativoPadre: string;
  nombreCuidador: string;
  parentescoCuidador: string;
  nivelEducativoCuidador: string;
  telefonoCuidador: string;
  correoCuidador: string;
  numHermanos: string;
  lugarQueOcupa: string;
  quienesApoyaCrianza: string;
  personasConQuienVive: string;
  estaBajoProteccion: boolean | null;   // NEW: student is under protection (PIAR_Gov.pdf)
  subsidioEntidad: string;              // NEW: which organization provides subsidy (PIAR_Gov.pdf)
  subsidioCual: string;                 // NEW: details of subsidy (PIAR_Gov.pdf)
}

// ─────────────────────────────────────────────
// Section: Entorno Educativo
// ─────────────────────────────────────────────
/** Educational environment: prior schooling history, prior pedagogical reports, and complementary programs. */
export interface EntornoEducativoData {
  vinculadoOtraInstitucion: boolean | null;
  noVinculacionMotivo: string;          // NEW: why NOT linked to another institution (PIAR_Gov.pdf)
  institucionesAnteriores: string;
  ultimoGradoCursado: Grado;
  estadoGrado: 'aprobado' | 'sinTerminar' | null;
  observacionesHistorial: string;
  recibeInformePedagogico: boolean | null;
  institucionInforme: string;
  programasComplementarios: boolean | null;
  programasCuales: string;
  medioTransporte: string;              // NEW: transportation method to school (PIAR_Gov.pdf)
  distanciaTiempo: string;              // NEW: distance and time to school (PIAR_Gov.pdf)
}

// ─────────────────────────────────────────────
// Section: Valoracion Pedagogica
// ─────────────────────────────────────────────
/** Support intensity levels used in the pedagogical assessment section. */
export type IntensidadApoyo = 'ninguno' | 'intermitente' | 'extenso' | 'generalizado' | null;

/** One assessment aspect: item-response record, support intensity, and free-text observation. */
export interface ValoracionAspecto {
  respuestas: Record<string, boolean | null>;
  intensidad: IntensidadApoyo;
  observacion: string;
}

/** Five pedagogical assessment aspects with per-item tri-state responses. */
export interface ValoracionPedagogicaData {
  movilidad: ValoracionAspecto;
  comunicacion: ValoracionAspecto;
  accesoInformacion: ValoracionAspecto;
  interaccionSocial: ValoracionAspecto;
  academicoPedagogico: ValoracionAspecto;
  observacionesGenerales: string;
}

// ─────────────────────────────────────────────
// Section: Competencias y Dispositivos
// ─────────────────────────────────────────────
/** Eight checklist groups covering literacy, math, memory, attention, perception, executive function, and language. */
export interface CompetenciasDispositivosData {
  competenciasLectoras02: Record<string, boolean | null>;
  competenciasLectoras311: Record<string, boolean | null>;
  competenciasMatematicas: Record<string, boolean | null>;
  memoria: Record<string, boolean | null>;
  atencion: Record<string, boolean | null>;
  percepcion: Record<string, boolean | null>;
  funcionesEjecutivas: Record<string, boolean | null>;
  lenguajeComunicacion: Record<string, boolean | null>;
  observacionesCompetencias: string;
}

// ─────────────────────────────────────────────
// Section: Ajustes Razonables
// ─────────────────────────────────────────────
/** One row in the reasonable-adjustments table. */
export interface AjusteRazonableRow {
  area: string;
  barreras: string;
  tipoAjuste: string;
  apoyoRequerido: string;
  descripcion: string;
  seguimiento: string;
}

// ─────────────────────────────────────────────
// Section: Signatures V2
// ─────────────────────────────────────────────
/** Signature fields for the PIAR's docente and role-specific signatories. */
export interface DocenteSignature {
  nombre: string;
  area: string;
  firma: string;
}

/** Signature block with a fixed tuple of nine docentes and the remaining role signatories. */
export interface FirmasV2 {
  docentes: [
    DocenteSignature, DocenteSignature, DocenteSignature,
    DocenteSignature, DocenteSignature, DocenteSignature,
    DocenteSignature, DocenteSignature, DocenteSignature,
  ];
  docenteOrientador: DocenteSignature;
  docenteApoyoPedagogico: DocenteSignature;
  coordinadorPedagogico: DocenteSignature;
  firmantePIAR: string;
  firmanteAcudiente: string;
}

// ─────────────────────────────────────────────
// Section: Acta de Acuerdo
// ─────────────────────────────────────────────
/** One activity row captured in the acta de acuerdo. */
export interface ActaActividad {
  nombre: string;
  descripcion: string;
  frecuencia: string;
}

/** Final agreement minutes with repeated header data, participant summary, activities, and signatures. */
export interface ActaAcuerdoData {
  equipoDirectivosDocentes: string;     // NEW: names/roles of leadership/teachers present (PIAR_Gov.pdf)
  familiaParticipante: string;          // NEW: family members who participated (PIAR_Gov.pdf)
  parentescoFamiliaParticipante: string; // NEW: their relationship to student (PIAR_Gov.pdf)
  compromisos: string;
  actividades: [ActaActividad, ActaActividad, ActaActividad, ActaActividad, ActaActividad];
  firmaEstudiante: string;
  firmaAcudiente: string;
  firmaDocentes: string;
  firmaDirectivo: string;
}

// ─────────────────────────────────────────────
// Section: Root V2
// ─────────────────────────────────────────────
/** Root type for the entire PIAR form. All section types nest under this. */
export interface PIARFormDataV2 {
  _version: 2;
  header: HeaderV2;
  student: StudentV2;
  entornoSalud: EntornoSaludData;
  entornoHogar: EntornoHogarData;
  entornoEducativo: EntornoEducativoData;
  valoracionPedagogica: ValoracionPedagogicaData;
  competenciasDispositivos: CompetenciasDispositivosData;
  descripcionHabilidades: string;
  estrategiasAcciones: string;
  fechaProximaRevision: string;
  ajustes: [
    AjusteRazonableRow, AjusteRazonableRow, AjusteRazonableRow,
    AjusteRazonableRow, AjusteRazonableRow,
  ];
  firmas: FirmasV2;
  acta: ActaAcuerdoData;
}

// ─────────────────────────────────────────────
// V2 Factory
// ─────────────────────────────────────────────

function createEmptyAjusteRazonableRow(): AjusteRazonableRow {
  return { area: '', barreras: '', tipoAjuste: '', apoyoRequerido: '', descripcion: '', seguimiento: '' };
}

function createEmptyDocenteSignature(): DocenteSignature {
  return { nombre: '', area: '', firma: '' };
}

function createEmptyActaActividad(): ActaActividad {
  return { nombre: '', descripcion: '', frecuencia: '' };
}

function createEmptyEntornoSaludRow(): EntornoSaludRow {
  return { aplica: null, cual: '', frecuencia: '', horario: '' };
}

function createEmptyValoracionAspecto(): ValoracionAspecto {
  return { respuestas: {}, intensidad: null, observacion: '' };
}

/**
 * Factory for a fresh, fully populated empty form.
 *
 * Every field is defaulted; tri-state booleans default to `null`; fixed-length
 * tuples are pre-allocated for the section arrays. Used by the start screen,
 * by import correction, and by `deepMergeWithDefaultsV2` when filling gaps.
 */
export function createEmptyPIARFormDataV2(): PIARFormDataV2 {
  return {
    _version: 2,
    header: {
      fechaDiligenciamiento: '',
      lugarDiligenciamiento: '',
      nombrePersonaDiligencia: '',
      rolPersonaDiligencia: '',
      institucionEducativa: '',
      sede: '',
      jornada: '',
    },
    student: {
      nombres: '',
      apellidos: '',
      tipoIdentificacion: '',
      numeroIdentificacion: '',
      lugarNacimiento: '',
      fechaNacimiento: '',
      edad: '',
      grado: '',
      gradoAspiraIngresar: '',
      vinculadoSistemaAnterior: null,
      departamento: '',
      municipio: '',
      barrio: '',
      direccion: '',
      telefono: '',
      correo: '',
      victimaConflicto: null,
      victimaConflictoRegistro: '',
      centroProteccion: null,
      centroProteccionLugar: '',
      grupoEtnico: null,
      grupoEtnicoCual: '',
      capacidades: '',
      gustosIntereses: '',
      expectativasEstudiante: '',
      expectativasFamilia: '',
      redesApoyo: '',
      otrasObservaciones: '',
    },
    entornoSalud: {
      afiliacionSalud: null,
      regimen: null,
      regimenCual: '',
      eps: '',
      lugarAtencionEmergencia: '',
      diagnosticoMedico: null,
      diagnosticoCual: '',
      sectorSaludFrecuencia: '',
      tratamientoMedicoCual: '',
      atencionMedica: [
        createEmptyEntornoSaludRow(),
        createEmptyEntornoSaludRow(),
        createEmptyEntornoSaludRow(),
      ],
      tratamientoTerapeutico: [
        createEmptyEntornoSaludRow(),
        createEmptyEntornoSaludRow(),
        createEmptyEntornoSaludRow(),
      ],
      medicamentos: [
        createEmptyEntornoSaludRow(),
        createEmptyEntornoSaludRow(),
      ],
      apoyosTecnicos: null,
      apoyosTecnicosCuales: '',
    },
    entornoHogar: {
      nombreMadre: '',
      ocupacionMadre: '',
      nivelEducativoMadre: '',
      nombrePadre: '',
      ocupacionPadre: '',
      nivelEducativoPadre: '',
      nombreCuidador: '',
      parentescoCuidador: '',
      nivelEducativoCuidador: '',
      telefonoCuidador: '',
      correoCuidador: '',
      numHermanos: '',
      lugarQueOcupa: '',
      quienesApoyaCrianza: '',
      personasConQuienVive: '',
      estaBajoProteccion: null,
      subsidioEntidad: '',
      subsidioCual: '',
    },
    entornoEducativo: {
      vinculadoOtraInstitucion: null,
      noVinculacionMotivo: '',
      institucionesAnteriores: '',
      ultimoGradoCursado: '',
      estadoGrado: null,
      observacionesHistorial: '',
      recibeInformePedagogico: null,
      institucionInforme: '',
      programasComplementarios: null,
      programasCuales: '',
      medioTransporte: '',
      distanciaTiempo: '',
    },
    valoracionPedagogica: {
      movilidad: createEmptyValoracionAspecto(),
      comunicacion: createEmptyValoracionAspecto(),
      accesoInformacion: createEmptyValoracionAspecto(),
      interaccionSocial: createEmptyValoracionAspecto(),
      academicoPedagogico: createEmptyValoracionAspecto(),
      observacionesGenerales: '',
    },
    competenciasDispositivos: {
      competenciasLectoras02: {},
      competenciasLectoras311: {},
      competenciasMatematicas: {},
      memoria: {},
      atencion: {},
      percepcion: {},
      funcionesEjecutivas: {},
      lenguajeComunicacion: {},
      observacionesCompetencias: '',
    },
    descripcionHabilidades: '',
    estrategiasAcciones: '',
    fechaProximaRevision: '',
    ajustes: [
      createEmptyAjusteRazonableRow(),
      createEmptyAjusteRazonableRow(),
      createEmptyAjusteRazonableRow(),
      createEmptyAjusteRazonableRow(),
      createEmptyAjusteRazonableRow(),
    ],
    firmas: {
      docentes: [
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
        createEmptyDocenteSignature(),
      ],
      docenteOrientador: createEmptyDocenteSignature(),
      docenteApoyoPedagogico: createEmptyDocenteSignature(),
      coordinadorPedagogico: createEmptyDocenteSignature(),
      firmantePIAR: '',
      firmanteAcudiente: '',
    },
    acta: {
      equipoDirectivosDocentes: '',
      familiaParticipante: '',
      parentescoFamiliaParticipante: '',
      compromisos: '',
      actividades: [
        createEmptyActaActividad(),
        createEmptyActaActividad(),
        createEmptyActaActividad(),
        createEmptyActaActividad(),
        createEmptyActaActividad(),
      ],
      firmaEstudiante: '',
      firmaAcudiente: '',
      firmaDocentes: '',
      firmaDirectivo: '',
    },
  };
}
