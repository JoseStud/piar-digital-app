import JSZip from 'jszip';
import { getBundledDocxTemplateBytes } from './template-bytes';
import { instrumentDocxTemplateDocumentXml } from './template-document';

let runtimeTemplateBytes: Uint8Array | null = null;

async function loadRuntimeTemplateBytes(): Promise<Uint8Array> {
  if (!runtimeTemplateBytes) {
    const sourceZip = await JSZip.loadAsync(getBundledDocxTemplateBytes());
    const templateDocument = await sourceZip.file('word/document.xml')?.async('string');
    if (!templateDocument) {
      throw new Error('Missing bundled DOCX template document.xml');
    }

    sourceZip.file('word/document.xml', instrumentDocxTemplateDocumentXml(templateDocument));
    runtimeTemplateBytes = await sourceZip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
  }

  return runtimeTemplateBytes.slice();
}

export async function loadRuntimeTemplateZip(): Promise<JSZip> {
  const templateBytes = await loadRuntimeTemplateBytes();

  try {
    return await JSZip.loadAsync(templateBytes);
  } catch (error) {
    runtimeTemplateBytes = null;
    throw error;
  }
}
