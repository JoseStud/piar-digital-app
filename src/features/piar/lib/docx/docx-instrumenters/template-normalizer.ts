/**
 * Normalizes supported DOCX template variants to the reconciled
 * visible-field layout expected by the instrumenters.
 */

import { COMPETENCIAS_LECTORAS_311 } from '@piar-digital-app/features/piar/content/assessment-catalogs';
import { WORD_NAMESPACE } from '../docx-shared/constants';
import { createParagraph, createWordElement } from '../docx-shared/xml-primitives';
import { getCell, getRow, getTable, setCellContent } from './shared';

function getDirectWordChildren(parent: Element, localName: string): Element[] {
  return Array.from(parent.childNodes).filter(
    (node): node is Element => node.nodeType === Node.ELEMENT_NODE
      && (node as Element).namespaceURI === WORD_NAMESPACE
      && (node as Element).localName === localName,
  );
}

function clearChildrenPreservingWordProperty(parent: Element, propertyLocalName: string): void {
  const preserved = getDirectWordChildren(parent, propertyLocalName).map((node) => node.cloneNode(true));
  for (const child of Array.from(parent.childNodes)) {
    parent.removeChild(child);
  }

  for (const property of preserved) {
    parent.appendChild(property);
  }
}

function setParagraphTextPreservingStyle(paragraph: Element, text: string): void {
  const paragraphProps = getDirectWordChildren(paragraph, 'pPr')[0]?.cloneNode(true) ?? null;
  const firstRun = getDirectWordChildren(paragraph, 'r')[0]?.cloneNode(true) as Element | undefined;

  for (const child of Array.from(paragraph.childNodes)) {
    paragraph.removeChild(child);
  }

  if (paragraphProps) {
    paragraph.appendChild(paragraphProps);
  }

  const run = firstRun ?? createWordElement(paragraph.ownerDocument, 'r');
  clearChildrenPreservingWordProperty(run, 'rPr');
  const textNode = createWordElement(paragraph.ownerDocument, 't');
  textNode.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
  textNode.textContent = text;
  run.appendChild(textNode);
  paragraph.appendChild(run);
}

function setCellTextPreservingStyle(cell: Element, text: string): void {
  const templateParagraph = getDirectWordChildren(cell, 'p')[0];
  if (!templateParagraph) {
    setCellContent(cell, [createParagraph(cell.ownerDocument, [text])]);
    return;
  }

  const paragraph = templateParagraph.cloneNode(true) as Element;
  setParagraphTextPreservingStyle(paragraph, text);
  setCellContent(cell, [paragraph]);
}

function ensureHeaderParityRow(body: Element): void {
  const table = getTable(body, 0);
  const rows = getDirectWordChildren(table, 'tr');
  if (rows.length >= 5) {
    return;
  }

  const parityRow = getRow(table, 3).cloneNode(true) as Element;
  setCellTextPreservingStyle(getCell(parityRow, 0), 'Sede y Jornada');
  setCellTextPreservingStyle(getCell(parityRow, 1), ' ');
  table.appendChild(parityRow);
}

function ensureActaHeaderParityLabel(body: Element): void {
  const table = getTable(body, 17);
  const row = getRow(table, 4);
  setCellTextPreservingStyle(getCell(row, 0), 'Sede y Jornada');
}

function ensureCompetencyParityRows(body: Element): void {
  const table = getTable(body, 7);
  const rows = getDirectWordChildren(table, 'tr');
  // Only the legacy 100-row competency table is safe to normalize here.
  // The reconciled template already has 102 rows after the two missing CL311
  // entries are present, and `instrumentCompetencies()` appends one final
  // observations row later, which is why the fully instrumented tree reaches 103.
  if (rows.length !== 100) {
    return;
  }

  const rowTemplate = getRow(table, 38);
  const observationRow = getRow(table, 39);
  const cl311_17 = COMPETENCIAS_LECTORAS_311.find((item) => item.id === 'cl311_17');
  const cl311_18 = COMPETENCIAS_LECTORAS_311.find((item) => item.id === 'cl311_18');

  const seventeenthRow = rowTemplate.cloneNode(true) as Element;
  setCellTextPreservingStyle(
    getCell(seventeenthRow, 0),
    `17. ${cl311_17?.label ?? 'Evalúa la credibilidad de fuentes escritas'}`,
  );

  const eighteenthRow = rowTemplate.cloneNode(true) as Element;
  setCellTextPreservingStyle(
    getCell(eighteenthRow, 0),
    `18. ${cl311_18?.label ?? 'Produce textos argumentativos con evidencia'}`,
  );

  table.insertBefore(seventeenthRow, observationRow);
  table.insertBefore(eighteenthRow, observationRow);
}

/** Normalizes the template XML tree to the reconciled visible export layout. */
export function normalizeDocxTemplateStructure(body: Element): void {
  ensureHeaderParityRow(body);
  ensureActaHeaderParityLabel(body);
  ensureCompetencyParityRows(body);
}
