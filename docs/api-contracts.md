# API and transport contracts (expanded)

This document is the canonical end-to-end contract map for all HTTP, SSE, and WebSocket surfaces.

## 1) Single envelope contract

All JSON responses use one of two shapes.

```ts
interface SuccessEnvelope<T> {
  ok: true;
  data: T;
}

interface ErrorEnvelope {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    correlationId: string;
  };
}
```

`correlationId` is produced by `requestContext` and is required on major failures for observability and replay diagnostics.

## 2) Contract graph

```mermaid
flowchart TB
  subgraph Inbound["Client ingress"]
    B1["Browser"]
    B2["Operator tooling"]
    B3["Automation"]
  end

  subgraph HTTP["HTTP APIs"]
    A1["GET /api/health"]
    A2["POST /api/oracle"]
    A3["/api/ai/*"]
    A4["/api/builder/*"]
    A5["/api/game/session/*"]
    A6["GET /api/game/session/:id/state"]
  end

  subgraph Realtime["Realtime APIs"]
    R1["WS /api/game/session/:id/ws"]
    R2["SSE /api/game/session/:id/hud"]
  end

  B1 --> A1
  B1 --> A2
  B1 --> A3
  B1 --> A4
  B1 --> A5
  B1 --> A6
  B1 --> R1
  B1 --> R2
  B2 --> A1
  B2 --> A3
  B2 --> A4
  B2 --> A5
  B2 --> R1
  B3 --> A3
  B3 --> A4
  B3 --> A6
```

## 3) Route lifecycle and envelope placement

```mermaid
sequenceDiagram
  autonumber
  participant C as Client
  participant R as Route
  participant S as Schema boundary
  participant D as Domain service
  participant E as Envelope mapper
  participant P as Producer

  C->>R: request
  R->>S: validate params and body
  alt schema valid
    S->>D: typed payload
    D-->>E: typed result
    E-->>C: ok response
  else schema invalid
    S-->>E: validation failure
    E-->>C: ok=false + validation code
  else runtime failure
    D-->>R: exception
    R->>E: map to failure envelope
    E-->>C: normalized failure
  end
  Note over P: WS/SSE are emitted from domain state transitions
```

## 4) Surface contracts

### 4.1 Health and oracle

- `GET /api/health`: readiness signal.
- `POST /api/oracle`: locale-aware oracle query.

### 4.2 Game transport

| Method | Endpoint | Contract |
| --- | --- | --- |
| `POST` | `/api/game/session` | create authoritative session |
| `POST` | `/api/game/session/:id` | restore using `resumeToken` |
| `POST` | `/api/game/session/:id/command` | command envelope + deterministic transition |
| `POST` | `/api/game/session/:id/invite` | issue invite token |
| `POST` | `/api/game/session/:id/join` | apply invite token |
| `GET` | `/api/game/session/:id/state` | polling fallback state |
| `GET` | `/api/game/session/:id/hud` | SSE events |
| `WS` | `/api/game/session/:id/ws` | streaming authoritative state |

### 4.3 Builder family

- Draft lifecycle endpoints under `/api/builder/projects*` mutate builder-domain records only.
- `publish` endpoint is a guarded transition.
- AI/generation helpers remain in builder context and cannot write game session records.

### 4.4 AI family

- `status`, `health`, `capabilities`, `catalog`: provider surface health.
- `knowledge/*` endpoints: retrieval/search with bounded timeout behavior.
- `audio/*` and `generate/*`: provider-mediated operations with standardized failure envelopes.

## 5) Error routing

```mermaid
flowchart TD
  EC["error.code"] --> R1{"retryable?"}
  R1 -->|true| M1["Retry with bounded backoff"]
  R1 -->|false| R2{"authorization?"}
  R2 -->|true| M2["Re-auth / refresh"]
  R2 -->|false| R3{"validation?"}
  R3 -->|true| M3["Operator/user correction"]
  R3 -->|false| R4{"session context?"}
  R4 -->|true| M4["Restore flow"]
  R4 -->|false| M5["Operational support / fix"]
```

## 6) Data contract reliability matrix

- `auth/session`: hard fail, no retry.
- `validation`: hard fail; caller must correct payload.
- `provider transient`: retryable when provider budget supports.
- `storage transient`: retryable only when idempotent.
- `publish` validation: returns explicit issue list, never opaque message.

## 7) Security and integrity

- Path and redirect payloads are validated before use.
- All session reads/writes include token ownership checks.
- WS/SSE producers validate requested channel, session ID, and user/project scope.
- Client-facing messages never expose provider internals.

## 8) Browser-facing behavior matrix

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading: open page / send request
  loading --> success: ok envelope
  loading --> retryable_error: temporary transport failure
  loading --> non_retryable_error: validation/auth
  retryable_error --> loading: retry
  success --> loading: mutation or refresh
  success --> restore: `resumeToken` flow
  restore --> success: restored
  restore --> non_retryable_error: invalid token/expired session
  non_retryable_error --> [*]
```

## 9) End-to-end dataflow for a command round trip

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as /game page
  participant API as /api/game/session/:id/command
  participant Loop as game-loop
  participant Session as session store
  participant HUD as SSE endpoint
  participant WS as WS endpoint

  User->>UI: send command
  UI->>API: POST envelope
  API->>Loop: processCommand()
  Loop->>Session: persist outcome
  Loop-->>API: command envelope + state version
  API-->>UI: apply state updates
  Loop->>WS: publish frame stream
  Loop->>HUD: publish HUD delta
```

## 10) Recommended verification

- Add/modify an API surface: run `bun run docs:check` then `bun run lint`, `bun run typecheck`.
- For contract-changing edits, add/update contract tests under `tests/`.
- For transport edits, run smoke for `/api/game/session/:id/ws` and `/api/game/session/:id/hud`.
