/**
 * XML namespace strings, control ids, and other DOCX constants shared
 * by the generator, importer, and template instrumentation code.
 */

/** PIAR XML namespace used inside the custom XML payload. */
export const PIAR_DOCX_XML_NAMESPACE = 'urn:piar-digital:v2';
/** Stable custom XML store item id referenced by the DOCX package. */
export const PIAR_DOCX_STORE_ITEM_ID = '{6E576A11-6E55-4639-9187-5D9F53D35B16}';
/** Token used when a checkbox group resolves to conflicting states. */
export const DOCX_CHECKBOX_CONFLICT_TOKEN = '__docx_checkbox_conflict__';

/** WordprocessingML namespace used for the visible template controls. */
export const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
/** Word 2010 namespace used for checkbox control state metadata. */
export const WORD_14_NAMESPACE = 'http://schemas.microsoft.com/office/word/2010/wordml';
/** Prefix mapping string embedded into custom XML data bindings. */
export const XML_PREFIX_MAPPINGS = "xmlns:piar='urn:piar-digital:v2'";
