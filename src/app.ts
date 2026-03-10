import { Elysia } from "elysia";
// Domain services
import { createOracleService } from "./domain/oracle/oracle-service.ts";
// Shared middleware & plugins
import { aiProviderPlugin } from "./plugins/ai-provider-plugin.ts";
import { creatorWorkerPlugin } from "./plugins/creator-worker-plugin.ts";
import { createErrorResponse } from "./plugins/error-handler.ts";
// Game
import { gamePlugin } from "./plugins/game-plugin.ts";
import { openApiDocsPlugin } from "./plugins/openapi-docs.ts";
import { requestContextPlugin } from "./plugins/request-context.ts";
import { sessionPurgePlugin } from "./plugins/session-purge-plugin.ts";
import { staticAssetsPlugin } from "./plugins/static-assets.ts";
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
        const errorResponse = createErrorResponse(
          code,
          error instanceof Error ? error : new Error(String(error)),
          request,
          set.headers,
        );
        set.status = errorResponse.status;
        return errorResponse.payload;
      })
      .onAfterHandle(({ responseValue, request, set }) => {
        if (typeof responseValue === "string") {
          const acceptHeader = request.headers.get("accept");
          const hasExplicitContentType =
            typeof set.headers["content-type"] === "string" ||
            typeof set.headers["Content-Type"] === "string";
          const wantsHtml =
            acceptHeader === null ||
            acceptHeader.includes("text/html") ||
            acceptHeader.includes("application/xhtml+xml");
          if (hasExplicitContentType || !wantsHtml) {
            return;
          }
          set.headers["content-type"] = contentType.htmlUtf8;
        }
      })

      // API Documentation
      .use(openApiDocsPlugin)

      // Static file serving (public bundle output, mounted media assets, plugin pack)
      .use(staticAssetsPlugin)

      // Presentation / View Routes
      .use(createPageRoutes(oracleService))
      .use(gameRoutes)

      // Data / Feature API Routes
      .use(createApiRoutes(oracleService))

      // AI Provider Management & Generation Routes
      .use(aiRoutes)

      // AI provider lifecycle (boot, periodic refresh, shutdown cleanup)
      .use(aiProviderPlugin)

      // Server-Authoritative Game Engine Routes (WebSocket + SSE + REST)
      .use(gamePlugin)

      // Game Builder Dashboard (HTMX pages + CRUD API)
      .use(builderRoutes)
      .use(builderApiRoutes)

      // Session purge lifecycle (onStart/onStop managed)
      .use(sessionPurgePlugin)

      // Builder generation + automation lifecycle (onStart/onStop managed)
      .use(creatorWorkerPlugin)
  );
};
