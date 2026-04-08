/**
 * Per-section merge functions that combine partial imported data with defaults, applying legacy field fallbacks where needed.
 *
 * Each `mergeXxxWithLegacyFallback` function takes the imported partial and the
 * default-shape full section and returns the merged result. This is the layer
 * that lets older PIAR files round-trip cleanly without the importer knowing
 * every historical field shape.
 *
 * @see ./legacyFallbacks.ts
 */
import type {
  CompetenciasDispositivosData,
  PIARFormDataV2,
  ValoracionPedagogicaData,
} from '@piar-digital-app/features/piar/model/piar';
import { preferNonEmptyString, splitLegacyStudentName } from './legacyFallbacks';
import {
  type DeepPartial,
  mergeActaActividad,
  mergeAjusteRow,
  mergeDocenteSignature,
  mergeEntornoSaludRow,
  mergeRecord,
} from './mergeHelpers';

/** Legacy acta payload shape that still carries a few V1-style header and student fields. */
export interface LegacyActaFallback extends DeepPartial<PIARFormDataV2['acta']> {
  fechaDiligenciamiento?: string;
  lugarDiligenciamiento?: string;
  nombrePersonaDiligencia?: string;
  rolPersonaDiligencia?: string;
  institucionEducativa?: string;
  sede?: string;
  nombreEstudiante?: string;
  edadEstudiante?: string;
  gradoEstudiante?: string;
}

/** Merges the header section and repairs legacy acta-originated field names when present. */
export function mergeHeaderWithLegacyFallback(
  parsedHeader: DeepPartial<PIARFormDataV2['header']> | undefined,
  parsedActa: LegacyActaFallback | undefined,
  defaults: PIARFormDataV2['header'],
): PIARFormDataV2['header'] {
  return {
    ...defaults,
    ...(parsedHeader ?? {}),
    // why: the legacy "Persona que diligencia" field is normalized here into the V2 header shape
    // so the older migrator does not need a separate special case.
    fechaDiligenciamiento: preferNonEmptyString(parsedHeader?.fechaDiligenciamiento, parsedActa?.fechaDiligenciamiento),
    lugarDiligenciamiento: preferNonEmptyString(parsedHeader?.lugarDiligenciamiento, parsedActa?.lugarDiligenciamiento),
    nombrePersonaDiligencia: preferNonEmptyString(parsedHeader?.nombrePersonaDiligencia, parsedActa?.nombrePersonaDiligencia),
    rolPersonaDiligencia: preferNonEmptyString(parsedHeader?.rolPersonaDiligencia, parsedActa?.rolPersonaDiligencia),
    institucionEducativa: preferNonEmptyString(parsedHeader?.institucionEducativa, parsedActa?.institucionEducativa),
    sede: preferNonEmptyString(parsedHeader?.sede, parsedActa?.sede),
    jornada: typeof parsedHeader?.jornada === 'string' ? parsedHeader.jornada : defaults.jornada,
  };
}

/** Merges the student section and repairs legacy full-name and identifier values when present. */
export function mergeStudentWithLegacyFallback(
  parsedStudent: DeepPartial<PIARFormDataV2['student']> | undefined,
  parsedActa: LegacyActaFallback | undefined,
  defaults: PIARFormDataV2['student'],
): PIARFormDataV2['student'] {
  const legacyActaStudentName = splitLegacyStudentName(
    typeof parsedActa?.nombreEstudiante === 'string' ? parsedActa.nombreEstudiante : '',
  );

  // Normalize tipoIdentificacion: legacy uppercase "Otro" → current lowercase "otro"
  const rawTipoIdentificacion = (
    parsedStudent as { tipoIdentificacion?: PIARFormDataV2['student']['tipoIdentificacion'] | 'Otro' } | undefined
  )?.tipoIdentificacion;
  const tipoIdentificacion = rawTipoIdentificacion === 'Otro'
    ? 'otro'
    : typeof rawTipoIdentificacion === 'string'
      ? rawTipoIdentificacion
      : defaults.tipoIdentificacion;

  return {
    ...defaults,
    ...(parsedStudent ?? {}),
    nombres: preferNonEmptyString(parsedStudent?.nombres, legacyActaStudentName.nombres),
    apellidos: preferNonEmptyString(parsedStudent?.apellidos, legacyActaStudentName.apellidos),
    tipoIdentificacion,
    edad: preferNonEmptyString(parsedStudent?.edad, parsedActa?.edadEstudiante),
    grado: preferNonEmptyString(parsedStudent?.grado, parsedActa?.gradoEstudiante),
    gradoAspiraIngresar: typeof parsedStudent?.gradoAspiraIngresar === 'string'
      ? parsedStudent.gradoAspiraIngresar
      : defaults.gradoAspiraIngresar,
  };
}

