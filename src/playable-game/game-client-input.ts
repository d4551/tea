import type { GameCommand } from "../shared/contracts/game.ts";
import type { GameClientRuntimeConfig } from "../shared/contracts/game-client-bootstrap.ts";
import type {
  GameClientAlertTone,
  GameClientLabels,
  GameConnectionState,
} from "./game-client-types.ts";
import { readInputConfig } from "./input-config.ts";

const readNonEmptyDatasetValue = (
  element: HTMLElement | null,
  attributeName: string,
): string | null => {
  const value = element?.dataset[attributeName];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isInteractiveElement = (element: Element | null): boolean =>
  Boolean(
    element?.closest(
      'a, button, input, select, textarea, summary, [contenteditable=""], [contenteditable="true"], [role="button"]',
    ),
  );

/**
 * Runtime status controller interface for the playable game surface.
 */
export type GameClientStatusController = {
  readonly setQueueDepth: (depth: number) => void;
  readonly setConnectionState: (state: GameConnectionState, closeCode?: number) => void;
  readonly setReconnectVisible: (visible: boolean) => void;
  readonly setConnectionAlert: (message: string | null, tone?: GameClientAlertTone) => void;
};

/**
 * Options for the playable runtime status controller.
 */
export type GameClientStatusOptions = {
  readonly queueBadge: HTMLElement | null;
  readonly statusBadge: HTMLElement | null;
  readonly statusTarget: HTMLElement | null;
  readonly reconnectButton: HTMLButtonElement | null;
  readonly connectionAlert: HTMLElement | null;
  readonly connectionAlertText: HTMLElement | null;
  /** Resolve at update time; SSE may replace #hud-scene via outerHTML swap. */
  readonly getHudSceneElement: () => HTMLElement | null;
  readonly labels: GameClientLabels;
};

/**
 * Input controller interface for the playable runtime.
 */
export type GameClientInputController = {
  readonly tick: (now: number) => void;
  readonly resolveInterpolationAlpha: (now: number) => number;
  readonly dispose: () => void;
};

/**
 * Options for the playable runtime input controller.
 */
export type GameClientInputOptions = {
  readonly wrapper: HTMLElement;
  readonly reconnectButton: HTMLButtonElement | null;
  readonly focusStatus: HTMLElement | null;
  readonly labels: GameClientLabels;
  readonly runtimeConfig: GameClientRuntimeConfig;
  readonly sendCommand: (command: GameCommand) => boolean;
  readonly getConnectionState: () => GameConnectionState;
  readonly onReconnect: () => void;
};

/**
 * Reads the localized runtime labels embedded in the SSR game page markup.
 */
export const readGameClientLabels = (
  wrapper: HTMLElement,
  statusBadge: HTMLElement | null,
  queueBadge: HTMLElement | null,
  reconnectButton: HTMLButtonElement | null,
): GameClientLabels | null => {
  const gamePageGrid = wrapper.closest(".game-page-grid") as HTMLElement | null;
  const queueLabel = readNonEmptyDatasetValue(queueBadge, "queueLabel");
  const connectionConnecting = readNonEmptyDatasetValue(statusBadge, "connectingLabel");
  const connectionConnected = readNonEmptyDatasetValue(statusBadge, "connectedLabel");
  const connectionDisconnected = readNonEmptyDatasetValue(statusBadge, "disconnectedPrefix");
  const connectionReconnecting = readNonEmptyDatasetValue(statusBadge, "reconnectingLabel");
  const connectionExpired = readNonEmptyDatasetValue(statusBadge, "expiredLabel");
  const connectionMissing = readNonEmptyDatasetValue(statusBadge, "missingLabel");
  const reconnectAction = readNonEmptyDatasetValue(reconnectButton, "reconnectLabel");
  const backToBuilderLabel = gamePageGrid
    ? readNonEmptyDatasetValue(gamePageGrid, "backToBuilderLabel")
    : null;
  const builderHref = gamePageGrid ? readNonEmptyDatasetValue(gamePageGrid, "builderHref") : null;
  const connectingToRealm = gamePageGrid
    ? readNonEmptyDatasetValue(gamePageGrid, "connectingToRealm")
    : null;
  const runtimeFocusActive = readNonEmptyDatasetValue(wrapper, "runtimeFocusActiveLabel");
  const runtimeFocusInactive = readNonEmptyDatasetValue(wrapper, "runtimeFocusInactiveLabel");
  const spectatorControlDenied = readNonEmptyDatasetValue(wrapper, "spectatorControlDeniedLabel");

  if (
    !queueLabel ||
    !connectionConnecting ||
    !connectionConnected ||
    !connectionDisconnected ||
    !connectionReconnecting ||
    !connectionExpired ||
    !connectionMissing ||
    !reconnectAction ||
    !runtimeFocusActive ||
    !runtimeFocusInactive ||
    !spectatorControlDenied
  ) {
    return null;
  }

  return {
    queueLabel,
    connection: {
      connecting: connectionConnecting,
      connected: connectionConnected,
      disconnected: connectionDisconnected,
      reconnecting: connectionReconnecting,
      expired: connectionExpired,
      missing: connectionMissing,
    },
    reconnectAction,
    backToBuilderLabel: backToBuilderLabel ?? "Back to builder",
    builderHref: builderHref ?? "#",
    connectingToRealm: connectingToRealm ?? connectionConnecting,
    runtimeFocusActive,
    runtimeFocusInactive,
    spectatorControlDenied,
  };
};

/**
 * Creates the DOM status controller used by the transport and runtime entrypoint.
 */
const escapeHtmlAttr = (s: string): string =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const createGameClientStatusController = ({
  queueBadge,
  statusBadge,
  statusTarget,
  reconnectButton,
  connectionAlert,
  connectionAlertText,
  getHudSceneElement,
  labels,
}: GameClientStatusOptions): GameClientStatusController => ({
  setQueueDepth(depth) {
    if (queueBadge) {
      queueBadge.textContent = `${labels.queueLabel}: ${depth}`;
    }

    if (statusTarget) {
      statusTarget.dataset.commandQueueDepth = String(depth);
    }
  },
  setConnectionState(state, closeCode) {
    if (!statusBadge) {
      return;
    }

    if (state === "connecting" || state === "connected" || state === "reconnecting") {
      statusBadge.textContent = labels.connection[state];
      const hudEl = getHudSceneElement();
      if (hudEl && (state === "connecting" || state === "reconnecting")) {
        hudEl.textContent =
          state === "reconnecting" ? labels.connection.reconnecting : labels.connectingToRealm;
      }
      return;
    }

    if (state === "expired" || state === "missing") {
      statusBadge.textContent = labels.connection[state];
      const hudEl = getHudSceneElement();
      if (hudEl) {
        const msg = labels.connection[state];
        const reconnectLabel = escapeHtmlAttr(labels.reconnectAction);
        const backLabel = escapeHtmlAttr(labels.backToBuilderLabel);
        const builderHref = escapeHtmlAttr(labels.builderHref);
        hudEl.innerHTML = `<div class="flex flex-col items-center gap-3 pointer-events-auto">
          <span class="font-semibold">${escapeHtmlAttr(msg)}</span>
          <div class="flex gap-2">
            <button type="button" class="btn btn-warning btn-sm game-reconnect-overlay-trigger" aria-label="${reconnectLabel}">${reconnectLabel}</button>
            <a href="${builderHref}" class="btn btn-ghost btn-sm" aria-label="${backLabel}">${backLabel}</a>
          </div>
        </div>`;
        const overlayBtn = hudEl.querySelector(".game-reconnect-overlay-trigger");
        if (overlayBtn && reconnectButton) {
          overlayBtn.addEventListener("click", () => reconnectButton.click());
        }
      }
      return;
    }

    const prefix = labels.connection.disconnected;
    statusBadge.textContent = typeof closeCode === "number" ? `${prefix} (${closeCode})` : prefix;
  },
  setReconnectVisible(visible) {
    if (!reconnectButton) {
      return;
    }

    reconnectButton.textContent = labels.reconnectAction;
    reconnectButton.classList.toggle("hidden", !visible);
  },
  setConnectionAlert(message, tone = "warning") {
    if (!connectionAlert || !connectionAlertText) {
      return;
    }

    connectionAlert.classList.toggle("hidden", !message);
    connectionAlert.classList.remove("alert-info", "alert-warning", "alert-error");
    connectionAlert.classList.add(
      tone === "error" ? "alert-error" : tone === "info" ? "alert-info" : "alert-warning",
    );
    connectionAlertText.textContent = message ?? "";
  },
});

/**
 * Creates the keyboard, focus, and reconnect interaction controller for the playable runtime.
 */
export const createGameClientInputController = ({
  wrapper,
  reconnectButton,
  focusStatus,
  labels,
  runtimeConfig,
  sendCommand,
  getConnectionState,
  onReconnect,
}: GameClientInputOptions): GameClientInputController => {
  const inputConfig = readInputConfig();
  const hasKey = (action: keyof typeof inputConfig, key: string) =>
    inputConfig[action].includes(key);
  const listenerController = new AbortController();
  const keysHeld = new Set<string>();
  let runtimeHasFocus = false;
  let lastMoveSentAt = 0;

  const setRuntimeFocusState = (active: boolean): void => {
    runtimeHasFocus = active;
    wrapper.dataset.runtimeActive = active ? "true" : "false";
    if (focusStatus) {
      focusStatus.textContent = active ? labels.runtimeFocusActive : labels.runtimeFocusInactive;
    }
  };

  const shouldCaptureGameInput = (): boolean => {
    if (!runtimeHasFocus || document.activeElement !== wrapper) {
      return false;
    }

    return !isInteractiveElement(document.activeElement);
  };

  reconnectButton?.addEventListener(
    "click",
    () => {
      if (getConnectionState() === "missing") {
        window.location.reload();
        return;
      }

      onReconnect();
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "pointerdown",
    () => {
      wrapper.focus({ preventScroll: true });
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "focus",
    () => {
      setRuntimeFocusState(true);
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "blur",
    () => {
      keysHeld.clear();
      setRuntimeFocusState(false);
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "keydown",
    (event) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat ||
        !shouldCaptureGameInput()
      ) {
        return;
      }

      keysHeld.add(event.key);

      if (hasKey("interact", event.key) || hasKey("interact", event.key.toLowerCase())) {
        const cutsceneEl = document.getElementById("hud-cutscene");
        const dialogueEl = document.getElementById("hud-dialogue");
        const cutsceneVisible =
          cutsceneEl &&
          !cutsceneEl.classList.contains("hidden") &&
          cutsceneEl.offsetParent !== null;
        const dialogueVisible =
          dialogueEl &&
          !dialogueEl.classList.contains("hidden") &&
          dialogueEl.textContent?.trim().length > 0;
        if (cutsceneVisible) {
          sendCommand({ type: "advanceCutscene" });
        } else if (dialogueVisible) {
          sendCommand({ type: "confirmDialogue" });
        } else {
          sendCommand({ type: "interact" });
        }
        event.preventDefault();
        return;
      }

      if (hasKey("menu", event.key) || hasKey("menu", event.key.toLowerCase())) {
        sendCommand({ type: "openInventory" });
        event.preventDefault();
        return;
      }

      if (hasKey("close", event.key)) {
        sendCommand({ type: "closeDialogue" });
        sendCommand({ type: "closeInventory" });
        event.preventDefault();
      }
    },
    { signal: listenerController.signal },
  );

  wrapper.addEventListener(
    "keyup",
    (event) => {
      keysHeld.delete(event.key);
    },
    { signal: listenerController.signal },
  );

  setRuntimeFocusState(document.activeElement === wrapper);

  return {
    tick(now) {
      if (
        !shouldCaptureGameInput() ||
        now - lastMoveSentAt <= runtimeConfig.commandSendIntervalMs
      ) {
        return;
      }

      const up = inputConfig["move-up"].some((k) => keysHeld.has(k));
      const down = inputConfig["move-down"].some((k) => keysHeld.has(k));
      const left = inputConfig["move-left"].some((k) => keysHeld.has(k));
      const right = inputConfig["move-right"].some((k) => keysHeld.has(k));

      if (up) {
        sendCommand({
          type: "move",
          direction: "up",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
        lastMoveSentAt = now;
        return;
      }

      if (down) {
        sendCommand({
          type: "move",
          direction: "down",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
        lastMoveSentAt = now;
        return;
      }

      if (left) {
        sendCommand({
          type: "move",
          direction: "left",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
        lastMoveSentAt = now;
        return;
      }

      if (right) {
        sendCommand({
          type: "move",
          direction: "right",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
        lastMoveSentAt = now;
      }
    },
    resolveInterpolationAlpha(now) {
      return Math.min((now - lastMoveSentAt) / runtimeConfig.commandSendIntervalMs, 1);
    },
    dispose() {
      listenerController.abort();
      keysHeld.clear();
    },
  };
};
