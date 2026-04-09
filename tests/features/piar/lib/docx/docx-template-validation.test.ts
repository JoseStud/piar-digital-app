/** Tests for the template validator that runs at template-load time. */
import { expect, it } from 'vitest';
import JSZip from 'jszip';
import { instrumentDocxTemplateDocumentXml } from '@piar-digital-app/features/piar/lib/docx/docx-instrumenters';
import { normalizeDocxTemplateStructure } from '@piar-digital-app/features/piar/lib/docx/docx-instrumenters/template-normalizer';
import { parseTemplateDocument } from '@piar-digital-app/features/piar/lib/docx/docx-shared/template-xml';
import { describeWithDocxTemplate, getTestDocxTemplateBytes } from './docx-template-fixture';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

async function readConfiguredTemplateDocumentXml(): Promise<string> {
  const zip = await JSZip.loadAsync(getTestDocxTemplateBytes());
  const file = zip.file('word/document.xml');
  if (!file) {
    throw new Error('Missing configured DOCX template document.xml');
  }

  return file.async('string');
}

function removeNthTable(xml: string, tableIndex: number): string {
  const tables = Array.from(xml.matchAll(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g));
  const table = tables[tableIndex];
  if (!table) {
    throw new Error(`Missing table ${tableIndex}`);
  }

  return xml.slice(0, table.index) + xml.slice(table.index + table[0].length);
}

function removeLastRowFromNthTable(xml: string, tableIndex: number): string {
  const tables = Array.from(xml.matchAll(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g));
  const table = tables[tableIndex];
  if (!table) {
    throw new Error(`Missing table ${tableIndex}`);
  }

  const tableXml = table[0];
  const rows = Array.from(tableXml.matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g));
  const row = rows.at(-1);
  if (!row) {
    throw new Error(`Missing row in table ${tableIndex}`);
  }

  const mutatedTable = tableXml.slice(0, row.index) + tableXml.slice(row.index + row[0].length);
  return xml.slice(0, table.index) + mutatedTable + xml.slice(table.index + tableXml.length);
}

function removeLastCellFromNthTableRow(xml: string, tableIndex: number, rowIndex: number): string {
  const tables = Array.from(xml.matchAll(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g));
  const table = tables[tableIndex];
  if (!table) {
    throw new Error(`Missing table ${tableIndex}`);
  }

  const tableXml = table[0];
  const rows = Array.from(tableXml.matchAll(/<w:tr[\s>][\s\S]*?<\/w:tr>/g));
  const row = rows[rowIndex];
  if (!row) {
    throw new Error(`Missing row ${rowIndex} in table ${tableIndex}`);
  }

  const rowXml = row[0];
  const cells = Array.from(rowXml.matchAll(/<w:tc[\s>][\s\S]*?<\/w:tc>/g));
  const cell = cells.at(-1);
  if (!cell) {
    throw new Error(`Missing cell in table ${tableIndex} row ${rowIndex}`);
  }

  const mutatedRow = rowXml.slice(0, cell.index) + rowXml.slice(cell.index + cell[0].length);
  const mutatedTable = tableXml.slice(0, row.index) + mutatedRow + tableXml.slice(row.index + rowXml.length);
  return xml.slice(0, table.index) + mutatedTable + xml.slice(table.index + tableXml.length);
}

function replaceFirstInNthTable(
  xml: string,
  tableIndex: number,
  search: string,
  replacement: string,
): string {
  const tables = Array.from(xml.matchAll(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g));
  const table = tables[tableIndex];
  if (!table) {
    throw new Error(`Missing table ${tableIndex}`);
  }

  const mutatedTable = table[0].replace(search, replacement);
  if (mutatedTable === table[0]) {
    throw new Error(`Missing "${search}" in table ${tableIndex}`);
  }

  return xml.slice(0, table.index) + mutatedTable + xml.slice(table.index + table[0].length);
}

function directChildren(parent: Element, localName: string): Element[] {
  return Array.from(parent.childNodes).filter(
    (node): node is Element => node.nodeType === Node.ELEMENT_NODE
      && (node as Element).namespaceURI === W
      && (node as Element).localName === localName,
  );
}

