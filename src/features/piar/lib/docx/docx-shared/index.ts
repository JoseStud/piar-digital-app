export {
  PIAR_DOCX_XML_NAMESPACE,
  PIAR_DOCX_STORE_ITEM_ID,
} from './constants';
export {
  buildDocxCustomXml,
  buildDocxCustomXmlItemProps,
  buildDocxCustomXmlRelationships,
} from './xml-builders';
export {
  instrumentDocxTemplateDocumentXml,
  populateDocxTemplateDocumentXml,
} from './template-document';
export {
  parseXml,
  extractFieldMapFromCustomXml,
  extractFieldMapFromDocumentXml,
} from './xml-readers';
export { loadRuntimeTemplateZip } from './template-loader';
export type { PIARDocxTemplateSource } from './template-source';
