# TEA — Bun-native game runtime + builder + AI platform

<p align="center">
  <strong>SSR-first game authoring and runtime stack built on Bun, Elysia, HTMX, and TypeScript strict.</strong>
</p>

<p align="center">
  <a href="notes/doc-archive/README.txt">English</a>
  ·
  <a href="notes/doc-archive/README.zh-CN.txt">中文</a>
  ·
  <a href="notes/doc-archive/ARCHITECTURE.txt">Architecture</a>
  ·
  <a href="notes/doc-archive/docs__index.txt">Docs index</a>
</p>

<p align="center">
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.3.x-111827?style=flat-square">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-2563eb?style=flat-square">
  <img alt="Elysia" src="https://img.shields.io/badge/Elysia-1.4.x-059669?style=flat-square">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7.x-1f2937?style=flat-square">
  <img alt="HTMX" src="https://img.shields.io/badge/HTMX-2.x-1d4ed8?style=flat-square">
  <img alt="SSR first" src="https://img.shields.io/badge/rendering-SSR--first-7c3aed?style=flat-square">
</p>

> This archive is the canonical, no-markdown documentation surface for operating and extending TEA.

## 1) What TEA is and how it is intended to work

TEA is a single Bun server application with four coupled but separable concerns:

- `Builder` area (authoring): create and mutate draft projects via HTMX-enhanced SSR pages.
- `Publish` boundary: validate mutable draft → materialize immutable published snapshot.
- `Game runtime`: run authoritative sessions from snapshots and emit live updates.
- `AI services`: local/Ollama/OpenAI-compatible orchestration for generation, retrieval, and assistant tooling.

The strict rule: **runtime never reads draft state directly**. Every play session starts from a published snapshot.

## 2) End-to-end operational model

### Top-level architecture

```mermaid
flowchart TB
  subgraph BrowserSurface["Browser surfaces"]
    B1[Home SSR]
    B2[Builder SSR + HTMX]
    B3[Playable SSR page]
    B4[WebSocket + HUD SSE + command POST]
  end

  subgraph AppKernel["src/app.ts composition"]
    K1[requestContext plugin]
    K2[i18n + locale plugin]
    K3[error-handler]
    K4[staticAssets plugin]
    K5[swagger + session/creator/ai plugins]
  end

  subgraph RouteSurfaces["Route layer"]
    R1[page-routes.ts]
    R2[builder-routes.ts]
    R3[builder-api.ts]
    R4[game-routes.ts]
    R5[game-plugin.ts]
    R6[api-routes.ts]
    R7[ai-routes.ts]
  end

  subgraph DomainCore["Domain layer"]
    D1[builder-service.ts]
    D2[game-loop.ts]
    D3[builder-publish-validation.ts]
    D4[provider-registry.ts]
    D5[knowledge-base-service.ts]
    D6[oracle-service.ts]
    D7[creator-worker.ts]
  end

  subgraph Persistence["Storage and assets"]
    S1[Prisma + SQLite]
    S2[uploads + builder artifacts]
    S3[public static output]
  end

  B1 --> K1
  B2 --> K1
  B3 --> K1
  B4 --> K1

  K1 --> K2 --> K3 --> K4 --> K5
  K5 --> R1
  K5 --> R2
  K5 --> R3
  K5 --> R4
  K5 --> R5
  K5 --> R6
  K5 --> R7

  R2 --> D1
  R3 --> D1
  R3 --> D4
  R3 --> D5
  R4 --> D1
  R4 --> D2
  R5 --> D2
  R5 --> D1
  R7 --> D4
  R7 --> D5
  R6 --> D6
  R6 --> D7
  R1 --> K5

  D1 --> S1
  D2 --> S1
  D1 --> S2
  D3 --> S1
  D2 --> S2
  D4 --> S3
  D5 --> S1
```

### Why this topology exists

- SSR pages are always server-driven, so initial paint, permission checks, and critical bootstrapping are deterministic.
- HTMX handles incremental updates where appropriate to avoid full SPA complexity.
- Game transport is explicit (`POST`, `WS`, `SSE`) with bounded surfaces.
- Builder mutations flow through one domain owner (`builder-service`) for coherence.

