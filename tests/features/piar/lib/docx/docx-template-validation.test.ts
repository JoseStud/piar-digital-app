/** Tests for the template validator that runs at template-load time. */
import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { getBundledDocxTemplateBytes } from '@piar-digital-app/features/piar/lib/docx/docx-shared/template-bytes';
import { instrumentDocxTemplateDocumentXml } from '@piar-digital-app/features/piar/lib/docx/docx-instrumenters';

async function readBundledTemplateDocumentXml(): Promise<string> {
  const zip = await JSZip.loadAsync(getBundledDocxTemplateBytes());
  const file = zip.file('word/document.xml');
  if (!file) {
    throw new Error('Missing bundled DOCX template document.xml');
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

describe('DOCX template structure validation', () => {
  it('rejects templates with an unexpected table count', async () => {
    const xml = await readBundledTemplateDocumentXml();
    const mutated = removeNthTable(xml, 21);

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'Unexpected DOCX template table count: expected 22, found 21.',
    );
  });

  it('rejects templates when a required table loses a row', async () => {
    const xml = await readBundledTemplateDocumentXml();
    const mutated = removeLastRowFromNthTable(xml, 7);

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'DOCX template table 7 (Competencias y Dispositivos) has 99 rows, expected 100.',
    );
  });

  it('rejects templates when the acta mirror table anchor text changes', async () => {
    const xml = await readBundledTemplateDocumentXml();
    const mutated = replaceFirstInNthTable(xml, 17, 'ACTA  DE ACUERDO', 'ACTA REORDENADA');

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'DOCX template table 17 (Acta de Acuerdo - encabezado) is missing expected text "ACTA DE ACUERDO".',
    );
  });

  it('rejects templates when the acta summary mirror table cell layout changes', async () => {
    const xml = await readBundledTemplateDocumentXml();
    const mutated = removeLastCellFromNthTableRow(xml, 18, 0);

    expect(() => instrumentDocxTemplateDocumentXml(mutated)).toThrow(
      'DOCX template table 18 (Resumen) row 0 has 5 cells, expected 6.',
    );
  });

  it('instruments visible content controls for the newly reconciled template fields', async () => {
    const xml = await readBundledTemplateDocumentXml();
    const instrumented = instrumentDocxTemplateDocumentXml(xml);

    const expectedTags = [
      'student.gradoAspiraIngresar',
      'student.victimaConflictoRegistro',
      'student.centroProteccionLugar',
      'student.grupoEtnicoCual',
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
