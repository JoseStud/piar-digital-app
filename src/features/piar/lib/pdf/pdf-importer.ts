import { PDFDocument } from 'pdf-lib';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { PIAR_APP_STATE_FIELD_NAME } from '@piar-digital-app/features/piar/lib/pdf/pdf-payload';
import {
  buildImportFailure,
  parsePIARData,
  type PIARImportResult,
} from '@piar-digital-app/features/piar/lib/portable/piar-import';

export { parsePIARData } from '@piar-digital-app/features/piar/lib/portable/piar-import';

const MAX_HIDDEN_FIELD_PAYLOAD_LENGTH = 5 * 1024 * 1024;

function getHiddenFieldPayload(doc: PDFDocument): { found: boolean; payload: string } {
  try {
    return {
      found: true,
      payload: doc.getForm().getTextField(PIAR_APP_STATE_FIELD_NAME).getText() ?? '',
    };
  } catch {
    return { found: false, payload: '' };
  }
}

export async function importPIARPdf(
  pdfBytes: Uint8Array,
): Promise<PIARImportResult> {
  try {
    const doc = await PDFDocument.load(pdfBytes);
    const hiddenField = getHiddenFieldPayload(doc);

    if (!hiddenField.found) {
      return buildImportFailure('not_piar');
    }

    if (hiddenField.payload.trim() === '') {
      return buildImportFailure('corrupt_or_incomplete_data');
    }

    if (hiddenField.payload.length > MAX_HIDDEN_FIELD_PAYLOAD_LENGTH) {
      return buildImportFailure('corrupt_or_incomplete_data');
    }

    try {
      return parsePIARData(JSON.parse(hiddenField.payload));
    } catch {
      return buildImportFailure('corrupt_or_incomplete_data');
    }
  } catch {
    return buildImportFailure('corrupt_or_incomplete_data');
  }
}
