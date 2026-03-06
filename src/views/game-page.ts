import { appConfig, type LocaleCode } from "../config/environment.ts";
import { appRoutes, interpolateRoutePath, withQueryParameters } from "../shared/constants/routes.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { escapeHtml, renderLayout } from "./layout.ts";

/**
 * Props for the playable runtime page.
 */
interface PlayableGamePageProps {
  readonly state: "playable";
  readonly locale: LocaleCode;
  readonly sessionId: string;
  readonly projectId?: string;
  readonly sceneTitle: string;
  readonly sceneMode?: "2d" | "3d";
  readonly activeQuestTitle?: string;
  readonly resumeToken: string;
  readonly resumeTokenExpiresAtMs: number;
  readonly commandQueueDepth: number;
  readonly version: number;
  readonly clientRuntimeConfig: {
    readonly commandSendIntervalMs: number;
    readonly commandTtlMs: number;
    readonly socketReconnectDelayMs: number;
    readonly restoreRequestTimeoutMs: number;
    readonly restoreMaxAttempts: number;
  };
}

/**
 * Props for non-playable project states.
 */
interface InactiveGamePageProps {
  readonly state: "missing-project" | "unpublished-project";
  readonly locale: LocaleCode;
  readonly projectId: string;
}

/**
 * Game page props.
 */
export type GamePageProps = PlayableGamePageProps | InactiveGamePageProps;

const renderInactiveState = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  state: InactiveGamePageProps["state"],
): string => {
  const builderHref = withQueryParameters(appRoutes.builder, {
    lang: locale,
    projectId,
  });
  const title =
    state === "missing-project"
      ? messages.game.projectUnavailableTitle
      : messages.game.projectUnpublishedTitle;
  const description =
    state === "missing-project"
      ? messages.game.projectUnavailableDescription
      : messages.game.projectUnpublishedDescription;

  return `<section class="mx-auto grid max-w-3xl gap-6 pt-8">
    <article class="card card-border bg-base-100 shadow-xl">
      <div class="card-body gap-4">
        <span class="badge badge-warning badge-soft w-max">${escapeHtml(messages.game.publishedProjectLabel)}</span>
        <h1 class="card-title text-3xl">${escapeHtml(title)}</h1>
        <p class="text-base-content/75">${escapeHtml(description)}</p>
        <div class="rounded-box bg-base-200/70 p-4 font-mono text-sm">${escapeHtml(projectId)}</div>
        <div class="card-actions justify-end">
          <a href="${escapeHtml(builderHref)}" class="btn btn-primary">${escapeHtml(messages.game.returnToBuilder)}</a>
        </div>
      </div>
    </article>
  </section>`;
};

/**
 * Renders the full-page game view with PixiJS canvas and SSE-driven HUD.
 *
 * @param props Page inputs.
 * @returns Full HTML document string.
 */
