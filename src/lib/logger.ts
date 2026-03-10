/**
 * Primitive JSON-compatible value.
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Nested JSON-like object structure.
 */
export interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}

/**
 * Any JSON-compatible value used for structured logging payloads.
 */
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];

/**
 * Available log levels.
 */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

/**
 * Public logger contract.
 */
export interface StructuredLogger {
  /**
   * Emits a debug log.
   */
  readonly debug: (message: string, data?: JsonObject) => void;
  /**
   * Emits an info log.
   */
  readonly info: (message: string, data?: JsonObject) => void;
  /**
   * Emits a warning log.
   */
  readonly warn: (message: string, data?: JsonObject) => void;
  /**
   * Emits an error log.
   */
  readonly error: (message: string, data?: JsonObject) => void;
}

/**
 * Creates a module-scoped structured logger.
 *
 * @param moduleName Logical module name for log attribution.
 * @param correlationId Optional request correlation identifier.
 * @returns Logger instance.
 */
export const createLogger = (
  moduleName: string,
  correlationId: string | null = null,
): StructuredLogger => {
  const emit = (level: LogLevel, message: string, data?: JsonObject): void => {
    const payload: JsonObject = {
      timestamp: new Date().toISOString(),
      level,
      module: moduleName,
      message,
      correlationId,
    };

    if (data) {
      const merged: JsonObject = {
        ...payload,
        data,
      };
      writeToStream(level, merged);
      return;
    }

    writeToStream(level, payload);
  };

  return {
    debug: (message, data) => emit("DEBUG", message, data),
    info: (message, data) => emit("INFO", message, data),
    warn: (message, data) => emit("WARN", message, data),
    error: (message, data) => emit("ERROR", message, data),
  };
};

const writeToStream = (level: LogLevel, payload: JsonObject): void => {
  const serialized = `${JSON.stringify(payload)}\n`;
  const bytes = new TextEncoder().encode(serialized);
  if (level === "ERROR") {
    writeToBunStderr(bytes);
    return;
  }

  writeToBunStdout(bytes);
};

const writeToBunStdout = (bytes: Uint8Array): boolean => {
  return writeToBunStream("stdout", bytes);
};

const writeToBunStderr = (bytes: Uint8Array): boolean => {
  return writeToBunStream("stderr", bytes);
};

type LoggerWriteFailure = {
  readonly stream: "stderr" | "stdout";
  readonly name: string;
  readonly message: string;
  readonly timestamp: string;
};

const maxLoggerWriteFailures = 5;
const loggerWriteFailures: LoggerWriteFailure[] = [];

const recordLoggerWriteFailure = (stream: "stderr" | "stdout", error: unknown): void => {
  const normalized = normalizeError(error);
  loggerWriteFailures.unshift({
    stream,
    name: normalized.name,
    message: normalized.message,
    timestamp: new Date().toISOString(),
  });
  loggerWriteFailures.length = Math.min(loggerWriteFailures.length, maxLoggerWriteFailures);
};

const normalizeError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

const writeToBunStream = (stream: "stderr" | "stdout", bytes: Uint8Array): boolean => {
  if (typeof Bun === "undefined" || typeof Bun.write !== "function") {
    return false;
  }

  const target = stream === "stdout" ? Bun.stdout : Bun.stderr;

  void Bun.write(target as never, bytes).then(
    () => true,
    (error: unknown) => {
      recordLoggerWriteFailure(stream, error);
      return false;
    },
  );
  return true;
};

/**
 * Returns recent logger sink errors for diagnostics.
 *
 * @returns A bounded list of recent sink failures.
 */
export const getLoggerWriteFailures = (): readonly LoggerWriteFailure[] => [...loggerWriteFailures];
