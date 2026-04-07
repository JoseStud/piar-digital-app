export const PIAR_DATA_VERSION = 2;

type LooseStringWithSuggestions<T extends string> = T | (string & {});
type NumericSchoolGrade = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}`;
type DecoratedSchoolGrade = `${NumericSchoolGrade}°`;

export type TipoIdentificacion = 'TI' | 'CC' | 'CE' | 'RC' | 'NUIP' | 'PEP' | 'PPT' | 'otro' | '';

export type Jornada = 'mañana' | 'tarde' | 'nocturna' | 'completa' | 'finde' | '';

export type Grado = LooseStringWithSuggestions<
  '' | 'Preescolar' | 'Transición' | NumericSchoolGrade | DecoratedSchoolGrade
>;

// ─────────────────────────────────────────────
// V2 Type Definitions
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Section: Header Fields
// ─────────────────────────────────────────────
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
export interface EntornoSaludRow {
  aplica: boolean | null;
  cual: string;
  frecuencia: string;
  horario: string;
}

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
export type IntensidadApoyo = 'ninguno' | 'intermitente' | 'extenso' | 'generalizado' | null;

export interface ValoracionAspecto {
  respuestas: Record<string, boolean | null>;
  intensidad: IntensidadApoyo;
  observacion: string;
}

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
export interface DocenteSignature {
  nombre: string;
  area: string;
  firma: string;
}

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
export interface ActaActividad {
  nombre: string;
  descripcion: string;
  frecuencia: string;
}

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
