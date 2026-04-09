/**
 * Section-scoped DOCX template instrumentation modules.
 *
 * Each instrumenter takes the parsed template XML and a slice of
 * `PIARFormDataV2`, then fills the matching structured controls inside
 * the visible Word document.
 */

import { WORD_NAMESPACE } from '../docx-shared/constants';
import { createControlFactory } from '../docx-shared/control-builders';
import { parseTemplateDocument, serializeTemplateDocument } from '../docx-shared/template-xml';
import { instrumentAssessment, instrumentCompetencies } from './assessment';
import { instrumentEducation, instrumentHealth, instrumentHome } from './environments';
import { instrumentHeader, instrumentStudent } from './identity';
import { instrumentActa, instrumentAjustes, instrumentFirmas, instrumentNarrativesAndPlanning } from './planning';
import { validateDocxTemplateStructure } from './template-validator';
import { normalizeDocxTemplateStructure } from './template-normalizer';
import { getOrThrow } from './shared';

// ─────────────────────────────────────────────
// Section: Section Instrumenter Re-exports
// ─────────────────────────────────────────────

/** Re-exported section instrumenters used by the orchestrator. */
export {
  instrumentAssessment,
  instrumentCompetencies,
  instrumentEducation,
  instrumentHealth,
  instrumentHome,
  instrumentHeader,
  instrumentStudent,
  instrumentActa,
  instrumentAjustes,
  instrumentFirmas,
  instrumentNarrativesAndPlanning,
};

// ─────────────────────────────────────────────
// Section: Template Instrumentation Orchestrator
// ─────────────────────────────────────────────

/** Instruments the configured DOCX template XML with PIAR form data. */
export function instrumentDocxTemplateDocumentXml(templateXml: string): string {
  validateDocxTemplateStructure(templateXml);
  const doc = parseTemplateDocument(templateXml);
  const body = getOrThrow(doc.getElementsByTagNameNS(WORD_NAMESPACE, 'body')[0], 'Missing template body');
  normalizeDocxTemplateStructure(body);
  const factory = createControlFactory();

  const steps = [
    ['header', () => instrumentHeader(body, doc, factory)],
    ['student', () => instrumentStudent(body, doc, factory)],
    ['health', () => instrumentHealth(body, doc, factory)],
    ['home', () => instrumentHome(body, doc, factory)],
    ['education', () => instrumentEducation(body, doc, factory)],
    ['assessment', () => instrumentAssessment(body, doc, factory)],
    ['competencies', () => instrumentCompetencies(body, doc, factory)],
    ['narratives', () => instrumentNarrativesAndPlanning(body, doc, factory)],
    ['ajustes', () => instrumentAjustes(body, doc, factory)],
    ['firmas', () => instrumentFirmas(body, doc, factory)],
    ['acta', () => instrumentActa(body, doc, factory)],
  ] as const;

  for (const [name, run] of steps) {
    try {
      run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to instrument ${name}: ${message}`);
    }
  }

  return serializeTemplateDocument(doc);
}
