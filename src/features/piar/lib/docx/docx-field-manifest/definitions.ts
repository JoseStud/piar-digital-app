/**
 * Builds the DOCX field manifest from the PIAR schema and DOCX-specific
 * presentation metadata.
 *
 * The manifest is the shared lookup table used by the DOCX instrumenters
 * and importer fallback path.
 */

import { PIAR_SCHEMA_FIELD_DEFINITIONS } from '@piar-digital-app/features/piar/model/piar-schema';
import { createDefinition } from './helpers';
import { resolveDocxFieldKind, resolveDocxFieldLabel } from './presentation-metadata';
import { resolveDocxFieldSection } from './section-metadata';
import type { DocxFieldDefinition } from './types';

function buildDocxFieldDefinitions(): DocxFieldDefinition[] {
  return PIAR_SCHEMA_FIELD_DEFINITIONS.map((definition) =>
    createDefinition(
      definition.path,
      resolveDocxFieldSection(definition.path),
      resolveDocxFieldLabel(definition),
      definition.valueType,
      resolveDocxFieldKind(definition.path),
      definition.allowedValues,
    ));
}

const DOCX_FIELD_DEFINITIONS = buildDocxFieldDefinitions();

/** Fast lookup from field path to manifest definition. */
export const DOCX_FIELD_DEFINITION_MAP = new Map(
  DOCX_FIELD_DEFINITIONS.map((definition) => [definition.path, definition]),
);
/** Manifest definitions grouped by section name for the instrumenters. */
export const DOCX_FIELD_DEFINITIONS_BY_SECTION = DOCX_FIELD_DEFINITIONS.reduce<Map<string, DocxFieldDefinition[]>>((sections, definition) => {
  const entries = sections.get(definition.section);
  if (entries) {
    entries.push(definition);
  } else {
    sections.set(definition.section, [definition]);
  }
  return sections;
}, new Map());

/** Flat list of every DOCX field definition. */
export { DOCX_FIELD_DEFINITIONS };
