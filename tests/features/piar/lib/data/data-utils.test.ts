/** Tests for the data-utils merge helpers. */
import { describe, it, expect } from 'vitest';
import { mergeRecord } from '@piar-digital-app/features/piar/lib/data/data-utils/mergeHelpers';

describe('mergeRecord', () => {
  it('merges valid boolean and null values', () => {
    const defaults = { a: null, b: true, c: false } as Record<string, boolean | null>;
    const parsed = { a: true, b: false };
    const result = mergeRecord(parsed, defaults);
    expect(result).toEqual({ a: true, b: false, c: false });
  });

  it('ignores __proto__ key to prevent prototype pollution', () => {
    const defaults = { safe: null } as Record<string, boolean | null>;
    const malicious = { safe: true, __proto__: { polluted: true } } as unknown as Record<string, boolean | null>;
    const result = mergeRecord(malicious, defaults);
    expect(result).toEqual({ safe: true });
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
    // Verify prototype was not polluted
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('ignores constructor key to prevent prototype pollution', () => {
    const defaults = { safe: null } as Record<string, boolean | null>;
    const malicious = { safe: true, constructor: true } as unknown as Record<string, boolean | null>;
    const result = mergeRecord(malicious, defaults);
    expect(result).toEqual({ safe: true });
  });

  it('ignores prototype key to prevent prototype pollution', () => {
    const defaults = { safe: null } as Record<string, boolean | null>;
    const malicious = { safe: true, prototype: true } as unknown as Record<string, boolean | null>;
    const result = mergeRecord(malicious, defaults);
    expect(result).toEqual({ safe: true });
  });
});
