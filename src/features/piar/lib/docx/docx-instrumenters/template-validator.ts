/**
 * Validates that the configured DOCX template has every structured control
 * the instrumenters expect before the instrumentation pass runs.
 */

import { WORD_NAMESPACE } from '../docx-shared/constants';
import { parseTemplateDocument } from '../docx-shared/template-xml';

/** Describes one table that must exist in the DOCX template. */
interface TemplateTableExpectation {
  index: number;
  label: string;
  rows: number;
  columnCounts?: readonly number[];
  requiredText?: readonly string[];
}

/** Table indexes for acta-specific template regions. */
export const DOCX_TEMPLATE_TABLE_INDEX = {
  actaHeader: 17,
  actaSummary: 18,
} as const;

const EXPECTED_TABLES: TemplateTableExpectation[] = [
  { index: 0, label: 'Información General', rows: 4 },
  { index: 1, label: 'Información del Estudiante', rows: 20 },
  { index: 2, label: 'Entorno de Salud', rows: 13 },
  { index: 3, label: 'Entorno del Hogar', rows: 7 },
  { index: 4, label: 'Entorno Educativo', rows: 6 },
  { index: 5, label: 'Separador de transición', rows: 1 },
  { index: 6, label: 'Valoración Pedagógica', rows: 27 },
  { index: 7, label: 'Competencias y Dispositivos', rows: 100 },
  { index: 8, label: 'Separador de transición', rows: 1 },
  { index: 9, label: 'Descripción de Habilidades y Destrezas', rows: 1 },
  { index: 10, label: 'Estrategias y/o Acciones a Desarrollar', rows: 1 },
  { index: 11, label: 'Firmas', rows: 2 },
  { index: 12, label: 'Ajustes Razonables', rows: 7 },
  { index: 13, label: 'Firmas docentes 1', rows: 6 },
  { index: 14, label: 'Firmas docentes 2', rows: 6 },
  { index: 15, label: 'Firmas docentes 3', rows: 6 },
  { index: 16, label: 'Firmas especiales', rows: 6 },
  {
    index: DOCX_TEMPLATE_TABLE_INDEX.actaHeader,
    label: 'Acta de Acuerdo - encabezado',
    rows: 5,
    columnCounts: [1, 2, 2, 2, 2],
    requiredText: ['ACTA DE ACUERDO', 'Fecha y Lugar de Diligenciamiento', 'Institución Educativa'],
  },
  {
    index: DOCX_TEMPLATE_TABLE_INDEX.actaSummary,
    label: 'Resumen',
    rows: 1,
    columnCounts: [6],
    requiredText: ['Nombre', 'Edad', 'Grado'],
  },
  { index: 19, label: 'Compromisos', rows: 1 },
  { index: 20, label: 'Actividades', rows: 6 },
  { index: 21, label: 'Firmas del acta', rows: 6 },
];

function getDirectChildren(parent: Element, localName: string): Element[] {
  return Array.from(parent.childNodes).filter(
    (node): node is Element => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return false;
      }

      const element = node as Element;
      return element.namespaceURI === WORD_NAMESPACE && element.localName === localName;
    },
  );
}

function getTableRows(table: Element): Element[] {
  return getDirectChildren(table, 'tr');
}

function getRowCells(row: Element): Element[] {
  return getDirectChildren(row, 'tc');
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function getElementText(element: Element): string {
  return normalizeText(element.textContent ?? '');
}

/** Throws when the configured DOCX template structure does not match expectations. */
export function validateDocxTemplateStructure(templateXml: string): void {
  const doc = parseTemplateDocument(templateXml);
  const body = doc.getElementsByTagNameNS(WORD_NAMESPACE, 'body')[0];
  if (!body) {
    throw new Error('Missing DOCX template body.');
  }

  const tables = Array.from(body.getElementsByTagNameNS(WORD_NAMESPACE, 'tbl'));
  if (tables.length !== EXPECTED_TABLES.length) {
    throw new Error(`Unexpected DOCX template table count: expected ${EXPECTED_TABLES.length}, found ${tables.length}.`);
  }

  for (const expectation of EXPECTED_TABLES) {
    const table = tables[expectation.index];
    if (!table) {
      throw new Error(`Missing DOCX template table ${expectation.index} (${expectation.label}).`);
    }

    const rows = getTableRows(table);
    const rowCount = rows.length;
    if (rowCount !== expectation.rows) {
      throw new Error(
        `DOCX template table ${expectation.index} (${expectation.label}) has ${rowCount} rows, expected ${expectation.rows}.`,
      );
    }

    if (expectation.columnCounts) {
      expectation.columnCounts.forEach((expectedCellCount, rowIndex) => {
        const cellCount = getRowCells(rows[rowIndex]).length;
        if (cellCount !== expectedCellCount) {
          throw new Error(
            `DOCX template table ${expectation.index} (${expectation.label}) row ${rowIndex} has ${cellCount} cells, expected ${expectedCellCount}.`,
          );
        }
      });
    }

    if (expectation.requiredText) {
      const tableText = getElementText(table);
      for (const expectedText of expectation.requiredText) {
        if (!tableText.includes(normalizeText(expectedText))) {
          throw new Error(
            `DOCX template table ${expectation.index} (${expectation.label}) is missing expected text "${expectedText}".`,
          );
        }
      }
    }
  }
}