## 3) Complete create-game flow (UI wired end-to-end)

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant BuilderUI as /builder UI
  participant BuilderAPI as /api/builder
  participant BuilderSvc as builderService
  participant PublishVal as publish validation
  participant Store as Prisma project store
  participant GameRoute as /game page
  participant GameAPI as game-plugin.ts
  participant GameLoop as game-loop.ts
  participant HUD as HUD SSE endpoint

  User->>BuilderUI: open /builder?projectId=hero-fort
  BuilderUI->>BuilderAPI: GET /builder shell + draft lookup
  BuilderAPI->>BuilderSvc: getProject(projectId)
  BuilderSvc->>Store: load mutable draft + dependencies
  Store-->>BuilderSvc: scenes, assets, npcs, dialogue, automation
  BuilderSvc-->>BuilderAPI: typed draft model
  BuilderAPI-->>BuilderUI: SSR builder shell + HTMX-initialized editor tabs

  User->>BuilderAPI: POST /api/builder/projects {projectId, locale, redirectPath}
  BuilderAPI-->>BuilderAPI: sanitize redirectPath, contract validation
  BuilderAPI->>BuilderSvc: createProject()
  BuilderSvc->>Store: insert project + initial draft records
  Store-->>BuilderSvc: draft id and defaults
  BuilderSvc-->>BuilderAPI: created project
  BuilderAPI-->>BuilderUI: HX-Redirect to /builder?projectId=<id>

  User->>BuilderUI: edit builder domains (scenes/npc/dialogue/quests/assets)
  BuilderUI->>BuilderAPI: patch endpoints (HTMX posts)
  BuilderAPI->>BuilderSvc: updateProjectDraft()
  BuilderSvc->>Store: versioned mutable writes

  User->>BuilderUI: click Publish
  BuilderUI->>BuilderAPI: PATCH /api/builder/projects/:id/publish {published:true}
  BuilderAPI->>BuilderSvc: publishProject(true)
  BuilderSvc->>PublishVal: validateBuilderProjectForPublish()
  PublishVal-->>BuilderSvc: issues[] or OK
  alt passes
    BuilderSvc->>Store: materialize immutable release snapshot
    Store-->>BuilderSvc: released snapshot + releaseVersion
    BuilderSvc-->>BuilderAPI: 200 with published release flags
    BuilderAPI-->>BuilderUI: render play-enabled shell
  else fails
    BuilderSvc-->>BuilderAPI: validation issues + context
    BuilderAPI-->>BuilderUI: fragment with error state
  end

  User->>GameRoute: open /game?projectId=<id>
  GameRoute->>BuilderSvc: getPublishedProject(projectId)
  BuilderSvc-->>GameRoute: snapshot + build config
  GameRoute->>BuilderSvc: getScene bootstrap
  GameRoute->>GameAPI: POST /api/game/session {projectId, locale}
  GameAPI->>GameLoop: createSession()
  GameLoop->>Store: create authoritative session state
  Store-->>GameLoop: sessionId + resume token
  GameLoop-->>BuilderSvc: bootstrap payload
  GameRoute-->>User: SSR playable page with bootstrap JSON

  User->>GameAPI: POST /api/game/session/:id/command {type, payload}
  GameAPI->>GameLoop: processCommand()
  GameLoop->>Store: command outcome persistence
  GameLoop-->>GameAPI: deterministic command outcome
  GameAPI-->>User: 200 outcome + next render hints

  par
    User->>GameAPI: GET /api/game/session/:id/hud
    GameAPI->>GameLoop: subscribe HUD stream
    GameLoop-->>User: SSE event stream
  and
    User->>GameAPI: WS /api/game/session/:id/ws
    GameAPI->>GameLoop: subscribe WS channel
    GameLoop-->>User: incremental state frames
  end

  User->>GameAPI: POST /api/game/session/:id {sessionId,resumetoken}
  GameAPI->>GameLoop: restoreSession()
  GameLoop-->>User: restored state if token and session valid
```

## 4) Request lifecycle and error envelope contract

```mermaid
flowchart LR
  Req[Incoming HTTP/WS/SSE request]
  Ctx[requestContextPlugin]
  Locale[i18n + locale resolution]
  Guard[auth and scoped guards]
  Validate[Typed schema validation]
  Domain[Domain service call]
  Success[Success envelope]
  Failure[error-envelope]
  Resp[SSR doc / partial / JSON]

  Req --> Ctx --> Locale --> Guard --> Validate --> Domain
  Domain --> Success --> Resp
  Validate --> Failure --> Resp
  Domain --> Failure --> Resp
