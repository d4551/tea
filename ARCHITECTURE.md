# TEA architecture

This document is the source-of-truth overview for TEA’s current runtime boundaries.

## System topology

```mermaid
flowchart TB
  subgraph Browser["Browser surfaces"]
    SSR["SSR documents"]
    HTMX["HTMX fragments"]
    Runtime["Playable runtime"]
    SSE["HUD SSE"]
    WS["Command websocket"]
  end

  subgraph Server["Elysia application"]
    RC["request-context"]
    LC["i18n-context"]
    ERR["global onError"]
    Views["SSR views"]
    Routes["route handlers"]
    Ext["HTMX extension assets"]
  end

  subgraph Domain["Domain owners"]
    Loop["game-loop"]
    Builder["builder-service"]
    Registry["provider-registry"]
    Knowledge["knowledge-base-service"]
    Oracle["oracle-service"]
  end

  subgraph RuntimeOwners["Runtime owners"]
    Client["playable client modules"]
    ModelFacade["model-manager facade"]
    ModelInternals["health + cache + loader + runner"]
  end

  subgraph Data["Persistence and artifacts"]
    Prisma["Prisma data"]
    Assets["public assets"]
  end

  SSR --> RC
  HTMX --> Routes
  Runtime --> Client
  SSE --> Routes
  WS --> Routes

  RC --> LC
  LC --> ERR
  ERR --> Views
  Views --> Ext
  Routes --> Loop
  Routes --> Builder
  Routes --> Registry
  Routes --> Knowledge
  Routes --> Oracle

  Loop --> Prisma
  Builder --> Prisma
  Registry --> ModelFacade
  ModelFacade --> ModelInternals
  Knowledge --> Prisma
  Views --> Assets
  Client --> Assets
```

## Request lifecycle

```mermaid
sequenceDiagram
  participant Browser
  participant Request as request-context
  participant Locale as i18n-context
  participant Route as route handler
  participant Domain as domain owner
  participant View as SSR view / API envelope
  participant Error as global onError

  Browser->>Request: request
  Request->>Locale: correlation id + locale derivation
  Locale->>Route: typed context
  Route->>Domain: typed boundary call
  Domain-->>Route: success or typed failure
  Route-->>View: document / fragment / API body
  Route-->>Error: framework or unexpected error
  Error-->>View: deterministic error envelope
```

## Ownership boundaries

| Concern | Owner | Notes |
| --- | --- | --- |
| Correlation ids and request completion logs | `request-context` | One request-scoped logging boundary |
| Locale negotiation and translator selection | `i18n-context`, `translator.ts` | Tracks explicit override, query, header, and default fallback |
| Shared shell and theme wiring | `src/views/layout.ts` | One layout owner for the SSR shell |
| HTMX lifecycle behavior | `src/htmx-extensions/layout-controls.ts` | Busy state, validation swaps, focus return |
| Game page bootstrap contract | `src/shared/contracts/game-client-bootstrap.ts` | Single SSR-to-browser contract |
| Playable runtime entry | `src/playable-game/game-client.ts` | Orchestration only |
| Authoritative simulation | `src/domain/game/game-loop.ts` | Session restore, queue advancement, persistence coordination |
| Builder mutations and release flow | `src/domain/builder/builder-service.ts` | Draft mutation and publish orchestration |
| AI capability routing | `src/domain/ai/providers/provider-registry.ts` | One provider switchboard |
| Local model execution | `src/domain/ai/model-manager.ts` | Facade over health/cache/loader/runner modules |
| Prisma failure mapping | `src/shared/services/prisma-failure.ts` | Explicit DB failure translation |

## UI state model

All SSR fragments and runtime fallback surfaces map to one state vocabulary.

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading
  loading --> success
  loading --> empty
  loading --> unauthorized
  loading --> retryable_error
  loading --> non_retryable_error
  retryable_error --> loading
  success --> loading
  empty --> loading
  unauthorized --> [*]
  non_retryable_error --> [*]
```

## Shared shell and HTMX ownership

The shell is DaisyUI-first and HTMX-first.

- Shared primitives: `navbar`, `drawer`, `card`, `alert`, `loading`, `table`, `toast`
- Request behavior is driven by HTMX lifecycle events instead of page-local scripts
- Validation responses can intentionally swap on `422`
- Post-swap focus returns to `[data-focus-panel="true"]` first, then `#main-content`

```mermaid
flowchart LR
  Request["HTMX request"] --> Busy["busy state on"]
  Busy --> Swap{"response"}
  Swap -->|2xx| Success["swap fragment"]
  Swap -->|422| Validation["swap validation fragment"]
  Swap -->|401/403| Unauthorized["render unauthorized state"]
  Swap -->|5xx / failure| Error["render error or toast"]
  Success --> Focus["restore focus"]
  Validation --> Focus
  Unauthorized --> Focus
  Error --> Focus
```

