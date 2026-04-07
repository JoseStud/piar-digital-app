import { describe, it, expect } from 'vitest';
import { unwrapEnvelope, deepMergeWithDefaultsV2 } from '@piar-digital-app/features/piar/lib/data/data-utils';
import { mergeRecord } from '@piar-digital-app/features/piar/lib/data/data-utils/mergeHelpers';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

describe('unwrapEnvelope', () => {
  it('extracts data from versioned envelope', () => {
    const inner = { name: 'test' };
    const result = unwrapEnvelope({ v: 2, data: inner });
    expect(result).toBe(inner);
  });

  it('returns raw value when not an envelope', () => {
    const raw = { name: 'test' };
    const result = unwrapEnvelope(raw);
    expect(result).toBe(raw);
  });

  it('returns raw value for non-object input', () => {
    expect(unwrapEnvelope('hello')).toBe('hello');
    expect(unwrapEnvelope(null)).toBe(null);
  });
});

describe('deepMergeWithDefaultsV2', () => {
  it('backfills canonical header and student fields from legacy acta duplicates when needed', () => {
    const partial = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    partial.header = {};
    partial.student = {};
    partial.acta = {
      fechaDiligenciamiento: '2026-03-30',
      lugarDiligenciamiento: 'Bogota',
      nombrePersonaDiligencia: 'Docente Uno',
      rolPersonaDiligencia: 'Docente de aula',
      institucionEducativa: 'IE Central',
      sede: 'Principal',
      nombreEstudiante: 'Ana Perez',
      edadEstudiante: '11',
      gradoEstudiante: '5',
      compromisos: 'Seguimiento semanal',
    };

    const result = deepMergeWithDefaultsV2(partial);
    const acta = result.acta as unknown as Record<string, unknown>;

    expect(result.header.fechaDiligenciamiento).toBe('2026-03-30');
    expect(result.header.lugarDiligenciamiento).toBe('Bogota');
    expect(result.header.institucionEducativa).toBe('IE Central');
    expect(result.student.nombres).toBe('Ana');
    expect(result.student.apellidos).toBe('Perez');
    expect(result.student.edad).toBe('11');
    expect(result.student.grado).toBe('5');
    expect(result.acta.compromisos).toBe('Seguimiento semanal');
    expect(Object.hasOwn(acta, 'fechaDiligenciamiento')).toBe(false);
    expect(Object.hasOwn(acta, 'nombreEstudiante')).toBe(false);
  });

  it('normalizes legacy uppercase tipoIdentificacion "Otro" to lowercase "otro"', () => {
    const partial = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    partial.student = { tipoIdentificacion: 'Otro' };

    const result = deepMergeWithDefaultsV2(partial);

    expect(result.student.tipoIdentificacion).toBe('otro');
  });

  it('preserves canonical header and student fields over stale legacy acta duplicates', () => {
    const partial = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    partial.header = {
      fechaDiligenciamiento: '2026-04-01',
      institucionEducativa: 'Canonical School',
      sede: 'Canonical Campus',
    };
    partial.student = {
      nombres: 'Laura',
      apellidos: 'Diaz',
      edad: '12',
      grado: '6',
    };
    partial.acta = {
      fechaDiligenciamiento: '1999-01-01',
      institucionEducativa: 'Legacy School',
      sede: 'Legacy Campus',
      nombreEstudiante: 'Legacy Student',
      edadEstudiante: '99',
      gradoEstudiante: '99',
    };

    const result = deepMergeWithDefaultsV2(partial);

    expect(result.header.fechaDiligenciamiento).toBe('2026-04-01');
    expect(result.header.institucionEducativa).toBe('Canonical School');
    expect(result.header.sede).toBe('Canonical Campus');
    expect(result.student.nombres).toBe('Laura');
    expect(result.student.apellidos).toBe('Diaz');
    expect(result.student.edad).toBe('12');
    expect(result.student.grado).toBe('6');
  });
});

describe('mergeRecord', () => {
  it('merges valid boolean and null values', () => {
    const defaults = { a: null, b: true, c: false } as Record<string, boolean | null>;
    const parsed = { a: true, b: false };
    const result = mergeRecord(parsed, defaults);
    expect(result).toEqual({ a: true, b: false, c: false });
  });

  it('ignores __proto__ key to prevent prototype pollution', () => {
    const defaults = { safe: null } as Record<string, boolean | null>;
    const malicious = { safe: true, __proto__: { polluted: true } } as unknown as Record<string, boolean | null>;
    const result = mergeRecord(malicious, defaults);
    expect(result).toEqual({ safe: true });
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
    // Verify prototype was not polluted
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('ignores constructor key to prevent prototype pollution', () => {
    const defaults = { safe: null } as Record<string, boolean | null>;
    const malicious = { safe: true, constructor: true } as unknown as Record<string, boolean | null>;
    const result = mergeRecord(malicious, defaults);
    expect(result).toEqual({ safe: true });
  });

  it('ignores prototype key to prevent prototype pollution', () => {
    const defaults = { safe: null } as Record<string, boolean | null>;
    const malicious = { safe: true, prototype: true } as unknown as Record<string, boolean | null>;
    const result = mergeRecord(malicious, defaults);
    expect(result).toEqual({ safe: true });
  });
});