```

For every JSON API surface, success/failure are meant to be deterministic and serializable so client code can render predictable UI states.

## 5) Route and contract inventory (current, non-markdown)

### Pages and partials

- `src/routes/page-routes.ts`: SSR routes and navigation shells.
- `src/routes/builder-routes.ts`: builder layout and editor entry route.
- `src/routes/game-routes.ts`: playable route and bootstrap page.
- `src/shared/constants/routes.ts`: canonical route map.

### Builder and authoring APIs

- `POST /api/builder/projects` create draft.
- `PATCH /api/builder/projects/:projectId/publish` publish/unpublish.
- Asset upload and metadata normalization APIs.
- Scene / NPC / dialogue / quest / automation patch APIs.
- `GET/POST /api/builder/ai/*` generation and retrieval APIs.

### Gameplay transport APIs

- `POST /api/game/session` create session.
- `POST /api/game/session/:sessionId` restore session.
- `POST /api/game/session/:sessionId/command` submit command.
- `POST /api/game/session/:sessionId/invite` / `join` for session invite workflows.
- `GET /api/game/session/:sessionId/state` status/state polling.
- `GET /api/game/session/:sessionId/hud` live HUD stream.
- `WS /api/game/session/:sessionId/ws` real-time state stream.

## 6) Internal state model and transitions

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading
  loading --> success
  loading --> empty
  loading --> unauthorized
  loading --> invalid
  success --> running
  running --> success
  running --> transition
  success --> error_retryable
  success --> error_non_retryable
  transition --> running
  transition --> error_retryable
  error_retryable --> loading
  error_non_retryable --> idle
```

This state machine maps to SSR fragments and API envelopes used across builder and gameplay UIs.

## 7) Dataflow breakdown by responsibility

### 7.1 Builder dataflow

```mermaid
flowchart LR
  U[User interactions] --> UI[Builder HTMX form and tabs]
  UI --> API[builder-api.ts]
  API --> SVC[builder-service.ts]
  SVC --> DB[(Prisma draft and relation tables)]
  DB --> SVC --> API
  API --> U
  SVC --> PublishCheck[builder-publish-validation.ts]
  PublishCheck --> SVC
```

### 7.2 Gameplay dataflow

```mermaid
flowchart LR
  U[Player browser] --> CMD[/api/game/session/*]
  CMD --> SVC[game-plugin.ts]
  SVC --> LOOP[game-loop.ts]
  LOOP --> DB[(Prisma session store)]
  LOOP --> DB
  LOOP --> WS[WebSocket broadcaster]
  LOOP --> SSE[HUD stream]
  WS --> U
  SSE --> U
```

### 7.3 AI and retrieval dataflow

```mermaid
flowchart LR
  U[Author action] --> AIAPI[/api/builder/ai/*]
  AIAPI --> SVC[provider-registry]
  SVC --> CACHE[(Knowledge index in Prisma)]
  SVC --> OUT[Local / Ollama / OpenAI-compatible provider]
  OUT --> SVC --> AIAPI
  AIAPI --> U
  CACHE --> SVC
```

## 8) Security and hardening checkpoints

- No trust of client-provided state: all authoritative writes go through server domain methods.
- Project creation and publish endpoints validate redirect and payload structure.
- Game sessions are keyed by server-issued tokens and restore checks.
- Static asset routes are path-normalized and mount-root constrained.
- Upload workflows normalize file metadata and persist canonical paths.
- Dependency drift and lint/typecheck are enforced in verification pipeline.

## 9) Performance and reliability notes

- Server-rendered bootstrap minimizes hydration cost for first paint.
- HTMX partial updates reduce SPA complexity for builder controls.
- Game loops favor short, explicit session commands rather than free-form socket payloads.
- SSE/WebSocket streams are intentionally separated: HUD has low-cardinality events; WS carries richer state frames.

## 10) Validation commands you should run

- `bun run lint`
- `bun run typecheck`
- `bun run test` or `bun test`
- `bun run verify`
- `bun run docs:check`

Use these before merging any route-level behavior changes, especially around publish gating and game transport.

## 11) Frequently encountered failure modes

| Symptom | Likely cause | Fix path |
| --- | --- | --- |
| Play button remains disabled after publish | publish validation returned issues | open project diagnostics and rerun publish |
| Session restore fails | stale token or wrong session id | create a new session and propagate resume token |
| Command seems ignored | malformed command contract or unauthorized route context | validate payload contract and session/locale headers |
| HUD stream disconnects repeatedly | token/channel mismatch or expired loop state | restart session and re-open `/api/game/session/:id/hud` |
| Builder edits not reflected in playtest | unpublished draft used | ensure publish snapshot was generated and used by /game route |

## 12) If you are extending the platform

- Keep one owner per module: route parsing in routes, state transitions in domain services.
- Add/modify contracts with explicit schema types.
- Keep UI states aligned to success/failure envelope taxonomy.
- Add observability around `requestContext` if adding new request boundaries.

## 13) Archive status

This document set lives under `notes/doc-archive` and replaces legacy `.md` readme/architecture artifacts for this repo slice.
