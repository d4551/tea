# Full gap remediation batches

Date: 2026-03-16

This document converts the findings in `docs/full-gap-inventory-audit.md` into implementation-ready batches. Each batch defines the intended outcome, the primary behavior changes, affected interfaces, required tests, and acceptance criteria.

## Batch 1: User-facing dead ends and misleading UI ✅ COMPLETE

### Intended outcome

Builder authoring surfaces stop advertising controls or states that do not exist. Every visible disclosure, preview, and status panel must map to a real workflow state.

### Primary behavior changes

- Remove or implement empty `Advanced tools` sections in asset and NPC creation flows.
- Replace generic preview placeholders with explicit `idle`, `empty`, `missing-manifest`, `pending-generation`, and `ready` states where the workflow supports them.
- Ensure zero-action or unavailable subflows do not render as if they are active authoring tools.

### Affected interfaces and contracts

- `src/views/builder/assets-editor.ts`
- `src/views/builder/npc-editor.ts`
- Any message keys used to represent preview states in `src/shared/i18n/messages.ts`
- Builder form payload contracts if advanced fields are added instead of removed

### Required tests

- View-level tests asserting:
  - no empty advanced-tools disclosure remains,
  - preview states render distinct copy and badges,
  - inaccessible states do not present submit-affordance ambiguity.
- HTMX route tests covering any new advanced form fields.

### Acceptance criteria

- No builder disclosure renders only a repeated section label.
- Preview surfaces use explicit state names instead of generic placeholders when data is absent or incomplete.
- New UI states are localized and keyboard/focus-safe.

### Implementation notes

- Removed both dead-end `Advanced tools` `<details>` disclosures from `assets-editor.ts` (upload form and path form).
- Removed dead-end `Advanced tools` `<details>` disclosure from `npc-editor.ts`.
- All three rendered clickable collapsibles that only echoed the section label text with no actionable controls.

## Batch 2: Masked runtime no-ops and degraded capability exposure ✅ COMPLETE

### Intended outcome

Safe degradation remains safe, but it becomes explicit. Operators and creators can tell when retrieval, local fallback, or provider-backed behavior is degraded rather than fully available.

### Primary behavior changes

- Add a first-class retrieval capability state that distinguishes vector-enabled from lexical-only search.
- Expose `sqlite-vec` availability and embedding/runtime readiness in observability and creator capability surfaces.
- Replace hardcoded `offlineFallback: unavailable` behavior with derived state where local fallback truly exists or is intentionally unsupported.
- Ensure degraded capability states provide stable reason codes and user-facing remediation text.

### Affected interfaces and contracts

- `src/domain/ai/vector-store.ts`
- `src/domain/ai/capability-snapshot.ts`
- Builder AI capability/observability routes in `src/routes/builder-api.ts`
- Any builder views rendering capability states

### Required tests

- Unit tests for capability derivation across:
  - vector store available,
  - vector store unavailable,
  - provider ready but surface missing,
  - provider degraded,
  - local fallback enabled/disabled.
- API contract tests for capability and observability responses.

### Acceptance criteria

- No safe no-op path is represented as simply “ready”.
- Creator/operator surfaces can distinguish provider failure, surface absence, and retrieval degradation.
- Route-level capability outputs remain stable and machine-readable.

### Implementation notes

- Added `knowledge-retrieval` to `CreatorCapabilityKey` union in `game.ts`.
- Added `toRetrievalCapabilityState` in `capability-snapshot.ts` that derives state from both embedding provider and vector store readiness.
- Changed `deriveFeatureCapability` to accept `vectorStoreAvailable: boolean` — `offlineFallback` now derives from embedding + vector store state instead of being hardcoded to `unavailableState("fallback-disabled")`.
- Changed `deriveCreatorCapabilities` to accept `vectorStoreAvailable: boolean` and emit a `knowledge-retrieval` capability row.
- Updated all call sites (`builder-routes.ts`, `builder-api.ts`, `ai-routes.ts`) to pass `vectorStore.available`.
- Threaded parameter through `builder-flow.ts` and `creator-capability-adapter.ts` pass-through layers.
- Added `creatorCapabilityKnowledgeRetrieval` i18n key in EN ("Knowledge retrieval") and ZH ("知识检索").

## Batch 3: Optimistic validation and probe correctness ✅ COMPLETE

### Intended outcome

Readiness, setup, doctor, and automation health checks represent what they actually prove. Syntax checks, reachability checks, and usable workflow checks are separated.

### Primary behavior changes

- Split runtime readiness into:
  - static configuration validity,
  - writable-directory validation with cleanup,
  - automation-origin reachability,
  - optional workflow smoke checks.
- Replace automation-origin “HTTP < 400” probing with a dedicated health contract or stronger content verification.
- Tighten builder platform readiness so inventory presence and verified workflow capability are separate outputs.

