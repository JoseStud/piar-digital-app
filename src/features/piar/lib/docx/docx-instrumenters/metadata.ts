/**
 * Writes hidden DOCX controls for PIAR fields that do not have a clean
 * visible slot in the template, preserving round-trip fallback data.
 */

import { WORD_NAMESPACE } from '../docx-shared/constants';
import type { ControlFactory } from '../docx-shared/control-builders';
import { createParagraph } from '../docx-shared/xml-primitives';
import { getOrThrow, createCheckboxControl, createInlineTextControl, OPTION_TAG_SEPARATOR } from './shared';

// ─────────────────────────────────────────────
// Section: Hidden Metadata Instrumentation
// ─────────────────────────────────────────────

/** Adds the hidden fallback controls to the end of the template body. */
export function instrumentHiddenMetadata(body: Element, doc: Document, factory: ControlFactory): void {
  const sectionProperties = getOrThrow(
    Array.from(body.childNodes).find(
      (node): node is Element => node.nodeType === Node.ELEMENT_NODE
        && (node as Element).namespaceURI === WORD_NAMESPACE
        && (node as Element).localName === 'sectPr',
    ),
    'Missing section properties',
  );

  // A few current schema fields do not have a clean 1:1 slot in the official
  // template. Keep them in hidden controls so DOCX visible-source fallback
  // still round-trips if the custom XML payload is removed.
  const hiddenNodes = [
    createParagraph(doc, [createInlineTextControl(doc, factory, 'header.jornada', 'Jornada')], { hidden: true }),
    createParagraph(doc, [
      'cl311_17 ',
      createCheckboxControl(doc, factory, `competenciasDispositivos.competenciasLectoras311.cl311_17${OPTION_TAG_SEPARATOR}true`, 'Competencia lectora 3-11 17 · Sí'),
      ' ',
      createCheckboxControl(doc, factory, `competenciasDispositivos.competenciasLectoras311.cl311_17${OPTION_TAG_SEPARATOR}false`, 'Competencia lectora 3-11 17 · No'),
    ], { hidden: true }),
    createParagraph(doc, [
      'cl311_18 ',
      createCheckboxControl(doc, factory, `competenciasDispositivos.competenciasLectoras311.cl311_18${OPTION_TAG_SEPARATOR}true`, 'Competencia lectora 3-11 18 · Sí'),
      ' ',
      createCheckboxControl(doc, factory, `competenciasDispositivos.competenciasLectoras311.cl311_18${OPTION_TAG_SEPARATOR}false`, 'Competencia lectora 3-11 18 · No'),
    ], { hidden: true }),
  ];

  for (const node of hiddenNodes) {
    body.insertBefore(node, sectionProperties);
  }
}
