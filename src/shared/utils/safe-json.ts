import type { Prisma } from "@prisma/client";

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
type JsonParseCursor = {
  readonly text: string;
  index: number;
};

type JsonValueResult =
  | { readonly success: true; readonly value: unknown; readonly nextIndex: number }
  | { readonly success: false };

const isWhitespace = (char: string): boolean =>
  char === " " || char === "\n" || char === "\t" || char === "\r" || char === "\f" || char === "\b";

const parseJsonValue = (cursor: JsonParseCursor): JsonValueResult => {
  const text = cursor.text;
  while (cursor.index < text.length && isWhitespace(text.charAt(cursor.index))) {
    cursor.index += 1;
  }
  if (cursor.index >= text.length) {
    return { success: false };
  }

  const char = text.charAt(cursor.index);
  if (char === "{") {
    return parseJsonObject(cursor);
  }
  if (char === "[") {
    return parseJsonArray(cursor);
  }
  if (char === `"`) {
    return parseJsonString(cursor);
  }
  if (char === "-") {
    return parseJsonNumber(cursor);
  }
  if (char >= "0" && char <= "9") {
    return parseJsonNumber(cursor);
  }
  if (char === "t") {
    return parseJsonLiteral(cursor, "true", true);
  }
  if (char === "f") {
    return parseJsonLiteral(cursor, "false", false);
  }
  if (char === "n") {
    return parseJsonLiteral(cursor, "null", null);
  }

  return { success: false };
};

const parseJsonLiteral = <T>(
  cursor: JsonParseCursor,
  literal: string,
  value: T,
): JsonValueResult => {
  const text = cursor.text;
  if (!text.startsWith(literal, cursor.index)) {
    return { success: false };
  }

  cursor.index += literal.length;
  return { success: true, value, nextIndex: cursor.index };
};

const parseJsonString = (cursor: JsonParseCursor): JsonValueResult => {
  const text = cursor.text;
  if (text.charAt(cursor.index) !== `"`) {
    return { success: false };
  }
  cursor.index += 1;

  let result = "";
  while (cursor.index < text.length) {
    const char = text.charAt(cursor.index);
    if (char === `"`) {
      cursor.index += 1;
      return { success: true, value: result, nextIndex: cursor.index };
    }

    if (char.charCodeAt(0) <= 0x1f) {
      return { success: false };
    }
    if (char !== "\\") {
      result += char;
      cursor.index += 1;
      continue;
    }

    const escapeStart = cursor.index + 1;
    if (escapeStart >= text.length) {
      return { success: false };
    }

    const escapeChar = text.charAt(escapeStart);
    cursor.index = escapeStart + 1;
    if (escapeChar === `"`) {
      result += `"`;
      continue;
    }
    if (escapeChar === `\\`) {
      result += `\\`;
      continue;
    }
    if (escapeChar === "/") {
      result += "/";
      continue;
    }
    if (escapeChar === "b") {
      result += "\b";
      continue;
    }
    if (escapeChar === "f") {
      result += "\f";
      continue;
    }
    if (escapeChar === "n") {
      result += "\n";
      continue;
    }
    if (escapeChar === "r") {
      result += "\r";
      continue;
    }
    if (escapeChar === "t") {
      result += "\t";
      continue;
    }
    if (escapeChar === "u") {
      const codeHex = text.slice(cursor.index + 1, cursor.index + 5);
      if (codeHex.length !== 4 || !/^[0-9a-fA-F]{4}$/u.test(codeHex)) {
        return { success: false };
      }
      const codePoint = Number.parseInt(codeHex, 16);
      if (Number.isNaN(codePoint)) {
        return { success: false };
      }
      result += String.fromCodePoint(codePoint);
      cursor.index += 5;
      continue;
    }

    return { success: false };
  }

  return { success: false };
};

const parseJsonNumber = (cursor: JsonParseCursor): JsonValueResult => {
  const text = cursor.text;
  const start = cursor.index;

  if (text.charAt(cursor.index) === "-") {
    cursor.index += 1;
  }

  if (cursor.index >= text.length) {
    return { success: false };
  }

  const firstDigit = text.charAt(cursor.index);
  if (firstDigit === "0") {
    cursor.index += 1;
  } else if (firstDigit >= "1" && firstDigit <= "9") {
    while (cursor.index < text.length) {
      const next = text.charAt(cursor.index);
      if (next >= "0" && next <= "9") {
        cursor.index += 1;
      } else {
        break;
      }
    }
  } else {
    return { success: false };
  }

  if (text.charAt(cursor.index) === ".") {
    cursor.index += 1;
    if (cursor.index >= text.length) {
      return { success: false };
    }

    const firstFractionDigit = text.charAt(cursor.index);
    if (!(firstFractionDigit >= "0" && firstFractionDigit <= "9")) {
      return { success: false };
    }
    while (cursor.index < text.length) {
      const next = text.charAt(cursor.index);
      if (next >= "0" && next <= "9") {
        cursor.index += 1;
      } else {
        break;
      }
    }
  }

  const exponent = text.charAt(cursor.index);
  if (exponent === "e" || exponent === "E") {
    cursor.index += 1;
    if (cursor.index >= text.length) {
      return { success: false };
    }
    const exponentSign = text.charAt(cursor.index);
    if (exponentSign === "+" || exponentSign === "-") {
      cursor.index += 1;
    }
    if (cursor.index >= text.length) {
      return { success: false };
    }

    const firstExponentDigit = text.charAt(cursor.index);
    if (!(firstExponentDigit >= "0" && firstExponentDigit <= "9")) {
      return { success: false };
    }
    while (cursor.index < text.length) {
      const next = text.charAt(cursor.index);
      if (next >= "0" && next <= "9") {
        cursor.index += 1;
      } else {
        break;
      }
    }
  }

  const raw = text.slice(start, cursor.index);
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    return { success: false };
  }

  return { success: true, value: parsed, nextIndex: cursor.index };
};

