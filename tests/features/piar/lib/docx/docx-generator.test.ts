import { afterEach, describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { readZipText } from './docx-test-helpers';

describe('DOCX generator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('generates from the bundled template without issuing runtime fetches', async () => {
    vi.resetModules();

    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock.mockImplementation(async () => {
      throw new Error('Unexpected fetch call');
    });

    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const data = createEmptyPIARFormDataV2();

    await expect(generatePIARDocx(data)).resolves.toBeInstanceOf(Uint8Array);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the official template structure instead of the legacy synthetic DOCX body', async () => {
    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const bytes = await generatePIARDocx(createEmptyPIARFormDataV2());
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await readZipText(zip, 'word/document.xml');

    expect(documentXml).toContain('PLAN INDIVIDUAL DE AJUSTES RAZONABLES');
    expect(documentXml).not.toContain('PIAR Digital — DOCX editable');
  });

  it('keeps the bundled DOCX header national and free of municipality or school identifiers', async () => {
    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const bytes = await generatePIARDocx(createEmptyPIARFormDataV2());
    const zip = await JSZip.loadAsync(bytes);
    const headerXml = await readZipText(zip, 'word/header1.xml');
    const coreXml = await readZipText(zip, 'docProps/core.xml');

    expect(headerXml).toContain('Ministerio de Educación Nacional');
    expect(headerXml).toContain('VICEMINISTERIO DE EDUCACIÓN');
    expect(headerXml).toContain('PREESCOLAR, BÁSICA Y MEDIA');
    expect(headerXml).toContain('ANEXO 2');
    expect(headerXml).not.toContain('Secretaría de Educación Distrital');
    expect(headerXml).not.toContain('AMBIENTALISTA CARTAGENA DE INDIAS');
    expect(headerXml).not.toContain('Proyecto: Ambientalistas de Avanzada');
    expect(zip.file('word/media/image1.png')).toBeNull();
    expect(coreXml).toContain('<dc:creator>Ministerio de Educación Nacional</dc:creator>');
    expect(coreXml).not.toContain('Sonia Yanira Hernandez Forero');
  });

  it('keeps document.xml well-formed when XMLSerializer includes its own declaration', async () => {
    vi.resetModules();

    const OriginalXMLSerializer = globalThis.XMLSerializer;

    class XMLSerializerWithDeclaration extends OriginalXMLSerializer {
      override serializeToString(root: Node): string {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${super.serializeToString(root)}`;
      }
    }

    vi.stubGlobal('XMLSerializer', XMLSerializerWithDeclaration);

    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const bytes = await generatePIARDocx(createEmptyPIARFormDataV2());
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await readZipText(zip, 'word/document.xml');

    expect(documentXml.match(/<\?xml\b/g)).toHaveLength(1);
    expect(() => new DOMParser().parseFromString(documentXml, 'application/xml')).not.toThrow();
    expect(new DOMParser().parseFromString(documentXml, 'application/xml').getElementsByTagName('parsererror')).toHaveLength(0);
  });
});
