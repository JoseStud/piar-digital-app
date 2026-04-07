import type {
  ActaActividad,
  AjusteRazonableRow,
  DocenteSignature,
  EntornoSaludRow,
} from '@/features/piar/model/piar';

export type DeepPartial<T> =
  T extends readonly (infer U)[]
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export function mergeEntornoSaludRow(
  parsed: DeepPartial<EntornoSaludRow> | undefined,
  defaultRow: EntornoSaludRow,
): EntornoSaludRow {
  return { ...defaultRow, ...(parsed ?? {}) };
}

export function mergeAjusteRow(
  parsed: DeepPartial<AjusteRazonableRow> | undefined,
  defaultRow: AjusteRazonableRow,
): AjusteRazonableRow {
  return { ...defaultRow, ...(parsed ?? {}) };
}

export function mergeDocenteSignature(
  parsed: DeepPartial<DocenteSignature> | undefined,
  defaultSig: DocenteSignature,
): DocenteSignature {
  return { ...defaultSig, ...(parsed ?? {}) };
}

export function mergeActaActividad(
  parsed: DeepPartial<ActaActividad> | undefined,
  defaultAct: ActaActividad,
): ActaActividad {
  return { ...defaultAct, ...(parsed ?? {}) };
}

// Keys that could cause prototype pollution if assigned directly
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function mergeRecord(
  parsed: Record<string, boolean | null | undefined> | undefined,
  defaults: Record<string, boolean | null>,
): Record<string, boolean | null> {
  const merged = { ...defaults };

  for (const [key, value] of Object.entries(parsed ?? {})) {
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }
    if (typeof value === 'boolean' || value === null) {
      merged[key] = value;
    }
  }

  return merged;
}
