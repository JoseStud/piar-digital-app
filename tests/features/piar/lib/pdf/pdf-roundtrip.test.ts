import { describe, it, expect } from 'vitest';
import { generatePIARPdf } from '@piar-digital-app/features/piar/lib/pdf/pdf-generator';
import { importPIARPdf } from '@piar-digital-app/features/piar/lib/pdf/pdf-importer';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import type {
  IntensidadApoyo,
  PIARFormDataV2,
  ValoracionAspecto,
} from '@piar-digital-app/features/piar/model/piar';
import {
  COMPETENCIAS_GRUPOS,
  VALORACION_ASPECTOS,
} from '@piar-digital-app/features/piar/content/assessment-catalogs';

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

describe('PDF round-trip', () => {
  it('generates and re-imports a V2 PIAR preserving all data', async () => {
    const original = createEmptyPIARFormDataV2();
    original.header.nombrePersonaDiligencia = 'Test Docente';
    original.student.nombres = 'Laura';
    original.student.apellidos = 'García';
    original.student.victimaConflicto = false;
    original.entornoSalud.diagnosticoMedico = true;
    original.entornoSalud.diagnosticoCual = 'Síndrome de Down';
    original.ajustes[0].area = 'Matemáticas';
    original.ajustes[0].barreras = 'Dificultad de concentración';
    original.firmas.docentes[0].nombre = 'Ana López';
    original.acta.compromisos = 'Apoyar en casa con ejercicios visuales.';

    const pdfBytes = await generatePIARPdf(original);
    const result = await importPIARPdf(pdfBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.header.nombrePersonaDiligencia).toBe('Test Docente');
    expect(result.data.student.nombres).toBe('Laura');
    expect(result.data.student.victimaConflicto).toBe(false);
    expect(result.data.entornoSalud.diagnosticoCual).toBe('Síndrome de Down');
    expect(result.data.ajustes[0].area).toBe('Matemáticas');
    expect(result.data.firmas.docentes[0].nombre).toBe('Ana López');
    expect(result.data.acta.compromisos).toBe('Apoyar en casa con ejercicios visuales.');
  });

  it('round-trips every valoración and competencia catalog item via PDF', async () => {
    const fixture = buildCatalogFixture();

    // Sanity check: the fixture actually covers the catalog. These equalities
    // ensure that if the catalog grows, the test automatically exercises the
    // new items instead of silently skipping them.
    const expectedValoracionCount = VALORACION_ASPECTOS.flatMap((a) => a.questions).length;
    const expectedCompetenciasCount = COMPETENCIAS_GRUPOS.flatMap((g) => g.items).length;
    expect(fixture.valoracionCount).toBe(expectedValoracionCount);
    expect(fixture.competenciasCount).toBe(expectedCompetenciasCount);

    const pdfBytes = await generatePIARPdf(fixture.data);
    const result = await importPIARPdf(pdfBytes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Valoración pedagógica: every catalog question round-trips on the correct aspect.
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

    // Competencias y dispositivos: every catalog item round-trips in its group.
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
