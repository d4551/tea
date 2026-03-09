import { describe, expect, test } from "bun:test";
import { LocalModelRuntimeHealth } from "./model-runtime-health.ts";

describe("local model runtime health", () => {
  test("opens the circuit after the configured failure threshold", () => {
    const health = new LocalModelRuntimeHealth({
      circuitBreakerThreshold: 2,
      cooldownMs: 500,
    });

    health.recordFailure(
      {
        code: "unexpected",
        message: "first",
        retryable: false,
        operation: "oracle.generate",
      },
      1_000,
    );
    const snapshot = health.recordFailure(
      {
        code: "unexpected",
        message: "second",
        retryable: false,
        operation: "oracle.generate",
      },
      1_000,
    );

    expect(snapshot.consecutiveFailures).toBe(2);
    expect(snapshot.circuitOpenUntilMs).toBe(1_500);
    expect(health.isCircuitOpen(1_400)).toBe(true);
    expect(health.isCircuitOpen(1_500)).toBe(false);
  });

  test("does not extend the cooldown when recording circuit-open failures", () => {
    const health = new LocalModelRuntimeHealth({
      circuitBreakerThreshold: 1,
      cooldownMs: 750,
    });

    health.recordFailure(
      {
        code: "unexpected",
        message: "load failed",
        retryable: true,
        operation: "pipeline.load",
      },
      500,
    );
    const snapshot = health.recordFailure(
      {
        code: "circuit-open",
        message: "cooldown active",
        retryable: true,
        operation: "pipeline.load",
      },
      900,
    );

    expect(snapshot.consecutiveFailures).toBe(1);
    expect(snapshot.circuitOpenUntilMs).toBe(1_250);
  });

  test("resets failure state after success", () => {
    const health = new LocalModelRuntimeHealth({
      circuitBreakerThreshold: 1,
      cooldownMs: 250,
    });

    health.recordFailure(
      {
        code: "unexpected",
        message: "load failed",
        retryable: false,
        operation: "pipeline.load",
      },
      200,
    );
    health.markSuccess();

    expect(health.snapshot()).toEqual({
      consecutiveFailures: 0,
      circuitOpenUntilMs: 0,
    });
  });
});
