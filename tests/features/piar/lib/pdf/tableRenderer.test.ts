/** Tests for the PDF table renderer: row height calculation, page break handling, header repetition. */
import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  drawTable,
  PDF_MARGIN_TOP,
  PDF_PAGE_HEIGHT,
} from '@piar-digital-app/features/piar/lib/pdf/pdf-generator/tableRenderer';
import type { DrawContext } from '@piar-digital-app/features/piar/lib/pdf/pdf-generator/types';

describe('drawTable', () => {
  it('throws a diagnostic error when a repeated header consumes an entire page', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const ctx: DrawContext = {
      doc,
      page,
      font,
      fontBold,
      y: PDF_PAGE_HEIGHT - PDF_MARGIN_TOP,
    };

    const headerText = Array.from({ length: 56 }, (_, index) => `Línea ${index + 1}`).join('\n');

    expect(() => {
      drawTable(ctx, {
        headerRow: [headerText],
        bodyRows: [['Fila de prueba']],
        colWidths: [500],
        repeatHeaderOnPageBreak: true,
      });
    }).toThrow('Header callback consumed entire page — check table configuration.');
  });
});
