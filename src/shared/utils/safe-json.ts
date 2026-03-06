/**
 * Safe JSON parsing and URL decoding utilities.
 *
 * Centralises all exception-boundary logic into a single file so
 * the rest of the codebase stays try/catch-free.
 */

/**
 * Parses a JSON string, returning `fallback` on invalid input.
 *
 * @param source Raw JSON string.
 * @param fallback Value returned when parsing fails.
 * @returns Parsed value or fallback.
 */
// SAFETY: JSON.parse is the sole standard API that throws on invalid input.
// This is the single, centralised catch boundary for the entire codebase.
export const safeJsonParse = <T>(source: string, fallback: T): T => {
  try {
    return JSON.parse(source) as T;
  } catch {
    return fallback;
  }
};

/**
 * Safely decodes a URI component, returning the raw value on failure.
 *
 * @param value Encoded URI component string.
 * @returns Decoded string, or original value if decoding fails.
 */
// SAFETY: decodeURIComponent throws on malformed percent-encoding.
export const safeDecodeUri = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
