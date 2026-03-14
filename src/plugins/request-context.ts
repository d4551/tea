import { Elysia } from "elysia";
import { ensureCorrelationIdHeader } from "../lib/correlation-id.ts";
import { createLogger } from "../lib/logger.ts";
import { httpStatus } from "../shared/constants/http.ts";
import { resolveRequestPathname } from "../shared/constants/routes.ts";

/**
 * Elysia plugin that injects request-scoped correlation and timing metadata.
 */
export const requestScopedContextPlugin = new Elysia({ name: "request-scoped-context" }).derive(
  { as: "scoped" },
  ({ request, set }) => {
    const correlationId = ensureCorrelationIdHeader(request, set.headers);

    return {
      correlationId,
      requestStartMs: performance.now(),
    };
  },
);

/**
 * Elysia plugin that emits structured request completion logs.
 */
export const requestLoggingPlugin = new Elysia({ name: "request-logging" })
  .use(requestScopedContextPlugin)
  .onAfterHandle(({ request, set, correlationId, requestStartMs }) => {
    const durationMs = Number((performance.now() - requestStartMs).toFixed(2));
    const status = typeof set.status === "number" ? set.status : httpStatus.ok;
    const requestLogger = createLogger("http.request", correlationId);

    requestLogger.info("request.completed", {
      method: request.method,
      path: resolveRequestPathname(request),
      status,
      durationMs,
    });
  });

/**
 * Elysia plugin that composes request-scoped context derivation and request logging.
 */
export const requestContextPlugin = new Elysia({ name: "request-context" })
  .use(requestScopedContextPlugin)
  .use(requestLoggingPlugin);
