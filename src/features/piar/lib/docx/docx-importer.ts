/**
 * Extracts PIAR form data from a generated DOCX.
 *
 * Two paths: (1) read the custom XML part if present (preferred - exact
 * round-trip), (2) fall back to reconstructing data from the visible
 * Word content controls if the custom XML is missing or unparseable
 * (lossy - only what's in structured fields round-trips). Always
 * returns a fully-populated `PIARFormDataV2` on success through
 * `parsePIARData`.
 *
 * @see ./docx-field-manifest/index.ts - drives the fallback reconstruction
 * @see ../portable/piar-import.ts
 */

import JSZip from 'jszip';
import { PIAR_DATA_VERSION, type PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import {
  DOCX_FIELD_DEFINITIONS,
  validateDocxFieldMap,
} from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest';
import { getDeepValue, setDeepValue } from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest/helpers';
import {
  extractFieldMapFromCustomXml,
  extractFieldMapFromDocumentXml,
  parseXml,
} from '@piar-digital-app/features/piar/lib/docx/docx-shared';
import {
  buildImportFailure,
  parsePIARData,
  type PIARImportWarning,
  type PIARImportResult,
  type PIARImportSuccess,
} from '@piar-digital-app/features/piar/lib/portable/piar-import';

type DocxSourceResult =
  | { status: 'not_piar' }
  | { status: 'unsupported_version' }
  | { status: 'corrupt' }
  | {
    status: 'valid';
    source: 'customXml' | 'document';
    data: PIARFormDataV2;
    warnings: PIARImportWarning[];
    presentPaths: Set<string>;
    recognizedFieldCount: number;
  };

async function readZipText(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path);
  if (!file) {
    return null;
  }

  return file.async('string');
}

function appendImportWarnings(
  result: PIARImportSuccess,
  warnings: readonly PIARImportWarning[],
): PIARImportSuccess {
  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    warnings: [...result.warnings, ...warnings],
  };
}

function normalizeImportData(
  data: PIARFormDataV2,
  warnings: readonly PIARImportWarning[] = [],
): PIARImportSuccess | null {
  const result = parsePIARData({ v: PIAR_DATA_VERSION, data });
  return result.ok ? appendImportWarnings(result, warnings) : null;
}

function buildCheckboxConflictWarnings(paths: readonly string[]): PIARImportWarning[] {
  return paths.map((path) => ({
    code: 'docx_checkbox_conflict',
    path,
  }));
}

function dedupeImportWarnings(warnings: readonly PIARImportWarning[]): PIARImportWarning[] {
  const seen = new Set<string>();
  const deduped: PIARImportWarning[] = [];

  for (const warning of warnings) {
    const key = `${warning.code}:${warning.path}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(warning);
  }

  return deduped;
}

function analyzeFieldMap(
  fieldValues: ReadonlyMap<string, string>,
  recognisableSourceFound: boolean,
  source: 'customXml' | 'document',
): DocxSourceResult {
  const validation = validateDocxFieldMap(fieldValues);
  if (validation.recognizedFieldCount === 0) {
    return recognisableSourceFound ? { status: 'corrupt' } : { status: 'not_piar' };
  }

  if (!validation.data) {
    return { status: 'corrupt' };
  }

  const data = normalizeImportData(
    validation.data,
    buildCheckboxConflictWarnings(validation.checkboxConflictPaths),
  );
  if (!data) {
    return { status: 'corrupt' };
  }

  return {
    status: 'valid',
    source,
    data: data.data,
    warnings: data.warnings,
    presentPaths: new Set(validation.presentPaths),
    recognizedFieldCount: validation.recognizedFieldCount,
  };
}

function analyzeCustomXmlSource(customXml: string | null): DocxSourceResult {
  if (!customXml) {
    return { status: 'not_piar' };
  }

  if (!parseXml(customXml)?.documentElement) {
    return { status: 'corrupt' };
  }

  const parsedCustomXml = extractFieldMapFromCustomXml(customXml);
  if (!parsedCustomXml) {
    return { status: 'not_piar' };
  }

  if (parsedCustomXml.version !== PIAR_DATA_VERSION) {
    if (parsedCustomXml.version !== null) {
      return { status: 'unsupported_version' };
    }

    return { status: 'corrupt' };
  }

  return analyzeFieldMap(parsedCustomXml.fields, true, 'customXml');
}

function analyzeDocumentSource(documentXml: string | null): DocxSourceResult {
  if (!documentXml) {
    return { status: 'not_piar' };
  }

  if (!parseXml(documentXml)?.documentElement) {
    return { status: 'corrupt' };
  }

  return analyzeFieldMap(extractFieldMapFromDocumentXml(documentXml), false, 'document');
}

function buildImportSuccess(
  data: PIARFormDataV2,
  warnings: readonly PIARImportWarning[] = [],
): PIARImportSuccess | null {
  return normalizeImportData(data, dedupeImportWarnings(warnings));
}

function mergeDocxSourceData(
  customXmlResult: Extract<DocxSourceResult, { status: 'valid' }>,
  documentResult: Extract<DocxSourceResult, { status: 'valid' }>,
): PIARImportSuccess | null {
  const mergedData = JSON.parse(JSON.stringify(customXmlResult.data)) as PIARFormDataV2;

  for (const definition of DOCX_FIELD_DEFINITIONS) {
    if (!documentResult.presentPaths.has(definition.path)) {
      continue;
    }

    setDeepValue(
      mergedData,
      definition.segments,
      getDeepValue(documentResult.data, definition.segments),
    );
  }

  return buildImportSuccess(
    mergedData,
    [...customXmlResult.warnings, ...documentResult.warnings],
  );
}

function resolveDocxImportResult(
  customXmlResult: DocxSourceResult,
  documentResult: DocxSourceResult,
): PIARImportResult {
  // why: the custom XML payload is the lossless source of truth, so it
  // wins whenever it is present and valid; visible controls are only a
  // fallback for documents that lost the embedded payload.
  if (customXmlResult.status === 'valid' && documentResult.status === 'valid') {
    const merged = mergeDocxSourceData(customXmlResult, documentResult);
    if (merged) {
      return merged;
    }
    return buildImportFailure('corrupt_or_incomplete_data');
  }

  if (customXmlResult.status === 'valid') {
    return buildImportSuccess(customXmlResult.data, customXmlResult.warnings)
      ?? buildImportFailure('corrupt_or_incomplete_data');
  }

  if (documentResult.status === 'valid') {
    return buildImportSuccess(documentResult.data, documentResult.warnings)
      ?? buildImportFailure('corrupt_or_incomplete_data');
  }

  // An unsupported custom XML version should not block recovery from valid
  // visible content controls, but it remains the terminal failure when no
  // valid fallback source exists.
  if (customXmlResult.status === 'unsupported_version') {
    return buildImportFailure('unsupported_version');
  }

  if (customXmlResult.status === 'corrupt' || documentResult.status === 'corrupt') {
    return buildImportFailure('corrupt_or_incomplete_data');
  }

  return buildImportFailure('not_piar');
}

export async function importPIARDocx(docxBytes: Uint8Array): Promise<PIARImportResult> {
  try {
    const zip = await JSZip.loadAsync(docxBytes);
    const customXml = await readZipText(zip, 'customXml/item1.xml');
    const customXmlResult = analyzeCustomXmlSource(customXml);

    const documentXml = await readZipText(zip, 'word/document.xml');
    const documentResult = analyzeDocumentSource(documentXml);
    return resolveDocxImportResult(customXmlResult, documentResult);
  } catch {
    return buildImportFailure('corrupt_or_incomplete_data');
  }
}