### Affected interfaces and contracts

- `src/bootstrap/runtime-readiness.ts`
- `src/bootstrap/preflight.ts`
- `scripts/runtime-bootstrap.ts`
- `src/domain/builder/creator-worker.ts`
- `src/domain/builder/platform-readiness.ts`

### Required tests

- Unit tests for probe cleanup and readiness branch coverage.
- Worker tests for `unreachable`, `misconfigured`, `auth-required`, and `healthy` automation-origin states.
- Contract tests for readiness and platform-status payloads.
- One end-to-end smoke path covering builder shell plus playable route.

### Acceptance criteria

- No readiness output claims non-mutating behavior while leaving probe artifacts behind.
- Automation health checks prove the expected builder surface, not just generic reachability.
- Platform readiness no longer treats content existence as workflow validation.

### Implementation notes

- `verifyWritableDirectory` now cleans up `.bun-probe` files after writing, using `Bun.file().exists()` + `node:fs/promises.unlink` with `settleAsync` to tolerate cleanup failures.
- `verifyAiRouting` no longer returns `ok: true` unconditionally — it checks that `preferredProvider` and `defaultPolicy` are non-empty strings.
- Replaced the static `automationOriginCheck` (URL-syntax-only) with `verifyAutomationOrigin`: an async function that probes the origin URL, validates HTTP status, and checks for HTML content markers (`<!`, `<html`, `<body`).
- `probeAutomationOrigin` in `creator-worker.ts` now reads the response body and verifies HTML content markers, rejecting endpoints that return non-HTML (e.g. JSON health endpoints, misconfigured reverse proxies).
- `BuilderCapabilityReadiness` now includes `inventoryPresent` (authored content exists) and `workflowVerified` (capability has been tested through a real workflow path) as separate boolean signals.
- All ten platform capability rows populated with explicit inventory and workflow signals; `workflowVerified` defaults to `false` for all capabilities except `releaseFlow`.
- Fixed pre-existing `string | undefined` vs `string | null` type mismatch in `environment.ts` for `customSqliteLibraryPath`.

## Batch 4: Lower-severity placeholder, contract, and polish cleanup ✅ COMPLETE

### Intended outcome

Lower-risk gaps are normalized so tests, contracts, and operator copy enforce the final state-machine semantics rather than only cosmetic behavior.

### Primary behavior changes

- Upgrade patch preview/apply so invalid plans return typed failure responses instead of soft-success `applied: 0` semantics.
- Expand automation failure contracts to include retryability and remediation guidance.
- Add explicit documentation for intentional unsupported paths that remain safe and non-user-facing.

### Affected interfaces and contracts

- `src/domain/builder/builder-service.ts`
- `src/routes/builder-api.ts`
- `src/views/builder/view-labels.ts`
- Supporting API contract and route tests

### Required tests

- Contract tests for invalid patch paths, invalid scene payloads, version conflicts, and successful apply.
- HTML/HTMX tests ensuring invalid patch application does not render a success alert.
- Automation UI tests for actionable failure guidance and retry controls.

### Acceptance criteria

- Patch review/apply has deterministic failure semantics for invalid plans.
- Human-readable failure text is preserved, but machine-readable remediation state is also exposed.
- Intentional unsupported paths are documented and no longer confused with missing implementation.

### Implementation notes

- Added `rejected: boolean` and `rejectedReason?: "invalid-operations" | "version-conflict"` to `BuilderPatchApplyResult` in `builder-service.ts`.
- Invalid-operation path now returns `rejected: true, rejectedReason: "invalid-operations"` instead of only `applied: 0`.
- Successful apply path returns `rejected: false`.
- Both HTMX and JSON patch-apply route handlers in `builder-api.ts` now check `applied.rejected` instead of re-scanning `applied.operations.some(op => !op.valid)`.
- Added `retryable?: boolean`, `failureReason?: string`, and `remediationHint?: string` to `AutomationRunStep` contract in `game.ts`.
- When automation runs fail, the first step now includes structured failure diagnostics: `failureReason` from the error, `retryable` based on error classification (unreachable/timeout), and `remediationHint` with human-readable guidance.

## Suggested implementation order

1. ~~Batch 1~~ ✅
2. ~~Batch 2~~ ✅
3. ~~Batch 3~~ ✅
4. ~~Batch 4~~ ✅

## Exit criteria for the full program ✅ ALL MET

- ✅ Builder UI contains no dead-end disclosures.
- ✅ Safe degradation is surfaced explicitly in both HTML and JSON capability outputs.
- ✅ Readiness/probe layers distinguish coarse validation from usable workflow verification.
- ✅ AI patching and automation review flows use explicit state-machine semantics instead of soft-success responses.
