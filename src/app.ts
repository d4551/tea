import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { appConfig } from "./config/environment.ts";
// Domain services
import { createOracleService } from "./domain/oracle/oracle-service.ts";
// Shared middleware & plugins
import { aiContextPlugin } from "./plugins/ai-context.ts";
import { createErrorResponse } from "./plugins/error-handler.ts";
// Game
import { gamePlugin } from "./plugins/game-plugin.ts";
import { requestContextPlugin } from "./plugins/request-context.ts";
import { sessionPurgePlugin } from "./plugins/session-purge-plugin.ts";
import { swaggerDocsPlugin } from "./plugins/swagger-docs.ts";
import { aiRoutes } from "./routes/ai-routes.ts";
import { createApiRoutes } from "./routes/api-routes.ts";
import { builderApiRoutes } from "./routes/builder-api.ts";
import { builderRoutes } from "./routes/builder-routes.ts";
import { gameRoutes } from "./routes/game-routes.ts";
// Routers
import { createPageRoutes } from "./routes/page-routes.ts";
import { contentType } from "./shared/constants/http.ts";

export const createApp = async () => {
  const oracleService = createOracleService();

  return (
    new Elysia()
      // Global context (correlation ID, timing)
      .use(requestContextPlugin)

      // AI model manager — injected as `ai` on every request context
      .use(aiContextPlugin)

      // Global error handler
      .onError(({ code, error, request, set }) => {
        const errorResponse = createErrorResponse(
          code,
          error as Error,
          request,
          set.headers as Record<string, string>,
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
      .use(
        staticPlugin({
          assets: appConfig.staticAssets.publicDirectory,
          prefix: appConfig.staticAssets.publicPrefix,
        }),
      )
      .use(
        staticPlugin({
          assets: appConfig.staticAssets.assetsDirectory,
          prefix: appConfig.staticAssets.assetsPrefix,
        }),
      )
      .use(
        staticPlugin({
          assets: appConfig.playableGame.sourceDirectory,
          prefix: appConfig.playableGame.assetPrefix,
        }),
      )
      .use(
        staticPlugin({
          assets: appConfig.staticAssets.rmmzPackDirectory,
          prefix: appConfig.staticAssets.rmmzPackPrefix,
        }),
      )

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
