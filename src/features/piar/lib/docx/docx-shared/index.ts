/**
 * Barrel exports for the DOCX shared utilities used by the generator,
 * importer, and template instrumenters.
 */

export {
  /** PIAR XML namespace and DOCX store id used by custom XML parts. */
  PIAR_DOCX_XML_NAMESPACE,
  PIAR_DOCX_STORE_ITEM_ID,
} from './constants';
export {
  /** XML builders for custom payloads and the visible Word document. */
  buildDocxCustomXml,
  buildDocxCustomXmlItemProps,
  buildDocxCustomXmlRelationships,
} from './xml-builders';
export {
  /** Template XML population helpers for the instrumentation pass. */
  instrumentDocxTemplateDocumentXml,
  populateDocxTemplateDocumentXml,
} from './template-document';
export {
  /** XML readers used by the DOCX importer fallback path. */
  parseXml,
  extractFieldMapFromCustomXml,
  extractFieldMapFromDocumentXml,
} from './xml-readers';
/** Loads a runtime DOCX template archive. */
export { loadRuntimeTemplateZip } from './template-loader';
/** Template source type accepted by the runtime loader. */
export type { PIARDocxTemplateSource } from './template-source';