/** Merges the health section while preserving the fixed-length support row tuples. */
export function mergeEntornoSaludSection(
  parsedEntornoSalud: DeepPartial<PIARFormDataV2['entornoSalud']> | undefined,
  defaults: PIARFormDataV2['entornoSalud'],
): PIARFormDataV2['entornoSalud'] {
  const parsedAtencionMedica = parsedEntornoSalud?.atencionMedica ?? [];
  const parsedTratamiento = parsedEntornoSalud?.tratamientoTerapeutico ?? [];
  const parsedMedicamentos = parsedEntornoSalud?.medicamentos ?? [];

  return {
    ...defaults,
    ...(parsedEntornoSalud ?? {}),
    atencionMedica: [0, 1, 2].map((i) =>
      mergeEntornoSaludRow(parsedAtencionMedica[i], defaults.atencionMedica[i]),
    ) as PIARFormDataV2['entornoSalud']['atencionMedica'],
    tratamientoTerapeutico: [0, 1, 2].map((i) =>
      mergeEntornoSaludRow(parsedTratamiento[i], defaults.tratamientoTerapeutico[i]),
    ) as PIARFormDataV2['entornoSalud']['tratamientoTerapeutico'],
    medicamentos: [0, 1].map((i) =>
      mergeEntornoSaludRow(parsedMedicamentos[i], defaults.medicamentos[i]),
    ) as PIARFormDataV2['entornoSalud']['medicamentos'],
  };
}

/** Merges the home section with the imported values over the default shape. */
export function mergeEntornoHogarSection(
  parsedEntornoHogar: DeepPartial<PIARFormDataV2['entornoHogar']> | undefined,
  defaults: PIARFormDataV2['entornoHogar'],
): PIARFormDataV2['entornoHogar'] {
  return { ...defaults, ...(parsedEntornoHogar ?? {}) };
}

/** Merges the educational-history section and keeps the grade field typed. */
export function mergeEntornoEducativoSection(
  parsedEntornoEducativo: DeepPartial<PIARFormDataV2['entornoEducativo']> | undefined,
  defaults: PIARFormDataV2['entornoEducativo'],
): PIARFormDataV2['entornoEducativo'] {
  return {
    ...defaults,
    ...(parsedEntornoEducativo ?? {}),
    ultimoGradoCursado: typeof parsedEntornoEducativo?.ultimoGradoCursado === 'string'
      ? parsedEntornoEducativo.ultimoGradoCursado
      : defaults.ultimoGradoCursado,
  };
}

function mergeValoracionPedagogica(
  parsed: DeepPartial<ValoracionPedagogicaData> | undefined,
  defaults: ValoracionPedagogicaData,
): ValoracionPedagogicaData {
  const aspectKeys = [
    'movilidad', 'comunicacion', 'accesoInformacion', 'interaccionSocial', 'academicoPedagogico',
  ] as const;

  const result = { ...defaults };

  for (const key of aspectKeys) {
    const parsedAspect = parsed?.[key];
    const defaultAspect = defaults[key];
    result[key] = {
      ...defaultAspect,
      ...(parsedAspect ?? {}),
      respuestas: mergeRecord(parsedAspect?.respuestas, defaultAspect.respuestas),
    };
  }

  if (typeof parsed?.observacionesGenerales === 'string') {
    result.observacionesGenerales = parsed.observacionesGenerales;
  }

  return result;
}

/** Merges the pedagogical-assessment section, including per-item response records. */
export function mergeValoracionPedagogicaSection(
  parsedValoracion: DeepPartial<PIARFormDataV2['valoracionPedagogica']> | undefined,
  defaults: PIARFormDataV2['valoracionPedagogica'],
): PIARFormDataV2['valoracionPedagogica'] {
  return mergeValoracionPedagogica(parsedValoracion, defaults);
}

