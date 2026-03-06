import { createApp } from "./app.ts";
import { appConfig } from "./config/environment.ts";
import { ModelManager } from "./domain/ai/model-manager.ts";
import { createLogger } from "./lib/logger.ts";

const bootstrapLogger = createLogger("bootstrap");

/**
 * Boots and starts the HTTP server.
 * Warms the AI ModelManager before accepting requests so the first
 * Oracle call doesn't pay the model-load penalty.
 */
export const startServer = async (): Promise<void> => {
  // Warm the sentiment model in the background — non-blocking
  // The server starts immediately; the model will be ready within seconds.
  ModelManager.getInstance()
    .then((manager) => manager.ensureWarmup())
    .then(() => bootstrapLogger.info("ai.models.ready"))
    .catch((err) => bootstrapLogger.error("ai.models.warmup.failed", { err: String(err) }));

  const app = await createApp();
  app.listen({
    hostname: appConfig.host,
    port: appConfig.port,
  });

  bootstrapLogger.info("server.started", {
    host: appConfig.host,
    port: appConfig.port,
  });
};

if (import.meta.main) {
  await startServer();
}
