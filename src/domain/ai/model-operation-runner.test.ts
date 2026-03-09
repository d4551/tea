import { describe, expect, test } from "bun:test";
import { runLocalModelOperation, toLocalModelFailure } from "./model-operation-runner.ts";

describe("local model operation runner", () => {
  test("maps timeout failures to the timeout code", () => {
    const failure = toLocalModelFailure({
      error: new Error("pipeline.load timed out after 100ms"),
      operation: "pipeline.load",
      modelKey: "oracle",
    });

    expect(failure.code).toBe("timeout");
    expect(failure.retryable).toBe(true);
  });

  test("maps invalid payloads through validation", async () => {
    const result = await runLocalModelOperation({
      operation: "oracle.generate",
      modelKey: "oracle",
      timeoutMs: 100,
      execute: async () => "",
      validate: (value) => value.length > 0,
      invalidMessage: "invalid",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.failure.code).toBe("invalid-output");
  });
});
