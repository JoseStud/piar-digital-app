import {
  AnnotationFlags,
  PDFDocument,
  StandardFonts,
  type PDFPage,
} from 'pdf-lib';
import { PIAR_APP_STATE_FIELD_NAME } from '@piar-digital-app/features/piar/lib/pdf/pdf-payload';
import {
  PDF_MARGIN_TOP,
  PDF_PAGE_HEIGHT,
  PDF_PAGE_WIDTH,
} from './tableRenderer';
import type { DrawContext, PdfContextBundle } from './types';

/**
 * Page-by-page assembly of the full PIAR PDF.
 *
 * Sequences calls to identity, environments, assessment, and planning,
 * tracks the cursor between sections, and embeds the hidden
 * `piar_app_state` payload at the end via `pdf-payload`. The order of
 * sections matches the printed government form.
 *
 * @see ../pdf-payload.ts
 */
/** Creates a PDF document context with the base fonts and first page. */
export async function createPdfContext(): Promise<PdfContextBundle> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const firstPage = doc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);

  const ctx: DrawContext = {
    doc,
    page: firstPage,
    font,
    fontBold,
    y: PDF_PAGE_HEIGHT - PDF_MARGIN_TOP,
  };

  return { doc, ctx, firstPage };
}

/** Embeds the serialized PIAR payload in a hidden form field on the first page. */
export function embedHiddenPayloadField(doc: PDFDocument, page: PDFPage, payload: string): void {
  const form = doc.getForm();
  const textField = form.createTextField(PIAR_APP_STATE_FIELD_NAME);
  textField.enableReadOnly();
  textField.enableMultiline();
  textField.addToPage(page, {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    hidden: true,
  });
  // why: embedding happens AFTER all visible drawing so the embedded
  // payload's byte position is stable and predictable for the importer.
  // The payload uses a hidden form field rather than a metadata
  // attribute because hidden fields survive every PDF reader's "Save As"
  // flow that we have tested.
  textField.acroField.getWidgets()[0].setFlagTo(AnnotationFlags.Print, false);
  textField.setText(payload);
}
