/**
 * Fills in the health, home, and education sections of the DOCX
 * template by writing the corresponding form values into those tables.
 */

import {
  OPTION_TAG_SEPARATOR,
  createCheckboxControl,
  createInlineTextControl,
  getCell,
  getRow,
  getTable,
  setCellToBlockControl,
  setCellToBooleanPair,
  setCellToInlineSegments,
  setCellToStandaloneCheckbox,
} from './shared';
import type { ControlFactory } from '../docx-shared/control-builders';

// ─────────────────────────────────────────────
// Section: Health Table Helpers
// ─────────────────────────────────────────────

/** Populates one repeated health support row in the template. */
function setHealthSupportRow(
  table: Element,
  rowIndex: number,
  basePath: string,
  doc: Document,
  factory: ControlFactory,
): void {
  const row = getRow(table, rowIndex);
  setCellToBooleanPair(getCell(row, 1), doc, factory, `${basePath}.aplica`);
  setCellToBlockControl(getCell(row, 3), doc, factory, `${basePath}.cual`, `${basePath} · Cuál`, 'plain');
  setCellToInlineSegments(getCell(row, 5), doc, [
    createInlineTextControl(doc, factory, `${basePath}.frecuencia`, `${basePath} · Frecuencia`),
    ' / ',
    createInlineTextControl(doc, factory, `${basePath}.horario`, `${basePath} · Horario`),
  ]);
}

// ─────────────────────────────────────────────
// Section: Health Instrumentation
// ─────────────────────────────────────────────

/** Populates the health section of the DOCX template. */
export function instrumentHealth(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 2);
  setCellToBooleanPair(getCell(getRow(table, 0), 1), doc, factory, 'entornoSalud.afiliacionSalud');
  setCellToStandaloneCheckbox(getCell(getRow(table, 0), 3), doc, factory, `entornoSalud.regimen${OPTION_TAG_SEPARATOR}contributivo`, 'Régimen contributivo');
  setCellToStandaloneCheckbox(getCell(getRow(table, 0), 5), doc, factory, `entornoSalud.regimen${OPTION_TAG_SEPARATOR}subsidiado`, 'Régimen subsidiado');
  setCellToInlineSegments(getCell(getRow(table, 0), 7), doc, [
    createCheckboxControl(doc, factory, `entornoSalud.regimen${OPTION_TAG_SEPARATOR}otro`, 'Régimen otro'),
    ' ',
    createInlineTextControl(doc, factory, 'entornoSalud.regimenCual', 'Régimen cuál'),
  ]);

  setCellToInlineSegments(getCell(getRow(table, 1), 1), doc, [
    createInlineTextControl(doc, factory, 'entornoSalud.eps', 'EPS'),
    ' — ',
    createInlineTextControl(doc, factory, 'entornoSalud.lugarAtencionEmergencia', 'Lugar de atención de emergencia'),
  ]);
  setCellToBooleanPair(getCell(getRow(table, 2), 1), doc, factory, 'entornoSalud.diagnosticoMedico');
  setCellToBlockControl(getCell(getRow(table, 2), 3), doc, factory, 'entornoSalud.diagnosticoCual', 'Diagnóstico médico', 'plain');

  setHealthSupportRow(table, 3, 'entornoSalud.atencionMedica.0', doc, factory);
  setHealthSupportRow(table, 4, 'entornoSalud.atencionMedica.1', doc, factory);
  setHealthSupportRow(table, 5, 'entornoSalud.atencionMedica.2', doc, factory);
  setHealthSupportRow(table, 6, 'entornoSalud.tratamientoTerapeutico.0', doc, factory);
  setHealthSupportRow(table, 7, 'entornoSalud.tratamientoTerapeutico.1', doc, factory);
  setHealthSupportRow(table, 8, 'entornoSalud.tratamientoTerapeutico.2', doc, factory);

  setCellToInlineSegments(getCell(getRow(table, 9), 3), doc, [
    createInlineTextControl(doc, factory, 'entornoSalud.sectorSaludFrecuencia', 'Sector salud · Frecuencia'),
    ' — ',
    createInlineTextControl(doc, factory, 'entornoSalud.tratamientoMedicoCual', 'Tratamiento médico · Cuál'),
  ]);

  setCellToBooleanPair(getCell(getRow(table, 10), 0), doc, factory, 'entornoSalud.medicamentos.0.aplica');
  setCellToBlockControl(getCell(getRow(table, 10), 1), doc, factory, 'entornoSalud.medicamentos.0.cual', 'Medicamento 1 · Cuál', 'plain');
  setCellToInlineSegments(getCell(getRow(table, 10), 3), doc, [
    createInlineTextControl(doc, factory, 'entornoSalud.medicamentos.0.frecuencia', 'Medicamento 1 · Frecuencia'),
    ' / ',
    createInlineTextControl(doc, factory, 'entornoSalud.medicamentos.0.horario', 'Medicamento 1 · Horario'),
  ]);
  setCellToBooleanPair(getCell(getRow(table, 11), 0), doc, factory, 'entornoSalud.medicamentos.1.aplica');
  setCellToBlockControl(getCell(getRow(table, 11), 1), doc, factory, 'entornoSalud.medicamentos.1.cual', 'Medicamento 2 · Cuál', 'plain');
  setCellToInlineSegments(getCell(getRow(table, 11), 3), doc, [
    createInlineTextControl(doc, factory, 'entornoSalud.medicamentos.1.frecuencia', 'Medicamento 2 · Frecuencia'),
    ' / ',
    createInlineTextControl(doc, factory, 'entornoSalud.medicamentos.1.horario', 'Medicamento 2 · Horario'),
  ]);

  setCellToBooleanPair(getCell(getRow(table, 12), 1), doc, factory, 'entornoSalud.apoyosTecnicos');
  setCellToBlockControl(getCell(getRow(table, 12), 3), doc, factory, 'entornoSalud.apoyosTecnicosCuales', 'Apoyos técnicos', 'plain');
}

