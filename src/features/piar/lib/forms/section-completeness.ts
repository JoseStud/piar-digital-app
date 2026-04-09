/**
 * Deterministic completeness scoring for PIAR sections.
 *
 * The counts are intentionally tied to the stable form schema and the
 * current assessment catalogs so the progress nav can show meaningful
 * per-section ratios without depending on runtime heuristics.
 */
import { COMPETENCIAS_GRUPOS, VALORACION_ASPECTOS } from '@piar-digital-app/features/piar/content/assessment-catalogs';
import type { PiarSectionId } from '@piar-digital-app/features/piar/model/section-list';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

export interface SectionCompleteness {
  filled: number;
  total: number;
}

function isFilledString(value: string): boolean {
  return value.trim().length > 0;
}

function isFilledBoolean(value: boolean | null): boolean {
  return value !== null;
}

function isFilledRow(row: object): boolean {
  return Object.values(row as Record<string, unknown>).some((value) => {
    if (typeof value === 'string') {
      return isFilledString(value);
    }

    if (typeof value === 'boolean') {
      return isFilledBoolean(value);
    }

    return value !== null && value !== undefined;
  });
}

function countFields(values: readonly (string | boolean | null)[]): SectionCompleteness {
  let filled = 0;
  for (const value of values) {
    if (typeof value === 'string' && isFilledString(value)) {
      filled += 1;
    } else if (typeof value === 'boolean' && isFilledBoolean(value)) {
      filled += 1;
    }
  }

  return {
    filled,
    total: values.length,
  };
}

function countRows(rows: readonly object[]): SectionCompleteness {
  let filled = 0;
  for (const row of rows) {
    if (isFilledRow(row)) {
      filled += 1;
    }
  }

  return {
    filled,
    total: rows.length,
  };
}

function mergeCounts(...counts: readonly SectionCompleteness[]): SectionCompleteness {
  return counts.reduce<SectionCompleteness>(
    (acc, count) => ({
      filled: acc.filled + count.filled,
      total: acc.total + count.total,
    }),
    { filled: 0, total: 0 },
  );
}

function getHeaderCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return countFields([
    data.header.fechaDiligenciamiento,
    data.header.lugarDiligenciamiento,
    data.header.nombrePersonaDiligencia,
    data.header.rolPersonaDiligencia,
    data.header.institucionEducativa,
    data.header.sede,
    data.header.jornada,
  ]);
}

function getStudentCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return countFields([
    data.student.nombres,
    data.student.apellidos,
    data.student.tipoIdentificacion,
    data.student.numeroIdentificacion,
    data.student.lugarNacimiento,
    data.student.fechaNacimiento,
    data.student.edad,
    data.student.grado,
    data.student.gradoAspiraIngresar,
    data.student.vinculadoSistemaAnterior,
    data.student.departamento,
    data.student.municipio,
    data.student.barrio,
    data.student.direccion,
    data.student.telefono,
    data.student.correo,
    data.student.victimaConflicto,
    data.student.victimaConflictoRegistro,
    data.student.centroProteccion,
    data.student.centroProteccionLugar,
    data.student.grupoEtnico,
    data.student.grupoEtnicoCual,
    data.student.capacidades,
    data.student.gustosIntereses,
    data.student.expectativasEstudiante,
    data.student.expectativasFamilia,
    data.student.redesApoyo,
    data.student.otrasObservaciones,
  ]);
}

function getEntornoSaludCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return mergeCounts(
    countFields([
      data.entornoSalud.afiliacionSalud,
      data.entornoSalud.regimen,
      data.entornoSalud.regimenCual,
      data.entornoSalud.eps,
      data.entornoSalud.lugarAtencionEmergencia,
      data.entornoSalud.diagnosticoMedico,
      data.entornoSalud.diagnosticoCual,
      data.entornoSalud.sectorSaludFrecuencia,
      data.entornoSalud.tratamientoMedicoCual,
      data.entornoSalud.apoyosTecnicos,
      data.entornoSalud.apoyosTecnicosCuales,
    ]),
    countRows(data.entornoSalud.atencionMedica),
    countRows(data.entornoSalud.tratamientoTerapeutico),
    countRows(data.entornoSalud.medicamentos),
  );
}

function getEntornoHogarCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return countFields([
    data.entornoHogar.nombreMadre,
    data.entornoHogar.ocupacionMadre,
    data.entornoHogar.nivelEducativoMadre,
    data.entornoHogar.nombrePadre,
    data.entornoHogar.ocupacionPadre,
    data.entornoHogar.nivelEducativoPadre,
    data.entornoHogar.nombreCuidador,
    data.entornoHogar.parentescoCuidador,
    data.entornoHogar.nivelEducativoCuidador,
    data.entornoHogar.telefonoCuidador,
    data.entornoHogar.correoCuidador,
    data.entornoHogar.numHermanos,
    data.entornoHogar.lugarQueOcupa,
    data.entornoHogar.quienesApoyaCrianza,
    data.entornoHogar.personasConQuienVive,
    data.entornoHogar.estaBajoProteccion,
    data.entornoHogar.subsidioEntidad,
    data.entornoHogar.subsidioCual,
  ]);
}

function getEntornoEducativoCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return countFields([
    data.entornoEducativo.vinculadoOtraInstitucion,
    data.entornoEducativo.noVinculacionMotivo,
    data.entornoEducativo.institucionesAnteriores,
    data.entornoEducativo.ultimoGradoCursado,
    data.entornoEducativo.estadoGrado,
    data.entornoEducativo.observacionesHistorial,
    data.entornoEducativo.recibeInformePedagogico,
    data.entornoEducativo.institucionInforme,
    data.entornoEducativo.programasComplementarios,
    data.entornoEducativo.programasCuales,
    data.entornoEducativo.medioTransporte,
    data.entornoEducativo.distanciaTiempo,
  ]);
}

function getValoracionCompleteness(data: PIARFormDataV2): SectionCompleteness {
  const aspectCounts = VALORACION_ASPECTOS.map((aspecto) => {
    const aspectData = data.valoracionPedagogica[aspecto.key];
    return mergeCounts(
      countFields(aspecto.questions.map((question) => aspectData.respuestas[question.id] ?? null)),
      countFields([aspectData.intensidad]),
      countFields([aspectData.observacion]),
    );
  });

  return mergeCounts(
    ...aspectCounts,
    countFields([data.valoracionPedagogica.observacionesGenerales]),
  );
}

function getCompetenciasCompleteness(data: PIARFormDataV2): SectionCompleteness {
  const groupCounts = COMPETENCIAS_GRUPOS.map((group) => {
    const groupData = data.competenciasDispositivos[group.key];
    return countFields(group.items.map((item) => groupData[item.id] ?? null));
  });

  const observations = COMPETENCIAS_GRUPOS.some((group) => group.hasObservaciones)
    ? countFields([data.competenciasDispositivos.observacionesCompetencias])
    : { filled: 0, total: 0 };

  return mergeCounts(...groupCounts, observations);
}

function getDescripcionHabilidadesCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return countFields([data.descripcionHabilidades]);
}

function getEstrategiasCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return countFields([data.estrategiasAcciones, data.fechaProximaRevision]);
}

function getAjustesCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return countRows(data.ajustes);
}

function getFirmasCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return mergeCounts(
    countRows(data.firmas.docentes),
    countFields([
      data.firmas.docenteOrientador.nombre,
      data.firmas.docenteOrientador.area,
      data.firmas.docenteOrientador.firma,
    ]),
    countFields([
      data.firmas.docenteApoyoPedagogico.nombre,
      data.firmas.docenteApoyoPedagogico.area,
      data.firmas.docenteApoyoPedagogico.firma,
    ]),
    countFields([
      data.firmas.coordinadorPedagogico.nombre,
      data.firmas.coordinadorPedagogico.area,
      data.firmas.coordinadorPedagogico.firma,
    ]),
    countFields([data.firmas.firmantePIAR]),
    countFields([data.firmas.firmanteAcudiente]),
  );
}

function getActaCompleteness(data: PIARFormDataV2): SectionCompleteness {
  return mergeCounts(
    countFields([
      data.acta.equipoDirectivosDocentes,
      data.acta.familiaParticipante,
      data.acta.parentescoFamiliaParticipante,
      data.acta.compromisos,
    ]),
    countRows(data.acta.actividades),
    countFields([
      data.acta.firmaEstudiante,
      data.acta.firmaAcudiente,
      data.acta.firmaDocentes,
      data.acta.firmaDirectivo,
    ]),
  );
}

const COMPLETENESS_GETTERS: Record<PiarSectionId, (data: PIARFormDataV2) => SectionCompleteness> = {
  'info-general': getHeaderCompleteness,
  estudiante: getStudentCompleteness,
  salud: getEntornoSaludCompleteness,
  hogar: getEntornoHogarCompleteness,
  educativo: getEntornoEducativoCompleteness,
  valoracion: getValoracionCompleteness,
  competencias: getCompetenciasCompleteness,
  habilidades: getDescripcionHabilidadesCompleteness,
  estrategias: getEstrategiasCompleteness,
  ajustes: getAjustesCompleteness,
  firmas: getFirmasCompleteness,
  acta: getActaCompleteness,
};

export function computeSectionCompleteness(
  sectionId: PiarSectionId,
  data: PIARFormDataV2,
): SectionCompleteness {
  return COMPLETENESS_GETTERS[sectionId](data);
}
