# TEA architecture (comprehensive reference)

This file is the canonical architecture reference used after markdown retirement.

## 1) Design invariants

1. **Authoring is mutable, runtime is immutable**: builder projects are drafts, sessions are created from published snapshots only.
2. **Single owner per domain**: one service/module owns one major behavior family.
3. **Typed boundary contracts are mandatory**: request/command/input/output is schema-validated.
4. **SSR-first**: all primary screens are server-rendered and then progressively enhanced.
5. **Transport contracts are explicit**: session commands, WS, and HUD SSE have dedicated contracts.

## 2) Topology and responsibility map

```mermaid
flowchart TB
  subgraph Browser
    B1["Home SSR"]
    B2["Builder SSR + HTMX"]
    B3["Game SSR"]
    B4["WS /game session channel"]
    B5["HUD SSE"]
    B6["Command POST"]
  end

  subgraph Kernel["src/app.ts"]
    K1["requestContext plugin"]
    K2["i18n + locale plugin"]
    K3["onError + onAfterHandle"]
    K4["staticAssetsPlugin"]
    K5["authSessionGuard"]
    K6["creatorWorkerPlugin"]
    K7["aiProviderPlugin"]
  end

  subgraph Routes
    R1["page-routes.ts"]
    R2["builder-routes.ts"]
    R3["builder-api.ts"]
    R4["game-routes.ts"]
    R5["game-plugin.ts"]
    R6["ai-routes.ts"]
    R7["api-routes.ts"]
  end

  subgraph Domain
    D1["builder-service.ts"]
    D2["builder-project-state-store.ts"]
    D3["builder-publish-validation.ts"]
    D4["game-loop.ts"]
    D5["provider-registry.ts"]
    D6["knowledge-base-service.ts"]
    D7["creator-worker.ts"]
    D8["oracle-service.ts"]
  end

  subgraph Contracts
    C1["game-client-bootstrap"]
    C2["error-envelope"]
    C3["command schema"]
    C4["AI registration contract"]
  end

  subgraph Storage
    S1["Prisma / SQLite"]
    S2["uploads + public assets"]
    S3["AI retrieval tables"]
  end

  B1 --> K1
  B2 --> K1
  B3 --> K1
  B4 --> K1
  B5 --> K1
  B6 --> K1

  K1 --> K2 --> K3 --> K4 --> K5 --> K6 --> K7
  K7 --> R1
  K7 --> R2
  K7 --> R3
  K7 --> R4
  K7 --> R5
  K7 --> R6
  K7 --> R7

  R2 --> D1
  R3 --> D1
  R3 --> D5
  R3 --> D6
  R4 --> D1
  R4 --> D4
  R5 --> D4
  R5 --> D2
  R6 --> D5
  R6 --> D6
  R7 --> D8
  R7 --> D7

  D1 --> S1
  D2 --> S1
  D3 --> S1
  D4 --> S1
  D5 --> S2
  D6 --> S3
  C1 --> R4
  C2 --> K3
```

## 3) Request lifecycle

```mermaid
sequenceDiagram
  autonumber
  participant Browser
  participant Ctx as requestContext plugin
  participant Locale as i18n plugin
  participant Guard as auth/session guards
  participant Route as route handler
  participant Domain as domain service
  participant Envelope as success/error envelope
  participant Response as SSR or JSON

  Browser->>Ctx: incoming request
  Ctx->>Locale: build request context
  Locale->>Guard: locale/auth projection
  Guard->>Route: guarded typed context
  Route->>Domain: call domain service
  alt service success
    Domain-->>Envelope: typed domain result
    Envelope-->>Response: document/fragment/JSON
  else domain validation
    Domain-->>Route: typed failure
    Route-->>Envelope: deterministic failure contract
  else unexpected exception
    Route->>K3: throw
    K3-->>Envelope: global error mapping
  end
  Response-->>Browser: response
```

## 4) Create → Publish → Play → Restore (full sequence)

