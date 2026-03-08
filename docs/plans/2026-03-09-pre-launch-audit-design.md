# Pre-Launch Full Codebase Audit & Refactor

**Date:** 2026-03-09
**Status:** Approved
**Scope:** 26 issues across 5 parallel work streams

## Context

Full codebase audit of LOTFK Tea House identified 26 issues blocking a zero-tech-debt launch. The codebase is architecturally sound (clean DDD, proper Elysia plugins, strong type safety, comprehensive error handling) but has accumulated hardcoded values, i18n gaps, ARIA violations, missing source files, and missed opportunities to use framework-native patterns.

## Execution Strategy

**Approach C: Parallel Work Streams by Independence**

5 independent streams that don't share files, allowing safe parallel execution:

| Stream | Focus | File Count |
|--------|-------|------------|
| 1 | i18n + ARIA Compliance | ~7 files |
| 2 | Config Extraction | ~8 files |
| 3 | HTMX Extension Overhaul | ~10 files |
| 4 | Game Client Hardening | ~4 files |
| 5 | Build + Verify | ~3 files + full test run |

---

## Stream 1: i18n + ARIA Compliance

**Goal:** Zero hardcoded user-facing strings. WCAG 2.1 AA compliance on every interactive element.

### 1a. Add missing i18n keys
**File:** `src/shared/i18n/messages.ts`

Add keys for both `en-US` and `zh-CN`:
- `builder.gameForgeTitle` → "Game Forge" / "游戏工厂"
- `builder.exitBuilder` → "Exit Builder" / "退出编辑器"
- `builder.contextLabel` → "Context" / "上下文"
- `builder.projectConfigured` → "Project Configured" / "项目已配置"

**File:** `src/views/builder/builder-layout.ts`
Replace all hardcoded strings with `escapeHtml(messages.builder.*)`.

### 1b. Add `<label>` to file input
**File:** `src/views/builder/assets-editor.ts`
Wrap file input with proper `<label>` using DaisyUI `fieldset` + `fieldset-legend` pattern.

### 1c. Add `aria-label` to HTMX indicator spinners
**Files:** scene-editor.ts, npc-editor.ts, dialogue-editor.ts, assets-editor.ts
Every `<span class="loading loading-spinner htmx-indicator">` gets `aria-label="${messages.common.loading}"`.

### 1d. Fix `role` attributes on status alerts
Audit all `role="alert"` and `role="status"` usages:
- Dynamic status changes → `role="status"` with `aria-live="polite"`
- Error alerts → `role="alert"`

### 1e. Add `aria-required="true"` to required form inputs
All inputs with HTML `required` also get `aria-required="true"`.

---

## Stream 2: Config Extraction

**Goal:** Zero magic numbers in domain code. Every tunable value in config.

### 2a. Game loop constants → game-config.ts
- `worldTimeWrapMs: 86_400_007` (from game-loop.ts)
- `multiplayerPresenceOffsets: [...]` (from game-loop.ts)
- `presenceCharacterByRole: {...}` (from game-loop.ts)

### 2b. Combat formula → config
- `combatDamageMultiplier: 1.5` (from combat-engine.ts)

### 2c. Sprite/AI constants → config
- `spriteAtlasMaxWidth: 2048` (from sprite-packer.ts)
- `embeddingDimension: 384` (from vector-store.ts)
- `circuitBreakerThreshold: 2` (from model-manager.ts)
- `circuitBreakerCooldownMultiplier: 4` (from model-manager.ts)

### 2d. Client-side constants
**File:** `src/shared/contracts/game.ts`
```typescript
export const WS_CLOSE_SESSION_MISSING = 4404
export const WS_CLOSE_TOKEN_EXPIRED = 4408
```

Session storage key as named constant.

### 2e. Update all call sites
Every file that currently uses an inline magic number reads from config instead.

---

## Stream 3: HTMX Extension Overhaul

**Goal:** All extensions have TypeScript source, share utilities, use official extensions where available.

### 3a. Recreate game-hud.ts
Create `src/htmx-extensions/game-hud.ts` with proper types from compiled `public/vendor/htmx-ext/game-hud.js`. Add to build pipeline.

### 3b. Consolidate shared utilities
Merge duplicate `escapeHtml` and `getHtmx` into `src/htmx-extensions/shared.ts`.

### 3c. Add hx-sync to builder forms
Every builder form gets `hx-sync="closest form:abort"` to prevent duplicate submissions.

### 3d. Add response-targets extension
Install official HTMX `response-targets` extension. Configure 4xx/5xx targets to render into toast container.

### 3e. Add idiomorph swap for HUD
Install official `idiomorph` extension. Use `hx-swap="morph"` on game HUD SSE containers.

### 3f. Add preload extension for navigation
Install official `preload` extension. Add `preload="mousedown"` to main nav links.

---

## Stream 4: Game Client Hardening

**Goal:** All failure modes handled gracefully with proper error reporting and bounded resources.

### 4a. Structured error logging
Add `clientLog(level, event, details)` function to game-client.ts:
- Dev: structured console JSON
- Visual: status indicator in game HUD
- Never crashes client

### 4b. Bound texture cache
LRU eviction on frame texture cache. Max 256 entries (configurable). Evicted textures destroyed.

### 4c. Spectator command feedback
Show i18n'd toast (`messages.game.spectatorCannotCommand`) instead of silent return in `sendEnvelope()`.

### 4d. Resume token clock skew tolerance
Add `clockSkewToleranceMs: 5000` config. Check `expiresAtMs + tolerance` before considering token expired.

### 4e. Clean up dead directories
Remove empty `public/game/js/` and `public/game/css/`.

### 4f. Remove deleted theme reference
Confirm `src/styles/lotfk-theme.css` deletion is clean. No imports reference old filename.

---

## Stream 5: Build + Verify

**Goal:** Verify pipeline catches everything. No dead files. Clean full verify.

### 5a. Add bun audit to verify
```json
"verify": "bun run build:assets && bun audit && bun run lint && bun run typecheck && bun test"
```

### 5b. Clean dead files
- Remove `test-prisma.ts`
- Remove empty `public/game/js/`, `public/game/css/`
- Confirm `lotfk-theme.css` deletion

### 5c. Full verification
1. `bun run build:assets` — compiles cleanly
2. `bun audit` — no vulnerabilities
3. `bun run lint` — Biome passes (no suppressed rules)
4. `bun run typecheck` — TSC zero errors
5. `bun test` — all tests pass
6. `bun run start` — server boots end-to-end

### 5d. Update tests
All test assertions match new patterns. No legacy test code for changed behavior.

---

## Success Criteria

- [ ] Zero hardcoded user-facing strings
- [ ] WCAG 2.1 AA: every interactive element has proper ARIA
- [ ] Zero magic numbers in domain code
- [ ] All HTMX extensions have TypeScript source
- [ ] Game client handles all failure modes with feedback
- [ ] `bun run verify` passes cleanly
- [ ] Server boots and runs end-to-end
