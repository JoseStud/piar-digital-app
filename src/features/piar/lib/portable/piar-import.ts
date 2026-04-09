/**
 * Shared envelope validator used by every PIAR importer (PDF, DOCX, localStorage).
 *
 * Valid V2 envelopes are normalized through the default form shape and returned
 * with a warnings array; future-version envelopes are rejected with
 * `unsupported_version`. This is the sole normalizer in the pipeline — every
 * value that reaches React state or the PDF/DOCX generators has already been
 * through it (or was built directly by `createEmptyPIARFormDataV2`).
 *
 * @see ../pdf/pdf-importer.ts
 * @see ../docx/docx-importer.ts
 * @see ../persistence/progress-store.ts
 */
import {
  createEmptyPIARFormDataV2,
  PIAR_DATA_VERSION,
  type PIARFormDataV2,
} from '@piar-digital-app/features/piar/model/piar';
import {
  PIAR_SCHEMA_TREE,
  PIAR_TOP_LEVEL_SECTION_KEYS,
  type PIARSchemaLeafNode,
  type PIARSchemaNode,
} from '@piar-digital-app/features/piar/model/piar-schema';

/** Error code returned when an imported PIAR payload cannot be accepted. */
export type PIARImportErrorCode =
  | 'not_piar'
  | 'unsupported_version'
  | 'corrupt_or_incomplete_data';

/** Warning code emitted when imported data is repaired or normalized. */
export type PIARImportWarningCode =
  | 'missing_section'
  | 'missing_field'
  | 'missing_item'
  | 'docx_checkbox_conflict'
  | 'invalid_type'
  | 'invalid_value'
  | 'unknown_key'
  | 'extra_item';

/** One normalization warning tied to a concrete path in the PIAR payload. */
export interface PIARImportWarning {
  code: PIARImportWarningCode;
  path: string;
}

/** Successful parse result containing normalized data and any repair warnings. */
export interface PIARImportSuccess {
  ok: true;
  data: PIARFormDataV2;
  warnings: PIARImportWarning[];
}

interface PIARImportFailure {
  ok: false;
  code: PIARImportErrorCode;
}

/** Discriminated union for the PIAR import pipeline result. */
export type PIARImportResult = PIARImportSuccess | PIARImportFailure;

/** Builds a typed failure result for import rejection paths. */
export function buildImportFailure(code: PIARImportErrorCode): PIARImportFailure {
  return { ok: false, code };
}

interface FatalValidationIssue {
  path: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && !Array.isArray(value);
}

function looksLikeLegacyPayload(value: unknown): boolean {
  return isRecord(value)
    && Array.isArray(value.periodos)
    && Array.isArray(value.recomendaciones);
}

class WarningCollector {
  private readonly seen = new Set<string>();

  private readonly warnings: PIARImportWarning[] = [];

  add(code: PIARImportWarningCode, path: string): void {
    const key = `${code}:${path}`;
    if (this.seen.has(key)) {
      return;
    }

    this.seen.add(key);
    this.warnings.push({ code, path });
  }

  toArray(): PIARImportWarning[] {
    return [...this.warnings];
  }
}

function normalizeLeafValue(
  input: unknown,
  schema: PIARSchemaLeafNode,
  fallback: unknown,
  path: string,
  warnings: WarningCollector,
): unknown {
  if (input === undefined) {
    if (schema.required) {
      warnings.add('missing_field', path);
    }
    return fallback;
  }

  switch (schema.valueType) {
    case 'string':
      if (typeof input === 'string') {
        return input;
      }
      warnings.add('invalid_type', path);
      return fallback;
    case 'boolean':
      if (typeof input === 'boolean' || input === null) {
        return input;
      }
      warnings.add('invalid_type', path);
      return fallback;
    case 'nullableString':
      if (input === null) {
        return null;
      }
      if (typeof input !== 'string') {
        warnings.add('invalid_type', path);
        return fallback;
      }
      if (schema.allowedValues && !schema.allowedValues.has(input)) {
        warnings.add('invalid_value', path);
        return fallback;
      }
      return input;
    case 'version':
      if (input === PIAR_DATA_VERSION) {
        return PIAR_DATA_VERSION;
      }
      warnings.add(typeof input === 'number' ? 'invalid_value' : 'invalid_type', path);
      return PIAR_DATA_VERSION;
    default:
      return fallback;
  }
}

