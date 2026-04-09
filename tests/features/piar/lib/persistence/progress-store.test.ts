/** Tests for ProgressStore: encrypted V2 round-trip, unsupported version handling, unload-recovery slot precedence, and concurrent device-key creation. */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import {
  decryptSerializedProgress,
  encryptSerializedProgress,
  resetProgressCryptoKeyCacheForTests,
} from '@piar-digital-app/features/piar/lib/persistence/progress-crypto';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { installEncryptedProgressStorageMocks } from '../../../../test-utils/encrypted-progress-storage';

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

async function storeEncryptedPayload(payload: unknown): Promise<void> {
  const encryptedPayload = await encryptSerializedProgress(JSON.stringify(payload));
  localStorageMock.setItem('piar-form-progress', JSON.stringify(encryptedPayload));
}

describe('ProgressStore', () => {
  beforeEach(() => {
    installEncryptedProgressStorageMocks();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('returns null when no saved data exists', async () => {
    const result = await ProgressStore.load();
    expect(result).toBeNull();
  });

  it('returns load status with not_found when empty', async () => {
    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('not_found');
    }
  });

  it('saves encrypted V2 data and loads it back', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Maria';
    data.student.apellidos = 'Garcia';
    data.header.institucionEducativa = 'IE Central';

    const saveResult = await ProgressStore.save(data);
    expect(saveResult.ok).toBe(true);

    const rawText = localStorageMock.getItem('piar-form-progress')!;
    const raw = JSON.parse(rawText);
    expect(raw.storageVersion).toBe(1);
    expect(raw.kind).toBe('piar-progress-encrypted');
    expect(raw.alg).toBe('AES-GCM');
    expect(raw.iv).toEqual(expect.any(String));
    expect(raw.ciphertext).toEqual(expect.any(String));
    expect(rawText).not.toContain('Maria');
    expect(rawText).not.toContain('Garcia');
    expect(rawText).not.toContain('IE Central');

    const loaded = await ProgressStore.load();
    expect(loaded).not.toBeNull();
    expect(loaded!._version).toBe(2);
    expect(loaded!.student.nombres).toBe('Maria');
    expect(loaded!.student.apellidos).toBe('Garcia');
    expect(loaded!.header.institucionEducativa).toBe('IE Central');
  });

  it('loads unload recovery when encrypted autosave has not completed', async () => {
    const older = createEmptyPIARFormDataV2();
    older.student.nombres = 'Anterior';
    await ProgressStore.save(older);

    const latest = createEmptyPIARFormDataV2();
    latest.student.nombres = 'Reciente';
    const recoveryResult = ProgressStore.saveUnloadRecovery(latest);
    expect(recoveryResult.ok).toBe(true);

    const recoveryRaw = localStorageMock.getItem('piar-form-progress-unload-recovery');
    expect(recoveryRaw).toContain('Reciente');

    const recovered = await ProgressStore.loadWithStatus();
    expect(recovered.ok).toBe(true);
    if (!recovered.ok) return;

    expect(recovered.data.student.nombres).toBe('Reciente');
    expect(localStorageMock.getItem('piar-form-progress-unload-recovery')).toBeNull();

    const encrypted = await ProgressStore.loadWithStatus();
    expect(encrypted.ok).toBe(true);
    if (!encrypted.ok) return;

    expect(encrypted.data.student.nombres).toBe('Anterior');
  });

  it('clears stale unload recovery after loading encrypted progress', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Guardado';
    await storeEncryptedPayload({ v: 2, data });

    localStorageMock.setItem('piar-form-progress-unload-recovery', 'not-json');

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Guardado');
    expect(localStorageMock.getItem('piar-form-progress-unload-recovery')).toBeNull();
  });

  it('counts and clears unload recovery data', () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Pendiente';

    expect(ProgressStore.hasSavedData()).toBe(false);
    ProgressStore.saveUnloadRecovery(data);

    expect(ProgressStore.hasSavedData()).toBe(true);
    ProgressStore.clear();

    expect(ProgressStore.hasSavedData()).toBe(false);
    expect(localStorageMock.getItem('piar-form-progress-unload-recovery')).toBeNull();
  });

  it('keeps first-time device key creation readable across concurrent tab caches', async () => {
    const firstEncryption = encryptSerializedProgress('first tab draft');
    resetProgressCryptoKeyCacheForTests();
    const secondEncryption = encryptSerializedProgress('second tab draft');
    const [firstEnvelope, secondEnvelope] = await Promise.all([firstEncryption, secondEncryption]);

    resetProgressCryptoKeyCacheForTests();

    await expect(decryptSerializedProgress(firstEnvelope)).resolves.toBe('first tab draft');
    await expect(decryptSerializedProgress(secondEnvelope)).resolves.toBe('second tab draft');
  });

  it('loads valid encrypted V2 envelopes from storage', async () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Guardado';
    await storeEncryptedPayload({ v: 2, data });

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.student.nombres).toBe('Guardado');
  });

  it('rejects unencrypted saved data', async () => {
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify({ v: 2, data: createEmptyPIARFormDataV2() }),
    );

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unencrypted_data');
  });

  it('rejects malformed encrypted envelopes', async () => {
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify({ kind: 'piar-progress-encrypted', storageVersion: 1 }),
    );

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('validation_failed');
  });

  it('rejects V1 envelopes as unsupported_version', async () => {
    await storeEncryptedPayload({ v: 1, data: createLegacyPayload() });

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unsupported_version');
  });

  it('rejects bare legacy saved data as unencrypted_data', async () => {
    localStorageMock.setItem(
      'piar-form-progress',
      JSON.stringify(createLegacyPayload()),
    );

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unencrypted_data');
  });

  it('rejects v:2 envelopes carrying legacy-shaped data', async () => {
    await storeEncryptedPayload({ v: 2, data: createLegacyPayload() });

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unsupported_version');
  });

  it('rejects invalid V2 payloads', async () => {
    await storeEncryptedPayload({ v: 2, data: {} });

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('validation_failed');
  });

  it('returns parse_failed for corrupted JSON', async () => {
    localStorageMock.setItem('piar-form-progress', 'not-json{{{');

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('parse_failed');
  });

  it('returns unsupported_version for future versions', async () => {
    const data = createEmptyPIARFormDataV2();
    await storeEncryptedPayload({ v: 99, data });

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.code).toBe('unsupported_version');
  });

  it('surfaces quota errors during save', async () => {
    const data = createEmptyPIARFormDataV2();
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    const result = await ProgressStore.save(data);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('quota_exceeded');
    }
  });

  it('surfaces private_browsing errors during save', async () => {
    const data = createEmptyPIARFormDataV2();
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    const result = await ProgressStore.save(data);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('private_browsing');
    }
  });

  it('surfaces private_browsing errors during load', async () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('private_browsing');
    }
  });

  it('fails closed when Web Crypto is unavailable', async () => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: undefined,
    });

    const result = await ProgressStore.save(createEmptyPIARFormDataV2());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('crypto_unavailable');
    }
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('fails closed when IndexedDB key storage is unavailable', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: undefined,
    });

    const result = await ProgressStore.save(createEmptyPIARFormDataV2());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('key_unavailable');
    }
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('surfaces decryption failure when the stored device key is lost', async () => {
    await ProgressStore.save(createEmptyPIARFormDataV2());
    installEncryptedProgressStorageMocks();

    const result = await ProgressStore.loadWithStatus();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('decryption_failed');
    }
  });

  it('clears saved data', async () => {
    await ProgressStore.save(createEmptyPIARFormDataV2());
    ProgressStore.clear();

    expect(await ProgressStore.load()).toBeNull();
  });

  it('returns true from hasSavedData when data exists', async () => {
    await ProgressStore.save(createEmptyPIARFormDataV2());
    expect(ProgressStore.hasSavedData()).toBe(true);
  });

  it('returns false from hasSavedData when empty', () => {
    expect(ProgressStore.hasSavedData()).toBe(false);
  });
});
