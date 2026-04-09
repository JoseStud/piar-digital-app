import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { buildPIARDataEnvelope } from '@piar-digital-app/features/piar/lib/portable/piar-envelope';

export const UNLOAD_RECOVERY_KIND = 'piar-progress-unload-recovery';
export const UNLOAD_RECOVERY_STORAGE_VERSION = 1;

export interface UnloadRecoveryEnvelope {
  storageVersion: typeof UNLOAD_RECOVERY_STORAGE_VERSION;
  kind: typeof UNLOAD_RECOVERY_KIND;
  savedAt: number;
  serializedProgress: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function buildSerializedPIARProgress(data: PIARFormDataV2): string {
  return JSON.stringify(buildPIARDataEnvelope(data));
}

export function buildUnloadRecoveryEnvelope(data: PIARFormDataV2): UnloadRecoveryEnvelope {
  return {
    storageVersion: UNLOAD_RECOVERY_STORAGE_VERSION,
    kind: UNLOAD_RECOVERY_KIND,
    savedAt: Date.now(),
    serializedProgress: buildSerializedPIARProgress(data),
  };
}

export function isUnloadRecoveryEnvelope(value: unknown): value is UnloadRecoveryEnvelope {
  return isRecord(value)
    && value.storageVersion === UNLOAD_RECOVERY_STORAGE_VERSION
    && value.kind === UNLOAD_RECOVERY_KIND
    && typeof value.savedAt === 'number'
    && Number.isFinite(value.savedAt)
    && typeof value.serializedProgress === 'string';
}