```mermaid
sequenceDiagram
  autonumber
  actor Author
  participant BuilderUI as /builder
  participant BuilderAPI as /api/builder
  participant BuilderSvc as builder-service
  participant Validate as publish validation
  participant Store as Prisma store
  participant GamePage as /game
  participant GameAPI as game-plugin.ts
  participant GameLoop as game-loop.ts

  Author->>BuilderUI: open /builder?projectId=hero-fort
  BuilderUI->>BuilderAPI: request draft context
  BuilderAPI->>BuilderSvc: getProject(projectId)
  BuilderSvc->>Store: load draft + dependencies
  Store-->>BuilderSvc: scenes, npcs, assets, dialogue
  BuilderSvc-->>BuilderAPI: typed draft
  BuilderAPI-->>BuilderUI: SSR shell + HTMX tabs

  Author->>BuilderAPI: POST /api/builder/projects
  BuilderAPI-->>BuilderAPI: sanitize redirectPath + validate
  BuilderAPI->>BuilderSvc: createProject()
  BuilderSvc->>Store: create draft roots
  Store-->>BuilderSvc: draft id
  BuilderSvc-->>BuilderAPI: draft details
  BuilderAPI-->>BuilderUI: HX-Redirect /builder?projectId=<id>

  Author->>BuilderUI: edit and save
  BuilderUI->>BuilderAPI: patch/asset/dialogue endpoints
  BuilderAPI->>BuilderSvc: mutation calls
  BuilderSvc->>Store: versioned writes

  Author->>BuilderUI: Publish
  BuilderUI->>BuilderAPI: PATCH /api/builder/projects/:id/publish
  BuilderAPI->>BuilderSvc: publishProject(true)
  BuilderSvc->>Validate: validateBuilderProjectForPublish()
  Validate-->>BuilderSvc: pass / issues
  alt validation pass
    BuilderSvc->>Store: materialize immutable snapshot
    Store-->>BuilderSvc: releaseVersion + snapshot
    BuilderSvc-->>BuilderAPI: publish ok
    BuilderAPI-->>BuilderUI: play-enabled shell
  else validation issue
    Validate-->>BuilderSvc: issues
    BuilderSvc-->>BuilderAPI: fail
    BuilderAPI-->>BuilderUI: validation fragment
  end

  Author->>GamePage: open /game?projectId=id
  GamePage->>BuilderSvc: getPublishedProject(id)
  BuilderSvc->>Store: read published snapshot
  Store-->>BuilderSvc: snapshot + bootstrap metadata
  BuilderSvc-->>GamePage: snapshot

  Author->>GameAPI: POST /api/game/session
  GameAPI->>GameLoop: createSession(snapshot, locale)
  GameLoop->>Store: persist session + resume token
  GameLoop-->>GameAPI: session bootstrap
  GameAPI-->>Author: sessionId + resume token

  Author->>GameAPI: POST /api/game/session/:id/command
  GameAPI->>GameLoop: processCommand
  GameLoop->>Store: persist command outcome
  GameLoop-->>GameAPI: command envelope
  GameAPI-->>Author: state update hint

  Author->>GameAPI: WS + HUD SSE subscribe
  GameAPI->>GameLoop: register streaming subscribers
  GameLoop-->>Author: WS frames + HUD events

  Author->>GameAPI: POST /api/game/session/:id (resumeToken)
  GameAPI->>GameLoop: restoreSession
  GameLoop-->>Author: restored state or unauthorized
```

## 5) Gameplay transport micro-level map

```mermaid
flowchart LR
  subgraph Input
    I1[/api/game/session/:id/command]
    I2[/api/game/session/:id/hud]
    I3[/api/game/session/:id/ws]
    I4[/api/game/session/:id restore]
  end
  subgraph Simulation["game-loop"]
    P1[validate command]
    P2[apply deterministic transition]
    P3[persist session state]
    P4[produce event envelopes]
  end
  subgraph Output
    O1[command outcome envelope]
    O2[incremental WS]
    O3[SSE HUD updates]
    O4[restore payload]
  end

  I1 --> P1 --> P2 --> P3 --> O1
  I3 --> P4 --> O2
  I2 --> P4 --> O3
  I4 --> P3 --> O4
```

## 6) Builder and AI data model map

```mermaid
flowchart TD
  subgraph Builder
    B1["ProjectDraft / mutable tables"]
    B2["Scenes + Nodes"]
    B3["NPC + Dialogue"]
    B4["Quests + Automation"]
    B5["PublishedSnapshot (immutable)"]
    B1 --> B2
    B1 --> B3
    B1 --> B4
    B3 --> B5
    B2 --> B5
    B4 --> B5
  end

  subgraph Runtime
    R1["GameSession"]
    R2["SceneState"]
    R3["Participants"]
    R4["Inventory"]
    R5["Combat"]
    R1 --> R2
    R1 --> R3
    R1 --> R4
    R1 --> R5
  end

  subgraph Knowledge
    K1["AiKnowledgeDocument"]
    K2["AiKnowledgeChunk"]
    K3["AiKnowledgeChunkTerm"]
    K1 --> K2 --> K3
  end

  B5 --> R1
  K1 --> K2 --> K3
```

## 7) Security hardening checkpoints

- Static path hardening: normalize/decode path and verify mount-root prefix before file read.
- URL/redirect and mutation hardening: strict contracts on builder create/publish endpoints.
- Runtime consistency hardening: no direct runtime reads from draft tables.
- Session hardening: restore and command endpoints require valid session context.
- Error hardening: all unexpected failures converge to envelope form.

## 8) Failure and recovery state chart

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Loading: start request
  Loading --> Success: typed success
  Loading --> Empty: optional missing data
  Loading --> RetryableError: transient issue
  Loading --> NonRetryableError: validation/auth
  Success --> Running
  Running --> CommandQueued
  CommandQueued --> Persisted: valid command
  CommandQueued --> Rejected: invalid command
  Persisted --> Broadcasted
  Rejected --> Success: user fix
  Broadcasted --> Running
  NonRetryableError --> Idle
  RetryableError --> Loading
```

## 9) Verification coupling

- `bun run verify` validates high-level policy and project checks.
- `bun run lint` / `bun run typecheck` protect compile-time correctness.
- `bun test` should exercise route/domain transitions.
- `bun run docs:check` validates archive manifest and references.
- `bun run dependency:drift` ensures stack version policy.

## 10) Future work gates

- Formalized UI state transitions by mapping legacy branches to a single enum.
- Expand AI request observability around provider latency and retry behavior.
- Add contract tests for resume token expiry and malformed redirectPath behavior.
- Keep doc map in sync with route-level contract changes.
