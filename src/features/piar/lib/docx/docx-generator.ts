import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import type { PIARDocxTemplateSource } from '@piar-digital-app/features/piar/lib/docx/docx-shared';
import {
  buildDocxCustomXml,
  buildDocxCustomXmlItemProps,
  buildDocxCustomXmlRelationships,
  loadRuntimeTemplateZip,
  populateDocxTemplateDocumentXml,
} from '@piar-digital-app/features/piar/lib/docx/docx-shared';

export interface PIARDocxGenerationOptions {
  templateSource?: PIARDocxTemplateSource;
}

export async function generatePIARDocx(
  data: PIARFormDataV2,
  options?: PIARDocxGenerationOptions,
): Promise<Uint8Array> {
  const zip = await loadRuntimeTemplateZip(options?.templateSource);
  const templateDocument = await zip.file('word/document.xml')?.async('string');
  if (!templateDocument) {
    throw new Error('Missing runtime DOCX template document.xml');
  }

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
