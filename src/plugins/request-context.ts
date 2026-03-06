import { Elysia } from "elysia";
import { ensureCorrelationIdHeader } from "../lib/correlation-id.ts";
import { createLogger } from "../lib/logger.ts";

/**
 * Elysia plugin that injects correlation ID and request timing metadata into context.
 */
export const requestContextPlugin = new Elysia({ name: "request-context" })
  .derive(({ request, set }) => {
    const correlationId = ensureCorrelationIdHeader(request, set.headers);

    // #region agent log
    const url = new URL(request.url);
    fetch("http://127.0.0.1:7824/ingest/2a1ebe22-3205-47a7-ac66-14b2478b8cbc", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f14b60" },
      body: JSON.stringify({
        sessionId: "f14b60",
        location: "request-context.ts:derive",
        message: "request.received",
        data: { method: request.method, path: url.pathname, hypothesisId: "H1,H2,H3" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return {
      correlationId,
      requestStartMs: performance.now(),
    };
  })
  .onAfterHandle(({ request, set, correlationId, requestStartMs }) => {
    const durationMs = Number((performance.now() - requestStartMs).toFixed(2));
    const url = new URL(request.url);
    const status = typeof set.status === "number" ? set.status : 200;
    const requestLogger = createLogger("http.request", correlationId);

    requestLogger.info("request.completed", {
      method: request.method,
      path: url.pathname,
      status,
      durationMs,
    });

    // #region agent log
    if (url.pathname === "/" || url.pathname === "/builder") {
      fetch("http://127.0.0.1:7824/ingest/2a1ebe22-3205-47a7-ac66-14b2478b8cbc", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f14b60" },
        body: JSON.stringify({
          sessionId: "f14b60",
          location: "request-context.ts:onAfterHandle",
          message: "request.completed.debug",
          data: { path: url.pathname, status, durationMs, hypothesisId: "H1,H2,H3,H5" },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion
  });