const parseJsonArray = (cursor: JsonParseCursor): JsonValueResult => {
  const text = cursor.text;
  if (text.charAt(cursor.index) !== "[") {
    return { success: false };
  }
  cursor.index += 1;

  const entries: unknown[] = [];
  while (cursor.index < text.length) {
    while (cursor.index < text.length && isWhitespace(text.charAt(cursor.index))) {
      cursor.index += 1;
    }
    if (cursor.index >= text.length) {
      return { success: false };
    }

    if (text.charAt(cursor.index) === "]") {
      cursor.index += 1;
      return { success: true, value: entries, nextIndex: cursor.index };
    }

    const entry = parseJsonValue(cursor);
    if (!entry.success) {
      return { success: false };
    }
    entries.push(entry.value);
    cursor.index = entry.nextIndex;

    while (cursor.index < text.length && isWhitespace(text.charAt(cursor.index))) {
      cursor.index += 1;
    }
    if (cursor.index >= text.length) {
      return { success: false };
    }

    if (text.charAt(cursor.index) === "]") {
      cursor.index += 1;
      return { success: true, value: entries, nextIndex: cursor.index };
    }

    if (text.charAt(cursor.index) !== ",") {
      return { success: false };
    }
    cursor.index += 1;
  }

  return { success: false };
};

const parseJsonObject = (cursor: JsonParseCursor): JsonValueResult => {
  const text = cursor.text;
  if (text.charAt(cursor.index) !== "{") {
    return { success: false };
  }
  cursor.index += 1;

  const entries: Record<string, unknown> = {};
  while (cursor.index < text.length) {
    while (cursor.index < text.length && isWhitespace(text.charAt(cursor.index))) {
      cursor.index += 1;
    }
    if (cursor.index >= text.length) {
      return { success: false };
    }

    if (text.charAt(cursor.index) === "}") {
      cursor.index += 1;
      return { success: true, value: entries, nextIndex: cursor.index };
    }

    const keyResult = parseJsonString(cursor);
    if (!keyResult.success || typeof keyResult.value !== "string") {
      return { success: false };
    }

    while (cursor.index < text.length && isWhitespace(text.charAt(cursor.index))) {
      cursor.index += 1;
    }
    if (cursor.index >= text.length || text.charAt(cursor.index) !== ":") {
      return { success: false };
    }
    cursor.index += 1;

    const valueResult = parseJsonValue(cursor);
    if (!valueResult.success) {
      return { success: false };
    }

    entries[keyResult.value] = valueResult.value;
    cursor.index = valueResult.nextIndex;

    while (cursor.index < text.length && isWhitespace(text.charAt(cursor.index))) {
      cursor.index += 1;
    }
    if (cursor.index >= text.length) {
      return { success: false };
    }

    if (text.charAt(cursor.index) === "}") {
      cursor.index += 1;
      return { success: true, value: entries, nextIndex: cursor.index };
    }

    if (text.charAt(cursor.index) !== ",") {
      return { success: false };
    }
    cursor.index += 1;
  }

  return { success: false };
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Validator that accepts any parsed value. Use only when the result is consumed as unknown
 * or validated separately. Never use for typed results without explicit structure validation.
 * @deprecated Prefer explicit validators for each payload shape. For truly unbounded fallback
 * scenarios, use `(value): value is unknown => true`.
 */
export const acceptUnknown = (value: unknown): value is unknown => true;

const isInputJsonValueArray = (value: readonly unknown[]): value is Prisma.InputJsonValue[] =>
  value.every(isInputJsonValue);

const isInputJsonValueObject = (value: unknown): value is Record<string, Prisma.InputJsonValue> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(isInputJsonValue);

export const isInputJsonValue = (value: unknown): value is Prisma.InputJsonValue =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  (Array.isArray(value) && isInputJsonValueArray(value)) ||
  isInputJsonValueObject(value);

const readJsonParseResult = (source: string): unknown | null => {
  const cursor: JsonParseCursor = {
    text: source.trim(),
    index: 0,
  };

  const root = parseJsonValue(cursor);
  if (!root.success) {
    return null;
  }

  let index = root.nextIndex;
  while (index < cursor.text.length && isWhitespace(cursor.text.charAt(index))) {
    index += 1;
  }
  if (index !== cursor.text.length) {
    return null;
  }

  return root.value;
};

// SAFETY: Central JSON parser with explicit structural failures returns fallback for malformed payloads.
// Callers MUST pass an explicit validator. Use acceptUnknown when accepting any JSON as unknown.
export const safeJsonParse = <T>(
  source: string,
  fallback: T,
  isExpected: (value: unknown) => value is T,
): T => {
  const parsed = readJsonParseResult(source);
  if (parsed === null || !isExpected(parsed)) {
    return fallback;
  }
  return parsed;
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
