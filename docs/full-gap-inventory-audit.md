# Full gap inventory audit

Date: 2026-03-16

This audit inventories unimplemented logic, masked no-ops, dead-end UI flows, optimistic checks, and partial feature surfaces across the current TEA codebase. It is repo-grounded and non-mutating: every finding below is backed by code or contract evidence rather than intent.

## Scope and taxonomy

This audit applies the following taxonomy consistently:

- `Dead-end UI`: controls or sections that render but do not unlock real behavior.
- `Placeholder behavior`: fallback or placeholder content rendered where surrounding product framing implies richer behavior.
- `Masked no-op`: services that safely return without effect while the surrounding surface can still imply capability.
- `Optimistic validation`: readiness or probe checks that can report success without proving usable behavior.
- `Partial contract`: a route, service, or state machine exposes only part of the flow it appears to support.
- `Intentional unsupported path`: a safe, explicit unsupported path that should be documented, not treated as a defect.

## Severity model

- `P0`: data loss, corruption, or a misleading success path that can cause destructive operator action.
- `P1`: a user-facing flow is materially incomplete or capability state is misleading.
- `P2`: the product degrades safely, but the UI or contract is still too coarse or ambiguous.
- `P3`: lower-severity placeholder or polish gaps that should be cleaned up once higher-risk flows are corrected.

## Seeded hypothesis disposition

| Hypothesis | Result | Notes |
| --- | --- | --- |
| Builder advanced-tools sections are dead-end UI in multiple workspaces. | Confirmed | Strongly confirmed in asset create/upload/clip forms and NPC create flow. |
| Asset and NPC previews rely on placeholder/fallback rendering where the surrounding flow may imply richer state. | Confirmed, downgraded to `P2`/`P3` depending on context | Mostly presentation gaps, but they still obscure whether generation/configuration is complete. |
| `VectorStore` degrades to no-op when `sqlite-vec` is unavailable and must be checked against exposed UI/API semantics. | Confirmed | Degradation is explicit in code and logs, but not fully surfaced as a first-class creator capability state. |
| Automation and readiness checks are optimistic. | Confirmed | Runtime readiness proves path existence and local writability, not end-to-end usability. |
| Patch/artifact preview and path handling expose partial capability. | Confirmed | Preview reports invalid operations, apply returns `applied: 0`, and unsupported paths are not elevated into a stronger operator contract. |

## Findings report

Findings are grouped by subsystem and sorted by severity.

### Builder UI and HTMX flows

#### 1. `P1` Dead-end advanced tools in asset authoring

- Title: Asset advanced-tools sections render no controls
- Taxonomy: `Dead-end UI`
- User/operator path affected: Builder asset upload, asset-by-path creation, and animation clip authoring
- Evidence:
  - `src/views/builder/assets-editor.ts:326-333`
  - `src/views/builder/assets-editor.ts:364-371`
  - `src/views/builder/assets-editor.ts:433-440`
- Incomplete behavior:
  - Each `Advanced tools` disclosure opens to a box containing the same `advancedTools` label text and nothing actionable.
  - The surrounding forms imply there should be advanced import, clip, or asset metadata controls.
- Why this is a gap instead of an intentional limitation:
  - The section is not hidden or marked unavailable; it is presented as a real extension point inside active authoring forms.
  - There is no explanatory copy describing why no controls are present.
- Recommended fix shape:
  - Remove the sections until they own a real contract, or replace them with actual advanced controls such as explicit IDs, tags, source-format overrides, validation toggles, clip loop/direction controls, or import review metadata.
- Verification required after fix:
  - Route/view tests asserting the section either contains concrete interactive controls or is absent.
  - HTMX form tests verifying advanced values survive submit and mutation.

#### 2. `P1` Dead-end advanced tools in NPC creation

- Title: NPC create form exposes an empty advanced-tools branch
- Taxonomy: `Dead-end UI`
- User/operator path affected: Builder NPC creation
- Evidence:
  - `src/views/builder/npc-editor.ts:214-221`
- Incomplete behavior:
  - The NPC create flow exposes `Advanced tools`, but expansion only reveals repeated label text.
