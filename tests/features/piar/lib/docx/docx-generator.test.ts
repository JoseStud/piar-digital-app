/** Tests for the DOCX generator: external template requirements, URL loading, ZIP integrity. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { readZipText } from './docx-test-helpers';
import {
  describeWithDocxTemplate,
  getTestDocxTemplateBytes,
  getTestDocxTemplateSource,
} from './docx-template-fixture';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function directChildren(parent: Element, localName: string): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < parent.childNodes.length; i += 1) {
    const child = parent.childNodes[i] as Element;
    if (child?.nodeType === Node.ELEMENT_NODE && child.namespaceURI === W && child.localName === localName) {
      out.push(child);
    }
  }

  return out;
}

describe('DOCX generator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('requires a configured template source before generating DOCX', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock.mockImplementation(async () => {
      throw new Error('Unexpected fetch call');
    });

    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const data = createEmptyPIARFormDataV2();

    await expect(generatePIARDocx(data)).rejects.toThrow(/No DOCX template source configured/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects cross-origin trusted template URLs before fetching', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock.mockImplementation(async () => {
      throw new Error('Unexpected fetch call');
    });

    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const data = createEmptyPIARFormDataV2();

    await expect(generatePIARDocx(data, {
      templateSource: {
        kind: 'url',
        url: 'https://example.gov.co/institution-template.docx',
        sourceName: 'Ministerio de Educación Nacional',
      },
    })).rejects.toThrow(/same-origin/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describeWithDocxTemplate('DOCX generator with configured template', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('generates from a same-origin trusted template URL and caches the fetched template', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock.mockResolvedValue(new Response(toArrayBuffer(getTestDocxTemplateBytes())));

    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const data = createEmptyPIARFormDataV2();
    const templateSource = {
      kind: 'url',
      url: '/institution-template.docx',
      sourceName: 'Ministerio de Educación Nacional',
    } as const;

    await expect(generatePIARDocx(data, { templateSource })).resolves.toBeInstanceOf(Uint8Array);
    await expect(generatePIARDocx(data, { templateSource })).resolves.toBeInstanceOf(Uint8Array);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/institution-template.docx', {
      credentials: 'same-origin',
    });
  });

  it('generates from a trusted byte payload without issuing runtime fetches', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    fetchMock.mockImplementation(async () => {
      throw new Error('Unexpected fetch call');
    });

    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const data = createEmptyPIARFormDataV2();

    await expect(generatePIARDocx(data, {
      templateSource: getTestDocxTemplateSource(),
    })).resolves.toBeInstanceOf(Uint8Array);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the official template structure instead of the legacy synthetic DOCX body', async () => {
    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const bytes = await generatePIARDocx(createEmptyPIARFormDataV2(), {
      templateSource: getTestDocxTemplateSource(),
    });
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await readZipText(zip, 'word/document.xml');

    expect(documentXml).toContain('PLAN INDIVIDUAL DE AJUSTES RAZONABLES');
    expect(documentXml).not.toContain('PIAR Digital — DOCX editable');
  });

  it('preserves live sede and jornada controls in the acta header copy', async () => {
    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const data = createEmptyPIARFormDataV2();
    data.header.sede = 'Principal';
    data.header.jornada = 'mañana';

    const bytes = await generatePIARDocx(data, {
      templateSource: getTestDocxTemplateSource(),
    });
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await readZipText(zip, 'word/document.xml');
    const doc = new DOMParser().parseFromString(documentXml, 'application/xml');
    const body = doc.getElementsByTagNameNS(W, 'body')[0];
    const tables = Array.from(body.getElementsByTagNameNS(W, 'tbl'));
    const actaHeaderCell = directChildren(directChildren(tables[17], 'tr')[4], 'tc')[1];
    const controlTags = Array.from(actaHeaderCell.getElementsByTagNameNS(W, 'tag'))
      .map((tag) => tag.getAttributeNS(W, 'val') ?? '');

    expect(controlTags).toEqual(['header.sede', 'header.jornada']);
    expect(documentXml.match(/w:tag w:val="header\.sede"/g)).toHaveLength(2);
    expect(documentXml.match(/w:tag w:val="header\.jornada"/g)).toHaveLength(2);
    expect(actaHeaderCell.textContent).toContain('Principal');
    expect(actaHeaderCell.textContent).toContain('mañana');
  });

  it('keeps the configured DOCX header national and free of municipality or school identifiers', async () => {
    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const bytes = await generatePIARDocx(createEmptyPIARFormDataV2(), {
      templateSource: getTestDocxTemplateSource(),
    });
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
    const OriginalXMLSerializer = globalThis.XMLSerializer;

    class XMLSerializerWithDeclaration extends OriginalXMLSerializer {
      override serializeToString(root: Node): string {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${super.serializeToString(root)}`;
      }
    }

    vi.stubGlobal('XMLSerializer', XMLSerializerWithDeclaration);

    const { generatePIARDocx } = await import('@piar-digital-app/features/piar/lib/docx/docx-generator');
    const bytes = await generatePIARDocx(createEmptyPIARFormDataV2(), {
      templateSource: getTestDocxTemplateSource(),
    });
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await readZipText(zip, 'word/document.xml');

    expect(documentXml.match(/<\?xml\b/g)).toHaveLength(1);
    expect(() => new DOMParser().parseFromString(documentXml, 'application/xml')).not.toThrow();
    expect(new DOMParser().parseFromString(documentXml, 'application/xml').getElementsByTagName('parsererror')).toHaveLength(0);
  });
});