export function GamePage(props: GamePageProps) {
  const messages: Messages = getMessages(props.locale);
  if (props.state !== "playable") {
    const currentPathWithQuery = withQueryParameters(appRoutes.game, {
      lang: props.locale,
      projectId: props.projectId,
    });

    return renderLayout({
      locale: props.locale,
      title: messages.navigation.game,
      messages,
      activeRoute: "game",
      currentPathWithQuery,
      body: renderInactiveState(messages, props.locale, props.projectId, props.state),
    });
  }

  const {
    sessionId,
    projectId,
    sceneTitle,
    sceneMode,
    activeQuestTitle,
    resumeToken,
    resumeTokenExpiresAtMs,
    commandQueueDepth,
    version,
    locale,
    clientRuntimeConfig,
  } = props;
  const currentPathWithQuery = withQueryParameters(appRoutes.game, {
    sessionId,
    projectId,
  });
  const gameHudStreamPath = interpolateRoutePath(appRoutes.gameApiSessionHud, { id: sessionId });
  const homePath = withQueryParameters(appRoutes.home, { lang: locale });
  const builderHref = withQueryParameters(appRoutes.builder, { lang: locale, projectId });
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
    <meta name="game-client-renderer-preference" data-game-client-renderer-preference="${escapeHtml(appConfig.playableGame.rendererPreference)}" />
    <div class="flex h-screen w-full flex-col bg-base-300 font-serif">
      <nav class="navbar absolute top-0 z-50 w-full border-b border-base-200 bg-base-100/90 shadow-sm backdrop-blur" role="navigation" aria-label="${escapeHtml(messages.common.primaryNavigation)}">
        <div class="flex-1 px-4">
          <a href="${escapeHtml(homePath)}" class="btn btn-ghost text-xl" aria-label="${escapeHtml(messages.metadata.appName)}">
            <span class="mr-2 text-2xl" aria-hidden="true">🍃</span> ${escapeHtml(messages.metadata.appName)}
          </a>
        </div>
        <div class="flex-none gap-2 px-4">
          <a href="${escapeHtml(builderHref)}" class="btn btn-outline btn-sm">${escapeHtml(messages.game.builderReturn)}</a>
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
            class="alert alert-warning alert-soft hidden max-w-xs px-2 py-1"
            role="status"
            aria-live="polite"
          >
            <span id="game-connection-alert-text" class="text-xs">${escapeHtml(messages.game.connectionStatus)}</span>
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

      <main class="relative flex flex-1 items-center justify-center overflow-hidden pt-20" id="main-content">
        <div class="grid w-full max-w-7xl gap-6 px-4 pb-6 lg:grid-cols-[0.82fr_0.18fr]">
          <div class="relative aspect-video overflow-hidden rounded-xl border border-base-content/20 bg-black shadow-2xl">
            <div id="game-canvas-wrapper" class="absolute inset-0 h-full w-full cursor-none" role="img" aria-label="${escapeHtml(messages.game.gameCanvasLabel)}">
            </div>

            <div
              class="pointer-events-none absolute inset-0 flex flex-col justify-between p-6"
              hx-ext="sse"
              sse-connect="${escapeHtml(gameHudStreamPath)}"
            >
              <div class="flex justify-between items-start pt-2">
                <div id="hud-scene" sse-swap="scene-title" hx-swap="outerHTML" aria-live="polite" role="status" class="pointer-events-auto rounded-full border border-base-content/10 bg-base-100/80 px-6 py-2 text-lg font-bold shadow backdrop-blur">
                  ${escapeHtml(messages.game.connectingToRealm)}
                </div>
              </div>

              <div class="flex w-full justify-center pb-8">
                <div
                  id="hud-dialogue"
                  data-hud-slot="hud-dialogue"
                  sse-swap="dialogue"
                  hx-swap="outerHTML"
                  aria-live="polite"
                  role="log"
                  class="hidden w-full max-w-2xl pointer-events-auto transform opacity-0 transition-all duration-300 scale-95"
                >
                </div>
              </div>
            </div>
          </div>

          <aside class="space-y-4">
            <article class="card card-border bg-base-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.objectiveTitle)}</h2>
                <p class="text-sm text-base-content/75">${escapeHtml(activeQuestTitle ?? messages.game.objectiveDescription)}</p>
                <div class="grid gap-2 text-sm">
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.sceneLabel)}</span>
                    <span class="font-medium">${escapeHtml(sceneTitle)}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.builder.sceneModeLabel)}</span>
                    <span class="font-medium">${escapeHtml(sceneMode === "3d" ? messages.builder.sceneMode3d : messages.builder.sceneMode2d)}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.projectLabel)}</span>
                    <span class="font-mono text-xs">${escapeHtml(projectId ?? messages.game.connectionMissing)}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.sessionIdLabel)}</span>
                    <span class="font-mono text-xs">${escapeHtml(sessionId)}</span>
                  </div>
                </div>
              </div>
            </article>
            <article class="card card-border bg-base-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.sessionContextTitle)}</h2>
                <div class="flex flex-wrap gap-2">
                  <span class="badge badge-outline">${escapeHtml(messages.game.queueLabel)}: ${commandQueueDepth}</span>
                  <span class="badge badge-soft">${escapeHtml(messages.game.publishedProjectLabel)}</span>
                  <span class="badge badge-ghost">${escapeHtml(locale)}</span>
                </div>
              </div>
            </article>
            <article class="card card-border bg-base-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.controlsTitle)}</h2>
                <ul class="space-y-2 text-sm">
                  <li>${escapeHtml(messages.game.controlsMove)}</li>
                  <li>${escapeHtml(messages.game.controlsInteract)}</li>
                  <li>${escapeHtml(messages.game.controlsAdvance)}</li>
                </ul>
              </div>
            </article>
          </aside>
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
