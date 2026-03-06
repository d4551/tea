import { appConfig, type LocaleCode } from "../config/environment.ts";
import { appRoutes, interpolateRoutePath, withLocaleQuery } from "../shared/constants/routes.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { escapeHtml, renderLayout } from "./layout.ts";

/**
 * Renders the full-page game view with PixiJS canvas and SSE-driven HUD.
 *
 * @param props Page inputs.
 * @returns Full HTML document string.
 */
export function GamePage(props: {
  locale: LocaleCode;
  sessionId: string;
  resumeToken: string;
  resumeTokenExpiresAtMs: number;
  commandQueueDepth: number;
  version: number;
  clientRuntimeConfig: {
    readonly commandSendIntervalMs: number;
    readonly commandTtlMs: number;
    readonly socketReconnectDelayMs: number;
    readonly restoreRequestTimeoutMs: number;
    readonly restoreMaxAttempts: number;
  };
}) {
  const messages: Messages = getMessages(props.locale);
  const {
    sessionId,
    resumeToken,
    resumeTokenExpiresAtMs,
    commandQueueDepth,
    version,
    locale,
    clientRuntimeConfig,
  } = props;
  const currentPathWithQuery = `${appRoutes.game}?sessionId=${encodeURIComponent(sessionId)}`;
  const gameHudStreamPath = interpolateRoutePath(appRoutes.gameApiSessionHud, { id: sessionId });
  const homePath = withLocaleQuery(appRoutes.home, locale);
  const pageScripts = [
    {
      src: appConfig.playableGame.clientScriptPath,
      type: "module" as const,
    },
  ] as const;

  const content = `
    <meta name="game-session-id" data-session-id="${escapeHtml(sessionId)}" />
    <meta name="game-session-resume-token" data-session-resume-token="${escapeHtml(resumeToken)}" />
    <meta name="game-session-locale" data-game-session-locale="${escapeHtml(locale)}" />
    <meta name="game-session-resume-expires-at-ms" data-game-session-resume-expires-at-ms="${escapeHtml(String(resumeTokenExpiresAtMs))}" />
    <meta name="game-session-command-queue-depth" data-game-session-command-queue-depth="${commandQueueDepth}" />
    <meta name="game-session-version" data-game-session-version="${version}" />
    <meta name="game-client-command-send-interval-ms" data-game-client-command-send-interval-ms="${escapeHtml(String(clientRuntimeConfig.commandSendIntervalMs))}" />
    <meta name="game-client-command-ttl-ms" data-game-client-command-ttl-ms="${escapeHtml(String(clientRuntimeConfig.commandTtlMs))}" />
    <meta name="game-client-socket-reconnect-delay-ms" data-game-client-socket-reconnect-delay-ms="${escapeHtml(String(clientRuntimeConfig.socketReconnectDelayMs))}" />
    <meta name="game-client-restore-request-timeout-ms" data-game-client-restore-request-timeout-ms="${escapeHtml(String(clientRuntimeConfig.restoreRequestTimeoutMs))}" />
    <meta name="game-client-restore-max-attempts" data-game-client-restore-max-attempts="${escapeHtml(String(clientRuntimeConfig.restoreMaxAttempts))}" />
    <div class="w-full h-screen bg-base-300 flex flex-col font-serif">
      <nav class="navbar bg-base-100/90 backdrop-blur border-b border-base-200 z-50 absolute top-0 w-full shadow-sm" role="navigation" aria-label="${escapeHtml(messages.common.primaryNavigation)}">
        <div class="flex-1 px-4">
          <a href="${escapeHtml(homePath)}" class="btn btn-ghost text-xl" aria-label="${escapeHtml(messages.metadata.appName)}">
            <span class="text-2xl mr-2" aria-hidden="true">🍃</span> ${escapeHtml(messages.metadata.appName)}
          </a>
        </div>
        <div class="flex-none gap-2 px-4">
          <span id="game-session-meta" class="hidden"
            data-session-id="${escapeHtml(sessionId)}"
            data-resume-token="${escapeHtml(resumeToken)}"
            data-command-queue-depth="${commandQueueDepth}"
            data-version="${version}"
            data-locale="${escapeHtml(locale)}"
            role="status" aria-live="polite">
          </span>
          <span
            id="game-connection-status"
            class="badge badge-neutral badge-sm"
            aria-label="${escapeHtml(messages.game.connectionStatus)}"
            data-connecting-label="${escapeHtml(messages.game.connectionStatus)}"
            data-connected-label="${escapeHtml(messages.game.connectionConnected)}"
            data-disconnected-prefix="${escapeHtml(messages.game.connectionDisconnected)}"
            data-reconnecting-label="${escapeHtml(messages.game.connectionReconnecting)}"
            data-expired-label="${escapeHtml(messages.game.connectionExpired)}"
            data-missing-label="${escapeHtml(messages.game.connectionMissing)}"
          >${escapeHtml(messages.game.connectionStatus)}</span>
          <span
            id="game-command-queue"
            class="badge badge-outline badge-sm"
            aria-label="${escapeHtml(messages.game.queueLabel)}"
            data-queue-label="${escapeHtml(messages.game.queueLabel)}"
          >${escapeHtml(messages.game.queueLabel)}: ${commandQueueDepth}</span>
          <button
            id="game-reconnect"
            type="button"
            class="btn btn-xs btn-warning hidden"
            data-reconnect-label="${escapeHtml(messages.game.reconnectAction)}"
          >${escapeHtml(messages.game.reconnectAction)}</button>
          <div
            id="game-connection-alert"
            class="alert alert-warning alert-soft hidden max-w-xs py-1 px-2"
            role="status"
            aria-live="polite"
          >
            <span id="game-connection-alert-text" class="text-xs">${escapeHtml(
              messages.game.connectionStatus,
            )}</span>
          </div>
          <div
            id="hud-xp"
            data-hud-slot="hud-xp"
            sse-swap="xp"
            hx-swap="outerHTML"
            data-xp-label="${escapeHtml(messages.game.xpLabel)}"
            data-level-label="${escapeHtml(messages.game.levelLabel)}"
            class="badge badge-primary badge-lg px-4 shadow-sm"
            aria-live="polite"
            role="status"
          >${escapeHtml(messages.game.initialXp)}</div>
        </div>
      </nav>

      <main class="flex-1 overflow-hidden relative flex items-center justify-center pt-16" id="main-content">
        <div class="relative w-full max-w-5xl aspect-video bg-black shadow-2xl overflow-hidden rounded-xl border border-base-content/20">

          <div id="game-canvas-wrapper" class="absolute inset-0 w-full h-full cursor-none" role="img" aria-label="${escapeHtml(messages.game.gameCanvasLabel)}">
            <!-- PixiJS v8 app is spawned here by game-client.ts -->
          </div>

          <div
            class="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between"
            hx-ext="sse"
            sse-connect="${escapeHtml(gameHudStreamPath)}"
          >

            <div class="flex justify-between items-start pt-2">
              <div id="hud-scene" sse-swap="scene-title" hx-swap="outerHTML" aria-live="polite" role="status" class="px-6 py-2 bg-base-100/80 backdrop-blur rounded-full shadow border border-base-content/10 font-bold text-lg pointer-events-auto">
                ${escapeHtml(messages.game.connectingToRealm)}
              </div>
            </div>

            <div class="w-full flex justify-center pb-8">
              <div
                id="hud-dialogue"
                data-hud-slot="hud-dialogue"
                sse-swap="dialogue"
                hx-swap="outerHTML"
                aria-live="polite"
                role="log"
                class="hidden max-w-2xl w-full pointer-events-auto transition-all duration-300 transform scale-95 opacity-0"
              >
                <!-- Dialogue injected here via SSE -->
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  `;

  return renderLayout({
    locale,
    title: messages.navigation.game,
    messages,
    activeRoute: "game",
    currentPathWithQuery,
    body: content,
    scripts: pageScripts,
  });
}
