import { afterEach, describe, expect, test } from "bun:test";
import {
  createLogger,
  getLoggerWriteFailures,
  toJsonObject,
  toJsonValue,
} from "../src/lib/logger.ts";

/**
 * Logger tests.
 *
 * Verifies that sink failures are observed through structured telemetry
 * and do not throw from caller sites.
 */
describe("createLogger", () => {
  const originalStdoutWrite = Bun.stdout.write;
  const originalStderrWrite = Bun.stderr.write;

  afterEach(() => {
    Bun.stdout.write = originalStdoutWrite;
    Bun.stderr.write = originalStderrWrite;
  });

  test("normalizes nested unknown values into JSON-safe logger payloads", () => {
    const normalized = toJsonObject({
      finite: 42,
      infinite: Number.POSITIVE_INFINITY,
      nested: {
        ok: true,
        list: [1, new Date("2026-03-14T00:00:00.000Z")],
      },
    });

    expect(normalized.finite).toBe(42);
    expect(normalized.infinite).toBe("Infinity");
    expect(normalized.nested).toEqual({
      ok: true,
      list: [1, "2026-03-14T00:00:00.000Z"],
    });
  });

  test("serializes Error instances into structured JSON values", () => {
    const error = new Error("boom");
    error.name = "ExampleError";

    const normalized = toJsonValue(error);

    expect(normalized).toMatchObject({
      name: "ExampleError",
      message: "boom",
    });
  });

  test("does not throw when stdout sink rejects", async () => {
    const previousFailures = getLoggerWriteFailures();
    const writeFails: typeof Bun.stdout.write = () =>
      Promise.reject(new Error("stream unavailable"));
    Bun.stdout.write = writeFails;

    const logger = createLogger("logger.test");

    expect(() => logger.info("info log")).not.toThrow();

    await Promise.resolve();

    const failures = getLoggerWriteFailures();
    expect(failures.length).toBeGreaterThan(previousFailures.length);
    expect(failures[0]?.message).toBe("stream unavailable");
  });

  test("records stderr stream failures on error logs", async () => {
    const previousFailures = getLoggerWriteFailures();
    const writeWithConditionalFailure: typeof Bun.stderr.write = () => {
      return Promise.reject(new Error("stderr blocked"));
    };
    Bun.stderr.write = writeWithConditionalFailure;

    const logger = createLogger("logger.test");

    expect(() => logger.error("error log")).not.toThrow();

    await Promise.resolve();

    const failures = getLoggerWriteFailures();
    expect(failures.length).toBeGreaterThan(previousFailures.length);
    expect(failures[0]?.stream).toBe("stderr");
    expect(failures[0]?.name).toBe("Error");
  });
});
