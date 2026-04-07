import { describe, it, expect, vi } from 'vitest';
import { importPIARPdf, parsePIARData } from '@/features/piar/lib/pdf/pdf-importer';
import { generatePIARPdf } from '@/features/piar/lib/pdf/pdf-generator';
import { buildPIARPdfPayload, PIAR_APP_STATE_FIELD_NAME } from '@/features/piar/lib/pdf/pdf-payload';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';
import { PDFDocument } from 'pdf-lib';

async function createPdfWithPayloads(options: {
  hiddenField?: string;
  subject?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage();

  if (options.hiddenField !== undefined) {
    const field = doc.getForm().createTextField(PIAR_APP_STATE_FIELD_NAME);
    field.enableReadOnly();
    field.enableMultiline();
    field.setText(options.hiddenField);
    field.addToPage(page, { x: 0, y: 0, width: 1, height: 1, hidden: true });
  }

  if (options.subject !== undefined) {
    doc.setSubject(options.subject);
  }

  return doc.save({ updateFieldAppearances: false });
}

function createLegacyPayload(): Record<string, unknown> {
  return {
    fechaElaboracion: '2026-03-30',
    nombre: 'Legacy Student',
    periodos: [],
    recomendaciones: [],
  };
}

describe('importPIARPdf', () => {
  it('returns not_piar for a PDF without PIAR payload', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save();
    const result = await importPIARPdf(bytes);
    expect(result).toEqual({ ok: false, code: 'not_piar' });
  });

  it('returns corrupt_or_incomplete_data for unreadable PDF bytes', async () => {
    const result = await importPIARPdf(new Uint8Array([1, 2, 3]));
    expect(result).toEqual({ ok: false, code: 'corrupt_or_incomplete_data' });
  });

  it('extracts V2 form data from a generated PIAR PDF', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Carlos';
    data.student.apellidos = 'Mendez';
    data.student.edad = '11';

    const pdfBytes = await generatePIARPdf(data);
    const result = await importPIARPdf(pdfBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data._version).toBe(2);
    expect(result.data.student.nombres).toBe('Carlos');
    expect(result.data.student.apellidos).toBe('Mendez');
    expect(result.data.student.edad).toBe('11');
  });

  it('imports V2 data from a hidden-field-only PDF', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Hidden';
    data.student.apellidos = 'Only';

    const bytes = await createPdfWithPayloads({
      hiddenField: buildPIARPdfPayload(data),
    });
    const result = await importPIARPdf(bytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Hidden');
    expect(result.data.student.apellidos).toBe('Only');
  });

  it('returns corrupt_or_incomplete_data for invalid JSON in the hidden field', async () => {
    const bytes = await createPdfWithPayloads({
      hiddenField: 'not valid json{{{',
    });
    const result = await importPIARPdf(bytes);
    expect(result).toEqual({ ok: false, code: 'corrupt_or_incomplete_data' });
  });

  it('returns corrupt_or_incomplete_data for oversized hidden-field payloads', async () => {
    const loadSpy = vi.spyOn(PDFDocument, 'load').mockResolvedValue({
      getForm: () => ({
        getTextField: () => ({
          getText: () => JSON.stringify({ v: 2, data: { blob: 'a'.repeat(5 * 1024 * 1024) } }),
        }),
      }),
    } as unknown as PDFDocument);

    const result = await importPIARPdf(new Uint8Array([1, 2, 3]));
    expect(result).toEqual({ ok: false, code: 'corrupt_or_incomplete_data' });

    loadSpy.mockRestore();
  });

  it('returns corrupt_or_incomplete_data for semantically invalid hidden-field payloads', async () => {
    const bytes = await createPdfWithPayloads({
      hiddenField: JSON.stringify({ v: 2, data: {} }),
    });
    const result = await importPIARPdf(bytes);
    expect(result).toEqual({ ok: false, code: 'corrupt_or_incomplete_data' });
  });

  it('returns not_piar for subject-only legacy PDFs', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Legacy Subject';

    const bytes = await createPdfWithPayloads({
      subject: buildPIARPdfPayload(data),
    });
    const result = await importPIARPdf(bytes);

    expect(result).toEqual({ ok: false, code: 'not_piar' });
  });

  it('returns unsupported_version when the hidden field declares an old version', async () => {
    const bytes = await createPdfWithPayloads({
      hiddenField: JSON.stringify({ v: 1, data: createLegacyPayload() }),
    });
    const result = await importPIARPdf(bytes);

    expect(result).toEqual({ ok: false, code: 'unsupported_version' });
  });

  it('returns unsupported_version when the hidden field declares a future version', async () => {
    const data = createEmptyPIARFormDataV2();

    const bytes = await createPdfWithPayloads({
      hiddenField: JSON.stringify({ v: 99, data }),
    });
    const result = await importPIARPdf(bytes);

    expect(result).toEqual({ ok: false, code: 'unsupported_version' });
  });
});

describe('parsePIARData', () => {
  it('rejects v:1 envelopes as unsupported_version', () => {
    expect(parsePIARData({ v: 1, data: createLegacyPayload() })).toEqual({
      ok: false,
      code: 'unsupported_version',
    });
  });

  it('rejects bare V1 payloads as unsupported_version', () => {
    expect(parsePIARData(createLegacyPayload())).toEqual({
      ok: false,
      code: 'unsupported_version',
    });
  });

  it('rejects v:2 envelopes carrying legacy-shaped data', () => {
    const result = parsePIARData({ v: 2, data: createLegacyPayload() });

    expect(result).toEqual({
      ok: false,
      code: 'unsupported_version',
    });
  });

  it('rejects malformed V2 payloads', () => {
    const invalid = {
      v: 2,
      data: {
        ...createEmptyPIARFormDataV2(),
        header: null,
      },
    };

    expect(parsePIARData(invalid)).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });
});