## Playable runtime decomposition

The playable client is decomposed into focused modules under one entrypoint.

```mermaid
flowchart LR
  Entry["game-client.ts"]
  Bootstrap["bootstrap/session"]
  Transport["transport/reconnect"]
  Input["input/runtime status"]
  Renderer["renderer lifecycle"]
  Types["shared client types"]
  Contract["SSR bootstrap contract"]

  Entry --> Bootstrap
  Entry --> Transport
  Entry --> Input
  Entry --> Renderer
  Entry --> Types
  Bootstrap --> Contract
```

### Playable connection state machine

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

Rules:

- Restore-first logic is limited to token-expiry and recoverable-close paths.
- Session persistence is owned by the bootstrap/session module.
- Websocket lifecycle, queue depth sync, and retry budget are transport-owned.
- Renderer lifecycle is isolated from connection logic.

## Local AI runtime decomposition

The local model runtime uses one public facade and typed internal boundaries.

```mermaid
flowchart LR
  Provider["transformers-provider.ts"]
  Facade["model-manager.ts"]
  Health["model-runtime-health.ts"]
  Cache["model-pipeline-cache.ts"]
  Loader["model-pipeline-loader.ts"]
  Runner["model-operation-runner.ts"]
  Contract["local-model-contract.ts"]

  Provider --> Facade
  Facade --> Health
  Facade --> Cache
  Facade --> Loader
  Facade --> Runner
  Facade --> Contract
```

### Local runtime result model

```mermaid
flowchart TD
  Operation["local model operation"] --> Result{"result"}
  Result -->|ok| Value["typed value"]
  Result -->|failure| Failure["typed LocalModelFailure"]
  Failure --> Timeout["timeout"]
  Failure --> Circuit["circuit-open"]
  Failure --> CacheRecover["cache-corruption-recovered"]
  Failure --> Unavailable["unavailable"]
  Failure --> Invalid["invalid-output"]
  Failure --> Unexpected["unexpected"]
```

## Builder publish and runtime seeding

Runtime sessions seed from immutable published releases, not mutable draft state.

```mermaid
flowchart LR
  Draft["Draft builder edits"]
  DraftRows["Normalized draft rows"]
  Publish["publishProject()"]
  Release["Immutable release snapshot"]
  Session["game-loop.createSession()"]
  Runtime["Live runtime session"]

  Draft --> DraftRows
  DraftRows --> Publish
  Publish --> Release
  Release --> Session
  Session --> Runtime
```

## Transport surfaces

```mermaid
flowchart LR
  GamePage["GET /game"] --> Bootstrap["bootstrap payload"]
  Create["POST /api/game/session"] --> Session["authoritative session"]
  Restore["POST /api/game/session/:id"] --> Session
  Command["POST /api/game/session/:id/command"] --> Session
  Hud["GET /api/game/session/:id/hud"] --> SSEOut["SSE HUD"]
  Socket["WS /api/game/session/:id/ws"] --> WSOut["realtime state lane"]
```

## Contract-first boundaries

| Boundary | Contract owner |
| --- | --- |
| SSR game bootstrap | `src/shared/contracts/game-client-bootstrap.ts` |
| Game transport frames and scene state | `src/shared/contracts/game.ts` |
| UI fragment state | `src/shared/contracts/ui-state.ts` |
| External provider/network/DB failures | `src/shared/contracts/external-boundary.ts` |
| Local model runtime failures | `src/domain/ai/local-model-contract.ts` |
| Locale ids and messages | `src/shared/i18n/messages.ts`, `translator.ts` |

## Documentation index

- [Docs index](/Users/brandondonnelly/Downloads/tea/docs/index.md)
- [README](/Users/brandondonnelly/Downloads/tea/README.md)
- [API and transport contracts](/Users/brandondonnelly/Downloads/tea/docs/api-contracts.md)
- [Builder domain](/Users/brandondonnelly/Downloads/tea/docs/builder-domain.md)
- [HTMX extensions](/Users/brandondonnelly/Downloads/tea/docs/htmx-extensions.md)
- [Playable runtime](/Users/brandondonnelly/Downloads/tea/docs/playable-runtime.md)
- [Local AI runtime](/Users/brandondonnelly/Downloads/tea/docs/local-ai-runtime.md)
- [Operator runbook](/Users/brandondonnelly/Downloads/tea/docs/operator-runbook.md)
- [RMMZ companion pack](/Users/brandondonnelly/Downloads/tea/docs/rmmz-pack.md)
