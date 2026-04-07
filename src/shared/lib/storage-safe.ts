/**
 * Safe localStorage utilities that never throw.
 * Returns null/false on failure (quota exceeded, private browsing, unavailable).
 */

/**
 * Safely get a value from localStorage.
 * @returns The stored value, or null if not found or unavailable.
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely set a value in localStorage.
 * @returns true if successful, false if storage is unavailable or quota exceeded.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely remove a value from localStorage.
 * @returns true if successful (or key didn't exist), false if storage unavailable.
 */
export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
