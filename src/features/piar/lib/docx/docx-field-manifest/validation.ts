/**
 * Sanity-checks imported DOCX field values before reconstruction.
 */

import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { DOCX_CHECKBOX_CONFLICT_TOKEN } from '@piar-digital-app/features/piar/lib/docx/docx-shared/constants';
import { DOCX_FIELD_DEFINITIONS } from './definitions';
import { setDeepValue } from './helpers';
import { deserializeDocxFieldValue } from './codec';
import type { ValidatedDocxFieldMap } from './types';

/** Validates an imported DOCX field map and records any anomalies. */
export function validateDocxFieldMap(rawFieldValues: ReadonlyMap<string, string>): ValidatedDocxFieldMap {
  const data = createEmptyPIARFormDataV2();
  const invalidPaths: string[] = [];
  const checkboxConflictPaths: string[] = [];
  const missingPaths: string[] = [];
  const presentPaths: string[] = [];
  let recognizedFieldCount = 0;

  for (const definition of DOCX_FIELD_DEFINITIONS) {
    const rawValue = rawFieldValues.get(definition.path);
    if (rawValue === undefined) {
      missingPaths.push(definition.path);
      continue;
    }

    recognizedFieldCount += 1;
    if (rawValue === DOCX_CHECKBOX_CONFLICT_TOKEN) {
      checkboxConflictPaths.push(definition.path);
      continue;
    }

    const parsedValue = deserializeDocxFieldValue(definition, rawValue, {
      invalidBooleanPolicy: 'reject',
      invalidAllowedValuePolicy: 'reject',
    });
    if (!parsedValue.ok) {
      invalidPaths.push(definition.path);
      continue;
    }

    setDeepValue(data, definition.segments, parsedValue.value);
    presentPaths.push(definition.path);
  }

  // Return data even when fields are missing - missing fields use defaults.
  // Only reject when values are invalid (unparseable/corrupt).
  return {
    data: invalidPaths.length === 0 ? data : null,
    invalidPaths,
    checkboxConflictPaths,
    missingPaths,
    presentPaths,
    recognizedFieldCount,
  };
}