- Why this is a gap instead of an intentional limitation:
  - NPC creation already has downstream concepts such as scene binding, sprite manifests, and dialogue linkage. The section advertises extensibility without implementing any of those controls.
- Recommended fix shape:
  - Replace with concrete advanced fields such as explicit character key, sprite manifest binding, greet behavior defaults, or dialogue seed controls.
  - If the flow is intentionally minimal, remove the disclosure completely.
- Verification required after fix:
  - View-level HTML assertions for either actionable fields or section removal.
  - Contract tests for any newly added NPC-creation parameters.

#### 3. `P2` Placeholder preview states obscure authoring completeness

- Title: Asset and NPC preview panels collapse incomplete state into generic placeholders
- Taxonomy: `Placeholder behavior`
- User/operator path affected: Asset preview, clip authoring, NPC preview
- Evidence:
  - `src/views/builder/assets-editor.ts:419`
  - `src/views/builder/assets-editor.ts:473`
  - `src/views/builder/assets-editor.ts:483`
  - `src/views/builder/npc-editor.ts:260-267`
- Incomplete behavior:
  - Multiple preview surfaces reuse `assetPlaceholder` instead of distinguishing between “nothing selected”, “manifest missing”, “generation pending”, and “asset unavailable”.
- Why this is a gap instead of an intentional limitation:
  - The surrounding builder workflows include generation jobs, manifests, and runtime variants. The placeholder text does not map 1:1 to those real states.
- Recommended fix shape:
  - Introduce explicit empty/loading/missing-manifest/error preview states with distinct messages and badges.
  - Attach those states to actual asset/NPC readiness signals instead of a generic placeholder string.
- Verification required after fix:
  - View tests for `idle`, `empty`, `missing-manifest`, and `ready` preview branches.
  - E2E checks for NPC and asset flows that transition between those states.

### AI and runtime capability surfaces

#### 4. `P1` Vector-store degradation is safe but not first-class in creator-facing capability semantics

- Title: Vector search silently degrades to BM25-only without a dedicated surfaced state
- Taxonomy: `Masked no-op`
- User/operator path affected: Retrieval-augmented AI features, knowledge-base search quality, operator diagnosis
- Evidence:
  - `src/domain/ai/vector-store.ts:97-100`
  - `src/domain/ai/vector-store.ts:129-135`
  - `src/domain/ai/vector-store.ts:166-176`
  - `src/domain/ai/capability-snapshot.ts:144-154`
- Incomplete behavior:
  - When `sqlite-vec` is unavailable, vector-store initialization disables itself and all write/search operations become safe no-ops.
  - The public feature matrix exposes `offlineFallback` as permanently unavailable via `fallback-disabled`, but there is no separate creator-facing capability indicating “semantic retrieval degraded to lexical-only”.
- Why this is a gap instead of an intentional limitation:
  - Safe degradation is valid. The gap is that creator/operator surfaces do not disclose the retrieval downgrade precisely enough for decision-making.
- Recommended fix shape:
  - Add a dedicated retrieval capability state derived from `vectorStore.available` and embedding-provider readiness.
  - Surface lexical-only fallback explicitly in HTML and JSON observability surfaces.
- Verification required after fix:
  - Unit tests for capability derivation when `sqlite-vec` is present vs unavailable.
  - Contract tests asserting degraded retrieval state is visible in capability and observability responses.

#### 5. `P2` Capability matrix over-compresses degraded and missing surfaces

- Title: Capability derivation compresses materially different failure modes into coarse labels
- Taxonomy: `Partial contract`
- User/operator path affected: Builder capability panel, AI settings, support diagnosis
- Evidence:
  - `src/domain/ai/capability-snapshot.ts:98-117`
  - `src/domain/ai/capability-snapshot.ts:153`
- Incomplete behavior:
  - `surface-missing`, `provider-missing`, and provider-degraded states are merged into a small number of route-level capability outcomes.
  - `offlineFallback` is hardcoded unavailable rather than derived from real local-mode/runtime state.
- Why this is a gap instead of an intentional limitation:
  - The API claims to expose a truthful feature matrix, but today it omits meaningful distinctions operators need when triaging degraded AI flows.
