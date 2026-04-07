import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { buildDocxFieldValueMap } from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest';
import { instrumentDocxTemplateDocumentXml } from '../docx-instrumenters';
import { DOCX_TEMPLATE_TABLE_INDEX } from '../docx-instrumenters/template-validator';
import { WORD_NAMESPACE } from './constants';
import { setCheckboxState, splitOptionTag } from './control-builders';
import { parseTemplateDocument, serializeTemplateDocument } from './template-xml';
import { createBlockParagraphs, createInlineRuns } from './xml-primitives';

// ─────────────────────────────────────────────
// Section: Constants
// ─────────────────────────────────────────────

const TYPE_IDENTIFICATION_TOKENS = ['TI', 'CC', 'RC', 'otro'] as const;

// ─────────────────────────────────────────────
// Section: Generic XML Helpers
// ─────────────────────────────────────────────

function getOrThrow<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function getTable(body: Element, index: number): Element {
  const tables = Array.from(body.getElementsByTagNameNS(WORD_NAMESPACE, 'tbl'));
  return getOrThrow(tables[index], `Missing template table ${index}`);
}

function getRow(table: Element, index: number): Element {
  return getOrThrow(table.getElementsByTagNameNS(WORD_NAMESPACE, 'tr')[index], 'Missing template row');
}

function getCell(row: Element, index: number): Element {
  return getOrThrow(row.getElementsByTagNameNS(WORD_NAMESPACE, 'tc')[index], 'Missing template cell');
}

function replaceChildrenPreservingPropertyNode(parent: Element, propertyLocalName: string, newChildren: Element[]): void {
  const preserved = Array.from(parent.childNodes).filter(
    (node) => node.nodeType === Node.ELEMENT_NODE
      && (node as Element).namespaceURI === WORD_NAMESPACE
      && (node as Element).localName === propertyLocalName,
  );

  for (const child of Array.from(parent.childNodes)) {
    parent.removeChild(child);
  }

  for (const propertyNode of preserved) {
    parent.appendChild(propertyNode);
  }

  for (const child of newChildren) {
    parent.appendChild(child);
  }
}

function setCellContent(cell: Element, children: Element[]): void {
  replaceChildrenPreservingPropertyNode(cell, 'tcPr', children);
}

function joinNonEmpty(parts: string[], separator: string): string {
  return parts.filter((value) => value.trim() !== '').join(separator);
}

// ─────────────────────────────────────────────
// Section: Instrumentation Export
// ─────────────────────────────────────────────

export { instrumentDocxTemplateDocumentXml };

// ─────────────────────────────────────────────
// Section: Control Population Helpers
// ─────────────────────────────────────────────

function populateTextControl(control: Element, value: string): void {
  const content = control.getElementsByTagNameNS(WORD_NAMESPACE, 'sdtContent')[0];
  if (!content) {
    return;
  }

  const doc = control.ownerDocument;
  const containsParagraphs = content.getElementsByTagNameNS(WORD_NAMESPACE, 'p').length > 0 || control.parentElement?.localName !== 'p';
  for (const child of Array.from(content.childNodes)) {
    content.removeChild(child);
  }

  if (containsParagraphs) {
    for (const paragraph of createBlockParagraphs(doc, value)) {
      content.appendChild(paragraph);
    }
    return;
  }

  for (const node of createInlineRuns(doc, value)) {
    content.appendChild(node);
  }
}

function setMirrorCellText(cell: Element, doc: Document, value: string, fallback = ''): void {
  setCellContent(cell, createBlockParagraphs(doc, value === '' ? fallback : value));
}

function populateMirrorTables(doc: Document, data: PIARFormDataV2): void {
  const body = getOrThrow(doc.getElementsByTagNameNS(WORD_NAMESPACE, 'body')[0], 'Missing document body');

  const actaHeader = getTable(body, DOCX_TEMPLATE_TABLE_INDEX.actaHeader);
  setMirrorCellText(
    getCell(getRow(actaHeader, 1), 1),
    doc,
    joinNonEmpty([data.header.fechaDiligenciamiento, data.header.lugarDiligenciamiento], ' — '),
    'DD/MM/AAAA',
  );
  setMirrorCellText(
    getCell(getRow(actaHeader, 2), 1),
    doc,
    joinNonEmpty([data.header.nombrePersonaDiligencia, data.header.rolPersonaDiligencia], ' — '),
  );
  setMirrorCellText(getCell(getRow(actaHeader, 3), 1), doc, data.header.institucionEducativa);

  const resumen = getTable(body, DOCX_TEMPLATE_TABLE_INDEX.actaSummary);
  setMirrorCellText(getCell(getRow(resumen, 0), 1), doc, joinNonEmpty([data.student.nombres, data.student.apellidos], ' '));
  setMirrorCellText(getCell(getRow(resumen, 0), 3), doc, data.student.edad);
  setMirrorCellText(getCell(getRow(resumen, 0), 5), doc, data.student.grado);
}

// ─────────────────────────────────────────────
// Section: Option Resolution Helpers
// ─────────────────────────────────────────────

function shouldCheckOption(path: string, token: string, value: string): boolean {
  if (path === 'student.tipoIdentificacion') {
    if (token === 'otro') {
      return value !== '' && !TYPE_IDENTIFICATION_TOKENS.slice(0, 3).includes(value as (typeof TYPE_IDENTIFICATION_TOKENS)[number]);
    }

    return value === token;
  }

  if (token === 'true') {
    return value === 'Sí';
  }

  if (token === 'false') {
    return value === 'No';
  }

  return value === token;
}

function getOverlayTextValue(path: string, value: string): string {
  if (path === 'student.tipoIdentificacion') {
    if (TYPE_IDENTIFICATION_TOKENS.includes(value as (typeof TYPE_IDENTIFICATION_TOKENS)[number])) {
      return '';
    }

    return value;
  }

  return value;
}

// ─────────────────────────────────────────────
// Section: Template Population Export
// ─────────────────────────────────────────────

export function populateDocxTemplateDocumentXml(templateXml: string, data: PIARFormDataV2): string {
  const doc = parseTemplateDocument(templateXml);
  const fieldValues = buildDocxFieldValueMap(data);
  const controls = Array.from(doc.getElementsByTagNameNS(WORD_NAMESPACE, 'sdt'));

  for (const control of controls) {
    const properties = control.getElementsByTagNameNS(WORD_NAMESPACE, 'sdtPr')[0];
    const tagNode = properties?.getElementsByTagNameNS(WORD_NAMESPACE, 'tag')[0];
    const tag = tagNode?.getAttributeNS(WORD_NAMESPACE, 'val') ?? '';
    if (!tag) {
      continue;
    }

    const option = splitOptionTag(tag);
    if (option) {
      const value = fieldValues.get(option.path) ?? '';
      setCheckboxState(control, shouldCheckOption(option.path, option.token, value));
      continue;
    }

    const value = fieldValues.get(tag) ?? '';
    populateTextControl(control, getOverlayTextValue(tag, value));
  }

  populateMirrorTables(doc, data);
  return serializeTemplateDocument(doc);
}
