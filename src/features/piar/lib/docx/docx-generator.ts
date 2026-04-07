import type { PIARFormDataV2 } from '@/features/piar/model/piar';
import {
  buildDocxCustomXml,
  buildDocxCustomXmlItemProps,
  buildDocxCustomXmlRelationships,
  loadRuntimeTemplateZip,
  populateDocxTemplateDocumentXml,
} from '@/features/piar/lib/docx/docx-shared';

export async function generatePIARDocx(data: PIARFormDataV2): Promise<Uint8Array> {
  const zip = await loadRuntimeTemplateZip();
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