function normalizeNode(
  input: unknown,
  schema: PIARSchemaNode,
  fallback: unknown,
  path: string,
  warnings: WarningCollector,
  missingCode: Extract<PIARImportWarningCode, 'missing_section' | 'missing_field' | 'missing_item'> = 'missing_field',
): unknown {
  if (schema.kind === 'leaf') {
    return normalizeLeafValue(input, schema, fallback, path, warnings);
  }

  if (input === undefined) {
    warnings.add(missingCode, path);
    return fallback;
  }

  if (schema.containerType === 'array') {
    if (!Array.isArray(input)) {
      warnings.add('invalid_type', path);
      return fallback;
    }

    const normalizedArray = fallback as unknown[];
    for (let index = 0; index < input.length; index += 1) {
      if (!schema.children.has(String(index))) {
        warnings.add('extra_item', `${path}.${index}`);
      }
    }

    const expectedIndexes = Array.from(schema.children.keys())
      .map((key) => Number(key))
      .sort((left, right) => left - right);

    for (const index of expectedIndexes) {
      const childSchema = schema.children.get(String(index));
      if (!childSchema) {
        continue;
      }

      normalizedArray[index] = normalizeNode(
        input[index],
        childSchema,
        normalizedArray[index],
        `${path}.${index}`,
        warnings,
        'missing_item',
      );
    }

    return normalizedArray;
  }

  if (!isPlainObject(input)) {
    warnings.add('invalid_type', path);
    return fallback;
  }

  const normalizedObject = fallback as Record<string, unknown>;
  for (const key of Object.keys(input)) {
    if (!schema.children.has(key)) {
      warnings.add('unknown_key', path ? `${path}.${key}` : key);
    }
  }

  for (const [childKey, childSchema] of Array.from(schema.children.entries())) {
    normalizedObject[childKey] = normalizeNode(
      input[childKey],
      childSchema,
      normalizedObject[childKey],
      path ? `${path}.${childKey}` : childKey,
      warnings,
    );
  }

  return normalizedObject;
}

function normalizePIARPayload(payload: Record<string, unknown>): PIARImportSuccess {
  const data = createEmptyPIARFormDataV2();
  const warnings = new WarningCollector();
  const normalizedRoot = data as unknown as Record<string, unknown>;

  for (const key of Object.keys(payload)) {
    if (!PIAR_SCHEMA_TREE.children.has(key)) {
      warnings.add('unknown_key', key);
    }
  }

  for (const [childKey, childSchema] of Array.from(PIAR_SCHEMA_TREE.children.entries())) {
    normalizedRoot[childKey] = normalizeNode(
      payload[childKey],
      childSchema,
      normalizedRoot[childKey],
      childKey,
      warnings,
      PIAR_TOP_LEVEL_SECTION_KEYS.has(childKey as keyof Omit<PIARFormDataV2, '_version'>)
        ? 'missing_section'
        : 'missing_field',
    );
  }

  return {
    ok: true,
    data,
    warnings: warnings.toArray(),
  };
}

function collectFatalValidationIssues(
  input: unknown,
  schema: PIARSchemaNode,
  path: string,
  issues: FatalValidationIssue[],
): void {
  if (schema.kind === 'leaf') {
    if (input === undefined) {
      return;
    }

    switch (schema.valueType) {
      case 'string':
        if (typeof input !== 'string') {
          issues.push({ path });
        }
        return;
      case 'boolean':
        if (typeof input !== 'boolean' && input !== null) {
          issues.push({ path });
        }
        return;
      case 'nullableString':
        if (input !== null && typeof input !== 'string') {
          issues.push({ path });
          return;
        }
        if (
          typeof input === 'string'
          && schema.allowedValues
          && !schema.allowedValues.has(input)
        ) {
          issues.push({ path });
        }
        return;
      case 'version':
        if (input !== undefined && input !== PIAR_DATA_VERSION) {
          issues.push({ path });
        }
        return;
      default:
        return;
    }
  }

  if (input === undefined) {
    issues.push({ path });
    return;
  }

  if (schema.containerType === 'array') {
    if (!Array.isArray(input)) {
      issues.push({ path });
      return;
    }

    const expectedIndexes = Array.from(schema.children.keys())
      .map((key) => Number(key))
      .sort((left, right) => left - right);

    for (const index of expectedIndexes) {
      const childSchema = schema.children.get(String(index));
      if (!childSchema) {
        continue;
      }

      collectFatalValidationIssues(
        input[index],
        childSchema,
        `${path}.${index}`,
        issues,
      );
    }

    return;
  }

  if (!isPlainObject(input)) {
    issues.push({ path });
    return;
  }

  for (const [childKey, childSchema] of Array.from(schema.children.entries())) {
    collectFatalValidationIssues(
      input[childKey],
      childSchema,
      path ? `${path}.${childKey}` : childKey,
      issues,
    );
  }
}

/** Parses a raw PIAR envelope into normalized form data or a typed failure. */
export function parsePIARData(raw: unknown): PIARImportResult {
  if (!isRecord(raw)) {
    return buildImportFailure('corrupt_or_incomplete_data');
  }

  if (!('v' in raw) && !('data' in raw)) {
    if (looksLikeLegacyPayload(raw)) {
      return buildImportFailure('unsupported_version');
    }

    return buildImportFailure('corrupt_or_incomplete_data');
  }

  if (!('v' in raw) || !('data' in raw)) {
    return buildImportFailure('corrupt_or_incomplete_data');
  }

  if (typeof raw.v !== 'number' || !Number.isInteger(raw.v)) {
    return buildImportFailure('corrupt_or_incomplete_data');
  }

  if (raw.v !== PIAR_DATA_VERSION) {
    return buildImportFailure('unsupported_version');
  }

  const payload = raw.data;
  if (!isRecord(payload)) {
    return buildImportFailure('corrupt_or_incomplete_data');
  }

  if (looksLikeLegacyPayload(payload)) {
    return buildImportFailure('unsupported_version');
  }

  const fatalIssues: FatalValidationIssue[] = [];
  collectFatalValidationIssues(payload, PIAR_SCHEMA_TREE, '', fatalIssues);
  if (fatalIssues.length > 0) {
    return buildImportFailure('corrupt_or_incomplete_data');
  }

  return normalizePIARPayload(payload);
}
