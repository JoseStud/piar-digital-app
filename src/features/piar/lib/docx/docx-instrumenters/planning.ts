import {
  createBodyBlockControl,
  createInlineTextControl,
  findParagraphByText,
  findTableParagraphFollowing,
  getCell,
  getRow,
  getTable,
  replaceNode,
  setCellContent,
  setCellToBlockControl,
  setCellToInlineSegments,
} from './shared';
import { createParagraph } from '../docx-shared/xml-primitives';
import type { ControlFactory } from '../docx-shared/control-builders';

// ─────────────────────────────────────────────
// Section: Narratives and Revision Instrumentation
// ─────────────────────────────────────────────

export function instrumentNarrativesAndPlanning(body: Element, doc: Document, factory: ControlFactory): void {
  const descripcionTable = getTable(body, 9);
  setCellToBlockControl(getCell(getRow(descripcionTable, 0), 0), doc, factory, 'descripcionHabilidades', 'Descripción de habilidades y destrezas', 'rich');

  const estrategiasHeading = getTable(body, 10);
  const estrategiasParagraph = findTableParagraphFollowing(estrategiasHeading);
  replaceNode(
    estrategiasParagraph,
    createBodyBlockControl(doc, factory, 'estrategiasAcciones', 'Estrategias y acciones', 'rich'),
  );

  const firmasTable = getTable(body, 11);
  setCellToBlockControl(getCell(getRow(firmasTable, 1), 0), doc, factory, 'firmas.firmantePIAR', 'Nombre y firma de quien diligencia', 'rich');
  setCellToBlockControl(getCell(getRow(firmasTable, 1), 1), doc, factory, 'firmas.firmanteAcudiente', 'Nombre y firma acudiente', 'rich');

  const revisionParagraph = findParagraphByText(body, 'Fecha sugerida de próxima revisión y actualización');
  replaceNode(revisionParagraph, createParagraph(doc, [
    'Fecha sugerida de próxima revisión y actualización: ',
    createInlineTextControl(doc, factory, 'fechaProximaRevision', 'Fecha próxima revisión'),
    '  (anualmente en el proceso ordinario pero si se requiere por modificaciones en el estudiante o en su contexto se deberá actualizar)',
  ]));
}

// ─────────────────────────────────────────────
// Section: Ajustes Instrumentation
// ─────────────────────────────────────────────

export function instrumentAjustes(body: Element, doc: Document, factory: ControlFactory): void {
  const table = getTable(body, 12);
  for (let index = 0; index < 5; index += 1) {
    const row = getRow(table, index + 2);
    setCellToInlineSegments(getCell(row, 0), doc, [
      `${index + 1}. `,
      createInlineTextControl(doc, factory, `ajustes.${index}.area`, `Ajuste ${index + 1} · Área`),
    ]);
    setCellToBlockControl(getCell(row, 1), doc, factory, `ajustes.${index}.barreras`, `Ajuste ${index + 1} · Barreras`, 'rich');
    setCellToBlockControl(getCell(row, 2), doc, factory, `ajustes.${index}.tipoAjuste`, `Ajuste ${index + 1} · Tipo de ajuste`, 'rich');
    setCellToBlockControl(getCell(row, 3), doc, factory, `ajustes.${index}.apoyoRequerido`, `Ajuste ${index + 1} · Apoyo requerido`, 'plain');
    setCellToBlockControl(getCell(row, 4), doc, factory, `ajustes.${index}.descripcion`, `Ajuste ${index + 1} · Descripción`, 'rich');
    setCellToBlockControl(getCell(row, 5), doc, factory, `ajustes.${index}.seguimiento`, `Ajuste ${index + 1} · Seguimiento`, 'rich');
  }
}

// ─────────────────────────────────────────────
// Section: Signatures Instrumentation
// ─────────────────────────────────────────────

