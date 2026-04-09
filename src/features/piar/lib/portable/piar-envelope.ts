import { PIAR_DATA_VERSION, type PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

export interface PIARDataEnvelope {
  v: typeof PIAR_DATA_VERSION;
  data: PIARFormDataV2;
}

export function buildPIARDataEnvelope(data: PIARFormDataV2): PIARDataEnvelope {
  return { v: PIAR_DATA_VERSION, data };
}