function mergeCompetenciasDispositivos(
  parsed: DeepPartial<CompetenciasDispositivosData> | undefined,
  defaults: CompetenciasDispositivosData,
): CompetenciasDispositivosData {
  const recordKeys = [
    'competenciasLectoras02', 'competenciasLectoras311', 'competenciasMatematicas',
    'memoria', 'atencion', 'percepcion', 'funcionesEjecutivas', 'lenguajeComunicacion',
  ] as const;

  const result: CompetenciasDispositivosData = { ...defaults };

  for (const key of recordKeys) {
    result[key] = mergeRecord(parsed?.[key], defaults[key]);
  }

  if (typeof parsed?.observacionesCompetencias === 'string') {
    result.observacionesCompetencias = parsed.observacionesCompetencias;
  }

  return result;
}

/** Merges the competencies and learning-devices section records. */
export function mergeCompetenciasDispositivosSection(
  parsedCompetencias: DeepPartial<PIARFormDataV2['competenciasDispositivos']> | undefined,
  defaults: PIARFormDataV2['competenciasDispositivos'],
): PIARFormDataV2['competenciasDispositivos'] {
  return mergeCompetenciasDispositivos(parsedCompetencias, defaults);
}

/** Merges the reasonable-adjustments tuple with default rows. */
export function mergeAjustesSection(
  parsedAjustes: Array<DeepPartial<PIARFormDataV2['ajustes'][number]>> | undefined,
  defaults: PIARFormDataV2['ajustes'],
): PIARFormDataV2['ajustes'] {
  return [0, 1, 2, 3, 4].map((i) =>
    mergeAjusteRow(parsedAjustes?.[i], defaults[i]),
  ) as PIARFormDataV2['ajustes'];
}

/** Merges the signature block, including the fixed nine-docente tuple. */
export function mergeFirmasSection(
  parsedFirmas: DeepPartial<PIARFormDataV2['firmas']> | undefined,
  defaults: PIARFormDataV2['firmas'],
): PIARFormDataV2['firmas'] {
  const parsedDocentes = parsedFirmas?.docentes ?? [];
  const docentes = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
    mergeDocenteSignature(parsedDocentes[i], defaults.docentes[i]),
  ) as PIARFormDataV2['firmas']['docentes'];

  return {
    ...defaults,
    ...(parsedFirmas ?? {}),
    docentes,
    docenteOrientador: mergeDocenteSignature(parsedFirmas?.docenteOrientador, defaults.docenteOrientador),
    docenteApoyoPedagogico: mergeDocenteSignature(parsedFirmas?.docenteApoyoPedagogico, defaults.docenteApoyoPedagogico),
    coordinadorPedagogico: mergeDocenteSignature(parsedFirmas?.coordinadorPedagogico, defaults.coordinadorPedagogico),
  };
}

/** Merges the acta de acuerdo section and repairs legacy activity rows when present. */
export function mergeActaSection(
  parsedActa: LegacyActaFallback | undefined,
  defaults: PIARFormDataV2['acta'],
): PIARFormDataV2['acta'] {
  const parsedActividades = parsedActa?.actividades ?? [];
  const actividades = [0, 1, 2, 3, 4].map((i) =>
    mergeActaActividad(parsedActividades[i], defaults.actividades[i]),
  ) as PIARFormDataV2['acta']['actividades'];

  return {
    equipoDirectivosDocentes: typeof parsedActa?.equipoDirectivosDocentes === 'string' ? parsedActa.equipoDirectivosDocentes : defaults.equipoDirectivosDocentes,
    familiaParticipante: typeof parsedActa?.familiaParticipante === 'string' ? parsedActa.familiaParticipante : defaults.familiaParticipante,
    parentescoFamiliaParticipante: typeof parsedActa?.parentescoFamiliaParticipante === 'string' ? parsedActa.parentescoFamiliaParticipante : defaults.parentescoFamiliaParticipante,
    compromisos: typeof parsedActa?.compromisos === 'string' ? parsedActa.compromisos : defaults.compromisos,
    actividades,
    firmaEstudiante: typeof parsedActa?.firmaEstudiante === 'string' ? parsedActa.firmaEstudiante : defaults.firmaEstudiante,
    firmaAcudiente: typeof parsedActa?.firmaAcudiente === 'string' ? parsedActa.firmaAcudiente : defaults.firmaAcudiente,
    firmaDocentes: typeof parsedActa?.firmaDocentes === 'string' ? parsedActa.firmaDocentes : defaults.firmaDocentes,
    firmaDirectivo: typeof parsedActa?.firmaDirectivo === 'string' ? parsedActa.firmaDirectivo : defaults.firmaDirectivo,
  };
}
