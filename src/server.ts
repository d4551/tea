import { createApp } from "./app.ts";
import { assertStartupReadiness } from "./bootstrap/preflight.ts";
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
  await assertStartupReadiness();
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

  void (async () => {
    // SAFETY: AI model warmup crosses into ONNX runtime FFI and may fail on missing native deps.
    try {
      const manager = await ModelManager.getInstance();
      await manager.ensureWarmup();
      bootstrapLogger.info("ai.models.ready");
    } catch (err: unknown) {
      bootstrapLogger.error("ai.models.warmup.failed", { err: String(err) });
    }
  })();
};

if (import.meta.main) {
  await startServer();
}
