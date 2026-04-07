import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
} from '@piar-digital-app/shared/lib/storage-safe';

describe('storage-safe utilities', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('safeLocalStorageGet', () => {
    it('returns stored value', () => {
      mockStorage['test-key'] = 'test-value';
      expect(safeLocalStorageGet('test-key')).toBe('test-value');
    });

    it('returns null for missing key', () => {
      expect(safeLocalStorageGet('missing')).toBeNull();
    });

    it('returns null when localStorage throws', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });
      expect(safeLocalStorageGet('any')).toBeNull();
    });
  });

  describe('safeLocalStorageSet', () => {
    it('stores value and returns true', () => {
      expect(safeLocalStorageSet('key', 'value')).toBe(true);
      expect(mockStorage['key']).toBe('value');
    });

    it('returns false when localStorage throws', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });
      expect(safeLocalStorageSet('key', 'value')).toBe(false);
    });
  });

  describe('safeLocalStorageRemove', () => {
    it('removes value and returns true', () => {
      mockStorage['key'] = 'value';
      expect(safeLocalStorageRemove('key')).toBe(true);
      expect(mockStorage['key']).toBeUndefined();
    });

    it('returns true even for missing key', () => {
      expect(safeLocalStorageRemove('missing')).toBe(true);
    });

    it('returns false when localStorage throws', () => {
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      expect(safeLocalStorageRemove('key')).toBe(false);
    });
  });
});