export function instrumentFirmas(body: Element, doc: Document, factory: ControlFactory): void {
  const teacherTables = [13, 14, 15];
  for (let groupIndex = 0; groupIndex < teacherTables.length; groupIndex += 1) {
    const tableIndex = teacherTables[groupIndex];
    const table = getTable(body, tableIndex);
    for (let offset = 0; offset < 3; offset += 1) {
      const teacherIndex = groupIndex * 3 + offset;
      setCellToBlockControl(getCell(getRow(table, 1), offset), doc, factory, `firmas.docentes.${teacherIndex}.nombre`, `Docente ${teacherIndex + 1} · Nombre`, 'plain');
      setCellToBlockControl(getCell(getRow(table, 3), offset), doc, factory, `firmas.docentes.${teacherIndex}.area`, `Docente ${teacherIndex + 1} · Área`, 'plain');
      setCellToBlockControl(getCell(getRow(table, 5), offset), doc, factory, `firmas.docentes.${teacherIndex}.firma`, `Docente ${teacherIndex + 1} · Firma`, 'rich');
    }
  }

  const specialTable = getTable(body, 16);
  const specialRoles = [
    'firmas.docenteOrientador',
    'firmas.docenteApoyoPedagogico',
    'firmas.coordinadorPedagogico',
  ] as const;

  for (let index = 0; index < specialRoles.length; index += 1) {
    const basePath = specialRoles[index];
    setCellToBlockControl(getCell(getRow(specialTable, 1), index), doc, factory, `${basePath}.nombre`, `${basePath} · Nombre`, 'plain');
    setCellToBlockControl(getCell(getRow(specialTable, 3), index), doc, factory, `${basePath}.area`, `${basePath} · Área`, 'plain');
    setCellToBlockControl(getCell(getRow(specialTable, 5), index), doc, factory, `${basePath}.firma`, `${basePath} · Firma`, 'rich');
  }
}

// ─────────────────────────────────────────────
// Section: Acta Instrumentation
// ─────────────────────────────────────────────

export function instrumentActa(body: Element, doc: Document, factory: ControlFactory): void {
  const headerTable = getTable(body, 17);
  setCellToBlockControl(getCell(getRow(headerTable, 4), 1), doc, factory, 'header.sede', 'Sede', 'plain');

  const studentInfoTable = getTable(body, 18);
  setCellToInlineSegments(getCell(getRow(studentInfoTable, 0), 1), doc, [
    createInlineTextControl(doc, factory, 'acta.equipoDirectivosDocentes', 'Equipo directivos y docentes'),
  ]);
  setCellToInlineSegments(getCell(getRow(studentInfoTable, 0), 3), doc, [
    createInlineTextControl(doc, factory, 'acta.familiaParticipante', 'Familia participante'),
  ]);
  setCellToInlineSegments(getCell(getRow(studentInfoTable, 0), 5), doc, [
    createInlineTextControl(doc, factory, 'acta.parentescoFamiliaParticipante', 'Parentesco familia participante'),
  ]);

  const compromisosTable = getTable(body, 19);
  setCellContent(getCell(getRow(compromisosTable, 0), 0), [
    createParagraph(doc, ['Incluya aquí los compromisos específicos para implementar en el aula que requieran ampliación o detalle adicional al incluido en el PIAR:']),
    createBodyBlockControl(doc, factory, 'acta.compromisos', 'Compromisos del acta', 'rich'),
  ]);

  const actividadesTable = getTable(body, 20);
  for (let index = 0; index < 5; index += 1) {
    const row = getRow(actividadesTable, index + 1);
    setCellToBlockControl(getCell(row, 0), doc, factory, `acta.actividades.${index}.nombre`, `Actividad ${index + 1} · Nombre`, 'plain');
    setCellToBlockControl(getCell(row, 1), doc, factory, `acta.actividades.${index}.descripcion`, `Actividad ${index + 1} · Descripción`, 'rich');
    setCellToBlockControl(getCell(row, 2), doc, factory, `acta.actividades.${index}.frecuencia`, `Actividad ${index + 1} · Frecuencia`, 'plain');
  }

  const firmasTable = getTable(body, 21);
  setCellToBlockControl(getCell(getRow(firmasTable, 0), 0), doc, factory, 'acta.firmaEstudiante', 'Acta · Firma estudiante', 'rich');
  setCellToBlockControl(getCell(getRow(firmasTable, 0), 1), doc, factory, 'acta.firmaAcudiente', 'Acta · Firma acudiente', 'rich');
  setCellToBlockControl(getCell(getRow(firmasTable, 2), 0), doc, factory, 'acta.firmaDocentes', 'Acta · Firma docentes', 'rich');
  setCellToBlockControl(getCell(getRow(firmasTable, 4), 0), doc, factory, 'acta.firmaDirectivo', 'Acta · Firma directivo', 'rich');
}
