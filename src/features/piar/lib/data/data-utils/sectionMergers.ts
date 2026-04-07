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

export function mergeHeaderWithLegacyFallback(
  parsedHeader: DeepPartial<PIARFormDataV2['header']> | undefined,
  parsedActa: LegacyActaFallback | undefined,
  defaults: PIARFormDataV2['header'],
): PIARFormDataV2['header'] {
  return {
    ...defaults,
    ...(parsedHeader ?? {}),
    fechaDiligenciamiento: preferNonEmptyString(parsedHeader?.fechaDiligenciamiento, parsedActa?.fechaDiligenciamiento),
    lugarDiligenciamiento: preferNonEmptyString(parsedHeader?.lugarDiligenciamiento, parsedActa?.lugarDiligenciamiento),
    nombrePersonaDiligencia: preferNonEmptyString(parsedHeader?.nombrePersonaDiligencia, parsedActa?.nombrePersonaDiligencia),
    rolPersonaDiligencia: preferNonEmptyString(parsedHeader?.rolPersonaDiligencia, parsedActa?.rolPersonaDiligencia),
    institucionEducativa: preferNonEmptyString(parsedHeader?.institucionEducativa, parsedActa?.institucionEducativa),
    sede: preferNonEmptyString(parsedHeader?.sede, parsedActa?.sede),
    jornada: typeof parsedHeader?.jornada === 'string' ? parsedHeader.jornada : defaults.jornada,
  };
}

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

export function mergeEntornoHogarSection(
  parsedEntornoHogar: DeepPartial<PIARFormDataV2['entornoHogar']> | undefined,
  defaults: PIARFormDataV2['entornoHogar'],
): PIARFormDataV2['entornoHogar'] {
  return { ...defaults, ...(parsedEntornoHogar ?? {}) };
}

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

export function mergeCompetenciasDispositivosSection(
  parsedCompetencias: DeepPartial<PIARFormDataV2['competenciasDispositivos']> | undefined,
  defaults: PIARFormDataV2['competenciasDispositivos'],
): PIARFormDataV2['competenciasDispositivos'] {
  return mergeCompetenciasDispositivos(parsedCompetencias, defaults);
}

export function mergeAjustesSection(
  parsedAjustes: Array<DeepPartial<PIARFormDataV2['ajustes'][number]>> | undefined,
  defaults: PIARFormDataV2['ajustes'],
): PIARFormDataV2['ajustes'] {
  return [0, 1, 2, 3, 4].map((i) =>
    mergeAjusteRow(parsedAjustes?.[i], defaults[i]),
  ) as PIARFormDataV2['ajustes'];
}

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
