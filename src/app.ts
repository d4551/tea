import { Elysia } from "elysia";
// Domain services
import { createOracleService } from "./domain/oracle/oracle-service.ts";
// Shared middleware & plugins
import { createErrorResponse } from "./plugins/error-handler.ts";
// Game
import { gamePlugin } from "./plugins/game-plugin.ts";
import { requestContextPlugin } from "./plugins/request-context.ts";
import { sessionPurgePlugin } from "./plugins/session-purge-plugin.ts";
import { staticAssetsPlugin } from "./plugins/static-assets.ts";
import { swaggerDocsPlugin } from "./plugins/swagger-docs.ts";
import { aiRoutes } from "./routes/ai-routes.ts";
import { createApiRoutes } from "./routes/api-routes.ts";
import { builderApiRoutes } from "./routes/builder-api.ts";
import { builderRoutes } from "./routes/builder-routes.ts";
import { gameRoutes } from "./routes/game-routes.ts";
// Routers
import { createPageRoutes } from "./routes/page-routes.ts";
import { contentType } from "./shared/constants/http.ts";

/**
 * Creates the fully wired Elysia application instance.
 *
 * @returns Bootstrapped application with plugins, routes, and shared middleware.
 */
export const createApp = async () => {
  const oracleService = createOracleService();

  return (
    new Elysia()
      // Global context (correlation ID, timing)
      .use(requestContextPlugin)

      // Global error handler
      .onError(({ code, error, request, set }) => {
        // #region agent log
        const url = new URL(request.url);
        fetch("http://127.0.0.1:7824/ingest/2a1ebe22-3205-47a7-ac66-14b2478b8cbc", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f14b60" },
          body: JSON.stringify({
            sessionId: "f14b60",
            location: "app.ts:onError",
            message: "request.error",
            data: { code, error: String(error), path: url.pathname, hypothesisId: "H3,H5" },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        const errorResponse = createErrorResponse(
          code,
          error instanceof Error ? error : new Error(String(error)),
          request,
          set.headers,
        );
        set.status = errorResponse.status;
        return errorResponse.payload;
      })
      .onAfterHandle(({ responseValue, set }) => {
        if (typeof responseValue === "string") {
          set.headers["content-type"] = contentType.htmlUtf8;
        }
      })

      // API Documentation
      .use(swaggerDocsPlugin)

      // Static file serving (public bundle output, mounted media assets, plugin pack)
      .use(staticAssetsPlugin)

      // Presentation / View Routes
      .use(createPageRoutes(oracleService))
      .use(gameRoutes)

      // Data / Feature API Routes
      .use(createApiRoutes(oracleService))

      // AI Provider Management & Generation Routes
      .use(aiRoutes)

      // Server-Authoritative Game Engine Routes (WebSocket + SSE + REST)
      .use(gamePlugin)

      // Game Builder Dashboard (HTMX pages + CRUD API)
      .use(builderRoutes)
      .use(builderApiRoutes)

      // Session purge lifecycle (onStart/onStop managed)
      .use(sessionPurgePlugin)
  );
};
