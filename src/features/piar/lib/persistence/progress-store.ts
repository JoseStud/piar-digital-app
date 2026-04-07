import { PIAR_DATA_VERSION, PIARFormDataV2 } from '@/features/piar/model/piar';
import {
  parsePIARData,
  type PIARImportWarning,
} from '@/features/piar/lib/portable/piar-import';

const STORAGE_KEY = 'piar-form-progress';

export type ProgressStoreSaveErrorCode =
  | 'storage_unavailable'
  | 'quota_exceeded'
  | 'serialization_failed'
  | 'private_browsing';
export type ProgressStoreLoadErrorCode =
  | 'private_browsing'
  | 'storage_unavailable'
  | 'not_found'
  | 'parse_failed'
  | 'validation_failed'
  | 'unsupported_version';

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

function buildStorageFailureMessage(code: ProgressStoreSaveErrorCode | ProgressStoreLoadErrorCode): string {
  switch (code) {
    case 'quota_exceeded':
      return 'No se pudo guardar el progreso porque el almacenamiento local esta lleno.';
    case 'serialization_failed':
      return 'No se pudo preparar el progreso para guardarlo.';
    case 'private_browsing':
      return 'El almacenamiento local esta bloqueado por este navegador o por el modo privado.';
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

function asStorageErrorCode(error: unknown): ProgressStoreSaveErrorCode {
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

function asStorageLoadErrorCode(error: unknown): Extract<ProgressStoreLoadErrorCode, 'private_browsing' | 'storage_unavailable'> {
  if (error instanceof DOMException && error.name === 'SecurityError') {
    return 'private_browsing';
  }

  return 'storage_unavailable';
}

export const ProgressStore = {
  save(data: PIARFormDataV2): ProgressStoreSaveResult {
    try {
      const envelope: VersionedData = { v: PIAR_DATA_VERSION, data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
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

  load(): PIARFormDataV2 | null {
    const result = this.loadWithStatus();
    return result.ok ? result.data : null;
  },

  loadWithStatus(): ProgressStoreLoadResult {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          ok: false,
          code: 'not_found',
          message: buildStorageFailureMessage('not_found'),
        };
      }

      const parsedJson = JSON.parse(raw) as unknown;
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

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable — nothing else to do
    }
  },

  hasSavedData(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  },
};
