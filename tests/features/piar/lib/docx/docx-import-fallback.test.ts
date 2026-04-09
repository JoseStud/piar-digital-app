/** Tests for the DOCX importer fallback path that reconstructs data from visible content controls when custom XML is missing. */
import { expect, it } from 'vitest';
import JSZip from 'jszip';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { generatePIARDocx } from '@piar-digital-app/features/piar/lib/docx/docx-generator';
import { importPIARDocx } from '@piar-digital-app/features/piar/lib/docx/docx-importer';
import {
  readZipText,
  setDocumentControlValue,
} from './docx-test-helpers';
import { describeWithDocxTemplate, getTestDocxTemplateSource } from './docx-template-fixture';

const generateTestDocx = (data: ReturnType<typeof createEmptyPIARFormDataV2>) =>
  generatePIARDocx(data, { templateSource: getTestDocxTemplateSource() });

describeWithDocxTemplate('DOCX import fallbacks', () => {
  it('falls back to content controls when the custom XML part is missing', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Fallback';
    original.student.apellidos = 'Control';

    const docxBytes = await generateTestDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.remove('customXml/item1.xml');

    const fallbackBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(fallbackBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Fallback');
    expect(result.data.student.apellidos).toBe('Control');
  }, 10000);

  it('reconstructs the formerly hidden parity fields from visible controls', async () => {
    const original = createEmptyPIARFormDataV2();
    original.header.jornada = 'mañana';
    original.competenciasDispositivos.competenciasLectoras311.cl311_17 = true;
    original.competenciasDispositivos.competenciasLectoras311.cl311_18 = false;

    const docxBytes = await generateTestDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.remove('customXml/item1.xml');

    const fallbackBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(fallbackBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.header.jornada).toBe('mañana');
    expect(result.data.competenciasDispositivos.competenciasLectoras311.cl311_17).toBe(true);
    expect(result.data.competenciasDispositivos.competenciasLectoras311.cl311_18).toBe(false);
  }, 10000);

  it('falls back to content controls when the custom XML part is corrupt', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Corrupto';

    const docxBytes = await generateTestDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.file('customXml/item1.xml', '<piar:document><broken>');

    const fallbackBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(fallbackBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Corrupto');
  }, 10000);

  it('falls back to content controls when the custom XML part declares an unsupported version', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Desde XML';

    const docxBytes = await generateTestDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    const customXml = await readZipText(zip, 'customXml/item1.xml');
    zip.file('customXml/item1.xml', customXml.replace('v="2"', 'v="99"'));
    await setDocumentControlValue(zip, 'student.nombres', 'Desde Word');

    const fallbackBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(fallbackBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Desde Word');
  }, 10000);
});
