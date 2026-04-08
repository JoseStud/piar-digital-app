/**
 * Parses DOCX template XML into a DOM and serializes it back with the
 * XML declaration Word expects.
 */

// ─────────────────────────────────────────────
// Section: XML Parsing
// ─────────────────────────────────────────────

/** Parses DOCX template XML into an XML DOM. */
export function parseTemplateDocument(xml: string): Document {
  const normalizedXml = xml.replace(/^\uFEFF/, '').trimStart();
  const doc = new DOMParser().parseFromString(normalizedXml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0 || !doc.documentElement) {
    throw new Error('Invalid DOCX template XML');
  }

  return doc;
}

// ─────────────────────────────────────────────
// Section: XML Serialization
// ─────────────────────────────────────────────

/** Serializes a parsed template document back to Word-compatible XML. */
export function serializeTemplateDocument(doc: Document): string {
  const serializedRoot = new XMLSerializer()
    .serializeToString(doc.documentElement)
    .replace(/^\uFEFF/, '')
    .replace(/^<\?xml[\s\S]*?\?>\s*/i, '');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${serializedRoot}`;
}