- Recommended fix shape:
  - Split route-level capability state into retrieval, local fallback, provider readiness, and surface readiness.
  - Add stable reason codes that map directly to user-facing remediation text.
- Verification required after fix:
  - Capability snapshot tests for each reason-code branch.
  - View assertions that degraded states produce distinct guidance text.

### Automation, readiness, and startup flows

#### 6. `P1` Runtime readiness claims “non-mutating” behavior while creating probe files and only validating URL shape for automation origin

- Title: Runtime readiness overstates what it proves
- Taxonomy: `Optimistic validation`
- User/operator path affected: Setup, doctor, startup preflight, operator trust in readiness output
- Evidence:
  - `src/bootstrap/runtime-readiness.ts:74-84`
  - `src/bootstrap/runtime-readiness.ts:150-168`
  - Bun reference confirms `Bun.write()` creates or overwrites files and returns bytes written.
- Incomplete behavior:
  - `collectRuntimeReadinessReport()` is documented as collecting readiness “without mutating build artifacts”, but directory checks call `Bun.write()` against `${directoryPath}/.bun-probe`.
  - The automation-origin readiness check always reports `ok: true` once `new URL(...)` succeeds; it does not verify reachability or usable automation behavior.
- Why this is a gap instead of an intentional limitation:
  - The check names and doc comments promise stronger guarantees than the implementation provides.
  - Setup and startup consumers treat this report as authoritative.
- Recommended fix shape:
  - Either rename the report to reflect coarse validation or strengthen it:
    - create-and-clean probe files deterministically,
    - verify automation origin with a low-cost health endpoint or authenticated reachability contract,
    - distinguish syntax-valid from reachable/usable.
- Verification required after fix:
  - Unit tests proving probe cleanup.
  - Runtime-readiness tests for invalid URL, unreachable URL, reachable-but-unusable automation origin, and successful health check.

#### 7. `P1` Automation origin probe verifies only HTTP reachability, not end-to-end automation capability

- Title: Automation worker can fail after “healthy” readiness signals
- Taxonomy: `Optimistic validation`
- User/operator path affected: Automation review runs, builder-origin Playwright execution
- Evidence:
  - `src/domain/builder/creator-worker.ts:196-217`
  - `src/domain/builder/creator-worker.ts:953` (worker status assignment for unreachable origin)
  - `tests/creator-worker.test.ts:203-257`
  - `tests/api.contract.test.ts:4017-4025`
- Incomplete behavior:
  - Worker probing treats any HTTP response below 400 as reachable.
  - That proves only endpoint reachability, not that the automation target exposes the expected builder shell, auth state, or browser-ready controls.
- Why this is a gap instead of an intentional limitation:
  - The system already exposes automation as a reviewable product feature, not as a best-effort developer-only experiment.
- Recommended fix shape:
  - Introduce an automation health contract that verifies expected route content or a dedicated health endpoint.
  - Encode richer failure states such as `origin-unreachable`, `origin-misconfigured`, `auth-required`, and `builder-shell-missing`.
- Verification required after fix:
  - Worker tests for each failure mode.
  - API contract tests ensuring operator-facing status labels remain human-readable and deterministic.

#### 8. `P2` Builder platform readiness infers implementation state from coarse project signals

- Title: Platform readiness can label capabilities as partial based on mere surface presence
- Taxonomy: `Optimistic validation`
- User/operator path affected: Builder readiness dashboard, operations observability
- Evidence:
  - `src/domain/builder/platform-readiness.ts:171-177`
  - `src/domain/builder/platform-readiness.ts:198-257`
  - `src/routes/builder-api.ts:1289-1318`
  - `src/routes/builder-api.ts:1328-1377`
- Incomplete behavior:
  - Capabilities are marked `partial` based on broad signals such as scene counts, asset counts, automation-run counts, or renderer preference.
  - That means “surface exists” and “workflow is meaningfully usable” are conflated.
- Why this is a gap instead of an intentional limitation:
  - The API and UI present this as platform readiness, not as a rough content inventory.
- Recommended fix shape:
  - Split inventory signals from capability verification signals.
  - Require workflow-specific checks before claiming `partial` or `implemented`.
- Verification required after fix:
  - Unit tests around readiness derivation with explicit verification inputs.
  - Contract tests separating inventory response from verified-capability response.

