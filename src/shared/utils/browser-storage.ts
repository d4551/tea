/**
 * Read result from localStorage access.
 */
export interface LocalStorageReadResult {
  /** Indicates localStorage read succeeded. */
  readonly ok: boolean;
  /** Optional stored value when read succeeded. */
  readonly value?: string;
}

/**
 * Write result from localStorage access.
 */
export interface LocalStorageWriteResult {
  /** Indicates localStorage write succeeded. */
  readonly ok: boolean;
}

/**
 * Reads a localStorage entry using a typed result envelope.
 *
 * @param key Storage key.
 * @returns Read result.
 */
export const readLocalStorageResult = (key: string): LocalStorageReadResult => {
  try {
    return { ok: true, value: localStorage.getItem(key) ?? undefined };
  } catch {
    return { ok: false };
  }
};

/**
 * Writes a localStorage entry using a typed result envelope.
 *
 * @param key Storage key.
 * @param value Serialized storage payload.
 * @returns Write result.
 */
export const writeLocalStorageResult = (key: string, value: string): LocalStorageWriteResult => {
  try {
    localStorage.setItem(key, value);
    return { ok: true };
  } catch {
    return { ok: false };
  }
};

/**
 * Reads a localStorage entry without leaking storage exceptions into feature code.
 *
 * @param key Storage key.
 * @returns Stored string value, or `null` when storage is unavailable.
 */
export const readLocalStorage = (key: string): string | null =>
  readLocalStorageResult(key).value ?? null;

/**
 * Writes a localStorage entry and returns `true` when write succeeds.
 *
 * @param key Storage key.
 * @param value Serialized storage payload.
 * @returns `true` when the write succeeds.
 */
export const writeLocalStorage = (key: string, value: string): boolean =>
  writeLocalStorageResult(key, value).ok;
