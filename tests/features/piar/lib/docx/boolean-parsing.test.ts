/** Tests for parsing legacy and current DOCX boolean tokens (Sí/Si/SI/sí/no/No/NO and friends). */
import { describe, expect, it } from 'vitest';
import { validateDocxFieldMap } from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest';

describe('Boolean parsing in validateDocxFieldMap', () => {
  it('accepts standard Sí/No boolean tokens', () => {
    const result = validateDocxFieldMap(new Map([
      ['student.victimaConflicto', 'Sí'],
      ['student.vinculadoSistemaAnterior', 'No'],
    ]));

    // These paths should NOT be in invalidPaths (they're valid booleans)
    expect(result.invalidPaths).not.toContain('student.victimaConflicto');
    expect(result.invalidPaths).not.toContain('student.vinculadoSistemaAnterior');
    expect(result.recognizedFieldCount).toBe(2);
  });

  it('accepts legacy true/false boolean tokens', () => {
    const result = validateDocxFieldMap(new Map([
      ['student.victimaConflicto', 'true'],
      ['student.vinculadoSistemaAnterior', 'false'],
    ]));

    expect(result.invalidPaths).not.toContain('student.victimaConflicto');
    expect(result.invalidPaths).not.toContain('student.vinculadoSistemaAnterior');
    expect(result.recognizedFieldCount).toBe(2);
  });

  it('accepts case and accent variants of boolean tokens', () => {
    // Test: "SÍ" (uppercase accent), "si" (lowercase), "NO" (uppercase), "no" (lowercase)
    const result = validateDocxFieldMap(new Map([
      ['student.victimaConflicto', 'SÍ'],
      ['student.vinculadoSistemaAnterior', 'NO'],
      ['student.centroProteccion', 'si'],
      ['student.grupoEtnico', 'no'],
    ]));

    // All case/accent variants should be accepted as valid
    expect(result.invalidPaths).toEqual([]);
    expect(result.recognizedFieldCount).toBe(4);
  });

  it('rejects unknown boolean tokens and marks them as invalid', () => {
    const result = validateDocxFieldMap(new Map([
      ['student.victimaConflicto', 'X'],
      ['student.vinculadoSistemaAnterior', 'maybe'],
      ['student.centroProteccion', 'Aplica'],
    ]));

    // Unknown tokens should be marked as invalid paths
    expect(result.invalidPaths).toContain('student.victimaConflicto');
    expect(result.invalidPaths).toContain('student.vinculadoSistemaAnterior');
    expect(result.invalidPaths).toContain('student.centroProteccion');
  });

  it('treats empty string as null (no answer) - valid, not invalid', () => {
    const result = validateDocxFieldMap(new Map([
      ['student.victimaConflicto', ''],
    ]));

    // Empty string should be accepted as valid (null = no answer)
    expect(result.invalidPaths).not.toContain('student.victimaConflicto');
    expect(result.recognizedFieldCount).toBe(1);
  });
});
