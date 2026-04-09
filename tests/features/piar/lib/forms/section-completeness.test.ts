/** Tests for deterministic section completeness scoring. */
import { describe, expect, it } from 'vitest';
import { COMPETENCIAS_GRUPOS, VALORACION_ASPECTOS } from '@piar-digital-app/features/piar/content/assessment-catalogs';
import { SECTION_LIST } from '@piar-digital-app/features/piar/model/section-list';
import { createEmptyPIARFormDataV2, type PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { computeSectionCompleteness } from '@piar-digital-app/features/piar/lib/forms/section-completeness';

const EXPECTED_TOTALS: Record<string, number> = {
  'info-general': 7,
  estudiante: 28,
  salud: 19,
  hogar: 18,
  educativo: 12,
  valoracion: 25,
  competencias: 88,
  habilidades: 1,
  estrategias: 2,
  'firmantes-piar': 2,
  ajustes: 5,
  'firmas-docentes': 9,
  'firmas-especiales': 9,
  acta: 13,
};

function makeFilledData(): PIARFormDataV2 {
  const data = createEmptyPIARFormDataV2();

  Object.assign(data.header, {
    fechaDiligenciamiento: '2026-04-09',
    lugarDiligenciamiento: 'Bogotá',
    nombrePersonaDiligencia: 'María Pérez',
    rolPersonaDiligencia: 'Docente',
    institucionEducativa: 'IE Central',
    sede: 'Principal',
    jornada: 'mañana',
  });

  Object.assign(data.student, {
    nombres: 'Ana',
    apellidos: 'García',
    tipoIdentificacion: 'TI',
    numeroIdentificacion: '123456789',
    lugarNacimiento: 'Bogotá',
    fechaNacimiento: '2014-01-01',
    edad: '10',
    grado: '5°',
    gradoAspiraIngresar: '6°',
    vinculadoSistemaAnterior: false,
    departamento: 'Cundinamarca',
    municipio: 'Bogotá',
    barrio: 'Centro',
    direccion: 'Calle 1 #2-3',
    telefono: '3001234567',
    correo: 'ana@example.com',
    victimaConflicto: true,
    victimaConflictoRegistro: 'Registro',
    centroProteccion: false,
    centroProteccionLugar: 'N/A',
    grupoEtnico: true,
    grupoEtnicoCual: 'Mestizo',
    capacidades: 'Capaz',
    gustosIntereses: 'Lectura',
    expectativasEstudiante: 'Aprender',
    expectativasFamilia: 'Progreso',
    redesApoyo: 'Familia',
    otrasObservaciones: 'Ninguna',
  });

  Object.assign(data.entornoSalud, {
    afiliacionSalud: true,
    regimen: 'contributivo',
    regimenCual: 'Contributivo',
    eps: 'EPS Salud',
    lugarAtencionEmergencia: 'Hospital Central',
    diagnosticoMedico: false,
    diagnosticoCual: 'Ninguno',
    sectorSaludFrecuencia: 'Mensual',
    tratamientoMedicoCual: 'Terapia',
    apoyosTecnicos: true,
    apoyosTecnicosCuales: 'Audífonos',
  });
  data.entornoSalud.atencionMedica = data.entornoSalud.atencionMedica.map((row, index) => ({
    ...row,
    aplica: true,
    cual: `Atención ${index + 1}`,
    frecuencia: 'Semanal',
    horario: 'Mañana',
  })) as typeof data.entornoSalud.atencionMedica;
  data.entornoSalud.tratamientoTerapeutico = data.entornoSalud.tratamientoTerapeutico.map((row, index) => ({
    ...row,
    aplica: false,
    cual: `Tratamiento ${index + 1}`,
    frecuencia: 'Mensual',
    horario: 'Tarde',
  })) as typeof data.entornoSalud.tratamientoTerapeutico;
  data.entornoSalud.medicamentos = data.entornoSalud.medicamentos.map((row, index) => ({
    ...row,
    aplica: true,
    cual: `Medicamento ${index + 1}`,
    frecuencia: 'Diaria',
    horario: 'Noche',
  })) as typeof data.entornoSalud.medicamentos;

  Object.assign(data.entornoHogar, {
    nombreMadre: 'Laura',
    ocupacionMadre: 'Comerciante',
    nivelEducativoMadre: 'Bachillerato',
    nombrePadre: 'Carlos',
    ocupacionPadre: 'Conductor',
    nivelEducativoPadre: 'Técnico',
    nombreCuidador: 'Elena',
    parentescoCuidador: 'Abuela',
    nivelEducativoCuidador: 'Primaria',
    telefonoCuidador: '3007654321',
    correoCuidador: 'cuidador@example.com',
    numHermanos: '2',
    lugarQueOcupa: 'Mayor',
    quienesApoyaCrianza: 'Madre y abuela',
    personasConQuienVive: 'Madre y hermano',
    estaBajoProteccion: false,
    subsidioEntidad: 'ICBF',
    subsidioCual: 'Subsidio alimentario',
  });

  Object.assign(data.entornoEducativo, {
    vinculadoOtraInstitucion: true,
    noVinculacionMotivo: 'N/A',
    institucionesAnteriores: 'IE Anterior',
    ultimoGradoCursado: '4°',
    estadoGrado: 'aprobado',
    observacionesHistorial: 'Sin novedades',
    recibeInformePedagogico: false,
    institucionInforme: 'N/A',
    programasComplementarios: true,
    programasCuales: 'Acompañamiento',
    medioTransporte: 'Bus',
    distanciaTiempo: '20 minutos',
  });

  for (const aspecto of VALORACION_ASPECTOS) {
    const aspectData = data.valoracionPedagogica[aspecto.key];
    for (const question of aspecto.questions) {
      aspectData.respuestas[question.id] = true;
    }
    aspectData.intensidad = 'intermitente';
    aspectData.observacion = `Observación ${aspecto.key}`;
  }
  data.valoracionPedagogica.observacionesGenerales = 'Observaciones generales';

  for (const group of COMPETENCIAS_GRUPOS) {
    const groupData = data.competenciasDispositivos[group.key];
    for (const item of group.items) {
      groupData[item.id] = true;
    }
  }
  data.competenciasDispositivos.observacionesCompetencias = 'Observaciones de competencias';

  data.descripcionHabilidades = 'Descripción de habilidades';
  data.estrategiasAcciones = 'Estrategias acordadas';
  data.fechaProximaRevision = '2026-10-01';

  data.ajustes = data.ajustes.map((row, index) => ({
    ...row,
    area: `Área ${index + 1}`,
    barreras: 'Barreras',
    tipoAjuste: 'Metodológico',
    apoyoRequerido: 'Docente de apoyo',
    descripcion: 'Descripción',
    seguimiento: 'Seguimiento',
  })) as typeof data.ajustes;

  data.firmas.docentes = data.firmas.docentes.map((doc, index) => ({
    ...doc,
    nombre: `Docente ${index + 1}`,
    area: `Área ${index + 1}`,
    firma: `Firma ${index + 1}`,
  })) as typeof data.firmas.docentes;
  data.firmas.docenteOrientador = { nombre: 'Orientador', area: 'Apoyo', firma: 'Firma' };
  data.firmas.docenteApoyoPedagogico = { nombre: 'Apoyo', area: 'Pedagógico', firma: 'Firma' };
  data.firmas.coordinadorPedagogico = { nombre: 'Coordinador', area: 'Académico', firma: 'Firma' };
  data.firmas.firmantePIAR = 'María Pérez';
  data.firmas.firmanteAcudiente = 'Carlos Pérez';

  data.acta.equipoDirectivosDocentes = 'Equipo directivo';
  data.acta.familiaParticipante = 'Familia';
  data.acta.parentescoFamiliaParticipante = 'Madre';
  data.acta.compromisos = 'Compromisos';
  data.acta.actividades = data.acta.actividades.map((actividad, index) => ({
    ...actividad,
    nombre: `Actividad ${index + 1}`,
    descripcion: 'Descripción',
    frecuencia: 'Semanal',
  })) as typeof data.acta.actividades;
  data.acta.firmaEstudiante = 'Estudiante';
  data.acta.firmaAcudiente = 'Acudiente';
  data.acta.firmaDocentes = 'Docentes';
  data.acta.firmaDirectivo = 'Directivo';

  return data;
}

describe('computeSectionCompleteness', () => {
  it('returns zero filled counts for every empty section', () => {
    const data = createEmptyPIARFormDataV2();

    for (const section of SECTION_LIST) {
      expect(computeSectionCompleteness(section.id, data)).toEqual({
        filled: 0,
        total: EXPECTED_TOTALS[section.id],
      });
    }
  });

  it('counts booleans as filled when they are true or false', () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Ana';
    data.student.vinculadoSistemaAnterior = false;
    data.student.victimaConflicto = true;

    expect(computeSectionCompleteness('estudiante', data)).toEqual({
      filled: 3,
      total: EXPECTED_TOTALS.estudiante,
    });
  });

  it('counts tuple rows when any row field is filled', () => {
    const data = createEmptyPIARFormDataV2();
    data.ajustes[0].area = 'Matemáticas';
    data.ajustes[2].descripcion = 'Tiempo adicional';

    expect(computeSectionCompleteness('ajustes', data)).toEqual({
      filled: 2,
      total: EXPECTED_TOTALS.ajustes,
    });
  });

  it('counts catalog-driven responses, intensity, and observations', () => {
    const data = createEmptyPIARFormDataV2();
    const aspect = VALORACION_ASPECTOS[0];
    data.valoracionPedagogica[aspect.key].respuestas[aspect.questions[0].id] = true;
    data.valoracionPedagogica[aspect.key].intensidad = 'intermitente';
    data.valoracionPedagogica[aspect.key].observacion = 'Observación';

    expect(computeSectionCompleteness('valoracion', data)).toEqual({
      filled: 3,
      total: EXPECTED_TOTALS.valoracion,
    });
  });

  it('counts a fully filled form as completely complete section by section', () => {
    const data = makeFilledData();

    for (const section of SECTION_LIST) {
      const result = computeSectionCompleteness(section.id, data);
      expect(result).toEqual({
        filled: EXPECTED_TOTALS[section.id],
        total: EXPECTED_TOTALS[section.id],
      });
    }
  });
});
