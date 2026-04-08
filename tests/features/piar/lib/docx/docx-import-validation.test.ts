/** Tests for DOCX import validation: rejected malformed inputs, warnings on partial data. */
import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { generatePIARDocx } from '@piar-digital-app/features/piar/lib/docx/docx-generator';
import { importPIARDocx } from '@piar-digital-app/features/piar/lib/docx/docx-importer';
import {
  buildPartialCustomXml,
  buildPartialDocumentXml,
  readZipText,
  setDocumentCheckboxState,
  setCustomXmlFieldValue,
  setDocumentControlValue,
} from './docx-test-helpers';

describe('DOCX import validation', () => {
  it('accepts legacy true/false boolean tokens during DOCX import', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.victimaConflicto = true;

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    await setCustomXmlFieldValue(zip, 'student.victimaConflicto', 'true');
    await setDocumentControlValue(zip, 'student.victimaConflicto', 'true');

    const legacyBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(legacyBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.victimaConflicto).toBe(true);
  });

  it('returns corrupt_or_incomplete_data for invalid boolean tokens in DOCX payloads', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.victimaConflicto = true;

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    await setCustomXmlFieldValue(zip, 'student.victimaConflicto', 'X');
    await setDocumentControlValue(zip, 'student.victimaConflicto', 'X');

    const invalidBytes = await zip.generateAsync({ type: 'uint8array' });
    await expect(importPIARDocx(invalidBytes)).resolves.toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('accepts partial custom XML payloads and fills missing fields with defaults', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Solo';

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.file('customXml/item1.xml', buildPartialCustomXml('student.nombres', 'Solo'));
    zip.remove('word/document.xml');

    const partialBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(partialBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Solo');
    expect(result.data.student.apellidos).toBe(''); // default
  });

  it('accepts partial content controls when custom XML is missing and fills missing fields with defaults', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Solo';

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.remove('customXml/item1.xml');
    zip.file('word/document.xml', buildPartialDocumentXml('student.nombres', 'Solo'));

    const partialBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(partialBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Solo');
    expect(result.data.student.apellidos).toBe(''); // default
  });

  it('warns and falls back to defaults when visible checkbox groups conflict and custom XML is missing', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.victimaConflicto = true;

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.remove('customXml/item1.xml');
    await setDocumentCheckboxState(zip, 'student.victimaConflicto', 'true', true);
    await setDocumentCheckboxState(zip, 'student.victimaConflicto', 'false', true);

    const conflictingBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(conflictingBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.victimaConflicto).toBeNull();
    expect(result.warnings).toEqual(expect.arrayContaining([
      { code: 'docx_checkbox_conflict', path: 'student.victimaConflicto' },
    ]));
  });

  it('warns and falls back to defaults when tipoIdentificacion checkboxes conflict and custom XML is missing', async () => {
    const original = createEmptyPIARFormDataV2();

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.remove('customXml/item1.xml');
    await setDocumentCheckboxState(zip, 'student.tipoIdentificacion', 'TI', true);
    await setDocumentCheckboxState(zip, 'student.tipoIdentificacion', 'CC', true);

    const conflictingBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(conflictingBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.tipoIdentificacion).toBe('');
    expect(result.warnings).toEqual(expect.arrayContaining([
      { code: 'docx_checkbox_conflict', path: 'student.tipoIdentificacion' },
    ]));
  });

  it('returns unsupported_version when the custom XML declares a newer version and content controls are unavailable', async () => {
    const original = createEmptyPIARFormDataV2();
    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    const customXml = await readZipText(zip, 'customXml/item1.xml');

    zip.file('customXml/item1.xml', customXml.replace('v="2"', 'v="99"'));
    zip.remove('word/document.xml');

    const invalidBytes = await zip.generateAsync({ type: 'uint8array' });
    await expect(importPIARDocx(invalidBytes)).resolves.toEqual({
      ok: false,
      code: 'unsupported_version',
    });
  });

  it('falls back to partial content controls when the custom XML declares a newer version', async () => {
    const original = createEmptyPIARFormDataV2();
    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    const customXml = await readZipText(zip, 'customXml/item1.xml');

    zip.file('customXml/item1.xml', customXml.replace('v="2"', 'v="99"'));
    zip.file('word/document.xml', buildPartialDocumentXml('student.nombres', 'Solo'));

    const partialBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(partialBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Solo');
    expect(result.data.student.apellidos).toBe(''); // default
  });

  it('merges visible content controls over custom XML on a per-field basis', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Desde XML';
    original.student.apellidos = 'Completo';

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    zip.file('word/document.xml', buildPartialDocumentXml('student.nombres', 'Desde Word'));

    const mixedBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(mixedBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Desde Word');
    expect(result.data.student.apellidos).toBe('Completo');
  });

  it('keeps customXml-only fields when the visible document source lacks them', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Visible';
    original.student.gradoAspiraIngresar = '6';

    const docxBytes = await generatePIARDocx(original);
    const result = await importPIARDocx(docxBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Visible');
    expect(result.data.student.gradoAspiraIngresar).toBe('6');
  });

  it('returns corrupt_or_incomplete_data for unreadable DOCX bytes', async () => {
    await expect(importPIARDocx(new Uint8Array([1, 2, 3]))).resolves.toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('returns corrupt_or_incomplete_data when custom XML is corrupt and no fallback source exists', async () => {
    const original = createEmptyPIARFormDataV2();
    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);

    zip.file('customXml/item1.xml', '<piar:document><broken>');
    zip.remove('word/document.xml');

    const brokenBytes = await zip.generateAsync({ type: 'uint8array' });
    await expect(importPIARDocx(brokenBytes)).resolves.toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('returns corrupt_or_incomplete_data when document XML is corrupt and custom XML is missing', async () => {
    const original = createEmptyPIARFormDataV2();
    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);

    zip.remove('customXml/item1.xml');
    zip.file('word/document.xml', '<w:document><broken>');

    const brokenBytes = await zip.generateAsync({ type: 'uint8array' });
    await expect(importPIARDocx(brokenBytes)).resolves.toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });
});
