import { describe, expect, test } from "bun:test";
import { readJsonResponse, resultFromSync, settleAsync, toError } from "./async-result.ts";

describe("async-result", () => {
  test("returns resolved values in a typed success envelope", async () => {
    const result = await settleAsync(Promise.resolve("ready"));

    expect(result).toEqual({
      ok: true,
      value: "ready",
    });
  });

  test("normalizes rejected values into Error instances", async () => {
    const result = await settleAsync(Promise.reject("unreachable"));

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected failed async result.");
    }

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe("unreachable");
  });

  test("returns a failed result when response JSON cannot be parsed", async () => {
    const response = new Response("{", {
      headers: {
        "content-type": "application/json",
      },
    });

    const result = await readJsonResponse<{ readonly ok: boolean }>(response);

    expect(result.ok).toBe(false);
  });

  test("passes through existing Error instances", () => {
    const error = new Error("boom");

    expect(toError(error)).toBe(error);
  });

  test("resultFromSync returns success for non-throwing functions", () => {
    const result = resultFromSync(() => 42);

    expect(result).toEqual({ ok: true, value: 42 });
  });

  test("resultFromSync normalizes thrown values into Error instances", () => {
    const result = resultFromSync(() => {
      throw "oops";
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected failed sync result.");
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe("oops");
  });
});