### Game/playable runtime and persistence

#### 9. `P2` Readiness and preview layers do not prove end-to-end playable/runtime success

- Title: Startup and builder readiness stop before playable-flow verification
- Taxonomy: `Partial contract`
- User/operator path affected: Builder-to-playtest handoff, operator confidence during setup
- Evidence:
  - `src/bootstrap/preflight.ts`
  - `src/bootstrap/runtime-readiness.ts:155-181`
  - `scripts/runtime-bootstrap.ts` setup and doctor workflows rely on readiness plus version checks
- Incomplete behavior:
  - Runtime readiness verifies file presence, DB reachability, schema presence, and coarse configuration, but does not validate a complete builder-to-playtest or published-runtime round trip.
- Why this is a gap instead of an intentional limitation:
  - The surrounding setup/doctor flow is positioned as a reliable operator gate.
- Recommended fix shape:
  - Add a smoke test target that exercises one builder page and one playable route.
  - Feed those results into doctor output separately from static readiness checks.
- Verification required after fix:
  - End-to-end smoke tests wired into doctor/setup CI paths.

### Supporting routes, contracts, and tests

#### 10. `P1` AI patch preview/apply is safe but only partially modeled as an operator contract

- Title: Patch preview/apply exposes invalid operations without a strong failure contract
- Taxonomy: `Partial contract`
- User/operator path affected: AI-assisted patch review and apply flows
- Evidence:
  - `src/domain/builder/builder-service.ts:3191-3280`
  - `src/domain/builder/builder-service.ts:3283-3348`
  - `src/routes/builder-api.ts:1988-2029`
  - `src/routes/builder-api.ts:2107-2115`
- Incomplete behavior:
  - Preview marks unsupported paths and invalid scene payloads as invalid operations.
  - Apply returns `{ applied: 0, operations }` when any preview operation is invalid instead of escalating into a stronger error envelope.
  - Apply-form success UI renders a success alert with the applied count, which can still look like a successful completion path even when nothing changed.
- Why this is a gap instead of an intentional limitation:
  - The route supports a review/apply workflow, so invalid plans should fail deterministically with operator-facing remediation rather than soft-success semantics.
- Recommended fix shape:
  - Promote invalid preview results to a typed non-success response.
  - Differentiate `no-op`, `invalid-plan`, `version-conflict`, and `applied` in both JSON and HTML surfaces.
- Verification required after fix:
  - Contract tests for invalid-path and invalid-payload responses.
  - HTML form tests ensuring zero-applied invalid plans do not render as success.

#### 11. `P3` Tests currently validate surfaced failure copy for automation-origin unreachability, but not stronger recovery semantics

- Title: Contracts preserve readable failure text without asserting richer operator-state transitions
- Taxonomy: `Intentional unsupported path`
- User/operator path affected: Automation review failure handling
- Evidence:
  - `tests/creator-worker.test.ts:249-257`
  - `tests/api.contract.test.ts:4017-4025`
  - `src/views/builder/view-labels.ts:364-389`
- Incomplete behavior:
  - Current tests correctly assert that raw internal codes are not leaked into HTML, but they stop at text rendering and do not require actionable remediation states or retry affordances.
- Why this is not a primary defect:
  - The failure is surfaced, localized, and non-silent. The remaining gap is depth of operator guidance, not unsafe behavior.
- Recommended fix shape:
  - Add contract coverage for retry actions, run-state transitions, and machine-readable remediation codes.
- Verification required after fix:
  - Route/view tests for failure CTA visibility and retryability semantics.

## Cross-cutting conclusions

- The most urgent gaps are not hidden crashes. They are misleading success or capability signals around builder authoring, automation health, and AI-assisted mutation.
- Several services already degrade safely. The problem is that the UI and API semantics still compress “safe but degraded” into “available enough”.
- Existing tests already show good discipline around localized copy and non-leaky status text. The next step is to make those tests enforce stronger state-machine semantics instead of presentation only.

## Recommended next action

Implement the remediation plan in `docs/full-gap-remediation-batches.md` in order. Batch 1 and Batch 2 should land before any further expansion of builder “advanced tools” or automation review surfaces.
