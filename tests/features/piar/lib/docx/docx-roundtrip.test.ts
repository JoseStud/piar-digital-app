import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import type {
  IntensidadApoyo,
  PIARFormDataV2,
  ValoracionAspecto,
} from '@piar-digital-app/features/piar/model/piar';
import { generatePIARDocx } from '@piar-digital-app/features/piar/lib/docx/docx-generator';
import { importPIARDocx } from '@piar-digital-app/features/piar/lib/docx/docx-importer';
import {
  COMPETENCIAS_GRUPOS,
  VALORACION_ASPECTOS,
} from '@piar-digital-app/features/piar/content/assessment-catalogs';
import {
  buildDocumentControlParagraphs,
  readZipText,
  setCustomXmlFieldValue,
  setDocumentControlContent,
  setDocumentControlValue,
} from './docx-test-helpers';

// Deterministic three-state pattern cycling through true / false / null so that
// every catalog item is exercised with each possible boolean-null value.
function tristateFor(index: number): boolean | null {
  const mod = index % 3;
  if (mod === 0) return true;
  if (mod === 1) return false;
  return null;
}

const INTENSIDAD_CYCLE: IntensidadApoyo[] = [
  'ninguno',
  'intermitente',
  'extenso',
  'generalizado',
  null,
];

interface CatalogFixture {
  data: PIARFormDataV2;
  valoracionExpected: Map<string, { aspectKey: string; value: boolean | null }>;
  competenciasExpected: Map<string, { groupKey: string; value: boolean | null }>;
  valoracionCount: number;
  competenciasCount: number;
}

function buildCatalogFixture(): CatalogFixture {
  const data = createEmptyPIARFormDataV2();
  const valoracionExpected = new Map<string, { aspectKey: string; value: boolean | null }>();
  const competenciasExpected = new Map<string, { groupKey: string; value: boolean | null }>();

  let globalIndex = 0;

  VALORACION_ASPECTOS.forEach((aspecto, aspectoIdx) => {
    const aspect = data.valoracionPedagogica[aspecto.key] as ValoracionAspecto;
    aspect.intensidad = INTENSIDAD_CYCLE[aspectoIdx % INTENSIDAD_CYCLE.length];
    aspect.observacion = `obs::${aspecto.key}::valoracion-${aspectoIdx}`;
    aspecto.questions.forEach((question) => {
      const value = tristateFor(globalIndex++);
      aspect.respuestas[question.id] = value;
      valoracionExpected.set(question.id, { aspectKey: aspecto.key, value });
    });
  });

  COMPETENCIAS_GRUPOS.forEach((group) => {
    const groupRecord = data.competenciasDispositivos[group.key] as Record<string, boolean | null>;
    group.items.forEach((item) => {
      const value = tristateFor(globalIndex++);
      groupRecord[item.id] = value;
      competenciasExpected.set(item.id, { groupKey: group.key, value });
    });
  });

  return {
    data,
    valoracionExpected,
    competenciasExpected,
    valoracionCount: valoracionExpected.size,
    competenciasCount: competenciasExpected.size,
  };
}

