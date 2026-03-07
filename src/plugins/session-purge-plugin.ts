import { appConfig } from "../config/environment.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { createLogger } from "../lib/logger.ts";
import { createManagedPollingPlugin } from "./managed-polling-plugin.ts";

const logger = createLogger("session.purge");

/**
 * Elysia plugin that starts a periodic session purge on server start
 * and clears the interval on server stop.
 */
export const sessionPurgePlugin = createManagedPollingPlugin({
  name: "session-purge",
  loggerModule: "session.purge",
  intervalMs: appConfig.game.sessionPurgeIntervalMs,
  startedEvent: "session.purge.started",
  stoppedEvent: "session.purge.stopped",
  failedEvent: "session.purge.failed",
  run: async () => gameLoop.purgeExpiredSessions(),
  onSuccess: (purgedCount) => {
    if (purgedCount > 0) {
      logger.info("session.purge.drained", {
        purgedCount,
      });
    }
  },
});
