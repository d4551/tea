import type { GameCommand } from "../shared/contracts/game.ts";
import type { GameClientRuntimeConfig } from "../shared/contracts/game-client-bootstrap.ts";
import type {
  GameClientAlertTone,
  GameClientLabels,
  GameConnectionState,
} from "./game-client-types.ts";

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
  const queueLabel = readNonEmptyDatasetValue(queueBadge, "queueLabel");
  const connectionConnecting = readNonEmptyDatasetValue(statusBadge, "connectingLabel");
  const connectionConnected = readNonEmptyDatasetValue(statusBadge, "connectedLabel");
  const connectionDisconnected = readNonEmptyDatasetValue(statusBadge, "disconnectedPrefix");
  const connectionReconnecting = readNonEmptyDatasetValue(statusBadge, "reconnectingLabel");
  const connectionExpired = readNonEmptyDatasetValue(statusBadge, "expiredLabel");
  const connectionMissing = readNonEmptyDatasetValue(statusBadge, "missingLabel");
  const reconnectAction = readNonEmptyDatasetValue(reconnectButton, "reconnectLabel");
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
    runtimeFocusActive,
    runtimeFocusInactive,
    spectatorControlDenied,
  };
};

/**
 * Creates the DOM status controller used by the transport and runtime entrypoint.
 */
export const createGameClientStatusController = ({
  queueBadge,
  statusBadge,
  statusTarget,
  reconnectButton,
  connectionAlert,
  connectionAlertText,
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
      return;
    }

    if (state === "expired" || state === "missing") {
      statusBadge.textContent = labels.connection[state];
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

      if (event.key === "e" || event.key === "Enter" || event.key === " ") {
        sendCommand({ type: "interact" });
        event.preventDefault();
        return;
      }

      if (event.key.toLowerCase() === "i" || event.key === "Tab") {
        sendCommand({ type: "openInventory" });
        event.preventDefault();
        return;
      }

      if (event.key === "Escape") {
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

      if (keysHeld.has("w") || keysHeld.has("ArrowUp")) {
        sendCommand({
          type: "move",
          direction: "up",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
        lastMoveSentAt = now;
        return;
      }

      if (keysHeld.has("s") || keysHeld.has("ArrowDown")) {
        sendCommand({
          type: "move",
          direction: "down",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
        lastMoveSentAt = now;
        return;
      }

      if (keysHeld.has("a") || keysHeld.has("ArrowLeft")) {
        sendCommand({
          type: "move",
          direction: "left",
          durationMs: runtimeConfig.commandSendIntervalMs,
        });
        lastMoveSentAt = now;
        return;
      }

      if (keysHeld.has("d") || keysHeld.has("ArrowRight")) {
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
