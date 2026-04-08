import { PIAR_DATA_VERSION, type PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

/**
 * Constants and helpers for embedding and extracting the hidden
 * `piar_app_state` field used by both the generator and importer.
 */
export const PIAR_APP_STATE_FIELD_NAME = 'piar_app_state';

/** Serializes a V2 PIAR form into the hidden PDF payload envelope. */
export function buildPIARPdfPayload(data: PIARFormDataV2): string {
  return JSON.stringify({ v: PIAR_DATA_VERSION, data });
}
