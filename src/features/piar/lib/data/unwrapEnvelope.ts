/**
 * Unwraps a `{ v, data }` versioned envelope down to the inner data.
 *
 * The importer layer calls this before validating the payload so the
 * underlying PIAR shape can be processed without envelope noise.
 */
/** Returns the inner data when the raw value looks like a versioned envelope. */
export function unwrapEnvelope(raw: unknown): unknown {
  if (typeof raw === 'object' && raw !== null && 'v' in raw && 'data' in raw) {
    return (raw as { v: number; data: unknown }).data;
  }
  return raw;
}
