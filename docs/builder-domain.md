# Builder domain (complete authoring model and invariants)

The builder domain owns mutable authoring data and is intentionally separated from runtime consumption.

## 1) Core invariants

1. **Draft is mutable, published is immutable.**
2. **All builder writes are routed through `builder-service`.**
3. **Publish is a validated transition, not a direct persistence write.**
4. **Runtime seeding uses only published snapshots.**
5. **AI generation and automation operate only inside project scope.**

## 2) State and ownership map

```mermaid
flowchart LR
  subgraph UI["Builder surfaces"]
    U1["/builder SSR pages"]
    U2["builder-api endpoints"]
    U3["AI + automation helpers"]
  end

  subgraph Domain["Domain services"]
    D1["builder-service.ts"]
    D2["builder-project-state-store.ts"]
    D3["builder-publish-validation.ts"]
    D4["creator-worker.ts"]
    D5["provider-registry.ts"]
  end

  subgraph Storage["Persistence"]
    S1["ProjectDraft"]
    S2["ProjectPublished"]
    S3["Assets"]
    S4["Automation artifacts"]
    S5["Scenes / NPC / Dialogue / Quests"]
  end

  U1 --> U2
  U2 --> D1
  U2 --> U3
  U3 --> D5 --> D1
  D1 --> D2 --> S1
  D1 --> D3 --> S2
  D2 --> S3
  D2 --> S4
  D2 --> S5
  D4 --> S4
```

## 3) Authoring lifecycle

```mermaid
sequenceDiagram
  autonumber
  actor Author
  participant UI as /builder UI
  participant API as /api/builder/*
  participant Svc as builder-service
  participant Store as builder-project-state-store
  participant Val as publish validation
  participant AI as /api/ai + provider registry
  participant Worker as creator-worker

  Author->>UI: open project
  UI->>API: load draft
  API->>Svc: getProject(projectId)
  Svc->>Store: read draft and relations
  Store-->>Svc: graph of scenes/dialogue/npcs/assets/quests
  Svc-->>API: validated draft model
  API-->>UI: SSR shell + HTMX tabs

  Author->>UI: patch scene / dialogue / quest / asset
  UI->>API: mutation endpoint
  API->>Svc: updateProjectDraft()
  Svc->>Store: versioned mutable persistence
  Store-->>Svc: saved version
  Svc-->>API: typed write contract
  API-->>UI: fragment with latest state

  Author->>UI: trigger generation
  UI->>API: generator request
  API->>AI: request generation plan
  AI->>Worker: execute bounded generation
  Worker->>Store: persist artifacts
  Worker-->>Svc: result + risk metadata
  Svc-->>API: patch contract with review state
  API-->>UI: generated patch review fragment

  Author->>UI: click Publish
  UI->>API: PATCH /api/builder/projects/:id/publish
  API->>Svc: publishProject(true)
  Svc->>Val: validateBuilderProjectForPublish()
  Val-->>Svc: pass / issue list
  alt pass
    Svc->>Store: materialize immutable snapshot
    Store-->>Svc: releaseVersion
    Svc-->>API: published release pointer
    API-->>UI: play-enabled state
  else fail
    Svc-->>API: issues list
    API-->>UI: localized validation fragment
  end
```

## 4) Domain boundaries and owners

| Area | Owner | Responsibility |
| --- | --- | --- |
| Core orchestration | `builder-service.ts` | create/read/update/publish core rules |
| Draft persistence | `builder-project-state-store.ts` | relational writes and normalization |
| Publish gates | `builder-publish-validation.ts` | required scene/npc/dialogue/assets checks |
| Automation execution | `creator-worker.ts` | generation jobs + diagnostics |
| Provider selection | `provider-registry.ts` | AI/knowledge tool routing |
| Route adaptation | `builder-api.ts` | schema, envelope, and HTMX transitions |

## 5) Publish transition machine

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Validating: publish request
  Validating --> ValidationFailed: checks fail
  Validating --> Snapshotting: checks pass
  Snapshotting --> Published: immutable snapshot committed
  Snapshotting --> Draft: persistence failure
  Published --> Unpublished: unpublish request
  Unpublished --> Published: republish
  ValidationFailed --> Draft: issues fixed in editor
```

Publish must enforce at least:

- Metadata and locale consistency.
- Scene graph start and connectivity integrity.
- Dialogue and NPC references resolved.
- At least one playable bootstrap entry route.
- Valid/normalized asset paths and existence checks.
- Trigger/action schema validity.

## 6) Data model map

```mermaid
flowchart TD
  subgraph Draft
    PD["ProjectDraft record"]
    SC["Scenes + Nodes"]
    NPC["NPC + Dialogue"]
    Q["Quests + Automation"]
    AS["Assets + Upload metadata"]
  end

  subgraph Release
    PP["ProjectPublished record"]
    SNAP["Snapshot blob + version"]
    IDX["Snapshot indexes"]
  end

  subgraph Runtime
    RTS["game-loop seed"]
    SE["GameSession state"]
  end

  PD --> SC --> PP --> SNAP --> IDX
  NPC --> PP
  Q --> PP
  AS --> PP
  SNAP --> RTS --> SE
  IDX --> RTS
```

Note: `IDX` is the internal bootstrap index used for deterministic runtime injection.

## 7) Contract and resilience

- Builder endpoints must remain envelope consistent even for partial HTMX responses.
- Mutation failures are emitted as classified errors: `validation`, `storage`, `authorization`, `transient`.
- Publish should be safe to retry on duplicate logical inputs.
- Generated artifacts must include provenance (`source`, `timestamp`, `traceId`) for review.

## 8) One owner per layer

- Route handlers shape request/response boundaries only.
- Domain services own write semantics and validation.
- Store modules own persistence durability and relation traversal.
- AI/automation modules own execution boundaries and provide typed results only.

## 9) Chinese quick map

- 任何构建编辑都在可变 `ProjectDraft` 内完成。
- 发布是“验证 -> 快照化 -> 不可变发布版本”流程。
- 游戏运行时只允许消费已发布快照，不允许直接消费草稿。