// ─────────────────────────────────────────────
// Section: Home Instrumentation
// ─────────────────────────────────────────────

/** Populates the home environment section of the DOCX template. */
export function instrumentHome(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 3);
  setCellToBlockControl(getCell(getRow(table, 0), 1), doc, factory, 'entornoHogar.nombreMadre', 'Nombre de la madre', 'plain');
  setCellToBlockControl(getCell(getRow(table, 0), 3), doc, factory, 'entornoHogar.nombrePadre', 'Nombre del padre', 'plain');
  setCellToBlockControl(getCell(getRow(table, 1), 1), doc, factory, 'entornoHogar.ocupacionMadre', 'Ocupación de la madre', 'plain');
  setCellToBlockControl(getCell(getRow(table, 1), 3), doc, factory, 'entornoHogar.ocupacionPadre', 'Ocupación del padre', 'plain');
  setCellToBlockControl(getCell(getRow(table, 2), 1), doc, factory, 'entornoHogar.nivelEducativoMadre', 'Nivel educativo de la madre', 'plain');
  setCellToBlockControl(getCell(getRow(table, 2), 3), doc, factory, 'entornoHogar.nivelEducativoPadre', 'Nivel educativo del padre', 'plain');
  setCellToBlockControl(getCell(getRow(table, 3), 1), doc, factory, 'entornoHogar.nombreCuidador', 'Nombre del cuidador', 'plain');
  setCellToBlockControl(getCell(getRow(table, 3), 4), doc, factory, 'entornoHogar.telefonoCuidador', 'Teléfono del cuidador', 'plain');
  setCellToBlockControl(getCell(getRow(table, 4), 1), doc, factory, 'entornoHogar.parentescoCuidador', 'Parentesco del cuidador', 'plain');
  setCellToBlockControl(getCell(getRow(table, 4), 2), doc, factory, 'entornoHogar.nivelEducativoCuidador', 'Nivel educativo del cuidador', 'plain');
  setCellToBlockControl(getCell(getRow(table, 4), 4), doc, factory, 'entornoHogar.correoCuidador', 'Correo del cuidador', 'plain');
  setCellToBlockControl(getCell(getRow(table, 5), 1), doc, factory, 'entornoHogar.numHermanos', 'Número de hermanos', 'plain');
  setCellToBlockControl(getCell(getRow(table, 5), 3), doc, factory, 'entornoHogar.lugarQueOcupa', 'Lugar que ocupa', 'plain');
  setCellToInlineSegments(getCell(getRow(table, 6), 0), doc, [
    'Bajo protección: Sí ',
    createCheckboxControl(doc, factory, `entornoHogar.estaBajoProteccion${OPTION_TAG_SEPARATOR}true`, 'Bajo protección · Sí'),
    '  No ',
    createCheckboxControl(doc, factory, `entornoHogar.estaBajoProteccion${OPTION_TAG_SEPARATOR}false`, 'Bajo protección · No'),
    ' — Subsidio entidad: ',
    createInlineTextControl(doc, factory, 'entornoHogar.subsidioEntidad', 'Subsidio · Entidad'),
    ' — Cuál: ',
    createInlineTextControl(doc, factory, 'entornoHogar.subsidioCual', 'Subsidio · Cuál'),
  ]);
  setCellToBlockControl(getCell(getRow(table, 6), 4), doc, factory, 'entornoHogar.quienesApoyaCrianza', 'Apoyo a la crianza', 'rich');
  setCellToBlockControl(getCell(getRow(table, 6), 5), doc, factory, 'entornoHogar.personasConQuienVive', 'Personas con quien vive', 'rich');
}

