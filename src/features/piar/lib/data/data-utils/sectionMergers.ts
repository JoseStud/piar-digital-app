/**
 * Per-section merge functions that combine partial imported data with defaults.
 *
 * Each `mergeXxxSection` function takes the imported partial and the
 * default-shape full section and returns the merged result. This layer runs
 * on data that `parsePIARData` has already validated against the V2 schema
 * tree, so it does not need to handle legacy field shapes.
 */
import type {
  CompetenciasDispositivosData,
  PIARFormDataV2,
  ValoracionPedagogicaData,
} from '@piar-digital-app/features/piar/model/piar';
import {
  type DeepPartial,
  mergeActaActividad,
  mergeAjusteRow,
  mergeDocenteSignature,
  mergeEntornoSaludRow,
  mergeRecord,
} from './mergeHelpers';

/** Merges the header section over the default shape. */
export function mergeHeaderSection(
  parsedHeader: DeepPartial<PIARFormDataV2['header']> | undefined,
  defaults: PIARFormDataV2['header'],
): PIARFormDataV2['header'] {
  return {
    ...defaults,
    ...(parsedHeader ?? {}),
    jornada: typeof parsedHeader?.jornada === 'string' ? parsedHeader.jornada : defaults.jornada,
  };
}

/** Merges the student section over the default shape. */
export function mergeStudentSection(
  parsedStudent: DeepPartial<PIARFormDataV2['student']> | undefined,
  defaults: PIARFormDataV2['student'],
): PIARFormDataV2['student'] {
  return {
    ...defaults,
    ...(parsedStudent ?? {}),
    // why: DeepPartial recurses into the `(string & {})` branch of literal-union types
    // like Grado/TipoIdentificacion, producing a broken object type. Narrowing with
    // typeof === 'string' gives us back a plain string that is assignable to the union.
    tipoIdentificacion: typeof parsedStudent?.tipoIdentificacion === 'string'
      ? parsedStudent.tipoIdentificacion
      : defaults.tipoIdentificacion,
    grado: typeof parsedStudent?.grado === 'string'
      ? parsedStudent.grado
      : defaults.grado,
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

/** Merges the acta de acuerdo section, preserving the fixed-length activity tuple. */
export function mergeActaSection(
  parsedActa: DeepPartial<PIARFormDataV2['acta']> | undefined,
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
