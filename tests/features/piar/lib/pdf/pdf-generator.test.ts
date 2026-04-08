/** Tests for the PIAR PDF generator: section assembly, hidden field embedding, page-break behavior. */
import { describe, it, expect } from 'vitest';
import { generatePIARPdf } from '@piar-digital-app/features/piar/lib/pdf/pdf-generator';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { buildPIARPdfPayload, PIAR_APP_STATE_FIELD_NAME } from '@piar-digital-app/features/piar/lib/pdf/pdf-payload';
import { AnnotationFlags, decodePDFRawStream, PDFDocument, PDFRawStream } from 'pdf-lib';

interface PDFContentArrayLike {
  size: () => number;
  get: (index: number) => unknown;
}

function hexEncode(text: string): string {
  return Buffer.from(text, 'latin1').toString('hex').toUpperCase();
}

function readDecodedPageContent(doc: PDFDocument): string {
  return doc.getPages().map((page) => {
    const contents = page.node.Contents();
    const refs = contents && typeof (contents as PDFContentArrayLike).size === 'function'
      ? Array.from({ length: (contents as PDFContentArrayLike).size() }, (_, index) => (contents as PDFContentArrayLike).get(index))
      : contents ? [contents] : [];

    return refs.map((ref) => {
      const stream = doc.context.lookup(ref as never) as PDFRawStream;
      return Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1').toUpperCase();
    }).join('\n');
  }).join('\n');
}

describe('generatePIARPdf', () => {
  it('produces a valid PDF Uint8Array', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test Student';

    const pdfBytes = await generatePIARPdf(data);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('embeds form data in the hidden field only', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'María';
    data.student.apellidos = 'García';
    data.student.edad = '10';

    const pdfBytes = await generatePIARPdf(data);
    const doc = await PDFDocument.load(pdfBytes);
    const form = doc.getForm();
    const textField = form.getTextField(PIAR_APP_STATE_FIELD_NAME);
    const widget = textField.acroField.getWidgets()[0];
    const payload = buildPIARPdfPayload(data);

    expect(textField.getText()).toBe(payload);
    expect(textField.isReadOnly()).toBe(true);
    expect(textField.isMultiline()).toBe(true);
    expect(widget.hasFlag(AnnotationFlags.Hidden)).toBe(true);
    expect(widget.hasFlag(AnnotationFlags.Print)).toBe(false);
  });

  it('generates multiple pages for filled form', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test';
    data.descripcionHabilidades = 'Habilidad detallada '.repeat(10);
    data.estrategiasAcciones = 'Estrategia acción '.repeat(10);

    const pdfBytes = await generatePIARPdf(data);
    const doc = await PDFDocument.load(pdfBytes);

    expect(doc.getPageCount()).toBeGreaterThan(1);
  });

  it('paginates a single oversized row across multiple pages', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.capacidades = 'Contexto detallado '.repeat(1200);

    const pdfBytes = await generatePIARPdf(data);
    const doc = await PDFDocument.load(pdfBytes);

    expect(doc.getPageCount()).toBeGreaterThan(2);
  });

  it('normalizes legacy acta duplicates so canonical facts drive the export', async () => {
    const data = createEmptyPIARFormDataV2();
    data.header.fechaDiligenciamiento = '2026-03-30';
    data.header.lugarDiligenciamiento = 'CanonicalPlace';
    data.header.nombrePersonaDiligencia = 'CanonicalTeacher';
    data.header.rolPersonaDiligencia = 'CanonicalRole';
    data.header.institucionEducativa = 'CanonicalSchool';
    data.header.sede = 'CanonicalCampus';
    data.header.jornada = 'mañana';
    data.student.nombres = 'Ana';
    data.student.apellidos = 'Perez';
    data.student.edad = '11';
    data.student.grado = '5';

    const legacyActa = data.acta as unknown as Record<string, string>;
    legacyActa.fechaDiligenciamiento = '1999-01-01';
    legacyActa.lugarDiligenciamiento = 'LegacyPlace';
    legacyActa.nombrePersonaDiligencia = 'LegacyTeacher';
    legacyActa.rolPersonaDiligencia = 'LegacyRole';
    legacyActa.institucionEducativa = 'LegacySchool';
    legacyActa.sede = 'LegacyCampus';
    legacyActa.nombreEstudiante = 'Legacy Student';
    legacyActa.edadEstudiante = '99';
    legacyActa.gradoEstudiante = '99';

    const pdfBytes = await generatePIARPdf(data);
    const doc = await PDFDocument.load(pdfBytes);
    const payloadText = doc.getForm().getTextField(PIAR_APP_STATE_FIELD_NAME).getText() ?? '';
    const payload = JSON.parse(payloadText) as { data: { acta: Record<string, unknown> } };
    const content = readDecodedPageContent(doc);

    expect(Object.hasOwn(payload.data.acta, 'fechaDiligenciamiento')).toBe(false);
    expect(Object.hasOwn(payload.data.acta, 'nombreEstudiante')).toBe(false);
    expect(content).toContain(hexEncode('CanonicalPlace'));
    expect(content).toContain(hexEncode('CanonicalSchool'));
    expect(content).toContain(hexEncode('Ana Perez'));
    expect(content).not.toContain(hexEncode('LegacyPlace'));
    expect(content).not.toContain(hexEncode('LegacySchool'));
    expect(content).not.toContain(hexEncode('Legacy Student'));
  });

  it('renders reconciled government-template scalar fields in visible PDF content', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.gradoAspiraIngresar = '6';
    data.student.victimaConflictoRegistro = 'RUV-123';
    data.student.centroProteccionLugar = 'CNorte';
    data.student.grupoEtnicoCual = 'Wayuu';
    data.entornoSalud.eps = 'EPSSura';
    data.entornoSalud.sectorSaludFrecuencia = 'Mensual';
    data.entornoSalud.tratamientoMedicoCual = 'TOcupacional';
    data.entornoHogar.estaBajoProteccion = true;
    data.entornoHogar.subsidioEntidad = 'ICBF';
    data.entornoHogar.subsidioCual = 'Transporte';
    data.entornoEducativo.noVinculacionMotivo = 'SinCupo';
    data.entornoEducativo.medioTransporte = 'RutaEscolar';
    data.entornoEducativo.distanciaTiempo = '30minutos';
    data.acta.equipoDirectivosDocentes = 'RectoraDocente';
    data.acta.familiaParticipante = 'Madre';
    data.acta.parentescoFamiliaParticipante = 'Madre';

    const pdfBytes = await generatePIARPdf(data);
    const doc = await PDFDocument.load(pdfBytes);
    const content = readDecodedPageContent(doc);

    for (const expected of [
      'RUV-123',
      'CNorte',
      'Wayuu',
      'EPSSura',
      'Mensual',
      'TOcupacional',
      'ICBF',
      'Transporte',
      'SinCupo',
      'RutaEscolar',
      '30minutos',
      'RectoraDocente',
    ]) {
      expect(content).toContain(hexEncode(expected));
    }
  });
});
