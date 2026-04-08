/**
 * Barrel for the DOCX field manifest module.
 *
 * The manifest maps PIAR form paths to Word control metadata for both
 * DOCX generation and DOCX import fallback reconstruction.
 */

/** Field-manifest type exports used by the DOCX generator/importer. */
export type {
  DocxControlKind,
  DocxFieldDefinition,
  ValidatedDocxFieldMap,
} from './types';
/** Manifest definitions and cached lookup structures. */
export {
  DOCX_FIELD_DEFINITIONS,
  DOCX_FIELD_DEFINITION_MAP,
  DOCX_FIELD_DEFINITIONS_BY_SECTION,
  DOCX_SUPPORTED_INTENSITIES,
} from './definitions';
/** Serializes PIAR form data into DOCX field values. */
export { buildDocxFieldValueMap } from './serialization';
/** Validates Word field values before reconstruction. */
export { validateDocxFieldMap } from './validation';
/** Rebuilds PIAR data from a DOCX field map. */
export { buildPIARDataFromFieldMap } from './reconstruction';
