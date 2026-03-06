/**
 * Reads a localStorage entry without leaking storage exceptions into feature code.
 *
 * @param key Storage key.
 * @returns Stored string value, or `null` when storage is unavailable.
 */
export const readLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Writes a localStorage entry without leaking storage exceptions into feature code.
 *
 * @param key Storage key.
 * @param value Serialized storage payload.
 * @returns `true` when the write succeeds.
 */
export const writeLocalStorage = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};
