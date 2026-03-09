import { appConfig, type LocaleCode } from "../config/environment.ts";
import {
  appRoutes,
  interpolateRoutePath,
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

  return `<section class="mx-auto grid max-w-3xl gap-6 pt-8">
    <article class="card card-border bg-base-100 shadow-xl">
      <div class="card-body gap-4">
        <div class="empty-state py-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-warning/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.692-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <span class="badge badge-warning badge-soft w-max">${escapeHtml(messages.game.publishedProjectLabel)}</span>
        <h1 class="card-title text-3xl">${escapeHtml(title)}</h1>
        <p class="text-base-content/75">${escapeHtml(description)}</p>
        ${
          projectId
            ? `<div class="rounded-box bg-base-200/70 p-4 font-mono text-sm">${escapeHtml(projectId)}</div>`
            : ""
        }
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
  };
  const gameHudStreamPath = interpolateRoutePath(appRoutes.gameApiSessionHud, { id: sessionId });
  const builderHref = withQueryParameters(appRoutes.builder, { lang: locale, projectId });
  const inviteAction = interpolateRoutePath(appRoutes.gameApiSessionInvite, { id: sessionId });
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
  const pageScripts = [
    {
      src: appConfig.playableGame.clientScriptPath,
      type: "module" as const,
    },
  ] as const;

  const content = `
    <script id="game-client-bootstrap" type="application/json">${serializeGameClientBootstrap(clientBootstrap)}</script>
    <div class="grid gap-5 font-serif animate-fade-in-up" hx-boost="false" hx-ext="sse" sse-connect="${escapeHtml(gameHudStreamPath)}">
      <!-- Game Header Bar -->
      <header class="card card-elevated bg-base-100/95 backdrop-blur-sm border border-base-300/50 shadow-lg">
        <div class="card-body p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3">
            <div class="rounded-lg w-10 h-10 flex items-center justify-center bg-primary/15 text-primary shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            </div>
            <div class="min-w-0">
              <h1
                id="game-scene-title-heading"
                sse-swap="scene-title-heading"
                hx-swap="outerHTML"
                class="text-xl lg:text-2xl font-bold tracking-tight truncate"
              >${escapeHtml(sceneTitle)}</h1>
              <p
                id="game-objective-summary"
                sse-swap="objective-summary"
                hx-swap="outerHTML"
                class="text-sm text-base-content/60 truncate"
              >${escapeHtml(activeQuestTitle ?? messages.game.objectiveDescription)}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a href="${escapeHtml(builderHref)}" class="btn btn-ghost btn-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              ${escapeHtml(messages.game.builderReturn)}
            </a>
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
              class="connection-status connection-status-connecting"
              aria-label="${escapeHtml(messages.game.connectionStatus)}"
              data-connecting-label="${escapeHtml(messages.game.connectionStatus)}"
              data-connected-label="${escapeHtml(messages.game.connectionConnected)}"
              data-disconnected-prefix="${escapeHtml(messages.game.connectionDisconnected)}"
              data-reconnecting-label="${escapeHtml(messages.game.connectionReconnecting)}"
              data-expired-label="${escapeHtml(messages.game.connectionExpired)}"
              data-missing-label="${escapeHtml(messages.game.connectionMissing)}"
            >
              <span>${escapeHtml(messages.game.connectionStatus)}</span>
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

      <section class="grid gap-6 lg:grid-cols-[0.82fr_0.18fr]">
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
              class="pointer-events-none absolute inset-0 flex flex-col justify-between p-6"
              style="backdrop-filter:blur(1px)"
            >
              <div class="flex justify-between items-start pt-2">
                <div id="hud-scene" sse-swap="scene-badge" hx-swap="outerHTML" aria-live="polite" role="status" class="pointer-events-auto rounded-full border border-base-content/10 bg-base-100/80 px-6 py-2 text-lg font-bold shadow backdrop-blur">
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

          <aside class="space-y-4">
            <article class="card card-border bg-base-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.objectiveTitle)}</h2>
                <p
                  id="game-objective-card"
                  sse-swap="objective-card"
                  hx-swap="outerHTML"
                  class="text-sm text-base-content/75"
                >${escapeHtml(activeQuestTitle ?? messages.game.objectiveDescription)}</p>
                <div class="grid gap-2 text-sm">
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.sceneLabel)}</span>
                    <span
                      id="game-scene-title-value"
                      sse-swap="scene-title-value"
                      hx-swap="outerHTML"
                      class="font-medium"
                    >${escapeHtml(sceneTitle)}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.sceneModeLabel)}</span>
                    <span
                      id="game-scene-mode-value"
                      sse-swap="scene-mode"
                      hx-swap="outerHTML"
                      class="font-medium"
                    >${escapeHtml(
                      sceneMode === "3d" ? messages.game.sceneMode3d : messages.game.sceneMode2d,
                    )}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.projectLabel)}</span>
                    <span class="font-mono text-xs">${escapeHtml(
                      projectId ?? messages.game.projectUnavailableValue,
                    )}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.sessionIdLabel)}</span>
                    <span class="font-mono text-xs">${escapeHtml(sessionId)}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.localeLabel)}</span>
                    <span class="font-medium">${escapeHtml(
                      resolveLocaleDisplayName(messages, locale),
                    )}</span>
                  </div>
                  <div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2">
                    <span>${escapeHtml(messages.game.participantRoleLabel)}</span>
                    <span class="font-medium">${escapeHtml(
                      resolveParticipantRoleLabel(messages, participantRole),
                    )}</span>
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
                  <span class="badge badge-ghost">${escapeHtml(
                    resolveLocaleDisplayName(messages, locale),
                  )}</span>
                </div>
              </div>
            </article>
            <article class="card card-border bg-base-100 shadow-sm">
              <div class="card-body gap-4">
                <h2 class="card-title text-lg">${escapeHtml(messages.game.multiplayerTitle)}</h2>
                <p class="text-sm text-base-content/70">${escapeHtml(messages.game.multiplayerDescription)}</p>
                <div class="space-y-2">
                  <div class="text-xs font-semibold uppercase tracking-wide text-base-content/60">${escapeHtml(
                    messages.game.participantsLabel,
                  )}</div>
                  <div id="game-participants-list" sse-swap="participants" hx-swap="outerHTML" class="space-y-2">
                    ${participants
                      .map(
                        (
                          participant,
                        ) => `<div class="flex items-center justify-between rounded-box bg-base-200/70 px-3 py-2 text-sm">
                          <span class="font-mono text-xs">${escapeHtml(participant.sessionId)}</span>
                          <span class="badge badge-outline">${escapeHtml(resolveParticipantRoleLabel(messages, participant.role))}</span>
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
                          <span id="invite-controller-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
                        </form>
                        <form hx-post="${escapeHtml(inviteAction)}" hx-target="#game-multiplayer-share-result" hx-swap="outerHTML" hx-disabled-elt="button" hx-indicator="#invite-spectator-spinner" class="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
                          <input type="hidden" name="role" value="spectator" />
                          <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.game.inviteSpectatorAction)}">${escapeHtml(messages.game.inviteSpectatorAction)}</button>
                          <span id="invite-spectator-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
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
            <article class="card card-border bg-base-100 shadow-sm">
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
    </div>
  `;

  return renderDocument(layout, messages.navigation.game, content, pageScripts);
}
