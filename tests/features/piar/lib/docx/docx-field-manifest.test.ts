/** Tests for the DOCX field manifest: definition consistency, path resolution, value coercion. */
import { describe, expect, it } from 'vitest';
import {
  DOCX_FIELD_DEFINITIONS,
  buildPIARDataFromFieldMap,
} from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest';
import { deserializeDocxFieldValue } from '@piar-digital-app/features/piar/lib/docx/docx-field-manifest/codec';
import { COMPETENCIAS_GRUPOS, VALORACION_ASPECTOS } from '@piar-digital-app/features/piar/content/assessment-catalogs';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { PIAR_SCHEMA_FIELD_PATHS } from '@piar-digital-app/features/piar/model/piar-schema';

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
  function getDefinition(path: string) {
    const definition = DOCX_FIELD_DEFINITIONS.find((entry) => entry.path === path);
    expect(definition).toBeDefined();
    return definition;
  }

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

  it('keeps the canonical PIAR schema in parity with the persisted schema', () => {
    const expectedPaths = buildExpectedPersistedPaths();
    expect([...PIAR_SCHEMA_FIELD_PATHS].sort()).toEqual(expectedPaths);
  });

  it('maps habilidades fields into the dedicated DOCX section', () => {
    const definition = getDefinition('descripcionHabilidades');

    expect(definition).toMatchObject({
      section: 'Habilidades y Estrategias',
      label: 'Descripción de habilidades y destrezas',
      kind: 'rich',
    });
  });

  it('keeps representative indexed, grouped, and catalog-driven labels stable', () => {
    const movilidadQuestion = VALORACION_ASPECTOS.find((aspecto) => aspecto.key === 'movilidad')?.questions[0];
    const memoriaItem = COMPETENCIAS_GRUPOS.find((group) => group.key === 'memoria')?.items[0];

    expect(getDefinition('ajustes.0.descripcion')?.label).toBe('Ajuste 1 · Descripción');
    expect(getDefinition('firmas.docenteOrientador.firma')?.label).toBe('Docente orientador · Firma');
    expect(getDefinition('valoracionPedagogica.movilidad.respuestas.mov_1')?.label).toBe(
      `Movilidad · ${movilidadQuestion?.label}`,
    );
    expect(getDefinition('competenciasDispositivos.memoria.mem_1')?.label).toBe(
      `Dispositivos Básicos de Aprendizaje – Memoria · ${memoriaItem?.label}`,
    );
  });

  it('marks rich-text controls without changing ordinary text fields', () => {
    expect(getDefinition('acta.compromisos')?.kind).toBe('rich');
    expect(getDefinition('student.nombres')?.kind).toBe('plain');
  });

  it('rejects invalid allowed values in strict DOCX decoding and preserves them in lenient decoding', () => {
    const definition = DOCX_FIELD_DEFINITIONS.find((entry) => entry.path === 'entornoEducativo.estadoGrado');
    expect(definition).toBeDefined();
    if (!definition) return;

    expect(deserializeDocxFieldValue(definition, 'nope')).toEqual({ ok: false });
    expect(deserializeDocxFieldValue(definition, 'nope', {
      invalidAllowedValuePolicy: 'as-is',
    })).toEqual({ ok: true, value: 'nope' });
  });
});
