export function unwrapEnvelope(raw: unknown): unknown {
  if (typeof raw === 'object' && raw !== null && 'v' in raw && 'data' in raw) {
    return (raw as { v: number; data: unknown }).data;
  }
  return raw;
}
