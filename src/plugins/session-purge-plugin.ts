/**
 * Session Purge Plugin
 *
 * Lifecycle-managed Elysia plugin that periodically purges expired game
 * sessions. Uses Elysia's `onStart`/`onStop` hooks to ensure the interval
 * is cleaned up on server shutdown.
 */
import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { gameStateStore } from "../domain/game/services/GameStateStore.ts";
import { createLogger } from "../lib/logger.ts";

const logger = createLogger("session.purge");

/**
 * Elysia plugin that starts a periodic session purge on server start
 * and clears the interval on server stop.
 */
export const sessionPurgePlugin = new Elysia({ name: "session-purge" })
  .state("purgeInterval", null as ReturnType<typeof setInterval> | null)
  .onStart(({ store }) => {
    store.purgeInterval = setInterval(() => {
      gameStateStore.purgeExpiredSessions().catch((err: unknown) => {
        logger.warn("session.purge.failed", { message: String(err) });
      });
    }, appConfig.game.sessionPurgeIntervalMs);
    logger.info("session.purge.started", {
      intervalMs: appConfig.game.sessionPurgeIntervalMs,
    });
  })
  .onStop(({ store }) => {
    if (store.purgeInterval) {
      clearInterval(store.purgeInterval);
      store.purgeInterval = null;
      logger.info("session.purge.stopped");
    }
  });
