import {
  DOCX_CHECKBOX_CONFLICT_TOKEN,
  PIAR_DOCX_XML_NAMESPACE,
  WORD_14_NAMESPACE,
  WORD_NAMESPACE,
} from './constants';

const OPTION_TAG_SEPARATOR = '::option::';

function hasXmlParseError(doc: Document): boolean {
  return doc.getElementsByTagName('parsererror').length > 0;
}

function getNamespacedAttr(element: Element, namespace: string, localName: string): string {
  return element.getAttributeNS(namespace, localName) ?? '';
}

export function parseXml(xml: string): Document | null {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  return hasXmlParseError(doc) ? null : doc;
}

export function extractFieldMapFromCustomXml(xml: string): { version: number | null; fields: Map<string, string> } | null {
  const doc = parseXml(xml);
  if (!doc?.documentElement) {
    return null;
  }

  const root = doc.documentElement;
  const version = Number.parseInt(root.getAttribute('v') ?? '', 10);
  const fieldNodes = Array.from(doc.getElementsByTagNameNS(PIAR_DOCX_XML_NAMESPACE, 'field'));
  if (fieldNodes.length === 0) {
    return null;
  }

  const fields = new Map<string, string>();
  for (const fieldNode of fieldNodes) {
    const path = fieldNode.getAttribute('path');
    if (!path) {
      continue;
    }

    fields.set(path, fieldNode.textContent ?? '');
  }

  return {
    version: Number.isInteger(version) ? version : null,
    fields,
  };
}

function walkControlNode(node: Node, parts: string[]): void {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = node as Element;
  if (element.namespaceURI === WORD_NAMESPACE && element.localName === 't') {
    parts.push(element.textContent ?? '');
    return;
  }

  if (element.namespaceURI === WORD_NAMESPACE && element.localName === 'br') {
    parts.push('\n');
    return;
  }

  for (const child of Array.from(element.childNodes)) {
    walkControlNode(child, parts);
  }
}

function normalizeLogicalBlankLines(text: string): string {
  return text
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : line))
    .join('\n');
}

function extractParagraphText(paragraph: Element): string {
  const parts: string[] = [];
  walkControlNode(paragraph, parts);
  const text = normalizeLogicalBlankLines(parts.join(''));

  return text.trim() === '' ? '' : text;
}

function extractControlText(content: Element): string {
  const paragraphs = Array.from(content.getElementsByTagNameNS(WORD_NAMESPACE, 'p'));

  if (paragraphs.length === 0) {
    const parts: string[] = [];
    walkControlNode(content, parts);
    const text = normalizeLogicalBlankLines(parts.join(''));
    return text.trim() === '' ? '' : text;
  }

  return normalizeLogicalBlankLines(paragraphs.map(extractParagraphText).join('\n'));
}

function splitOptionTag(tag: string): { path: string; token: string } | null {
  const separatorIndex = tag.indexOf(OPTION_TAG_SEPARATOR);
  if (separatorIndex === -1) {
    return null;
  }

  return {
    path: tag.slice(0, separatorIndex),
    token: tag.slice(separatorIndex + OPTION_TAG_SEPARATOR.length),
  };
}

function getCheckboxState(control: Element): boolean | null {
  const checkedNode = control.getElementsByTagNameNS(WORD_14_NAMESPACE, 'checked')[0];
  const checkedValue = checkedNode?.getAttributeNS(WORD_14_NAMESPACE, 'val') ?? checkedNode?.getAttribute('w14:val') ?? checkedNode?.getAttribute('val');
  if (checkedValue === '1' || checkedValue === 'true') {
    return true;
  }

  if (checkedValue === '0' || checkedValue === 'false') {
    return false;
  }

  const content = control.getElementsByTagNameNS(WORD_NAMESPACE, 'sdtContent')[0];
  const text = content ? extractControlText(content).trim() : '';
  if (text.includes('☒') || text.includes('☑') || text.includes('☓') || text.includes('X')) {
    return true;
  }

  if (text.includes('☐')) {
    return false;
  }

  return null;
}

function mergeOptionAndTextValue(path: string, optionValue: string, textValue: string | undefined): string {
  if (path === 'student.tipoIdentificacion') {
    if (optionValue === DOCX_CHECKBOX_CONFLICT_TOKEN) {
      return optionValue;
    }

    if (optionValue === 'otro') {
      return textValue?.trim() ? textValue.trim() : 'otro';
    }

    if (optionValue !== '') {
      return optionValue;
    }

    return textValue ?? '';
  }

  if (optionValue === DOCX_CHECKBOX_CONFLICT_TOKEN) {
    return optionValue;
  }

  return optionValue === '' ? (textValue ?? '') : optionValue;
}

export function extractFieldMapFromDocumentXml(xml: string): Map<string, string> {
  const doc = parseXml(xml);
  if (!doc?.documentElement) {
    return new Map();
  }

  const fieldValues = new Map<string, string>();
  const optionStates = new Map<string, Map<string, boolean>>();
  const controls = Array.from(doc.getElementsByTagNameNS(WORD_NAMESPACE, 'sdt'));

  for (const control of controls) {
    const properties = control.getElementsByTagNameNS(WORD_NAMESPACE, 'sdtPr')[0];
    const tag = properties?.getElementsByTagNameNS(WORD_NAMESPACE, 'tag')[0];
    const content = control.getElementsByTagNameNS(WORD_NAMESPACE, 'sdtContent')[0];

    if (!tag || !content) {
      continue;
    }

    const path = getNamespacedAttr(tag, WORD_NAMESPACE, 'val');
    if (!path) {
      continue;
    }

    const option = splitOptionTag(path);
    if (option) {
      const group = optionStates.get(option.path) ?? new Map<string, boolean>();
      const state = getCheckboxState(control);
      group.set(option.token, state === true);
      optionStates.set(option.path, group);
      continue;
    }

    fieldValues.set(path, extractControlText(content));
  }

  for (const [path, options] of Array.from(optionStates.entries())) {
    const selectedTokens = Array.from(options.entries())
      .filter((entry) => entry[1])
      .map((entry) => entry[0]);

    const optionValue = selectedTokens.length > 1
      ? DOCX_CHECKBOX_CONFLICT_TOKEN
      : selectedTokens.length === 1
        ? (
          selectedTokens[0] === 'true'
            ? 'Sí'
            : selectedTokens[0] === 'false'
              ? 'No'
              : selectedTokens[0]
        )
        : '';

    fieldValues.set(path, mergeOptionAndTextValue(path, optionValue, fieldValues.get(path)));
  }

  return fieldValues;
}
