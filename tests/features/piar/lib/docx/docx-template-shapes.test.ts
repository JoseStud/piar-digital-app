/** Tests asserting the bundled template's structural shape matches what the instrumenters expect. */
import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { getBundledDocxTemplateBytes } from '@piar-digital-app/features/piar/lib/docx/docx-shared/template-bytes';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function textOf(el: Element): string {
  const ts = el.getElementsByTagNameNS(W, 't');
  let s = '';
  for (let i = 0; i < ts.length; i++) {
    s += ts[i].textContent ?? '';
  }
  return s.trim();
}

function directChildren(parent: Element, localName: string): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < parent.childNodes.length; i++) {
    const c = parent.childNodes[i] as Element;
    if (c && c.nodeType === 1 && c.namespaceURI === W && c.localName === localName) {
      out.push(c);
    }
  }
  return out;
}

describe('DOCX template mirror table shapes', () => {
  it('keeps the acta mirror tables aligned with the populated cell targets', async () => {
    const zip = await JSZip.loadAsync(getBundledDocxTemplateBytes());
    const xml = await zip.file('word/document.xml')!.async('string');
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const body = doc.getElementsByTagNameNS(W, 'body')[0];
    const tables = Array.from(body.getElementsByTagNameNS(W, 'tbl'));

    const actaHeaderRows = directChildren(tables[17], 'tr');
    expect(actaHeaderRows.map((row) => directChildren(row, 'tc').length)).toEqual([
      1,
      2,
      2,
      2,
      2,
    ]);
    expect(textOf(directChildren(actaHeaderRows[0], 'tc')[0]).replace(/\s+/g, ' ')).toBe('ACTA DE ACUERDO');
    expect(textOf(directChildren(actaHeaderRows[1], 'tc')[0])).toBe('Fecha y Lugar de Diligenciamiento');
    expect(textOf(directChildren(actaHeaderRows[3], 'tc')[0])).toBe('Institución Educativa');

    const summaryRows = directChildren(tables[18], 'tr');
    expect(summaryRows.map((row) => directChildren(row, 'tc').length)).toEqual([6]);
    expect(textOf(directChildren(summaryRows[0], 'tc')[0])).toBe('Nombre');
    expect(textOf(directChildren(summaryRows[0], 'tc')[2])).toBe('Edad');
    expect(textOf(directChildren(summaryRows[0], 'tc')[4])).toBe('Grado');
  });
});
