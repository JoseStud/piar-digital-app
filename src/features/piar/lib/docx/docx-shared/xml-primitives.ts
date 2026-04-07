import {
  PIAR_DOCX_STORE_ITEM_ID,
  WORD_14_NAMESPACE,
  WORD_NAMESPACE,
  XML_PREFIX_MAPPINGS,
} from './constants';

// ─────────────────────────────────────────────
// Section: Constants and Types
// ─────────────────────────────────────────────

const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';

export type Alignment = 'left' | 'center';
export type ParagraphSegment = string | Element;

// ─────────────────────────────────────────────
// Section: XML Element Factories
// ─────────────────────────────────────────────

export function createWordElement(doc: Document, localName: string): Element {
  return doc.createElementNS(WORD_NAMESPACE, `w:${localName}`);
}

export function createWord14Element(doc: Document, localName: string): Element {
  return doc.createElementNS(WORD_14_NAMESPACE, `w14:${localName}`);
}

export function setWordAttribute(element: Element, localName: string, value: string): void {
  element.setAttributeNS(WORD_NAMESPACE, `w:${localName}`, value);
}

export function setWord14Attribute(element: Element, localName: string, value: string): void {
  element.setAttributeNS(WORD_14_NAMESPACE, `w14:${localName}`, value);
}

// ─────────────────────────────────────────────
// Section: Text and Paragraph Builders
// ─────────────────────────────────────────────

export function appendTextRun(
  doc: Document,
  parent: Element,
  text: string,
  options: {
    preserveSpace?: boolean;
    bold?: boolean;
    hidden?: boolean;
    color?: string;
    size?: string;
  } = {},
): void {
  const run = createWordElement(doc, 'r');
  if (options.bold || options.hidden || options.color || options.size) {
    const runProps = createWordElement(doc, 'rPr');
    if (options.bold) {
      runProps.appendChild(createWordElement(doc, 'b'));
    }
    if (options.hidden) {
      runProps.appendChild(createWordElement(doc, 'vanish'));
    }
    if (options.color) {
      const color = createWordElement(doc, 'color');
      setWordAttribute(color, 'val', options.color);
      runProps.appendChild(color);
    }
    if (options.size) {
      const size = createWordElement(doc, 'sz');
      setWordAttribute(size, 'val', options.size);
      runProps.appendChild(size);
    }
    run.appendChild(runProps);
  }

  const textNode = createWordElement(doc, 't');
  if (options.preserveSpace ?? true) {
    textNode.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
  }
  textNode.textContent = text;
  run.appendChild(textNode);
  parent.appendChild(run);
}

export function createParagraph(doc: Document, segments: ParagraphSegment[], options: {
  align?: Alignment;
  hidden?: boolean;
} = {}): Element {
  const paragraph = createWordElement(doc, 'p');
  if (options.align || options.hidden) {
    const paragraphProps = createWordElement(doc, 'pPr');
    if (options.align) {
      const justification = createWordElement(doc, 'jc');
      setWordAttribute(justification, 'val', options.align);
      paragraphProps.appendChild(justification);
    }
    if (options.hidden) {
      const runProps = createWordElement(doc, 'rPr');
      runProps.appendChild(createWordElement(doc, 'vanish'));

      const color = createWordElement(doc, 'color');
      setWordAttribute(color, 'val', 'FFFFFF');
      runProps.appendChild(color);

      const size = createWordElement(doc, 'sz');
      setWordAttribute(size, 'val', '2');
      runProps.appendChild(size);

      paragraphProps.appendChild(runProps);
    }
    paragraph.appendChild(paragraphProps);
  }

  for (const segment of segments) {
    if (typeof segment === 'string') {
      appendTextRun(doc, paragraph, segment);
    } else {
      paragraph.appendChild(segment);
    }
  }

  if (!paragraph.lastChild) {
    appendTextRun(doc, paragraph, ' ');
  }

  return paragraph;
}

export function createBlockParagraphs(doc: Document, value: string): Element[] {
  const normalized = value.replace(/\r\n/g, '\n');
  if (normalized === '') {
    return [createParagraph(doc, [' '])];
  }

  return normalized.split('\n').map((line) => createParagraph(doc, [line === '' ? ' ' : line]));
}

export function createInlineRuns(doc: Document, value: string): Element[] {
  const normalized = value.replace(/\r\n/g, '\n');
  if (normalized === '') {
    const run = createWordElement(doc, 'r');
    const textNode = createWordElement(doc, 't');
    textNode.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
    textNode.textContent = ' ';
    run.appendChild(textNode);
    return [run];
  }

  const nodes: Element[] = [];
  const lines = normalized.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (index > 0) {
      const breakRun = createWordElement(doc, 'r');
      breakRun.appendChild(createWordElement(doc, 'br'));
      nodes.push(breakRun);
    }

    const run = createWordElement(doc, 'r');
    const textNode = createWordElement(doc, 't');
    textNode.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
    textNode.textContent = line === '' ? ' ' : line;
    run.appendChild(textNode);
    nodes.push(run);
  }

  return nodes;
}

// ─────────────────────────────────────────────
// Section: SDT Metadata Helpers
// ─────────────────────────────────────────────

export function createTagElement(doc: Document, tag: string): Element {
  const tagElement = createWordElement(doc, 'tag');
  setWordAttribute(tagElement, 'val', tag);
  return tagElement;
}

export function createAliasElement(doc: Document, value: string): Element {
  const alias = createWordElement(doc, 'alias');
  setWordAttribute(alias, 'val', value);
  return alias;
}

export function createIdElement(doc: Document, id: number): Element {
  const identifier = createWordElement(doc, 'id');
  setWordAttribute(identifier, 'val', String(id));
  return identifier;
}

export function createLockElement(doc: Document): Element {
  const lock = createWordElement(doc, 'lock');
  setWordAttribute(lock, 'val', 'sdtLocked');
  return lock;
}

export function createDataBindingElement(doc: Document, path: string): Element {
  const xpath = `/piar:document/piar:fields/piar:field[@path='${path}']`;
  const dataBinding = createWordElement(doc, 'dataBinding');
  setWordAttribute(dataBinding, 'storeItemID', PIAR_DOCX_STORE_ITEM_ID);
  setWordAttribute(dataBinding, 'xpath', xpath);
  setWordAttribute(dataBinding, 'prefixMappings', XML_PREFIX_MAPPINGS);
  return dataBinding;
}
