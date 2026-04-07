import {
  AnnotationFlags,
  PDFDocument,
  StandardFonts,
  type PDFPage,
} from 'pdf-lib';
import { PIAR_APP_STATE_FIELD_NAME } from '@/features/piar/lib/pdf/pdf-payload';
import {
  PDF_MARGIN_TOP,
  PDF_PAGE_HEIGHT,
  PDF_PAGE_WIDTH,
} from './tableRenderer';
import type { DrawContext, PdfContextBundle } from './types';

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
  textField.acroField.getWidgets()[0].setFlagTo(AnnotationFlags.Print, false);
  textField.setText(payload);
}
