/** Tests asserting the configured template's structural shape matches what the instrumenters expect. */
import { expect, it } from 'vitest';
import JSZip from 'jszip';
import { instrumentDocxTemplateDocumentXml } from '@piar-digital-app/features/piar/lib/docx/docx-instrumenters';
import { describeWithDocxTemplate, getTestDocxTemplateBytes } from './docx-template-fixture';

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

describeWithDocxTemplate('DOCX template mirror table shapes', () => {
  it('normalizes the template into the reconciled visible layout without breaking the acta mirrors', async () => {
    const zip = await JSZip.loadAsync(getTestDocxTemplateBytes());
    const xml = await zip.file('word/document.xml')!.async('string');
    const doc = new DOMParser().parseFromString(instrumentDocxTemplateDocumentXml(xml), 'application/xml');
    const body = doc.getElementsByTagNameNS(W, 'body')[0];
    const tables = Array.from(body.getElementsByTagNameNS(W, 'tbl'));

    const headerRows = directChildren(tables[0], 'tr');
    expect(headerRows).toHaveLength(5);
    expect(textOf(directChildren(headerRows[4], 'tc')[0]).replace(/\s+/g, ' ')).toBe('Sede y Jornada');

    const competencyRows = directChildren(tables[7], 'tr');
    expect(competencyRows).toHaveLength(103);
    expect(textOf(directChildren(competencyRows[39], 'tc')[0])).toContain('Evalúa la credibilidad de fuentes escritas');
    expect(textOf(directChildren(competencyRows[40], 'tc')[0])).toContain('Produce textos argumentativos con evidencia');

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
    expect(textOf(directChildren(actaHeaderRows[4], 'tc')[0])).toBe('Sede y Jornada');

    const summaryRows = directChildren(tables[18], 'tr');
    expect(summaryRows.map((row) => directChildren(row, 'tc').length)).toEqual([6]);
    expect(textOf(directChildren(summaryRows[0], 'tc')[0])).toBe('Nombre');
    expect(textOf(directChildren(summaryRows[0], 'tc')[2])).toBe('Edad');
    expect(textOf(directChildren(summaryRows[0], 'tc')[4])).toBe('Grado');
  });
});
