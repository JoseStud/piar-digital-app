import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressStore } from '@/features/piar/lib/persistence/progress-store';
import { createEmptyPIARFormDataV2 } from '@/features/piar/model/piar';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function createLegacyPayload(): Record<string, unknown> {
  return {
    fechaElaboracion: '2026-03-30',
    nombre: 'Legacy Student',
    periodos: [],
    recomendaciones: [],
  };
}

describe('ProgressStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('returns null when no saved data exists', () => {
    const result = ProgressStore.load();
    expect(result).toBeNull();
  });

  it('returns load status with not_found when empty', () => {
    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('not_found');
    }
  });

  it('saves a V2 object and loads it back', () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'María';
    data.student.apellidos = 'García';
    data.header.institucionEducativa = 'IE Central';

    const saveResult = ProgressStore.save(data);
    expect(saveResult.ok).toBe(true);

    const raw = JSON.parse(localStorageMock.getItem('piar-form-progress')!);
    expect(raw.v).toBe(2);
    expect(raw.data).toBeDefined();

    const loaded = ProgressStore.load();
    expect(loaded).not.toBeNull();
    expect(loaded!._version).toBe(2);
    expect(loaded!.student.nombres).toBe('María');
    expect(loaded!.student.apellidos).toBe('García');
    expect(loaded!.header.institucionEducativa).toBe('IE Central');
  });

  it('loads valid V2 envelopes from storage', () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Guardado';
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify({ v: 2, data }),
    );

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Guardado');
  });

  it('rejects V1 envelopes as unsupported_version', () => {
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify({ v: 1, data: createLegacyPayload() }),
    );

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unsupported_version');
  });

  it('rejects bare legacy saved data as unsupported_version', () => {
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify(createLegacyPayload()),
    );

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unsupported_version');
  });

  it('rejects v:2 envelopes carrying legacy-shaped data', () => {
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify({ v: 2, data: createLegacyPayload() }),
    );

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unsupported_version');
  });

  it('rejects invalid V2 payloads', () => {
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify({ v: 2, data: {} }),
    );

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('validation_failed');
  });

  it('returns parse_failed for corrupted JSON', () => {
    localStorageMock.setItem('piar-form-progress', 'not-json{{{');

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('parse_failed');
  });

  it('returns unsupported_version for future versions', () => {
    const data = createEmptyPIARFormDataV2();
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify({ v: 99, data }),
    );

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unsupported_version');
  });

  it('surfaces quota errors during save', () => {
    const data = createEmptyPIARFormDataV2();
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    const result = ProgressStore.save(data);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('quota_exceeded');
    }
  });

  it('surfaces private_browsing errors during save', () => {
    const data = createEmptyPIARFormDataV2();
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    const result = ProgressStore.save(data);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('private_browsing');
    }
  });

  it('surfaces private_browsing errors during load', () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    const result = ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('private_browsing');
    }
  });

  it('clears saved data', () => {
    ProgressStore.save(createEmptyPIARFormDataV2());
    ProgressStore.clear();

    expect(ProgressStore.load()).toBeNull();
  });

  it('returns true from hasSavedData when data exists', () => {
    ProgressStore.save(createEmptyPIARFormDataV2());
    expect(ProgressStore.hasSavedData()).toBe(true);
  });

  it('returns false from hasSavedData when empty', () => {
    expect(ProgressStore.hasSavedData()).toBe(false);
  });
});
