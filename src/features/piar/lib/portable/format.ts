/** Portable export formats supported by the PIAR download flow. */
export type PIARPortableFormat = 'pdf' | 'docx';

/** Detects the supported portable format from a file's MIME type or extension. */
export function detectPIARPortableFormat(file: File): PIARPortableFormat | null {
  const lowerName = file.name.toLowerCase();

  if (
    file.type === 'application/pdf'
    || (!file.type && lowerName.endsWith('.pdf'))
    || lowerName.endsWith('.pdf')
  ) {
    return 'pdf';
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || (!file.type && lowerName.endsWith('.docx'))
    || lowerName.endsWith('.docx')
  ) {
    return 'docx';
  }

  return null;
}
