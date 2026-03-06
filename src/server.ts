import { createApp } from "./app.ts";
import { appConfig } from "./config/environment.ts";
import { ModelManager } from "./domain/ai/model-manager.ts";
import { createLogger } from "./lib/logger.ts";

const bootstrapLogger = createLogger("bootstrap");

/**
 * Boots and starts the HTTP server.
 * Local AI warmup is opt-in because eager pipeline loading can stall
 * live request handling on Bun's main server process.
 */
export const startServer = async (): Promise<void> => {
  const app = await createApp();
  app.listen({
    hostname: appConfig.host,
    port: appConfig.port,
  });

  bootstrapLogger.info("server.started", {
    host: appConfig.host,
    port: appConfig.port,
  });

  if (!appConfig.ai.warmupOnBoot) {
    return;
  }

  ModelManager.getInstance()
    .then((manager) => manager.ensureWarmup())
    .then(() => bootstrapLogger.info("ai.models.ready"))
    .catch((err) => bootstrapLogger.error("ai.models.warmup.failed", { err: String(err) }));
};

if (import.meta.main) {
  await startServer();
}
