/**
 * Layout constants and text-wrapping helpers shared by the PDF
 * generator's table renderer. `PDF_LAYOUT` collects every magic number
 * (margins, column widths, line heights) so layout tweaks happen in
 * one place.
 */
function splitLongWord(
  word: string,
  maxWidth: number,
  measureWidth: (text: string) => number,
): string[] {
  if (!word || measureWidth(word) <= maxWidth) {
    return [word];
  }

  const segments: string[] = [];
  let currentSegment = '';

  for (const char of word) {
    const nextSegment = currentSegment + char;
    if (currentSegment && measureWidth(nextSegment) > maxWidth) {
      segments.push(currentSegment);
      currentSegment = char;
    } else {
      currentSegment = nextSegment;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments.length > 0 ? segments : [word];
}

/** Wraps text to the available column width using the provided measurement function. */
export function wrapText(
  text: string,
  maxWidth: number,
  measureWidth: (text: string) => number,
): string[] {
  if (!text) return [''];

  const paragraphs = text.split('\n');
  const allLines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      allLines.push('');
      continue;
    }

    // why: pdf-lib has no built-in word wrap. We measure each candidate
    // substring's width with widthOfTextAtSize and break on the last
    // whitespace before the column overflows. Hyphenation is not attempted;
    // extremely long unbroken tokens overflow the cell rather than
    // breaking mid-word.
    const words = paragraph.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const segments = splitLongWord(word, maxWidth, measureWidth);

      for (let index = 0; index < segments.length; index++) {
        const segment = segments[index];

        if (!currentLine) {
          currentLine = segment;
          continue;
        }

        const separator = index === 0 ? ' ' : '';
        const testLine = currentLine + separator + segment;
        if (measureWidth(testLine) <= maxWidth) {
          currentLine = testLine;
        } else {
          allLines.push(currentLine);
          currentLine = segment;
        }
      }
    }

    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines.length > 0 ? allLines : [''];
}

/** Shared layout constants for the PDF generator and importer helpers. */
export const PDF_LAYOUT = {
  pageWidth: 612,
  pageHeight: 792,
  marginTop: 56,
  marginBottom: 56,
  marginLeft: 56,
  marginRight: 56,
  cellPadding: 4,
  fontSize: 9,
  headerFontSize: 12,
  titleFontSize: 14,
  lineHeight: 12,
  borderWidth: 1,
  tableNumberColumnWidth: 24,
} as const;

/** Width, in points, of the printable content area between the margins. */
export type ContentWidth = number;

/** Returns the printable content width between the configured margins. */
export function getContentWidth(): ContentWidth {
  return PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginLeft - PDF_LAYOUT.marginRight;
}
