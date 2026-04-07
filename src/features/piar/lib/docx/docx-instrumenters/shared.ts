import { WORD_NAMESPACE } from '../docx-shared/constants';
import {
  type ControlFactory,
  OPTION_TAG_SEPARATOR,
  createBlockTextControl,
  createCheckboxControl,
  createInlineTextControl,
} from '../docx-shared/control-builders';
import { type Alignment, type ParagraphSegment, createParagraph } from '../docx-shared/xml-primitives';

// ─────────────────────────────────────────────
// Section: Core Lookup Helpers
// ─────────────────────────────────────────────

export function getOrThrow<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function getBodyElementChildren(body: Element): Element[] {
  return Array.from(body.childNodes).filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE);
}

export function getTable(body: Element, index: number): Element {
  const tables = Array.from(body.getElementsByTagNameNS(WORD_NAMESPACE, 'tbl'));
  return getOrThrow(tables[index], `Missing template table ${index}`);
}

export function getRow(table: Element, index: number): Element {
  return getOrThrow(table.getElementsByTagNameNS(WORD_NAMESPACE, 'tr')[index], 'Missing template row');
}

export function getCell(row: Element, index: number): Element {
  return getOrThrow(row.getElementsByTagNameNS(WORD_NAMESPACE, 'tc')[index], 'Missing template cell');
}

// ─────────────────────────────────────────────
// Section: Node Replacement Helpers
// ─────────────────────────────────────────────

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

export function setCellContent(cell: Element, children: Element[]): void {
  replaceChildrenPreservingPropertyNode(cell, 'tcPr', children);
}

// ─────────────────────────────────────────────
// Section: Cell Composition Helpers
// ─────────────────────────────────────────────

export function setCellToInlineSegments(cell: Element, doc: Document, segments: ParagraphSegment[], options: {
  align?: Alignment;
  hidden?: boolean;
} = {}): void {
  setCellContent(cell, [createParagraph(doc, segments, options)]);
}

export function setCellToBlockControl(
  cell: Element,
  doc: Document,
  factory: ControlFactory,
  path: string,
  label: string,
  kind: 'plain' | 'rich',
): void {
  setCellContent(cell, [createBlockTextControl(doc, factory, path, label, kind)]);
}

export function setCellToBooleanPair(
  cell: Element,
  doc: Document,
  factory: ControlFactory,
  path: string,
  trueLabel = 'Sí',
  falseLabel = 'No',
): void {
  setCellToInlineSegments(cell, doc, [
    `${trueLabel} `,
    createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}true`, `${path} · ${trueLabel}`),
    `  ${falseLabel} `,
    createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}false`, `${path} · ${falseLabel}`),
  ]);
}

export function setCellToStandaloneCheckbox(cell: Element, doc: Document, factory: ControlFactory, tag: string, label: string): void {
  setCellToInlineSegments(cell, doc, [createCheckboxControl(doc, factory, tag, label)], { align: 'center' });
}

function createIntensityParagraph(
  doc: Document,
  factory: ControlFactory,
  path: string,
): Element {
  return createParagraph(doc, [
    'Intensidad y duración del apoyo: Ninguno ',
    createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}ninguno`, `${path} · Ninguno`),
    '  Intermitente ',
    createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}intermitente`, `${path} · Intermitente`),
    '  Extenso ',
    createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}extenso`, `${path} · Extenso`),
    '  Generalizado ',
    createCheckboxControl(doc, factory, `${path}${OPTION_TAG_SEPARATOR}generalizado`, `${path} · Generalizado`),
    '  No aplica _____',
  ]);
}

export function setCellToIntensityAndObservation(
  cell: Element,
  doc: Document,
  factory: ControlFactory,
  intensityPath: string,
  observationPath: string,
  observationLabel: string,
): void {
  setCellContent(cell, [
    createIntensityParagraph(doc, factory, intensityPath),
    createParagraph(doc, ['Observación:']),
    createBlockTextControl(doc, factory, observationPath, observationLabel, 'rich'),
  ]);
}

// ─────────────────────────────────────────────
// Section: Traversal and Replacement Helpers
// ─────────────────────────────────────────────

export function findParagraphByText(body: Element, snippet: string): Element {
  const bodyChildren = getBodyElementChildren(body);
  const paragraph = bodyChildren.find((child) => (
    child.namespaceURI === WORD_NAMESPACE
    && child.localName === 'p'
    && (child.textContent ?? '').includes(snippet)
  ));
  return getOrThrow(paragraph, `Missing paragraph containing "${snippet}"`);
}

export function findTableParagraphFollowing(table: Element): Element {
  let current = table.nextSibling;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as Element;
      if (element.namespaceURI === WORD_NAMESPACE && element.localName === 'p') {
        return element;
      }
    }
    current = current.nextSibling;
  }

  throw new Error('Missing paragraph after table');
}

export function replaceNode(target: Element, replacement: Element): void {
  target.parentNode?.replaceChild(replacement, target);
}

export function createBodyBlockControl(
  doc: Document,
  factory: ControlFactory,
  path: string,
  label: string,
  kind: 'plain' | 'rich',
): Element {
  return createBlockTextControl(doc, factory, path, label, kind);
}

// ─────────────────────────────────────────────
// Section: Re-exports
// ─────────────────────────────────────────────

export { createCheckboxControl, createInlineTextControl, OPTION_TAG_SEPARATOR };
