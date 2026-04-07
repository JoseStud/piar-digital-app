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
} from './shared';
import type { ControlFactory } from '../docx-shared/control-builders';

// ─────────────────────────────────────────────
// Section: Header Instrumentation
// ─────────────────────────────────────────────

export function instrumentHeader(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 0);
  setCellToInlineSegments(getCell(getRow(table, 1), 1), doc, [
    createInlineTextControl(doc, factory, 'header.fechaDiligenciamiento', 'Fecha de diligenciamiento'),
    ' — ',
    createInlineTextControl(doc, factory, 'header.lugarDiligenciamiento', 'Lugar de diligenciamiento'),
  ]);
  setCellToInlineSegments(getCell(getRow(table, 2), 1), doc, [
    createInlineTextControl(doc, factory, 'header.nombrePersonaDiligencia', 'Nombre de la persona que diligencia'),
    ' — ',
    createInlineTextControl(doc, factory, 'header.rolPersonaDiligencia', 'Rol de la persona que diligencia'),
  ]);
  setCellToBlockControl(getCell(getRow(table, 3), 1), doc, factory, 'header.institucionEducativa', 'Institución educativa', 'plain');
}

// ─────────────────────────────────────────────
// Section: Student Instrumentation
// ─────────────────────────────────────────────

export function instrumentStudent(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 1);
  setCellToBlockControl(getCell(getRow(table, 1), 0), doc, factory, 'student.nombres', 'Nombres', 'plain');
  setCellToBlockControl(getCell(getRow(table, 1), 1), doc, factory, 'student.apellidos', 'Apellidos', 'plain');
  setCellToInlineSegments(getCell(getRow(table, 1), 2), doc, [
    'TI ',
    createCheckboxControl(doc, factory, `student.tipoIdentificacion${OPTION_TAG_SEPARATOR}TI`, 'Tipo identificación · TI'),
    '  CC ',
    createCheckboxControl(doc, factory, `student.tipoIdentificacion${OPTION_TAG_SEPARATOR}CC`, 'Tipo identificación · CC'),
    '  RC ',
    createCheckboxControl(doc, factory, `student.tipoIdentificacion${OPTION_TAG_SEPARATOR}RC`, 'Tipo identificación · RC'),
    '  otro ',
    createCheckboxControl(doc, factory, `student.tipoIdentificacion${OPTION_TAG_SEPARATOR}otro`, 'Tipo identificación · otro'),
    '  ¿Cuál? ',
    createInlineTextControl(doc, factory, 'student.tipoIdentificacion', 'Tipo identificación'),
  ]);
  setCellToBlockControl(getCell(getRow(table, 1), 3), doc, factory, 'student.numeroIdentificacion', 'Número de identificación', 'plain');

  setCellToBlockControl(getCell(getRow(table, 3), 0), doc, factory, 'student.lugarNacimiento', 'Lugar de nacimiento', 'plain');
  setCellToBlockControl(getCell(getRow(table, 3), 1), doc, factory, 'student.edad', 'Edad', 'plain');
  setCellToBlockControl(getCell(getRow(table, 3), 2), doc, factory, 'student.fechaNacimiento', 'Fecha de nacimiento', 'plain');
  setCellToInlineSegments(getCell(getRow(table, 3), 3), doc, [
    createInlineTextControl(doc, factory, 'student.grado', 'Grado'),
    ' / ',
    createInlineTextControl(doc, factory, 'student.gradoAspiraIngresar', 'Grado al que aspira ingresar'),
  ]);
  setCellToBooleanPair(getCell(getRow(table, 3), 4), doc, factory, 'student.vinculadoSistemaAnterior');

  setCellToBlockControl(getCell(getRow(table, 4), 1), doc, factory, 'student.departamento', 'Departamento', 'plain');
  setCellToBlockControl(getCell(getRow(table, 4), 3), doc, factory, 'student.municipio', 'Municipio', 'plain');
  setCellToBlockControl(getCell(getRow(table, 4), 5), doc, factory, 'student.barrio', 'Barrio o vereda', 'plain');

  setCellToBlockControl(getCell(getRow(table, 5), 1), doc, factory, 'student.direccion', 'Dirección', 'plain');
  setCellToBlockControl(getCell(getRow(table, 5), 3), doc, factory, 'student.telefono', 'Teléfono', 'plain');
  setCellToBlockControl(getCell(getRow(table, 5), 5), doc, factory, 'student.correo', 'Correo electrónico', 'plain');

  setCellToInlineSegments(getCell(getRow(table, 7), 1), doc, [
    'Sí ',
    createCheckboxControl(doc, factory, `student.victimaConflicto${OPTION_TAG_SEPARATOR}true`, 'Víctima del conflicto · Sí'),
    '  No ',
    createCheckboxControl(doc, factory, `student.victimaConflicto${OPTION_TAG_SEPARATOR}false`, 'Víctima del conflicto · No'),
    '  Registro: ',
    createInlineTextControl(doc, factory, 'student.victimaConflictoRegistro', 'Víctima del conflicto · Registro'),
  ]);
  setCellToInlineSegments(getCell(getRow(table, 7), 2), doc, [
    'Sí ',
    createCheckboxControl(doc, factory, `student.centroProteccion${OPTION_TAG_SEPARATOR}true`, 'Centro de protección · Sí'),
    '  No ',
    createCheckboxControl(doc, factory, `student.centroProteccion${OPTION_TAG_SEPARATOR}false`, 'Centro de protección · No'),
    '  ¿Cuál? ',
    createInlineTextControl(doc, factory, 'student.centroProteccionLugar', 'Centro de protección · Lugar'),
  ]);
  setCellToInlineSegments(getCell(getRow(table, 7), 3), doc, [
    'Sí ',
    createCheckboxControl(doc, factory, `student.grupoEtnico${OPTION_TAG_SEPARATOR}true`, 'Grupo étnico · Sí'),
    '  No ',
    createCheckboxControl(doc, factory, `student.grupoEtnico${OPTION_TAG_SEPARATOR}false`, 'Grupo étnico · No'),
    '  ¿Cuál? ',
    createInlineTextControl(doc, factory, 'student.grupoEtnicoCual', 'Grupo étnico · Cuál'),
  ]);

  setCellToBlockControl(getCell(getRow(table, 9), 1), doc, factory, 'student.capacidades', 'Capacidades', 'rich');
  setCellToBlockControl(getCell(getRow(table, 11), 1), doc, factory, 'student.gustosIntereses', 'Gustos e intereses', 'rich');
  setCellToBlockControl(getCell(getRow(table, 13), 1), doc, factory, 'student.expectativasEstudiante', 'Expectativas del estudiante', 'rich');
  setCellToBlockControl(getCell(getRow(table, 15), 1), doc, factory, 'student.expectativasFamilia', 'Expectativas de la familia', 'rich');
  setCellToBlockControl(getCell(getRow(table, 17), 1), doc, factory, 'student.redesApoyo', 'Redes de apoyo', 'rich');
  setCellToBlockControl(getCell(getRow(table, 19), 1), doc, factory, 'student.otrasObservaciones', 'Otras observaciones', 'rich');
}
