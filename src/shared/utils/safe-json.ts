/**
 * Safe JSON parsing and URL decoding utilities.
 *
 * Centralises all exception-boundary logic into a single file.
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
    return JSON.parse(source);
  } catch {
    return fallback;
  }
};

/**
 * Safely decodes a URI component with tolerant percent-sequence handling.
 *
 * @param value Encoded URI component string.
 * @returns Decoded string with malformed percent escapes normalized.
 */
export const safeDecodeUri = (value: string): string => {
  const safeValue = value.replace(/%(?![0-9A-Fa-f]{2})/g, "%25");
  const encoder = new TextEncoder();
  const bytes = new Uint8Array(safeValue.length * 3);
  let byteIndex = 0;

  for (let index = 0; index < safeValue.length; index++) {
    const char = safeValue[index];
    if (char !== "%") {
      const encoded = encoder.encode(char);
      bytes.set(encoded, byteIndex);
      byteIndex += encoded.length;
      continue;
    }

    const hex = safeValue.slice(index + 1, index + 3);
    if (hex.length === 2 && /^[0-9A-Fa-f]{2}$/.test(hex)) {
      bytes[byteIndex] = Number.parseInt(hex, 16);
      byteIndex += 1;
      index += 2;
      continue;
    }

    const encoded = encoder.encode(char);
    bytes.set(encoded, byteIndex);
    byteIndex += encoded.length;
  }

  const decoder = new TextDecoder("utf-8", { fatal: false });
  return decoder.decode(bytes.slice(0, byteIndex));
};
