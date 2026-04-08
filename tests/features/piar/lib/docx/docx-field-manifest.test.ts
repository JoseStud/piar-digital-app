/** Tests for the DOCX field manifest: definition consistency, path resolution, value coercion. */
import { describe, expect, it } from 'vitest';
import {
  DOCX_FIELD_DEFINITIONS,
  buildPIARDataFromFieldMap,
} from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest';
import { COMPETENCIAS_GRUPOS, VALORACION_ASPECTOS } from '@piar-digital-app/features/piar/content/assessment-catalogs';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';

function enumerateLeafPaths(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => enumerateLeafPaths(entry, path ? `${path}.${index}` : String(index)));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([key, entry]) => enumerateLeafPaths(entry, path ? `${path}.${key}` : key));
  }

  return path === '_version' ? [] : [path];
}

function buildExpectedPersistedPaths(): string[] {
  const defaultPaths = enumerateLeafPaths(createEmptyPIARFormDataV2());
  const valoracionPaths = VALORACION_ASPECTOS.flatMap((aspecto) =>
    aspecto.questions.map((question) => `valoracionPedagogica.${aspecto.key}.respuestas.${question.id}`),
  );
  const competenciaPaths = COMPETENCIAS_GRUPOS.flatMap((group) =>
    group.items.map((item) => `competenciasDispositivos.${group.key}.${item.id}`),
  );

  return Array.from(new Set([...defaultPaths, ...valoracionPaths, ...competenciaPaths])).sort();
}

describe('buildPIARDataFromFieldMap', () => {
  it('hydrates partial field maps without throwing', () => {
    const result = buildPIARDataFromFieldMap(new Map([
      ['student.nombres', 'Ana'],
    ]));

    expect(result.student.nombres).toBe('Ana');
    expect(result.student.apellidos).toBe('');
  });

  it('accepts current and legacy boolean tokens', () => {
    const result = buildPIARDataFromFieldMap(new Map([
      ['student.victimaConflicto', 'Sí'],
      ['student.vinculadoSistemaAnterior', 'false'],
    ]));

    expect(result.student.victimaConflicto).toBe(true);
    expect(result.student.vinculadoSistemaAnterior).toBe(false);
  });

  it('accepts case and accent variants of boolean tokens', () => {
    // "SÍ" (uppercase accent), "si" (lowercase no accent), "NO" (uppercase)
    const result = buildPIARDataFromFieldMap(new Map([
      ['student.victimaConflicto', 'SÍ'],
      ['student.vinculadoSistemaAnterior', 'NO'],
      ['student.centroProteccion', 'si'],
    ]));

    expect(result.student.victimaConflicto).toBe(true);
    expect(result.student.vinculadoSistemaAnterior).toBe(false);
    expect(result.student.centroProteccion).toBe(true);
  });

  it('returns null for unknown boolean tokens instead of false', () => {
    const result = buildPIARDataFromFieldMap(new Map([
      ['student.victimaConflicto', 'X'],
      ['student.vinculadoSistemaAnterior', 'maybe'],
      ['student.centroProteccion', 'Aplica'],
    ]));

    // Unknown tokens should become null (no answer), not false (a meaningful answer)
    expect(result.student.victimaConflicto).toBeNull();
    expect(result.student.vinculadoSistemaAnterior).toBeNull();
    expect(result.student.centroProteccion).toBeNull();
  });

  it('keeps DOCX field definitions in parity with the persisted schema', () => {
    const expectedPaths = buildExpectedPersistedPaths();
    const manifestPaths = DOCX_FIELD_DEFINITIONS.map((definition) => definition.path).sort();

    expect(manifestPaths).toEqual(expectedPaths);
  });
});
