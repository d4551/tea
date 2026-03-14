# Operator runbook (operations, verification, and incident response)

Use this runbook for bootstrap, verification, and production-like debugging.

## 1) Environment baseline

Required assumptions:

- Bun is installed in supported policy band.
- Database URL resolves to reachable SQLite or local DB.
- Asset build pipeline is available and output directories are writable.
- Local AI runtime artifacts exist when local providers are enabled.

## 2) Golden startup path

```mermaid
flowchart LR
  S1["bun install"]
  S2["bun run setup"]
  S3["bun run doctor"]
  S4["bun run build:assets"]
  S5["bun run verify"]
  S6["bun run dev"]
  S1 --> S2 --> S3 --> S4 --> S5 --> S6
```

## 3) Operational command matrix

| Command | Purpose | Expected outcome |
| --- | --- | --- |
| `bun run setup` | First-run bootstrap | env + prisma + assets + readiness checks |
| `bun run doctor` | Structural readiness | dependency, file, and filesystem diagnostics |
| `bun run build:assets` | Rebuild client/static assets | updated output under `public/` |
| `bun run docs:check` | Archive integrity gate | all required archive keys present |
| `bun run lint` | Style/type quality | lint and boundary checks pass |
| `bun run typecheck` | TS compile contract checks | strict types pass |
| `bun test` | behavioral suite | contract and route tests pass |
| `bun run verify` | full pre-merge gate | all required checks pass |
| `bun run dependency:drift` | dependency policy | no unexpected drift |
| `bun run start` | production-like boot | server binds and routes respond |

## 4) Verify flow

```mermaid
stateDiagram-v2
  [*] --> docs
  docs --> assets: optional
  docs --> lint: run after docs
  assets --> lint
  lint --> typecheck
  typecheck --> test
  test --> drift: if green
  drift --> ok: all checks pass
  ok --> [*]
  docs --> blocked: missing archive key
  lint --> blocked: lint failures
  typecheck --> blocked: typing failures
  test --> blocked: regression
  drift --> blocked: version mismatch
  blocked --> recover: fix owner
  recover --> docs
```

## 5) Incident playbooks

### 5.1 Builder publish blocked

1. Open the project diagnostics in Builder.
2. Inspect publish validation output.
3. Fix missing scene/dialogue/asset references.
4. Re-run publish.
5. Verify `publishedReleaseVersion` increments and `/game` bootstrap uses published snapshot.

### 5.2 Game session fails to start

1. Confirm `/game` received a valid bootstrap payload.
2. Confirm project is published and release snapshot exists.
3. Confirm `/api/game/session` returns session ID + token.
4. Verify WS and HUD can subscribe with same session ID.
5. Test restore flow with resume token immediately after reconnect.

### 5.3 UI regressions (loading/focus/validation)

1. Confirm shared extensions are initialized (`layout-controls`, `focus-panel`).
2. Confirm route responses continue returning envelopes and status contracts.
3. Ensure no page-local duplicate listeners for `htmx:*`.
4. Replay `hx-target` + `hx-swap` path and verify focus order.

### 5.4 AI failures

1. Check `/api/ai/status` and `/api/ai/health`.
2. Inspect provider readiness and model files.
3. Confirm local model runtime warmup/circuit state logs.
4. Switch fallback provider by config and re-run.

### 5.5 Docs/manifest drift

1. Run `bun run docs:check`.
2. Inspect `notes/doc-archive/index.json` for missing or stale keys.
3. Re-run archive migration step when docs move.

## 6) Logging and correlation

- `correlationId` should exist on major failures.
- Command/publish/session transitions should log owner and outcome.
- Prefer structured logs over ad-hoc prints.

## 7) Recovery paths by failure class

```mermaid
flowchart LR
  F["Failure"] --> D1{"retryable?"}
  D1 -->|yes| R1["Apply bounded backoff and retry"]
  D1 -->|no| D2{"session context?"}
  D2 -->|yes| R2["Restore flow"]
  D2 -->|no| D3{"operator action?"}
  D3 -->|config| R3["Fix config + redeploy"]
  D3 -->|code| R4["Patch owning module and re-run verify"]
```

## 8) Daily/weekly checkpoints

- Daily:
  - `bun run doctor`
  - `bun run dev` (if active development)
  - `bun run verify` on critical changes
- Weekly:
  - `bun run dependency:drift`
  - `bun run docs:check`
  - full command baseline sweep
- Before publish-affecting changes:
  - run security and restore-flow checks at least once.

## 9) One-click troubleshooting checklist

- Validate docs and contract drift first.
- Confirm builder draft vs publish snapshot consistency.
- Validate runtime session graph and resume token validity.
- Reproduce with local session restart before changing infra.