describe('DOCX round-trip', () => {
  it('generates and re-imports a DOCX preserving mapped PIAR data', async () => {
    const original = createEmptyPIARFormDataV2();
    original.header.nombrePersonaDiligencia = 'Docente Word';
    original.student.nombres = 'Laura';
    original.student.apellidos = 'García';
    original.student.victimaConflicto = false;
    original.descripcionHabilidades = 'Lee con apoyo visual.\nEscribe frases cortas.';
    original.ajustes[0].descripcion = 'Uso de apoyos visuales en matemáticas.';
    original.firmas.docentes[0].nombre = 'Ana López';
    original.acta.compromisos = 'Mantener seguimiento semanal.';

    const docxBytes = await generatePIARDocx(original);
    const result = await importPIARDocx(docxBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.header.nombrePersonaDiligencia).toBe('Docente Word');
    expect(result.data.student.nombres).toBe('Laura');
    expect(result.data.student.victimaConflicto).toBe(false);
    expect(result.data.descripcionHabilidades).toContain('Lee con apoyo visual.');
    expect(result.data.ajustes[0].descripcion).toContain('apoyos visuales');
    expect(result.data.firmas.docentes[0].nombre).toBe('Ana López');
    expect(result.data.acta.compromisos).toBe('Mantener seguimiento semanal.');
  });

  it('preserves the custom XML relationship and exports booleans as Sí/No', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.vinculadoSistemaAnterior = true;
    original.student.victimaConflicto = false;

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    const customXmlRels = await readZipText(zip, 'customXml/_rels/item1.xml.rels');
    const customXml = await readZipText(zip, 'customXml/item1.xml');

    expect(customXmlRels).toContain('relationships/customXmlProps');
    expect(customXmlRels).toContain('Target="itemProps1.xml"');
    expect(customXml).toContain('path="student.vinculadoSistemaAnterior">Sí<');
    expect(customXml).toContain('path="student.victimaConflicto">No<');
  });

  it('prefers the visible content controls when valid DOCX sources disagree', async () => {
    const original = createEmptyPIARFormDataV2();
    original.student.nombres = 'Original';

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    await setCustomXmlFieldValue(zip, 'student.nombres', 'Desde XML');
    await setDocumentControlValue(zip, 'student.nombres', 'Desde Word');

    const editedBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(editedBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Desde Word');
  });

  it('preserves paragraph breaks from rich-text content controls edited in Word', async () => {
    const original = createEmptyPIARFormDataV2();
    original.descripcionHabilidades = 'Original';

    const docxBytes = await generatePIARDocx(original);
    const zip = await JSZip.loadAsync(docxBytes);
    await setCustomXmlFieldValue(zip, 'descripcionHabilidades', 'Desde XML');
    await setDocumentControlContent(
      zip,
      'descripcionHabilidades',
      buildDocumentControlParagraphs(['Primera línea', '', 'Tercera línea']),
    );

    const editedBytes = await zip.generateAsync({ type: 'uint8array' });
    const result = await importPIARDocx(editedBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.descripcionHabilidades).toBe('Primera línea\n\nTercera línea');
  });

  it('preserves blank lines from untouched DOCX rich-text controls', async () => {
    const original = createEmptyPIARFormDataV2();
    original.descripcionHabilidades = 'Primera\n\nTercera';

    const docxBytes = await generatePIARDocx(original);
    const result = await importPIARDocx(docxBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.descripcionHabilidades).toBe('Primera\n\nTercera');
  });

  it('round-trips checkbox-group enums rendered from the template layout', async () => {
    const original = createEmptyPIARFormDataV2();
    original.entornoSalud.regimen = 'otro';
    original.entornoSalud.regimenCual = 'Especial';
    original.entornoEducativo.estadoGrado = 'sinTerminar';
    original.valoracionPedagogica.movilidad.intensidad = 'extenso';

    const docxBytes = await generatePIARDocx(original);
    const result = await importPIARDocx(docxBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.entornoSalud.regimen).toBe('otro');
    expect(result.data.entornoSalud.regimenCual).toBe('Especial');
    expect(result.data.entornoEducativo.estadoGrado).toBe('sinTerminar');
    expect(result.data.valoracionPedagogica.movilidad.intensidad).toBe('extenso');
  });

  it('round-trips every valoración and competencia catalog item via DOCX', async () => {
    const fixture = buildCatalogFixture();

    const expectedValoracionCount = VALORACION_ASPECTOS.flatMap((aspecto) => aspecto.questions).length;
    const expectedCompetenciasCount = COMPETENCIAS_GRUPOS.flatMap((group) => group.items).length;
    expect(fixture.valoracionCount).toBe(expectedValoracionCount);
    expect(fixture.competenciasCount).toBe(expectedCompetenciasCount);

    const docxBytes = await generatePIARDocx(fixture.data);
    const result = await importPIARDocx(docxBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    VALORACION_ASPECTOS.forEach((aspecto, aspectoIdx) => {
      const importedAspect = result.data.valoracionPedagogica[aspecto.key];
      expect(importedAspect.intensidad).toBe(
        INTENSIDAD_CYCLE[aspectoIdx % INTENSIDAD_CYCLE.length],
      );
      expect(importedAspect.observacion).toBe(`obs::${aspecto.key}::valoracion-${aspectoIdx}`);
      aspecto.questions.forEach((question) => {
        const expected = fixture.valoracionExpected.get(question.id);
        expect(expected, `missing fixture entry for ${question.id}`).toBeDefined();
        expect(
          importedAspect.respuestas[question.id],
          `valoracionPedagogica.${aspecto.key}.respuestas.${question.id}`,
        ).toBe(expected!.value);
      });
    });

    COMPETENCIAS_GRUPOS.forEach((group) => {
      const importedGroup = result.data.competenciasDispositivos[group.key] as Record<
        string,
        boolean | null
      >;
      group.items.forEach((item) => {
        const expected = fixture.competenciasExpected.get(item.id);
        expect(expected, `missing fixture entry for ${item.id}`).toBeDefined();
        expect(
          importedGroup[item.id],
          `competenciasDispositivos.${group.key}.${item.id}`,
        ).toBe(expected!.value);
      });
    });
  });
});
