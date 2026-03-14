import { appConfig, type LocaleCode } from "../config/environment.ts";
import { joinUrlPath } from "../shared/constants/assets.ts";

type PageScript = {
  readonly src: string;
  readonly type?: "module";
};
import {
  appRoutes,
  interpolateRoutePath,
  withLocaleQuery,
  withQueryParameters,
} from "../shared/constants/routes.ts";
import type {
  GameSessionParticipant,
  GameSessionParticipantRole,
} from "../shared/contracts/game.ts";
import {
  type GameClientBootstrapData,
  serializeGameClientBootstrap,
} from "../shared/contracts/game-client-bootstrap.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { escapeHtml, type LayoutContext, renderDocument } from "./layout.ts";
import { spinnerClasses } from "./shared/ui-components.ts";

/**
 * Props for the playable runtime page.
 */
interface PlayableGamePageProps {
  readonly state: "playable";
  readonly locale: LocaleCode;
  readonly sessionId: string;
  readonly participantSessionId: string;
  readonly projectId?: string;
  readonly sceneTitle: string;
  readonly sceneMode?: "2d" | "3d";
  readonly activeQuestTitle?: string;
  readonly resumeToken: string;
  readonly resumeTokenExpiresAtMs: number;
  readonly commandQueueDepth: number;
  readonly version: number;
  readonly participantRole: GameSessionParticipantRole;
  readonly participants: readonly GameSessionParticipant[];
  readonly clientRuntimeConfig: GameClientBootstrapData["runtime"];
  /** Request origin for absolute SSE/WS URLs; uses appConfig.appOrigin when omitted. */
  readonly appOrigin?: string;
}

/**
 * Props for non-playable project states.
 */
interface InactiveGamePageProps {
  readonly state:
    | "missing-project"
    | "unpublished-project"
    | "invalid-invite"
    | "session-unavailable";
  readonly locale: LocaleCode;
  readonly projectId?: string;
}

/**
 * Game page props.
 */
export type GamePageProps = PlayableGamePageProps | InactiveGamePageProps;

const resolveLocaleDisplayName = (messages: Messages, locale: LocaleCode): string =>
  locale === "zh-CN"
    ? messages.navigation.localeNameChinese
    : messages.navigation.localeNameEnglish;

const resolveParticipantRoleLabel = (
  messages: Messages,
  role: GameSessionParticipantRole,
): string =>
  role === "owner"
    ? messages.game.participantRoleOwner
    : role === "controller"
      ? messages.game.participantRoleController
      : messages.game.participantRoleSpectator;

