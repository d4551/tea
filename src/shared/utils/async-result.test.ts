import { describe, expect, test } from "bun:test";
import { readJsonResponse, settleAsync, toError } from "./async-result.ts";

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
});
