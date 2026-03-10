# Playable runtime

This document describes the browser-side playable client after the decomposition of `game-client.ts`.

## Current shape

The browser entrypoint remains `src/playable-game/game-client.ts`, but it now orchestrates focused internal modules instead of owning every concern directly.

```mermaid
flowchart TD
  Entry["game-client.ts"]
  Bootstrap["game-client-bootstrap-session.ts"]
  Transport["game-client-transport.ts"]
  Input["game-client-input.ts"]
  Renderer["game-client-renderer.ts"]
  Types["game-client-types.ts"]
  Contract["shared/contracts/game-client-bootstrap.ts"]

  Entry --> Bootstrap
  Entry --> Transport
  Entry --> Input
  Entry --> Renderer
  Entry --> Types
  Bootstrap --> Contract
```

## Module responsibilities

| Module | Responsibility |
| --- | --- |
| `game-client.ts` | Browser entrypoint and high-level orchestration |
| `game-client-bootstrap-session.ts` | Bootstrap payload parse, session restore metadata, localStorage ownership |
| `game-client-transport.ts` | Websocket connect/reconnect, restore loop, queue/session sync |
| `game-client-input.ts` | Keyboard input, focus ownership, reconnect CTA, spectator guard behavior |
| `game-client-renderer.ts` | Pixi/Three setup, resize, ticker lifecycle, scene interpolation, disposal |
| `game-client-types.ts` | Shared client-only runtime types |

## Bootstrap contract

The server emits one canonical bootstrap JSON payload described by `src/shared/contracts/game-client-bootstrap.ts`.

Rules:

- No fallback meta-tag bootstrap path.
- No duplicate parsing logic in route and client code.
- Session metadata and runtime config come from one source of truth.

## Connection state machine

```mermaid
stateDiagram-v2
  [*] --> connecting
  connecting --> connected
  connecting --> missing
  connecting --> expired
  connected --> reconnecting
  reconnecting --> connected
  reconnecting --> expired
  reconnecting --> disconnected
  missing --> [*]
  expired --> [*]
  disconnected --> [*]
```

### State meaning

| State | Meaning |
| --- | --- |
| `connecting` | Initial bootstrap and socket establishment |
| `connected` | Runtime socket active and state updates flowing |
| `reconnecting` | Recoverable disconnect path with restore attempts in flight |
| `expired` | Resume token/session can no longer be restored |
| `missing` | Required bootstrap/session data unavailable |
| `disconnected` | Non-recoverable close or retry budget exhausted |

## Session persistence rules

- Persisted session metadata is read and written only by the bootstrap/session module.
- Persisted data must still match the active bootstrap contract before reuse.
- Expiry windows are normalized relative to the runtime command TTL budget.

## Transport rules

- Restore-first behavior is limited to recoverable close paths.
- Queue depth and session metadata updates are transport-owned concerns.
- Spectators must not be allowed to emit gameplay commands.
- Transport failures should re-enter shared runtime status surfaces instead of disappearing into console-only behavior.

## Rendering rules

- Rendering setup and teardown are isolated from transport concerns.
- The renderer owns canvas lifecycle, resize handling, ticker lifecycle, and scene interpolation.
- The playable page must still present a meaningful SSR state before runtime takeover.

## Why this split exists

Before the refactor, the client mixed persistence, websocket control flow, keyboard logic, and renderer lifecycle in one large imperative module. The split now gives one owner per concern while preserving the same route-level contract.