const renderInactiveState = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string | undefined,
  state: InactiveGamePageProps["state"],
): string => {
  const builderHref = withQueryParameters(appRoutes.builder, {
    lang: locale,
    projectId,
  });
  const title =
    state === "invalid-invite"
      ? messages.game.invalidInviteTitle
      : state === "session-unavailable"
        ? messages.game.sessionUnavailableTitle
        : state === "missing-project"
          ? messages.game.projectUnavailableTitle
          : messages.game.projectUnpublishedTitle;
  const description =
    state === "invalid-invite"
      ? messages.game.invalidInviteDescription
      : state === "session-unavailable"
        ? messages.game.sessionUnavailableDescription
        : state === "missing-project"
          ? messages.game.projectUnavailableDescription
          : messages.game.projectUnpublishedDescription;

  return `<section class="hero min-h-[60vh] rounded-box bg-base-200" aria-label="${escapeHtml(title)}">
    <div class="hero-content text-center">
      <div class="max-w-lg">
        <div class="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-warning/40 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.692-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <div class="alert alert-soft alert-warning mb-6 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4m0 4h.01"/><circle cx="12" cy="12" r="10"/></svg>
          <span>${escapeHtml(messages.pages.home.activityEmptyTitle)}</span>
        </div>
        <span class="badge badge-warning badge-soft mb-3">${escapeHtml(messages.game.publishedProjectLabel)}</span>
        <h1 class="text-3xl font-bold tracking-tight">${escapeHtml(title)}</h1>
        <p class="text-base-content/75 py-4">${escapeHtml(description)}</p>
        ${
          projectId
            ? `<div class="rounded-box bg-base-300/50 p-4 font-mono text-sm mb-4">${escapeHtml(projectId)}</div>`
            : ""
        }
        <a href="${escapeHtml(builderHref)}" class="btn btn-primary" aria-label="${escapeHtml(messages.game.returnToBuilder)}">${escapeHtml(messages.game.returnToBuilder)}</a>
      </div>
    </div>
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
    const layout: LayoutContext = {
      locale: props.locale,
      messages,
      activeRoute: "game",
      currentPathWithQuery,
      persistentProjectId: props.projectId,
    };

    return renderDocument(
      layout,
      messages.navigation.game,
      renderInactiveState(messages, props.locale, props.projectId, props.state),
    );
  }

  const {
    sessionId,
    participantSessionId,
    projectId,
    sceneTitle,
    sceneMode,
    activeQuestTitle,
    resumeToken,
    resumeTokenExpiresAtMs,
    commandQueueDepth,
    version,
    participantRole,
    participants,
    locale,
    clientRuntimeConfig,
  } = props;
  const currentPathWithQuery = withQueryParameters(appRoutes.game, {
    lang: locale,
    sessionId,
    projectId,
  });
  const layout: LayoutContext = {
    locale,
    messages,
    activeRoute: "game",
    currentPathWithQuery,
    persistentProjectId: projectId,
    hideTopBar: true,
    hideFooter: true,
  };
  const gameHudStreamPath = interpolateRoutePath(appRoutes.gameApiSessionHud, { id: sessionId });
  const origin = props.appOrigin ?? appConfig.appOrigin;
  const gameHudStreamBaseUrl =
    gameHudStreamPath.startsWith("/") && origin
      ? `${origin.replace(/\/$/, "")}${gameHudStreamPath}`
      : gameHudStreamPath;
  const gameHudStreamUrl = withQueryParameters(gameHudStreamBaseUrl, { locale });
  const builderHref = withQueryParameters(appRoutes.builder, { lang: locale, projectId });
  const inviteAction = interpolateRoutePath(appRoutes.gameApiSessionInvite, { id: sessionId });
  const saveSlotAction = interpolateRoutePath(appRoutes.gameApiSessionSaveSlot, { id: sessionId });
  const saveSlotsAction = interpolateRoutePath(appRoutes.gameApiSessionSaveSlots, {
    id: sessionId,
  });
  const _restoreSlotAction = interpolateRoutePath(appRoutes.gameApiSessionRestoreSlot, {
    id: sessionId,
  });
  const clientBootstrap: GameClientBootstrapData = {
    session: {
      sessionId,
      participantSessionId,
      resumeToken,
      locale,
      resumeTokenExpiresAtMs,
      commandQueueDepth,
      version,
      participantRole,
    },
    runtime: {
      ...clientRuntimeConfig,
      rendererPreference: appConfig.playableGame.rendererPreference,
    },
  };
  const pageScripts: readonly PageScript[] = [
    {
      src: appConfig.playableGame.clientScriptPath,
      type: "module",
    },
    {
      src: joinUrlPath(appConfig.staticAssets.publicPrefix, "js/game-sse-error.js"),
      type: "module",
    },
    {
      src: joinUrlPath(appConfig.staticAssets.publicPrefix, "js/game-modal-focus.js"),
      type: "module",
    },
    {
      src: joinUrlPath(appConfig.staticAssets.publicPrefix, "js/game-key-bindings.js"),
      type: "module",
    },
  ];

  const content = `
    <script id="game-client-bootstrap" type="application/json">${serializeGameClientBootstrap(clientBootstrap)}</script>
    <div class="game-page-grid gap-5 font-serif stagger-children animate-fade-in-up" hx-boost="false" hx-ext="sse" sse-connect="${escapeHtml(gameHudStreamUrl)}" data-sse-url="${escapeHtml(gameHudStreamUrl)}" data-builder-href="${escapeHtml(builderHref)}" data-back-to-builder-label="${escapeHtml(messages.game.builderReturn)}" data-connecting-to-realm="${escapeHtml(messages.game.connectingToRealm)}">
      <!-- Game Header Bar -->
      <header class="bg-base-200 card shadow">
        <div class="card-body p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3 min-w-0 shrink" role="group" aria-label="${escapeHtml(messages.game.sceneLabel)}">
            <div class="rounded-lg w-10 h-10 flex items-center justify-center bg-primary/15 text-primary shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            </div>
            <div class="min-w-0">
              <h1
                id="game-scene-title-heading"
                sse-swap="scene-title-heading"
                hx-swap="outerHTML"
                class="text-heading-2 font-bold tracking-tight truncate"
              >${escapeHtml(sceneTitle)}</h1>
              <p
                id="game-objective-summary"
                sse-swap="objective-summary"
                hx-swap="outerHTML"
                class="text-sm text-base-content/60 truncate"
              >${escapeHtml(activeQuestTitle ?? messages.game.objectiveDescription)}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-4 lg:gap-6">
            <div class="flex gap-2" role="group" aria-label="${escapeHtml(messages.builder.title)}">
              <a href="${escapeHtml(builderHref)}" class="btn btn-outline btn-sm gap-2" aria-label="${escapeHtml(messages.game.builderReturn)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                <span class="hidden sm:inline">${escapeHtml(messages.game.builderReturn)}</span>
              </a>
              <button type="button" class="btn btn-ghost btn-sm gap-2" data-modal-trigger="key_bindings_modal" aria-label="${escapeHtml(messages.game.keyBindingsTitle)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-1.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h1.09a1.65 1.65 0 001-1.51 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v1.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-1.09a1.65 1.65 0 00-1.51 1z"/></svg>
                <span class="hidden sm:inline">${escapeHtml(messages.game.keyBindingsTitle)}</span>
              </button>
            ${
              participantRole === "owner"
                ? `
              <button type="button" class="btn btn-ghost btn-sm gap-2" data-modal-trigger="save_slot_modal" aria-label="${escapeHtml(messages.game.saveAction)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span class="hidden sm:inline">${escapeHtml(messages.game.saveAction)}</span>
              </button>
              <button type="button" class="btn btn-ghost btn-sm gap-2" data-modal-trigger="load_slot_modal" aria-label="${escapeHtml(messages.game.loadAction)}">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span class="hidden sm:inline">${escapeHtml(messages.game.loadAction)}</span>
              </button>
            `
                : ""
            }
            </div>
            <div class="flex items-center gap-2 flex-wrap" role="group" aria-label="${escapeHtml(messages.game.connectionStatus)}">
            <span id="game-session-meta" class="hidden"
              data-session-id="${escapeHtml(sessionId)}"
              data-participant-session-id="${escapeHtml(participantSessionId)}"
              data-resume-token="${escapeHtml(resumeToken)}"
              data-command-queue-depth="${commandQueueDepth}"
              data-version="${version}"
              data-locale="${escapeHtml(locale)}"
              role="status" aria-live="polite">
            </span>
            <div
              id="game-connection-status"
              class="flex items-center gap-2 rounded-box bg-base-200 px-3 py-2 text-sm"
              aria-label="${escapeHtml(messages.game.connectionStatus)}"
              data-connecting-label="${escapeHtml(messages.game.connectionStatus)}"
              data-connected-label="${escapeHtml(messages.game.connectionConnected)}"
              data-disconnected-prefix="${escapeHtml(messages.game.connectionDisconnected)}"
              data-reconnecting-label="${escapeHtml(messages.game.connectionReconnecting)}"
              data-expired-label="${escapeHtml(messages.game.connectionExpired)}"
              data-missing-label="${escapeHtml(messages.game.connectionMissing)}"
              role="status"
              aria-live="polite"
            >
              <span id="game-connection-indicator" class="status status-warning status-sm status-ping"></span>
              <span id="game-connection-status-text">${escapeHtml(messages.game.connectionStatus)}</span>
            </div>
            <span
              id="game-command-queue"
              class="badge badge-outline badge-sm gap-1"
              aria-label="${escapeHtml(messages.game.queueLabel)}"
              data-queue-label="${escapeHtml(messages.game.queueLabel)}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              ${commandQueueDepth}
            </span>
            <button
              id="game-reconnect"
              type="button"
              class="btn btn-xs btn-warning hidden gap-1"
              aria-label="${escapeHtml(messages.game.reconnectAction)}"
              data-reconnect-label="${escapeHtml(messages.game.reconnectAction)}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              ${escapeHtml(messages.game.reconnectAction)}
            </button>
            <div
              id="hud-xp"
              data-hud-slot="hud-xp"
              sse-swap="xp"
              hx-swap="outerHTML"
              data-xp-label="${escapeHtml(messages.game.xpLabel)}"
              data-level-label="${escapeHtml(messages.game.levelLabel)}"
              class="badge badge-primary badge-lg px-4 shadow-md gap-1"
              aria-live="polite"
              role="status"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${escapeHtml(messages.game.initialXp)}
            </div>
            </div>
          </div>
        </div>
        <div
          id="game-connection-alert"
          class="hidden border-t border-base-300/50 bg-warning/10 px-4 py-2 text-sm"
          role="alert"
          aria-live="polite"
        >
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-warning shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span id="game-connection-alert-text">${escapeHtml(messages.game.connectionStatus)}</span>
          </div>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-[0.82fr_0.18fr]" aria-label="${escapeHtml(messages.game.runtimeSurfaceLabel)}">
          <div class="relative aspect-video overflow-hidden rounded-xl border border-base-content/20 bg-black shadow-2xl">
            <div
              id="game-canvas-wrapper"
              class="absolute inset-0 h-full w-full cursor-auto outline-none data-[runtime-active=true]:cursor-none"
              tabindex="0"
              aria-label="${escapeHtml(messages.game.runtimeSurfaceLabel)}"
              aria-describedby="game-runtime-help game-controls-list"
              data-runtime-active="false"
              data-runtime-focus-active-label="${escapeHtml(messages.game.runtimeSurfaceActive)}"
              data-runtime-focus-inactive-label="${escapeHtml(messages.game.runtimeSurfaceInactive)}"
              data-spectator-control-denied-label="${escapeHtml(messages.game.spectatorControlDenied)}"
            ></div>

            <div
              class="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 backdrop-blur-sm"
            >
              <div class="flex justify-between items-start pt-2">
                <div id="hud-scene" sse-swap="scene-badge" hx-swap="outerHTML" aria-live="polite" role="status" class="pointer-events-auto rounded-full border border-base-content/10 bg-base-100/80 backdrop-blur-sm px-6 py-2 text-lg font-bold shadow">
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

                <div
                  id="hud-combat"
                  data-hud-slot="hud-combat"
                  sse-swap="combat"
                  hx-swap="outerHTML"
                  aria-live="polite"
                  role="log"
                  class="hidden w-full max-w-4xl pointer-events-auto transform opacity-0 transition-all duration-300 scale-95"
                >
                </div>

                <div
                  id="hud-inventory"
                  data-hud-slot="hud-inventory"
                  sse-swap="inventory"
                  hx-swap="outerHTML"
                  aria-live="polite"
                  role="region"
                  class="hidden w-full max-w-3xl pointer-events-auto transform opacity-0 transition-all duration-300 scale-95"
                >
                </div>

                <div
                  id="hud-cutscene"
                  data-hud-slot="hud-cutscene"
                  sse-swap="cutscene"
                  hx-swap="outerHTML"
                  aria-live="polite"
                  role="region"
                  class="hidden w-full h-full pointer-events-auto transform transition-all duration-500"
                >
                </div>
              </div>
            </div>
          </div>

          <aside class="order-2 lg:order-none space-y-4 game-sidebar" aria-label="${escapeHtml(messages.game.objectiveTitle)}">
            <article class="bg-base-200 card flex-1">
              <div class="card-body">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.objectiveTitle)}</h2>
                <div
                  id="game-quest-log"
                  sse-swap="quest"
                  hx-swap="outerHTML"
                  class="hidden"
                  aria-label="${escapeHtml(messages.game.questLogTitle)}"
                ></div>
                <div class="stats stats-vertical bg-base-200 rounded-box mt-3">
                  <div class="stat">
                    <div class="stat-title">${escapeHtml(messages.game.participantsLabel)}</div>
                    <div class="stat-value text-sm">${participants.length}</div>
                    <div class="stat-desc">${escapeHtml(resolveParticipantRoleLabel(messages, participantRole))}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">${escapeHtml(messages.game.sceneLabel)}</div>
                    <div
                      id="game-scene-title-value"
                      sse-swap="scene-title-value"
                      hx-swap="outerHTML"
                      class="stat-value text-base"
                    >${escapeHtml(sceneTitle)}</div>
                    <div class="stat-desc">${escapeHtml(messages.game.sceneModeLabel)}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">${escapeHtml(messages.game.sceneModeLabel)}</div>
                    <div
                      id="game-scene-mode-value"
                      sse-swap="scene-mode"
                      hx-swap="outerHTML"
                      class="stat-value text-base"
                    >${escapeHtml(
                        sceneMode === "3d" ? messages.game.sceneMode3d : messages.game.sceneMode2d,
                      )}</div>
                    <div class="stat-desc">${escapeHtml(activeQuestTitle ?? messages.game.objectiveDescription)}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">${escapeHtml(messages.game.projectLabel)}</div>
                    <div class="stat-value text-xs">${escapeHtml(projectId ?? messages.game.projectUnavailableValue)}</div>
                  </div>
                </div>
              </div>
            </article>
            <article class="bg-base-200 card flex-1">
              <div class="card-body">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.sessionContextTitle)}</h2>
                <div class="flex flex-wrap gap-2">
                  <span class="badge badge-outline">${escapeHtml(messages.game.queueLabel)}: ${commandQueueDepth}</span>
                  <span class="badge badge-soft">${escapeHtml(messages.game.publishedProjectLabel)}</span>
                  <span class="badge badge-ghost">${escapeHtml(
                    resolveLocaleDisplayName(messages, locale),
                  )}</span>
                </div>
              </div>
            </article>
            <article class="bg-base-200 card flex-1">
              <div class="card-body gap-4">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.multiplayerTitle)}</h2>
                <p class="text-sm text-base-content/70">${escapeHtml(messages.game.multiplayerDescription)}</p>
                <div class="space-y-2">
                  <div class="text-xs font-semibold uppercase tracking-wide text-base-content/60">${escapeHtml(
                    messages.game.participantsLabel,
                  )}</div>
                  <div class="avatar-group -space-x-6" id="game-participants-list" sse-swap="participants" hx-swap="outerHTML" role="list" aria-live="polite">
                    ${participants
                      .map(
                        (
                          participant,
                        ) => `<div class="avatar tooltip" data-tip="${escapeHtml(participant.sessionId)}">
                          <div class="w-12 rounded-full bg-base-200 ring ring-base-300">
                            <span class="text-sm uppercase font-semibold">${escapeHtml(participant.role.slice(0, 1))}</span>
                          </div>
                        </div>`,
                      )
                      .join("")}
                  </div>
                </div>
                ${
                  participantRole === "owner"
                    ? `<div class="space-y-3">
                        <form hx-post="${escapeHtml(inviteAction)}" hx-target="#game-multiplayer-share-result" hx-swap="outerHTML" hx-disabled-elt="button" hx-indicator="#invite-controller-spinner" class="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
                          <input type="hidden" name="role" value="controller" />
                          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.game.inviteControllerAction)}">${escapeHtml(messages.game.inviteControllerAction)}</button>
                          <span id="invite-controller-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                        </form>
                        <form hx-post="${escapeHtml(inviteAction)}" hx-target="#game-multiplayer-share-result" hx-swap="outerHTML" hx-disabled-elt="button" hx-indicator="#invite-spectator-spinner" class="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
                          <input type="hidden" name="role" value="spectator" />
                          <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.game.inviteSpectatorAction)}">${escapeHtml(messages.game.inviteSpectatorAction)}</button>
                          <span id="invite-spectator-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                        </form>
                        <div id="game-multiplayer-share-result" class="hidden"></div>
                      </div>`
                    : participantRole === "spectator"
                      ? `<div class="alert alert-soft">
                        <span>${escapeHtml(messages.game.spectatorModeHint)}</span>
                      </div>`
                      : ""
                }
              </div>
            </article>
            <article class="bg-base-200 card flex-1">
              <div class="card-body">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.controlsTitle)}</h2>
                <p id="game-runtime-help" class="text-sm text-base-content/70">${escapeHtml(messages.game.runtimeSurfaceHint)}</p>
                <span id="game-runtime-focus-status" class="sr-only" aria-live="polite" role="status">${escapeHtml(messages.game.runtimeSurfaceInactive)}</span>
                <ul id="game-controls-list" class="space-y-2 text-sm">
                  <li>${escapeHtml(messages.game.controlsMove)}</li>
                  <li>${escapeHtml(messages.game.controlsInteract)}</li>
                  <li>${escapeHtml(messages.game.controlsAdvance)}</li>
                </ul>
              </div>
            </article>
          </aside>
      </section>

      ${
        participantRole === "owner"
          ? `
      <!-- Save slot modal (native dialog with showModal, focus trap, restore on close) -->
      <dialog id="save_slot_modal" class="modal" role="dialog" aria-labelledby="save-slot-modal-title" aria-modal="true">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="${escapeHtml(messages.common.closeMenu)}">✕</button>
          </form>
          <h3 id="save-slot-modal-title" class="font-bold text-lg">${escapeHtml(messages.game.saveSlotTitle)}</h3>
          <form
            id="save-slot-form"
            hx-post="${escapeHtml(saveSlotAction)}"
            hx-target="#save-slot-result"
            hx-swap="innerHTML"
            hx-disabled-elt="button[type=submit]"
            class="mt-4 space-y-4"
          >
            <div class="form-control">
              <label class="label" for="save-slot-name">
                <span class="label-text">${escapeHtml(messages.game.saveSlotNameLabel)}</span>
              </label>
              <input
                type="text"
                id="save-slot-name"
                name="slotName"
                placeholder="${escapeHtml(messages.game.saveSlotNamePlaceholder)}"
                class="input input-bordered w-full"
                required
                aria-required="true"
              />
            </div>
            <div id="save-slot-result"></div>
            <div class="modal-action">
              <form method="dialog" class="inline"><button type="submit" class="btn btn-ghost">${escapeHtml(messages.builder.cancel)}</button></form>
              <button type="submit" class="btn btn-primary">${escapeHtml(messages.game.saveAction)}</button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit" aria-label="${escapeHtml(messages.common.closeMenu)}">close</button>
        </form>
      </dialog>

      <!-- Load slot modal (native dialog with showModal) -->
      <dialog id="load_slot_modal" class="modal" role="dialog" aria-labelledby="load-slot-modal-title" aria-modal="true">
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="${escapeHtml(messages.common.closeMenu)}">✕</button>
          </form>
          <h3 id="load-slot-modal-title" class="font-bold text-lg">${escapeHtml(messages.game.loadSlotTitle)}</h3>
          <div
            id="load-slots-list"
            class="mt-4 space-y-2 max-h-64 overflow-y-auto"
            hx-get="${escapeHtml(saveSlotsAction)}"
            hx-trigger="revealed"
            hx-swap="innerHTML"
          >
            <div class="flex flex-col gap-2" aria-busy="true" aria-label="${escapeHtml(messages.common.loading)}">
              <div class="skeleton h-12 w-full rounded-box"></div>
              <div class="skeleton h-12 w-full rounded-box"></div>
              <div class="skeleton h-12 w-full rounded-box"></div>
              <div class="skeleton h-12 w-3/4 rounded-box"></div>
            </div>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit" aria-label="${escapeHtml(messages.common.closeMenu)}">close</button>
        </form>
      </dialog>
      `
          : ""
      }

      <!-- Key bindings modal (for all players) -->

      <dialog id="key_bindings_modal" class="modal" role="dialog" aria-labelledby="key-bindings-modal-title" aria-modal="true" data-listening-hint="${escapeHtml(messages.game.keyBindingsListeningHint)}" data-set-label="${escapeHtml(messages.game.keyBindingsSetButton)}">
        <div class="modal-box max-w-md">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="${escapeHtml(messages.common.closeMenu)}">✕</button>
          </form>
          <h3 id="key-bindings-modal-title" class="font-bold text-lg">${escapeHtml(messages.game.keyBindingsTitle)}</h3>
          <p class="text-sm text-base-content/70 mt-1">${escapeHtml(messages.game.keyBindingsDescription)}</p>
          <div class="mt-4 space-y-3">
            <div class="form-control key-binding-row" data-action="move-up">
              <div class="flex items-center justify-between gap-4">
                <label class="label py-0"><span class="label-text">${escapeHtml(messages.game.keyBindingsActionMoveUp)}</span></label>
                <div class="flex items-center gap-2">
                  <span class="key-binding-keys flex flex-wrap gap-1"></span>
                  <button type="button" class="btn btn-sm btn-outline" data-action-set="move-up">${escapeHtml(messages.game.keyBindingsSetButton)}</button>
                </div>
              </div>
            </div>
            <div class="form-control key-binding-row" data-action="move-down">
              <div class="flex items-center justify-between gap-4">
                <label class="label py-0"><span class="label-text">${escapeHtml(messages.game.keyBindingsActionMoveDown)}</span></label>
                <div class="flex items-center gap-2">
                  <span class="key-binding-keys flex flex-wrap gap-1"></span>
                  <button type="button" class="btn btn-sm btn-outline" data-action-set="move-down">${escapeHtml(messages.game.keyBindingsSetButton)}</button>
                </div>
              </div>
            </div>
            <div class="form-control key-binding-row" data-action="move-left">
              <div class="flex items-center justify-between gap-4">
                <label class="label py-0"><span class="label-text">${escapeHtml(messages.game.keyBindingsActionMoveLeft)}</span></label>
                <div class="flex items-center gap-2">
                  <span class="key-binding-keys flex flex-wrap gap-1"></span>
                  <button type="button" class="btn btn-sm btn-outline" data-action-set="move-left">${escapeHtml(messages.game.keyBindingsSetButton)}</button>
                </div>
              </div>
            </div>
            <div class="form-control key-binding-row" data-action="move-right">
              <div class="flex items-center justify-between gap-4">
                <label class="label py-0"><span class="label-text">${escapeHtml(messages.game.keyBindingsActionMoveRight)}</span></label>
                <div class="flex items-center gap-2">
                  <span class="key-binding-keys flex flex-wrap gap-1"></span>
                  <button type="button" class="btn btn-sm btn-outline" data-action-set="move-right">${escapeHtml(messages.game.keyBindingsSetButton)}</button>
                </div>
              </div>
            </div>
            <div class="form-control key-binding-row" data-action="interact">
              <div class="flex items-center justify-between gap-4">
                <label class="label py-0"><span class="label-text">${escapeHtml(messages.game.keyBindingsActionInteract)}</span></label>
                <div class="flex items-center gap-2">
                  <span class="key-binding-keys flex flex-wrap gap-1"></span>
                  <button type="button" class="btn btn-sm btn-outline" data-action-set="interact">${escapeHtml(messages.game.keyBindingsSetButton)}</button>
                </div>
              </div>
            </div>
            <div class="form-control key-binding-row" data-action="menu">
              <div class="flex items-center justify-between gap-4">
                <label class="label py-0"><span class="label-text">${escapeHtml(messages.game.keyBindingsActionMenu)}</span></label>
                <div class="flex items-center gap-2">
                  <span class="key-binding-keys flex flex-wrap gap-1"></span>
                  <button type="button" class="btn btn-sm btn-outline" data-action-set="menu">${escapeHtml(messages.game.keyBindingsSetButton)}</button>
                </div>
              </div>
            </div>
            <div class="form-control key-binding-row" data-action="close">
              <div class="flex items-center justify-between gap-4">
                <label class="label py-0"><span class="label-text">${escapeHtml(messages.game.keyBindingsActionClose)}</span></label>
                <div class="flex items-center gap-2">
                  <span class="key-binding-keys flex flex-wrap gap-1"></span>
                  <button type="button" class="btn btn-sm btn-outline" data-action-set="close">${escapeHtml(messages.game.keyBindingsSetButton)}</button>
                </div>
              </div>
            </div>
          </div>
          <p class="text-xs text-base-content/50 mt-3">${escapeHtml(messages.game.keyBindingsUpdatedHint)}</p>
          <div class="modal-action mt-4">
            <button type="button" class="btn btn-ghost btn-sm" data-reset-bindings>${escapeHtml(messages.game.keyBindingsResetDefaults)}</button>
            <form method="dialog" class="inline"><button type="submit" class="btn btn-ghost">${escapeHtml(messages.common.closeMenu)}</button></form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit" aria-label="${escapeHtml(messages.common.closeMenu)}">close</button>
        </form>
      </dialog>
    </div>
  `;

  return renderDocument(layout, messages.navigation.game, content, pageScripts);
}
