import { afterEach, describe, expect, test } from "bun:test";
import { createLogger, getLoggerWriteFailures } from "../src/lib/logger.ts";

/**
 * Logger tests.
 *
 * Verifies that sink failures are observed through structured telemetry
 * and do not throw from caller sites.
 */
describe("createLogger", () => {
  const originalWrite = Bun.write;

  afterEach(() => {
    Bun.write = originalWrite;
  });

  test("does not throw when stdout sink rejects", async () => {
    const previousFailures = getLoggerWriteFailures();
    Bun.write = (() => Promise.reject(new Error("stream unavailable"))) as typeof Bun.write;

    const logger = createLogger("logger.test");

    expect(() => logger.info("info log")).not.toThrow();

    await Promise.resolve();

    const failures = getLoggerWriteFailures();
    expect(failures.length).toBeGreaterThan(previousFailures.length);
    expect(failures[0]?.message).toBe("stream unavailable");
  });

  test("records stderr stream failures on error logs", async () => {
    const previousFailures = getLoggerWriteFailures();
    Bun.write = ((stream) => {
      if (stream === Bun.stderr) {
        return Promise.reject(new Error("stderr blocked"));
      }
      return Promise.resolve(0);
    }) as typeof Bun.write;

    const logger = createLogger("logger.test");

    expect(() => logger.error("error log")).not.toThrow();

    await Promise.resolve();

    const failures = getLoggerWriteFailures();
    expect(failures.length).toBeGreaterThan(previousFailures.length);
    expect(failures[0]?.stream).toBe("stderr");
    expect(failures[0]?.name).toBe("Error");
  });
});
