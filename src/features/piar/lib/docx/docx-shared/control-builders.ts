/**
 * Constructors for Word structured-document-tag controls used by the
 * DOCX template instrumentation and round-trip importer.
 *
 * The helpers cover text controls, checkbox controls, and tag parsing.
 */

import { WORD_14_NAMESPACE, WORD_NAMESPACE } from './constants';
import {
  appendTextRun,
  createAliasElement,
  createBlockParagraphs,
  createDataBindingElement,
  createIdElement,
  createInlineRuns,
  createLockElement,
  createTagElement,
  createWord14Element,
  createWordElement,
  setWord14Attribute,
} from './xml-primitives';

// ─────────────────────────────────────────────
// Section: Constants and Types
// ─────────────────────────────────────────────

/** Delimiter that marks checkbox option tags inside structured controls. */
export const OPTION_TAG_SEPARATOR = '::option::';
const CHECKED_GLYPH = '☒';
const UNCHECKED_GLYPH = '☐';

/** Generates monotonically increasing Word control ids. */
export interface ControlFactory {
  nextId(): number;
}

// ─────────────────────────────────────────────
// Section: Control Factories
// ─────────────────────────────────────────────

/** Creates a fresh control-id factory for one DOCX instrumentation pass. */
export function createControlFactory(start = 1000): ControlFactory {
  let current = start;
  return {
    nextId() {
      const value = current;
      current += 1;
      return value;
    },
  };
}

/** Creates an inline text content control for a template field path. */
export function createInlineTextControl(
  doc: Document,
  factory: ControlFactory,
  path: string,
  label: string,
): Element {
  const control = createWordElement(doc, 'sdt');
  const properties = createWordElement(doc, 'sdtPr');
  properties.appendChild(createAliasElement(doc, label));
  properties.appendChild(createTagElement(doc, path));
  properties.appendChild(createIdElement(doc, factory.nextId()));
  properties.appendChild(createLockElement(doc));
  properties.appendChild(createDataBindingElement(doc, path));
  properties.appendChild(createWordElement(doc, 'text'));
  control.appendChild(properties);

  const content = createWordElement(doc, 'sdtContent');
  for (const node of createInlineRuns(doc, '')) {
    content.appendChild(node);
  }
  control.appendChild(content);
  return control;
}

/** Creates a block text content control for a template field path. */
export function createBlockTextControl(
  doc: Document,
  factory: ControlFactory,
  path: string,
  label: string,
  kind: 'plain' | 'rich',
): Element {
  const control = createWordElement(doc, 'sdt');
  const properties = createWordElement(doc, 'sdtPr');
  properties.appendChild(createAliasElement(doc, label));
  properties.appendChild(createTagElement(doc, path));
  properties.appendChild(createIdElement(doc, factory.nextId()));
  properties.appendChild(createLockElement(doc));
  properties.appendChild(createDataBindingElement(doc, path));
  properties.appendChild(createWordElement(doc, kind === 'rich' ? 'richText' : 'text'));
  control.appendChild(properties);

  const content = createWordElement(doc, 'sdtContent');
  for (const paragraph of createBlockParagraphs(doc, '')) {
    content.appendChild(paragraph);
  }
  control.appendChild(content);
  return control;
}

// ─────────────────────────────────────────────
// Section: Checkbox Controls
// ─────────────────────────────────────────────

/** Creates a Word checkbox control bound to an option token. */
export function createCheckboxControl(
  doc: Document,
  factory: ControlFactory,
  tag: string,
  label: string,
): Element {
  const control = createWordElement(doc, 'sdt');
  const properties = createWordElement(doc, 'sdtPr');
  properties.appendChild(createAliasElement(doc, label));
  properties.appendChild(createTagElement(doc, tag));
  properties.appendChild(createIdElement(doc, factory.nextId()));
  properties.appendChild(createLockElement(doc));

  const checkbox = createWord14Element(doc, 'checkbox');
  const checked = createWord14Element(doc, 'checked');
  setWord14Attribute(checked, 'val', '0');
  checkbox.appendChild(checked);

  const checkedState = createWord14Element(doc, 'checkedState');
  setWord14Attribute(checkedState, 'font', 'MS Gothic');
  setWord14Attribute(checkedState, 'val', '2612');
  checkbox.appendChild(checkedState);

  const uncheckedState = createWord14Element(doc, 'uncheckedState');
  setWord14Attribute(uncheckedState, 'font', 'MS Gothic');
  setWord14Attribute(uncheckedState, 'val', '2610');
  checkbox.appendChild(uncheckedState);

  properties.appendChild(checkbox);
  control.appendChild(properties);

  const content = createWordElement(doc, 'sdtContent');
  appendTextRun(doc, content, UNCHECKED_GLYPH);
  control.appendChild(content);
  return control;
}

/** Updates a checkbox control's checked state and visible glyph. */
export function setCheckboxState(control: Element, checked: boolean): void {
  const checkedNode = control.getElementsByTagNameNS(WORD_14_NAMESPACE, 'checked')[0];
  if (checkedNode) {
    setWord14Attribute(checkedNode, 'val', checked ? '1' : '0');
  }

  const content = control.getElementsByTagNameNS(WORD_NAMESPACE, 'sdtContent')[0];
  if (!content) {
    return;
  }

  for (const child of Array.from(content.childNodes)) {
    content.removeChild(child);
  }

  appendTextRun(control.ownerDocument, content, checked ? CHECKED_GLYPH : UNCHECKED_GLYPH);
}

// ─────────────────────────────────────────────
// Section: Tag Utilities
// ─────────────────────────────────────────────

/** Splits an option tag into its base path and option token. */
export function splitOptionTag(tag: string): { path: string; token: string } | null {
  const separatorIndex = tag.indexOf(OPTION_TAG_SEPARATOR);
  if (separatorIndex === -1) {
    return null;
  }

  return {
    path: tag.slice(0, separatorIndex),
    token: tag.slice(separatorIndex + OPTION_TAG_SEPARATOR.length),
  };
}
