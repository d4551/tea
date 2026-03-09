# Builder domain

This document describes the current-state builder model: draft authoring, normalized persistence, publish invariants, and runtime seeding.

## Domain flow

```mermaid
flowchart LR
  Draft["Builder draft mutation"]
  Store["builder-project-state-store"]
  Service["builder-service"]
  Validation["publish validation"]
  Release["immutable release snapshot"]
  Runtime["game-loop runtime seeding"]

  Draft --> Service
  Service --> Store
  Service --> Validation
  Validation --> Release
  Release --> Runtime
```

## Ownership model

| Concern | Owner |
| --- | --- |
| Draft snapshot decode/normalize | `builder-project-state-store` |
| Builder mutations and defaults | `builder-service` |
| Publish validation | `builder-publish-validation.ts` |
| Generation and automation execution | `creator-worker.ts` |
| Runtime session seeding | `game-loop.ts` |

## Draft versus release

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> validated
  validated --> published
  published --> unpublished
  unpublished --> published
```

Rules:

- Draft edits can change mutable authoring state.
- Publish materializes an immutable release snapshot.
- Runtime sessions seed from the published release, not mutable draft rows.
- Unpublish removes the active published pointer without deleting historical releases.

## Builder surface areas

The builder domain owns authoring for:

- scenes
- scene nodes
- NPCs
- dialogue
- assets and uploads
- animation clips
- dialogue graphs
- quests
- triggers and flags
- AI generation jobs and patch workflows
- automation runs and artifacts

## Publish invariants

- A project must pass builder publish validation before release.
- A release is immutable once materialized.
- Runtime sessions consume published release data only.
- Builder create flows should come from the builder domain, not route-local defaults.

## Builder and runtime relationship

```mermaid
flowchart TB
  Builder["Builder authoring routes"]
  Draft["Draft project state"]
  Release["Published release"]
  Game["Game page / game-loop"]

  Builder --> Draft
  Draft --> Release
  Release --> Game
```

## API and UI implications

- Builder SSR routes should consume the shared shell, locale handling, and UI-state vocabulary.
- Builder APIs should not invent route-local mutation semantics when the builder domain already owns those operations.
- AI patch preview/apply, automation evidence, and generation review belong to the same builder project contract family.
