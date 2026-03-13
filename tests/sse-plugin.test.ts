import { describe, expect, test } from "bun:test";
import { type SseUtils, sseUtils } from "../src/plugins/sse-plugin.ts";

/**
 * SSE Plugin unit tests.
 *
 * Tests the SSE formatting utilities in isolation without requiring
 * an Elysia server instance.
 */

const sse: SseUtils = sseUtils;

describe("ssePlugin", () => {
  test("event formats a basic named event", () => {
    const result = sse.event("status", "<div>ok</div>");
    expect(result).toBe("event: status\ndata: <div>ok</div>\n\n");
  });

  test("event preserves multi-line data", () => {
    const result = sse.event("content", "line1\nline2\nline3");
    expect(result).toBe("event: content\ndata: line1\ndata: line2\ndata: line3\n\n");
  });

  test("event includes id when provided", () => {
    const result = sse.event("msg", "hello", { id: "evt-1" });
    expect(result).toContain("id: evt-1\n");
    expect(result).toContain("event: msg\n");
    expect(result).toContain("data: hello\n\n");
  });

  test("event includes retry when provided", () => {
    const result = sse.event("msg", "data", { retry: 3000 });
    expect(result).toContain("retry: 3000\n");
  });

  test("event excludes id when empty", () => {
    const result = sse.event("msg", "x", { id: "" });
    expect(result).not.toContain("id:");
  });

  test("ping returns a comment line with timestamp", () => {
    const result = sse.ping();
    expect(result.startsWith(": ping ")).toBe(true);
    expect(result.endsWith("\n\n")).toBe(true);
  });

  test("comment returns a properly formatted SSE comment", () => {
    const result = sse.comment("debug info");
    expect(result).toBe(": debug info\n\n");
  });
});