// ─────────────────────────────────────────────
// Section: Education Instrumentation
// ─────────────────────────────────────────────

/** Populates the education environment section of the DOCX template. */
export function instrumentEducation(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 4);
  setCellToInlineSegments(getCell(getRow(table, 0), 1), doc, [
    'No ',
    createCheckboxControl(doc, factory, `entornoEducativo.vinculadoOtraInstitucion${OPTION_TAG_SEPARATOR}false`, 'Vinculado otra institución · No'),
    '  ¿Por qué? ',
    createInlineTextControl(doc, factory, 'entornoEducativo.noVinculacionMotivo', 'Motivo de no vinculación'),
  ]);
  setCellToInlineSegments(getCell(getRow(table, 0), 2), doc, [
    'Sí ',
    createCheckboxControl(doc, factory, `entornoEducativo.vinculadoOtraInstitucion${OPTION_TAG_SEPARATOR}true`, 'Vinculado otra institución · Sí'),
    '  ¿Cuáles? ',
    createInlineTextControl(doc, factory, 'entornoEducativo.institucionesAnteriores', 'Instituciones anteriores'),
  ]);
  setCellToBlockControl(getCell(getRow(table, 1), 1), doc, factory, 'entornoEducativo.ultimoGradoCursado', 'Último grado cursado', 'plain');
  setCellToBlockControl(getCell(getRow(table, 1), 3), doc, factory, 'entornoEducativo.observacionesHistorial', 'Observaciones del historial', 'rich');
  setCellToInlineSegments(getCell(getRow(table, 2), 2), doc, [
    'Aprobado ',
    createCheckboxControl(doc, factory, `entornoEducativo.estadoGrado${OPTION_TAG_SEPARATOR}aprobado`, 'Estado de grado · Aprobado'),
    '  Sin terminar ',
    createCheckboxControl(doc, factory, `entornoEducativo.estadoGrado${OPTION_TAG_SEPARATOR}sinTerminar`, 'Estado de grado · Sin terminar'),
  ]);
  setCellToBooleanPair(getCell(getRow(table, 3), 1), doc, factory, 'entornoEducativo.recibeInformePedagogico');
  setCellToInlineSegments(getCell(getRow(table, 4), 1), doc, [
    createInlineTextControl(doc, factory, 'entornoEducativo.institucionInforme', 'Institución del informe'),
    ' — Transporte: ',
    createInlineTextControl(doc, factory, 'entornoEducativo.medioTransporte', 'Medio de transporte'),
    ' — Distancia/tiempo: ',
    createInlineTextControl(doc, factory, 'entornoEducativo.distanciaTiempo', 'Distancia y tiempo'),
  ]);
  setCellToInlineSegments(getCell(getRow(table, 5), 2), doc, [
    'No ',
    createCheckboxControl(doc, factory, `entornoEducativo.programasComplementarios${OPTION_TAG_SEPARATOR}false`, 'Programas complementarios · No'),
    '  Sí ',
    createCheckboxControl(doc, factory, `entornoEducativo.programasComplementarios${OPTION_TAG_SEPARATOR}true`, 'Programas complementarios · Sí'),
    '  ¿Cuáles? ',
    createInlineTextControl(doc, factory, 'entornoEducativo.programasCuales', 'Programas complementarios'),
  ]);
}
