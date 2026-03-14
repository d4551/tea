/**
 * Persisted browser session metadata used to resume a playable game session.
 */
export type PersistedSessionMeta = {
  readonly sessionId: string;
  readonly participantSessionId: string;
  readonly resumeToken: string;
  readonly locale: string;
  readonly participantRole: "owner" | "controller" | "spectator";
  readonly commandQueueDepth: number;
  readonly version: number;
  readonly expiresAtMs: number;
};

/**
 * Successful session restore payload returned by the server restore endpoint.
 */
export type RestoreSessionResponse = {
  readonly ok: true;
  readonly data: {
    readonly sessionId: string;
    readonly participantSessionId?: string;
    readonly locale: string;
    readonly timestamp: string;
    readonly state: import("../shared/contracts/game.ts").GameSceneState;
    readonly commandQueueDepth?: number;
    readonly resumeToken?: string;
    readonly resumeTokenExpiresAtMs?: number;
    readonly version?: number;
  };
};

/**
 * Connection states surfaced in the playable runtime status UI.
 */
export type GameConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "expired"
  | "missing";

/**
 * Localized labels required by the playable runtime UI.
 */
export type GameClientLabels = {
  readonly queueLabel: string;
  readonly connection: Readonly<Record<GameConnectionState, string>>;
  readonly reconnectAction: string;
  readonly backToBuilderLabel: string;
  readonly builderHref: string;
  readonly connectingToRealm: string;
  readonly runtimeFocusActive: string;
  readonly runtimeFocusInactive: string;
  readonly spectatorControlDenied: string;
};

/**
 * Connection alert tone variants rendered by the playable runtime UI.
 */
export type GameClientAlertTone = "info" | "warning" | "error";
