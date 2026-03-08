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
  const pageScripts = [
    {
      src: appConfig.playableGame.clientScriptPath,
      type: "module" as const,
    },
  ] as const;

  const content = `
    <meta name="game-session-id" data-session-id="${escapeHtml(sessionId)}" />
    <meta name="game-session-participant-id" data-game-session-participant-id="${escapeHtml(participantSessionId)}" />
    <meta name="game-session-resume-token" data-session-resume-token="${escapeHtml(resumeToken)}" />
    <meta name="game-session-locale" data-game-session-locale="${escapeHtml(locale)}" />
    <meta name="game-session-resume-expires-at-ms" data-game-session-resume-expires-at-ms="${escapeHtml(String(resumeTokenExpiresAtMs))}" />
    <meta name="game-session-command-queue-depth" data-game-session-command-queue-depth="${commandQueueDepth}" />
    <meta name="game-session-version" data-game-session-version="${version}" />
    <meta name="game-session-participant-role" data-game-session-participant-role="${escapeHtml(participantRole)}" />
    <meta name="game-client-command-send-interval-ms" data-game-client-command-send-interval-ms="${escapeHtml(String(clientRuntimeConfig.commandSendIntervalMs))}" />
    <meta name="game-client-command-ttl-ms" data-game-client-command-ttl-ms="${escapeHtml(String(clientRuntimeConfig.commandTtlMs))}" />
    <meta name="game-client-socket-reconnect-delay-ms" data-game-client-socket-reconnect-delay-ms="${escapeHtml(String(clientRuntimeConfig.socketReconnectDelayMs))}" />
    <meta name="game-client-restore-request-timeout-ms" data-game-client-restore-request-timeout-ms="${escapeHtml(String(clientRuntimeConfig.restoreRequestTimeoutMs))}" />
    <meta name="game-client-restore-max-attempts" data-game-client-restore-max-attempts="${escapeHtml(String(clientRuntimeConfig.restoreMaxAttempts))}" />
    <meta name="game-client-renderer-preference" data-game-client-renderer-preference="${escapeHtml(appConfig.playableGame.rendererPreference)}" />
    <div class="grid gap-6 font-serif" hx-boost="false" hx-ext="sse" sse-connect="${escapeHtml(gameHudStreamPath)}">
      <section class="card card-border bg-base-100/95 shadow-sm">
        <div class="card-body flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="space-y-2">
            <h1
              id="game-scene-title-heading"
              sse-swap="scene-title-heading"
              hx-swap="outerHTML"
              class="text-3xl font-semibold"
            >${escapeHtml(sceneTitle)}</h1>
            <p
              id="game-objective-summary"
              sse-swap="objective-summary"
              hx-swap="outerHTML"
              class="text-sm text-base-content/70"
            >${escapeHtml(activeQuestTitle ?? messages.game.objectiveDescription)}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
          <a href="${escapeHtml(builderHref)}" class="btn btn-outline btn-sm">${escapeHtml(messages.game.builderReturn)}</a>
          <span id="game-session-meta" class="hidden"
            data-session-id="${escapeHtml(sessionId)}"
            data-participant-session-id="${escapeHtml(participantSessionId)}"
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
      </section>

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
                        <form hx-post="${escapeHtml(inviteAction)}" hx-target="#game-multiplayer-share-result" hx-swap="outerHTML" class="flex flex-wrap gap-2">
                          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
                          <input type="hidden" name="role" value="controller" />
                          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.game.inviteControllerAction)}</button>
                        </form>
                        <form hx-post="${escapeHtml(inviteAction)}" hx-target="#game-multiplayer-share-result" hx-swap="outerHTML" class="flex flex-wrap gap-2">
                          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
                          <input type="hidden" name="role" value="spectator" />
                          <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.game.inviteSpectatorAction)}</button>
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
