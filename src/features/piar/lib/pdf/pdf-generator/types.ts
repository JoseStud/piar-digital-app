import type { PDFDocument, PDFFont, PDFPage } from 'pdf-lib';

export interface DrawContext {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
}

export interface PreparedRow {
  cells: string[][];
  isHeader: boolean;
  maxLines: number;
}

export interface TableDefinition {
  bodyRows: string[][];
  colWidths: number[];
  gapBefore?: number;
  headerRow?: string[];
  repeatHeaderOnPageBreak?: boolean;
}

export interface PdfContextBundle {
  doc: PDFDocument;
  ctx: DrawContext;
  firstPage: PDFPage;
}
