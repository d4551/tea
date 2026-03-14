# Playable runtime (authoritative runtime client stack)

This document defines the browser runtime contract that consumes `/game` bootstrap and all game transport streams.

## 1) Runtime decomposition and ownership

```mermaid
flowchart TB
  subgraph BrowserEntry["Browser entry"]
    BE["game-client.ts"]
  end

  subgraph Session["Session orchestration"]
    BS["game-client-bootstrap-session.ts"]
    IN["game-client-input.ts"]
    TP["game-client-transport.ts"]
  end

  subgraph Render["Render pipeline"]
    RN["game-client-renderer.ts"]
    TY["game-client-types.ts"]
  end

  subgraph Shared["Shared contracts"]
    C1["shared/contracts/game-client-bootstrap.ts"]
    C2["shared/contracts/game.ts"]
  end

  BE --> BS --> C1
  BE --> IN --> C2
  BE --> TP --> C2
  BE --> RN --> TY
```

## 2) From page bootstrap to live state

```mermaid
sequenceDiagram
  autonumber
  participant Page as /game SSR page
  participant API as /api/game/session
  participant Bootstrap as game-client-bootstrap-session
  participant Transport as game-client-transport
  participant Renderer as game-client-renderer
  participant Persist as local persistence

  Page->>Bootstrap: inject bootstrap payload
  Bootstrap->>Bootstrap: parse + validate contract
  Bootstrap->>Persist: persist session metadata
  Bootstrap-->>Transport: start session context
  Transport->>Transport: open WS /api/game/session/:id/ws
  Transport-->>Renderer: initial state + frame contract
  Renderer->>Page: render scene/camera/hud shell
  Page->>IN: user intent + input events
  IN->>Transport: POST /api/game/session/:id/command
  Transport->>Transport: apply response outcome
  Transport-->>Renderer: interpolated frame + HUD hint
```

## 3) Transport contract details

### 3.1 Session bootstrap contract

- Created by game routes and validated in `game-client-bootstrap-session.ts`.
- Required values:
  - `sessionId`, `resumeToken`, `projectId`
  - snapshot metadata (`version`, `flags`)
  - render config (`viewport`, frame/reconnect budgets)
  - command defaults (`commandCooldownMs`, `commandTimeoutMs`)

### 3.2 Command loop

- The UI posts command envelopes to `POST /api/game/session/:id/command`.
- Response is authoritative; rendering confirms after server result.
- Local optimistic hints are optional and must never commit without server confirmation.
- Replay safety:
  - on timeout, transition to restore path,
  - preserve unsent input queue per tick.

### 3.3 Restore and reconnect path

```mermaid
flowchart LR
  C1["disconnect"] --> C2["restore attempt with resumeToken"]
  C2 -->|ok| C3["resume streams"]
  C2 -->|missing| C4["expired/invalid"]
  C2 -->|retry-exceeded| C5["new session required"]
  C3 --> C6["UI recovers"]
  C4 --> C7["recreate flow CTA"]
  C5 --> C7
```

## 4) Renderer and scene update rules

- Renderer owns canvas lifecycle, interpolation, and scene object updates.
- Transport always provides normalized frame data.
- Heavy parsing and schema checks stay outside the frame loop.
- Resize and visibility transitions are renderer state, not transport state.

## 5) Playable page state machine

```mermaid
stateDiagram-v2
  [*] --> bootstrapMissing
  bootstrapMissing --> bootstrapParseError: parse/validate fail
  bootstrapMissing --> connecting: valid bootstrap
  connecting --> connected: WS open + first frame
  connecting --> reconnecting: retryable WS fail
  connected --> reconnecting: network drop
  connected --> commandPending: command accepted
  commandPending --> connected: command response
  reconnecting --> connected: restore success
  reconnecting --> restoreExpired: restore failure
  restoreExpired --> terminalError: requires new session
  terminalError --> [*]
```

## 6) Security and anti-cheat

- Client rendering never mutates authoritative state.
- Viewer-only roles are filtered before any command dispatch.
- Restore checks both session and `resumeToken` validity.
- Replay/restart resolution uses envelope + session version, not client clock heuristics.

## 7) Reliability and performance

- Render loop aligns to transport cadence; avoid unbounded animation drift.
- Command envelopes stay compact and typed to reduce bandwidth.
- WS stream carries authoritative state.
- HUD SSE stream carries low-cardinality overlay updates.

## 8) Verification targets

- Contract tests for bootstrap parse and command transitions in `tests/`.
- WS reconnect and restore tests for transport failures.
- Locale/render config change coverage for bootstrap parser.
- Replay restrictions and spectator role restrictions.

## 9) Failure matrix

```mermaid
flowchart TB
  F1["command timeout"] -->|retryable| F2["restore attempt"]
  F1 -->|non-retryable| F3["terminal"]
  F2 -->|token valid| F4["resumed"]
  F2 -->|token missing| F3
  F3 --> F5["recreate session required"]
```

## 10) Runtime sequence map (full flow)

```mermaid
flowchart LR
  subgraph "Client"
    A["Page"]
    B["Transport"]
    C["Renderer"]
  end
  subgraph "Server"
    D["game-plugin.ts"]
    E["game-loop.ts"]
    F["Prisma sessions"]
  end
  A --> B --> D --> E --> F --> E --> C
  B -->|SSE| C
```
