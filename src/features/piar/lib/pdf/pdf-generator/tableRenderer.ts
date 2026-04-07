import { rgb, type PDFFont } from 'pdf-lib';
import { wrapText, PDF_LAYOUT } from '@piar-digital-app/features/piar/lib/pdf/pdf-table-helpers';
import type { DrawContext, PreparedRow, TableDefinition } from './types';

export const PDF_PAGE_WIDTH = PDF_LAYOUT.pageWidth;
export const PDF_PAGE_HEIGHT = PDF_LAYOUT.pageHeight;
export const PDF_MARGIN_TOP = PDF_LAYOUT.marginTop;

const {
  marginBottom,
  marginLeft,
  cellPadding,
  fontSize,
  lineHeight,
  borderWidth,
} = PDF_LAYOUT;

export function newPage(ctx: DrawContext): void {
  ctx.page = ctx.doc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
  ctx.y = PDF_PAGE_HEIGHT - PDF_MARGIN_TOP;
}

export function ensureSpace(ctx: DrawContext, needed: number): void {
  if (ctx.y - needed < marginBottom) {
    newPage(ctx);
  }
}

export function drawCenteredText(ctx: DrawContext, text: string, size: number, font?: PDFFont): void {
  const activeFont = font ?? ctx.font;
  const textWidth = activeFont.widthOfTextAtSize(text, size);
  const x = (PDF_PAGE_WIDTH - textWidth) / 2;
  ctx.page.drawText(text, { x, y: ctx.y, size, font: activeFont, color: rgb(0, 0, 0) });
  ctx.y -= size + 4;
}

function measureWidth(font: PDFFont, text: string, size: number): number {
  return font.widthOfTextAtSize(text, size);
}

function getAvailableLineCount(ctx: DrawContext): number {
  const availableHeight = ctx.y - marginBottom - cellPadding * 2;
  if (availableHeight < lineHeight) {
    return 0;
  }
  return Math.max(1, Math.floor(availableHeight / lineHeight));
}

function assertAvailableLineCountAfterPageBreak(ctx: DrawContext): void {
  if (getAvailableLineCount(ctx) === 0) {
    throw new Error('Header callback consumed entire page — check table configuration.');
  }
}

function prepareRow(
  ctx: DrawContext,
  cells: string[],
  colWidths: number[],
  isHeader: boolean,
): PreparedRow {
  const rowFont = isHeader ? ctx.fontBold : ctx.font;
  const wrappedCells = cells.map((cell, index) => {
    const cellWidth = colWidths[index] - cellPadding * 2;
    return wrapText(cell, cellWidth, (text) => measureWidth(rowFont, text, fontSize));
  });

  return {
    cells: wrappedCells,
    isHeader,
    maxLines: Math.max(...wrappedCells.map((cell) => cell.length), 1),
  };
}

function drawRowSegment(
  ctx: DrawContext,
  row: PreparedRow,
  colWidths: number[],
  startLineIndex: number,
  lineCount: number,
): void {
  const rowFont = row.isHeader ? ctx.fontBold : ctx.font;
  const rowHeight = lineCount * lineHeight + cellPadding * 2;

  let x = marginLeft;
  row.cells.forEach((cellLines, index) => {
    const width = colWidths[index];

    ctx.page.drawRectangle({
      x,
      y: ctx.y - rowHeight,
      width,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth,
      color: row.isHeader ? rgb(0.95, 0.95, 0.95) : undefined,
    });

    for (let lineOffset = 0; lineOffset < lineCount; lineOffset++) {
      const text = cellLines[startLineIndex + lineOffset];
      if (!text) {
        continue;
      }

      const textY = ctx.y - cellPadding - (lineOffset + 1) * lineHeight + 2;
      ctx.page.drawText(text, {
        x: x + cellPadding,
        y: textY,
        size: fontSize,
        font: rowFont,
        color: rgb(0, 0, 0),
      });
    }

    x += width;
  });

  ctx.y -= rowHeight;
}

function drawPreparedRow(
  ctx: DrawContext,
  row: PreparedRow,
  colWidths: number[],
  onPageBreak?: () => void,
): void {
  let lineIndex = 0;

  while (lineIndex < row.maxLines) {
    let availableLineCount = getAvailableLineCount(ctx);
    if (availableLineCount === 0) {
      newPage(ctx);
      onPageBreak?.();
      assertAvailableLineCountAfterPageBreak(ctx);
      availableLineCount = getAvailableLineCount(ctx);
    }

    const segmentLineCount = Math.min(row.maxLines - lineIndex, availableLineCount);
    drawRowSegment(ctx, row, colWidths, lineIndex, segmentLineCount);
    lineIndex += segmentLineCount;

    if (lineIndex < row.maxLines) {
      newPage(ctx);
      onPageBreak?.();
      assertAvailableLineCountAfterPageBreak(ctx);
    }
  }
}

export function drawTable(ctx: DrawContext, table: TableDefinition): void {
  if (table.gapBefore) {
    ctx.y -= table.gapBefore;
  }

  const preparedHeader = table.headerRow
    ? prepareRow(ctx, table.headerRow, table.colWidths, true)
    : null;

  const drawRepeatedHeader = () => {
    if (preparedHeader) {
      drawPreparedRow(ctx, preparedHeader, table.colWidths);
    }
  };

  if (preparedHeader) {
    drawPreparedRow(ctx, preparedHeader, table.colWidths);
  }

  for (const row of table.bodyRows) {
    const preparedRow = prepareRow(ctx, row, table.colWidths, false);
    drawPreparedRow(
      ctx,
      preparedRow,
      table.colWidths,
      table.repeatHeaderOnPageBreak ? drawRepeatedHeader : undefined,
    );
  }
}
