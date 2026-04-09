/**
 * Reverse pass that rebuilds PIAR form data from a DOCX field map.
 */

import {
  createEmptyPIARFormDataV2,
  type PIARFormDataV2,
} from '@piar-digital-app/features/piar/model/piar';
import { DOCX_FIELD_DEFINITIONS } from './definitions';
import { setDeepValue } from './helpers';
import { deserializeDocxFieldValue } from './codec';

/** Reconstructs PIAR form data from the imported DOCX field values. */
export function buildPIARDataFromFieldMap(rawFieldValues: ReadonlyMap<string, string>): PIARFormDataV2 {
  const data = createEmptyPIARFormDataV2();

  for (const definition of DOCX_FIELD_DEFINITIONS) {
    const rawValue = rawFieldValues.get(definition.path);
    if (rawValue === undefined) {
      continue;
    }

    const parsedValue = deserializeDocxFieldValue(definition, rawValue, {
      invalidBooleanPolicy: 'null',
      invalidAllowedValuePolicy: 'as-is',
    });
    if (!parsedValue.ok) {
      continue;
    }

    setDeepValue(data, definition.segments, parsedValue.value);
  }

  return data;
}
