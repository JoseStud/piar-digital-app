import { PIAR_DATA_VERSION, type PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

export const PIAR_APP_STATE_FIELD_NAME = 'piar_app_state';

export function buildPIARPdfPayload(data: PIARFormDataV2): string {
  return JSON.stringify({ v: PIAR_DATA_VERSION, data });
}
