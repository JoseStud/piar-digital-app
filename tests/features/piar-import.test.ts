import { describe, expect, it } from 'vitest';
import {
  createEmptyPIARFormDataV2,
  PIAR_DATA_VERSION,
} from '@/features/piar/model/piar';
import { parsePIARData } from '@/features/piar/lib/portable/piar-import';

function createEnvelope(data: Record<string, unknown>) {
  return {
    v: PIAR_DATA_VERSION,
    data,
  };
}

describe('parsePIARData normalization', () => {
  it('rejects invalid boolean leaves', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    (data.student as Record<string, unknown>).vinculadoSistemaAnterior = 'si';

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('drops unknown keys inside checkbox groups and warns', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    const competencias = data.competenciasDispositivos as Record<string, unknown>;
    competencias.competenciasLectoras02 = {
      cl02_1: true,
      typo: false,
    };

    const result = parsePIARData(createEnvelope(data));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.competenciasDispositivos.competenciasLectoras02).toEqual({ cl02_1: true });
    expect(result.warnings).toEqual(expect.arrayContaining([
      { code: 'unknown_key', path: 'competenciasDispositivos.competenciasLectoras02.typo' },
    ]));
  });

  it('preserves defaults for missing additive leaf fields', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    delete ((data.student as Record<string, unknown>) as { gradoAspiraIngresar?: unknown }).gradoAspiraIngresar;

    const result = parsePIARData(createEnvelope(data));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.student.gradoAspiraIngresar).toBe('');
    expect(result.warnings).toEqual(expect.arrayContaining([
      { code: 'missing_field', path: 'student.gradoAspiraIngresar' },
    ]));
  });

  it('rejects missing top-level sections and nested groups', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    delete (data as { student?: unknown }).student;
    delete ((data.valoracionPedagogica as Record<string, unknown>) as { movilidad?: unknown }).movilidad;

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('rejects invalid container types', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    data.ajustes = {};
    (data.entornoSalud as Record<string, unknown>).atencionMedica = {};

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('ignores extra tuple entries and reports warnings', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    data.ajustes = [
      ...createEmptyPIARFormDataV2().ajustes,
      {
        area: 'Extra',
        barreras: '',
        tipoAjuste: '',
        apoyoRequerido: '',
        descripcion: '',
        seguimiento: '',
      },
    ];

    const result = parsePIARData(createEnvelope(data));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.ajustes).toHaveLength(5);
    expect(result.warnings).toEqual(expect.arrayContaining([
      { code: 'extra_item', path: 'ajustes.5' },
    ]));
  });

  it('rejects short fixed tuples', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;

    data.ajustes = [
      { area: 'Matemáticas', barreras: 'B1', tipoAjuste: '', apoyoRequerido: '', descripcion: '', seguimiento: '' },
      { area: 'Lenguaje', barreras: 'B2', tipoAjuste: '', apoyoRequerido: '', descripcion: '', seguimiento: '' },
    ];

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('rejects short nested tuples', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;

    (data.entornoSalud as Record<string, unknown>).atencionMedica = [
      { aplica: true, cual: 'Hospital X', frecuencia: 'Mensual', horario: 'Mañana' },
    ];

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('rejects explicit undefined tuple slots', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    const existing = createEmptyPIARFormDataV2();

    data.ajustes = [
      existing.ajustes[0],
      undefined,
      existing.ajustes[2],
      existing.ajustes[3],
      existing.ajustes[4],
    ];

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('rejects unsupported versions', () => {
    const result = parsePIARData({
      v: PIAR_DATA_VERSION - 1,
      data: createEmptyPIARFormDataV2(),
    });

    expect(result).toEqual({ ok: false, code: 'unsupported_version' });
  });

  it('rejects malformed envelopes before normalization', () => {
    expect(parsePIARData({ nope: true })).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
    expect(parsePIARData({ v: PIAR_DATA_VERSION, data: null })).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('rejects legacy-shaped payloads wrapped in a v:2 envelope', () => {
    expect(parsePIARData({
      v: PIAR_DATA_VERSION,
      data: {
        fechaElaboracion: '2026-03-30',
        nombre: 'Legacy Student',
        periodos: [],
        recomendaciones: [],
      },
    })).toEqual({
      ok: false,
      code: 'unsupported_version',
    });
  });

  it('rejects invalid_type when a boolean field receives a string value', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    (data.student as Record<string, unknown>).centroProteccion = 'yes';

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('rejects invalid_type when a string field receives a number value', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    (data.header as Record<string, unknown>).fechaDiligenciamiento = 12345;

    expect(parsePIARData(createEnvelope(data))).toEqual({
      ok: false,
      code: 'corrupt_or_incomplete_data',
    });
  });

  it('reports unknown_key for extra top-level fields', () => {
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    data.unknownSection = { foo: 'bar' };

    const result = parsePIARData(createEnvelope(data));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.warnings).toEqual(expect.arrayContaining([
      { code: 'unknown_key', path: 'unknownSection' },
    ]));
  });
});
