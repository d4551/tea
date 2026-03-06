import { Elysia } from "elysia";
import { ensureCorrelationIdHeader } from "../lib/correlation-id.ts";
import { createLogger } from "../lib/logger.ts";

/**
 * Elysia plugin that injects correlation ID and request timing metadata into context.
 */
export const requestContextPlugin = new Elysia({ name: "request-context" })
  .derive(({ request, set }) => {
    const correlationId = ensureCorrelationIdHeader(request, set.headers);

    return {
      correlationId,
      requestStartMs: performance.now(),
    };
  })
  .onAfterResponse(({ request, set, correlationId, requestStartMs }) => {
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
  });
