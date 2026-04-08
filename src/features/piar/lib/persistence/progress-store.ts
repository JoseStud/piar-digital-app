/**
 * localStorage wrapper for PIAR draft persistence.
 *
 * Drafts are stored encrypted (AES-256-GCM, see ./progress-crypto). A
 * second unencrypted "unload recovery" slot exists because Web Crypto +
 * IndexedDB cannot be awaited reliably during `pagehide` — the recovery
 * slot is written synchronously when the page is about to die and is
 * cleared as soon as the encrypted save catches up. All public methods
 * return result objects rather than throwing, so callers never need
 * try/catch to surface a Spanish error notice to the user.
 *
 * The load path checks the unload-recovery slot FIRST so a recent
 * unload's plaintext-but-fresh data wins over an older encrypted save.
 *
 * @see ./progress-crypto.ts
 * @see ../../components/form/PIARForm/usePIARAutosave.ts
 */
import { PIAR_DATA_VERSION, PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import {
  parsePIARData,
  type PIARImportWarning,
} from '@piar-digital-app/features/piar/lib/portable/piar-import';
import {
  decryptSerializedProgress,
  encryptSerializedProgress,
  isEncryptedProgressEnvelope,
  looksLikeEncryptedProgressEnvelope,
  ProgressCryptoError,
  type ProgressCryptoErrorCode,
} from '@piar-digital-app/features/piar/lib/persistence/progress-crypto';

const STORAGE_KEY = 'piar-form-progress';
const UNLOAD_RECOVERY_STORAGE_KEY = 'piar-form-progress-unload-recovery';
const UNLOAD_RECOVERY_KIND = 'piar-progress-unload-recovery';
const UNLOAD_RECOVERY_STORAGE_VERSION = 1;

/**
 * Every failure mode `ProgressStore.save` can return. The string codes
 * are stable — log them, switch on them, and translate them via
 * `buildStorageFailureMessage`. Do not parse the message string.
 */
export type ProgressStoreSaveErrorCode =
  | 'storage_unavailable'
  | 'quota_exceeded'
  | 'serialization_failed'
  | 'private_browsing'
  | 'crypto_unavailable'
  | 'key_unavailable'
  | 'encryption_failed';
/**
 * Every failure mode `ProgressStore.loadWithStatus` can return.
 * `not_found` is the normal "first visit" case and should usually be
 * treated as success-with-no-data, not as an error to surface.
 */
export type ProgressStoreLoadErrorCode =
  | 'private_browsing'
  | 'storage_unavailable'
  | 'not_found'
  | 'parse_failed'
  | 'validation_failed'
  | 'unsupported_version'
  | 'unencrypted_data'
  | 'crypto_unavailable'
  | 'key_unavailable'
  | 'decryption_failed';

export interface ProgressStoreSuccess<T> {
  ok: true;
  data: T;
}

export interface ProgressStoreFailure<TCode extends string> {
  ok: false;
  code: TCode;
  message: string;
}

export type ProgressStoreSaveResult = ProgressStoreSuccess<null> | ProgressStoreFailure<ProgressStoreSaveErrorCode>;
export interface ProgressStoreLoadSuccess extends ProgressStoreSuccess<PIARFormDataV2> {
  warnings: PIARImportWarning[];
}

export type ProgressStoreLoadResult =
  | ProgressStoreLoadSuccess
  | ProgressStoreFailure<ProgressStoreLoadErrorCode>;

interface VersionedData {
  v: typeof PIAR_DATA_VERSION;
  data: PIARFormDataV2;
}

// The unload recovery slot has no max age. If the user closes their
// browser at midnight and reopens it three weeks later, this code will
// happily restore the three-week-old plaintext copy. That is intentional:
// the data is still the user's own work, and aging it out would risk
// silently dropping recoverable progress on flaky shutdowns. The slot is
// cleared as soon as the encrypted save catches up.
interface UnloadRecoveryEnvelope {
  storageVersion: typeof UNLOAD_RECOVERY_STORAGE_VERSION;
  kind: typeof UNLOAD_RECOVERY_KIND;
  savedAt: number;
  serializedProgress: string;
}

function buildVersionedData(data: PIARFormDataV2): VersionedData {
  return { v: PIAR_DATA_VERSION, data };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUnloadRecoveryEnvelope(value: unknown): value is UnloadRecoveryEnvelope {
  return isRecord(value)
    && value.storageVersion === UNLOAD_RECOVERY_STORAGE_VERSION
    && value.kind === UNLOAD_RECOVERY_KIND
    && typeof value.savedAt === 'number'
    && Number.isFinite(value.savedAt)
    && typeof value.serializedProgress === 'string';
}

function buildStorageFailureMessage(code: ProgressStoreSaveErrorCode | ProgressStoreLoadErrorCode): string {
  // Every code in both ProgressStoreSaveErrorCode and
  // ProgressStoreLoadErrorCode has a Spanish message here. Callers like
  // PiarHomePage.saveWithNotice and DownloadButton.runDownload simply
  // surface result.message — they do NOT need to branch on the code,
  // because every code is already mapped to user-facing copy.
  switch (code) {
    case 'quota_exceeded':
      return 'No se pudo guardar el progreso porque el almacenamiento local esta lleno.';
    case 'serialization_failed':
      return 'No se pudo preparar el progreso para guardarlo.';
    case 'private_browsing':
      return 'El almacenamiento local esta bloqueado por este navegador o por el modo privado.';
    case 'crypto_unavailable':
      return 'No se pudo cifrar el progreso porque Web Crypto no esta disponible en este navegador.';
    case 'key_unavailable':
      return 'No se pudo acceder a la llave local de cifrado en este navegador.';
    case 'encryption_failed':
      return 'No se pudo cifrar el progreso para guardarlo.';
    case 'decryption_failed':
      return 'No se pudo descifrar el progreso guardado en este navegador.';
    case 'unencrypted_data':
      return 'El progreso guardado no esta cifrado y no se cargara.';
    case 'parse_failed':
      return 'No se pudo leer el progreso guardado porque esta corrupto.';
    case 'validation_failed':
      return 'El progreso guardado no coincide con el formato esperado.';
    case 'unsupported_version':
      return 'El progreso guardado usa una version incompatible de la aplicacion.';
    case 'storage_unavailable':
      return 'El almacenamiento local no esta disponible en este navegador.';
    case 'not_found':
      return 'No se encontro progreso guardado.';
    default:
      return 'No se pudo completar la operacion de almacenamiento local.';
  }
}

function asProgressStoreCryptoSaveErrorCode(code: ProgressCryptoErrorCode): Extract<ProgressStoreSaveErrorCode, 'crypto_unavailable' | 'key_unavailable' | 'encryption_failed'> {
  if (code === 'crypto_unavailable' || code === 'key_unavailable') {
    return code;
  }

  return 'encryption_failed';
}

function asStorageErrorCode(error: unknown): ProgressStoreSaveErrorCode {
  if (error instanceof ProgressCryptoError) {
    return asProgressStoreCryptoSaveErrorCode(error.code);
  }

  if (error instanceof DOMException && error.name === 'SecurityError') {
    return 'private_browsing';
  }

  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return 'quota_exceeded';
  }

  if (error instanceof TypeError) {
    return 'serialization_failed';
  }

  return 'storage_unavailable';
}

function asStorageLoadErrorCode(error: unknown): Extract<ProgressStoreLoadErrorCode, 'private_browsing' | 'storage_unavailable' | 'crypto_unavailable' | 'key_unavailable' | 'decryption_failed'> {
  if (error instanceof ProgressCryptoError) {
    if (error.code === 'crypto_unavailable' || error.code === 'key_unavailable' || error.code === 'decryption_failed') {
      return error.code;
    }

    return 'decryption_failed';
  }

  if (error instanceof DOMException && error.name === 'SecurityError') {
    return 'private_browsing';
  }

  return 'storage_unavailable';
}

function buildLoadResultFromParsedProgress(parsedJson: unknown): ProgressStoreLoadResult {
  const parsed = parsePIARData(parsedJson);
  if (!parsed.ok) {
    const code = parsed.code === 'unsupported_version'
      ? 'unsupported_version'
      : 'validation_failed';
    return {
      ok: false,
      code,
      message: buildStorageFailureMessage(code),
    };
  }

  return {
    ok: true,
    data: parsed.data,
    warnings: parsed.warnings,
  };
}

function clearUnloadRecovery(): void {
  try {
    localStorage.removeItem(UNLOAD_RECOVERY_STORAGE_KEY);
  } catch {
    // localStorage unavailable — nothing else to do
  }
}

function readUnloadRecoveryWithStatus(): ProgressStoreLoadResult | null {
  const raw = localStorage.getItem(UNLOAD_RECOVERY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const recoveryJson = JSON.parse(raw) as unknown;
    if (!isUnloadRecoveryEnvelope(recoveryJson)) {
      clearUnloadRecovery();
      return null;
    }

    const parsedJson = JSON.parse(recoveryJson.serializedProgress) as unknown;
    const result = buildLoadResultFromParsedProgress(parsedJson);
    if (!result.ok) {
      clearUnloadRecovery();
      return null;
    }

    return result;
  } catch (error) {
    if (error instanceof SyntaxError) {
      clearUnloadRecovery();
      return null;
    }

    throw error;
  }
}

export const ProgressStore = {
  /**
   * Encrypts and persists the form data to localStorage. Returns
   * `{ ok: true }` on success or a typed failure code on every failure
   * path. Never throws — even quota errors and crypto unavailability
   * surface as result codes the caller can branch on.
   */
  async save(data: PIARFormDataV2): Promise<ProgressStoreSaveResult> {
    try {
      const envelope = buildVersionedData(data);
      const serializedEnvelope = JSON.stringify(envelope);
      const encryptedEnvelope = await encryptSerializedProgress(serializedEnvelope);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedEnvelope));
      return { ok: true, data: null };
    } catch (error) {
      const code = asStorageErrorCode(error);
      return {
        ok: false,
        code,
        message: buildStorageFailureMessage(code),
      };
    }
  },

  /**
   * Synchronous unload safety net. Writes a plaintext copy of the form
   * data to a separate localStorage slot so a `pagehide` handler can
   * persist progress even when Web Crypto cannot be awaited. Cleared
   * automatically once the next encrypted save succeeds.
   */
  saveUnloadRecovery(data: PIARFormDataV2): ProgressStoreSaveResult {
    try {
      const envelope = buildVersionedData(data);
      // why: Web Crypto + IndexedDB cannot be awaited inside a `pagehide`
      // handler — the page may die before the promise resolves. We write a
      // SYNCHRONOUS plaintext copy here as a safety net, then queue the real
      // encrypted save in the background. If the encrypted save completes,
      // `clearUnloadRecovery` runs and this slot disappears. If it doesn't,
      // the next session restores from this slot.
      const recoveryEnvelope: UnloadRecoveryEnvelope = {
        storageVersion: UNLOAD_RECOVERY_STORAGE_VERSION,
        kind: UNLOAD_RECOVERY_KIND,
        savedAt: Date.now(),
        serializedProgress: JSON.stringify(envelope),
      };

      localStorage.setItem(UNLOAD_RECOVERY_STORAGE_KEY, JSON.stringify(recoveryEnvelope));
      return { ok: true, data: null };
    } catch (error) {
      const code = asStorageErrorCode(error);
      return {
        ok: false,
        code,
        message: buildStorageFailureMessage(code),
      };
    }
  },

  /**
   * Convenience wrapper around `loadWithStatus` that drops the
   * warnings array and any failure detail. Returns `null` on every
   * failure path including `not_found`. Prefer `loadWithStatus` if you
   * need to distinguish "no draft" from "draft is corrupted."
   */
  async load(): Promise<PIARFormDataV2 | null> {
    const result = await this.loadWithStatus();
    return result.ok ? result.data : null;
  },

  /**
   * Full-detail load: tries the unload-recovery slot first, falls back
   * to the encrypted slot, decrypts, and runs the data through
   * `parsePIARData` for shape validation. Returns warnings about any
   * fields that had to be repaired during the merge so the UI can
   * surface a "we corrected N values" notice.
   */
  async loadWithStatus(): Promise<ProgressStoreLoadResult> {
    try {
      // why: check unload recovery FIRST. If the user closed the tab during a
      // save, the recovery slot has the freshest data (written synchronously
      // during pagehide) and the encrypted slot may still hold the previous
      // snapshot. Recovery wins until `usePIARAutosave` clears it after a
      // successful encrypted save catches up.
      const unloadRecovery = readUnloadRecoveryWithStatus();
      if (unloadRecovery) {
        return unloadRecovery;
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          ok: false,
          code: 'not_found',
          message: buildStorageFailureMessage('not_found'),
        };
      }

      const parsedJson = JSON.parse(raw) as unknown;
      if (!isEncryptedProgressEnvelope(parsedJson)) {
        // why: anything in the encrypted slot that is not a valid encrypted
        // envelope is rejected. Pre-encryption drafts (from before this branch
        // shipped) land here and surface as `unencrypted_data` — there is no
        // silent migration path; the user gets a clear error and can export a
        // backup before clearing.
        const code = looksLikeEncryptedProgressEnvelope(parsedJson)
          ? 'validation_failed'
          : 'unencrypted_data';
        return {
          ok: false,
          code,
          message: buildStorageFailureMessage(code),
        };
      }

      let decryptedJson: unknown;
      try {
        decryptedJson = JSON.parse(await decryptSerializedProgress(parsedJson)) as unknown;
      } catch (error) {
        const code = error instanceof SyntaxError ? 'decryption_failed' : asStorageLoadErrorCode(error);
        return {
          ok: false,
          code,
          message: buildStorageFailureMessage(code),
        };
      }

      return buildLoadResultFromParsedProgress(decryptedJson);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          ok: false,
          code: 'parse_failed',
          message: buildStorageFailureMessage('parse_failed'),
        };
      }

      return {
        ok: false,
        code: asStorageLoadErrorCode(error),
        message: buildStorageFailureMessage(asStorageLoadErrorCode(error)),
      };
    }
  },

  /** Wipes both the encrypted and unload-recovery slots. */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable — nothing else to do
    }
    clearUnloadRecovery();
  },

  /**
   * Wipes only the unload-recovery slot. Called by `usePIARAutosave`
   * after a successful encrypted save to drop the now-redundant
   * plaintext copy.
   */
  clearUnloadRecovery(): void {
    clearUnloadRecovery();
  },

  /**
   * Cheap check used by the start screen to decide whether to offer
   * the "Restaurar progreso" prompt. Returns true if EITHER slot has
   * data — does not attempt to decrypt or validate.
   */
  hasSavedData(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null
        || localStorage.getItem(UNLOAD_RECOVERY_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  },
};
