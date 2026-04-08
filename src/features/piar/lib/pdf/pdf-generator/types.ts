/** Internal type definitions used by the PDF generator modules (page state, layout context, table cell shapes). */
import type { PDFDocument, PDFFont, PDFPage } from 'pdf-lib';

/** Carries the mutable drawing state for the current PDF page. */
export interface DrawContext {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
}

/** Represents a row that has already been wrapped into display lines. */
export interface PreparedRow {
  cells: string[][];
  isHeader: boolean;
  maxLines: number;
}

/** Describes a table block that can be rendered by the shared table helper. */
export interface TableDefinition {
  bodyRows: string[][];
  colWidths: number[];
  gapBefore?: number;
  headerRow?: string[];
  repeatHeaderOnPageBreak?: boolean;
}

/** Bundles the PDF document, current drawing context, and first page reference. */
export interface PdfContextBundle {
  doc: PDFDocument;
  ctx: DrawContext;
  firstPage: PDFPage;
}