describeWithDocxTemplate('DOCX template structure validation', () => {
  it('rejects templates with an unexpected table count', async () => {
    const xml = await readConfiguredTemplateDocumentXml();
    const mutated = removeNthTable(xml, 21);

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'Unexpected DOCX template table count: expected 22, found 21.',
    );
  });

  it('rejects templates when a required table loses a row', async () => {
    const xml = await readConfiguredTemplateDocumentXml();
    const mutated = removeLastRowFromNthTable(xml, 7);

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'DOCX template table 7 (Competencias y Dispositivos) has 99 rows, expected 100 or 102.',
    );
  });

  it('only inserts competency parity rows for the known 100-row legacy shape', async () => {
    const xml = await readConfiguredTemplateDocumentXml();
    const doc = parseTemplateDocument(xml);
    const body = doc.getElementsByTagNameNS(W, 'body')[0];
    if (!body) {
      throw new Error('Missing DOCX template body.');
    }

    const table = Array.from(body.getElementsByTagNameNS(W, 'tbl'))[7];
    if (!table) {
      throw new Error('Missing competency table.');
    }

    const rows = directChildren(table, 'tr');
    if (rows.length === 100) {
      table.appendChild(rows[38].cloneNode(true));
    } else if (rows.length === 102) {
      table.removeChild(rows.at(-1)!);
    } else {
      throw new Error(`Unexpected starting competency row count: ${rows.length}`);
    }

    expect(directChildren(table, 'tr')).toHaveLength(101);

    normalizeDocxTemplateStructure(body);

    expect(directChildren(table, 'tr')).toHaveLength(101);
  });

  it('rejects templates when the acta mirror table anchor text changes', async () => {
    const xml = await readConfiguredTemplateDocumentXml();
    const mutated = replaceFirstInNthTable(xml, 17, 'ACTA  DE ACUERDO', 'ACTA REORDENADA');

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'DOCX template table 17 (Acta de Acuerdo - encabezado) is missing expected text "ACTA DE ACUERDO".',
    );
  });

  it('rejects templates when the acta summary mirror table cell layout changes', async () => {
    const xml = await readConfiguredTemplateDocumentXml();
    const mutated = removeLastCellFromNthTableRow(xml, 18, 0);

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'DOCX template table 18 (Resumen) row 0 has 5 cells, expected 6.',
    );
  });

  it('instruments visible content controls for the newly reconciled template fields', async () => {
    const xml = await readConfiguredTemplateDocumentXml();
    const instrumented = instrumentDocxTemplateDocumentXml(xml);

    const expectedTags = [
      'header.jornada',
      'student.gradoAspiraIngresar',
      'student.victimaConflictoRegistro',
      'student.centroProteccionLugar',
      'student.grupoEtnicoCual',
      'competenciasDispositivos.competenciasLectoras311.cl311_17::option::true',
      'competenciasDispositivos.competenciasLectoras311.cl311_17::option::false',
      'competenciasDispositivos.competenciasLectoras311.cl311_18::option::true',
      'competenciasDispositivos.competenciasLectoras311.cl311_18::option::false',
      'entornoSalud.eps',
      'entornoSalud.sectorSaludFrecuencia',
      'entornoSalud.tratamientoMedicoCual',
      'entornoHogar.estaBajoProteccion::option::true',
      'entornoHogar.estaBajoProteccion::option::false',
      'entornoHogar.subsidioEntidad',
      'entornoHogar.subsidioCual',
      'entornoEducativo.noVinculacionMotivo',
      'entornoEducativo.medioTransporte',
      'entornoEducativo.distanciaTiempo',
      'acta.equipoDirectivosDocentes',
      'acta.familiaParticipante',
      'acta.parentescoFamiliaParticipante',
    ] as const;

    for (const tag of expectedTags) {
      expect(instrumented).toContain(`w:tag w:val="${tag}"`);
    }
  });
});
