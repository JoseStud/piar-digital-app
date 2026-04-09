/**
 * Generates a PIAR DOCX file by instrumenting a trusted template
 * source and embedding the form data as custom XML.
 *
 * Strategy: load the template ZIP, walk it with `jszip`, drop the
 * source PIAR data into a `<piar:document v="2">` custom XML part, and
 * use the `docx-instrumenters` modules to inject visible content into
 * the structured Word controls so the document looks filled-out when
 * opened in Word. Re-importing through `docx-importer` reads the
 * custom XML first, falling back to control values if the XML is
 * missing. The public app does not ship a proprietary template; the
 * caller must provide a same-origin URL or trusted byte payload.
 *
 * @see ./docx-instrumenters/index.ts
 * @see ./docx-shared/template-loader.ts
 * @see ./docx-importer.ts
 */

import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';
import {
  buildDocxCustomXml,
  buildDocxCustomXmlItemProps,
  buildDocxCustomXmlRelationships,
  loadRuntimeTemplateZip,
  populateDocxTemplateDocumentXml,
} from '@piar-digital-app/features/piar/lib/docx/docx-shared';

/** Options for selecting the runtime DOCX template source. */
export interface PIARDocxGenerationOptions {
  templateSource?: PIARDocxTemplateSource;
}

/** Builds a DOCX archive containing the visible form and custom XML. */
export async function generatePIARDocx(
  data: PIARFormDataV2,
  options?: PIARDocxGenerationOptions,
): Promise<Uint8Array> {
  const zip = await loadRuntimeTemplateZip(options?.templateSource);
  const templateDocument = await zip.file('word/document.xml')?.async('string');
  if (!templateDocument) {
    throw new Error('Missing runtime DOCX template document.xml');
  }

  // why: the custom XML root is XML, not a JSON envelope; the `v`
  // attribute carries the schema version that the importer uses as the
  // lossless source of truth.
  zip.file('word/document.xml', populateDocxTemplateDocumentXml(templateDocument, data));
  zip.file('customXml/item1.xml', buildDocxCustomXml(data));
  zip.file('customXml/itemProps1.xml', buildDocxCustomXmlItemProps());
  zip.file('customXml/_rels/item1.xml.rels', buildDocxCustomXmlRelationships());

  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
