# Pre-Launch Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve all 26 audit findings across i18n, ARIA, config extraction, HTMX extensions, and game client hardening — zero tech debt before launch.

**Architecture:** 5 independent work streams executed in parallel. Streams 1-4 touch non-overlapping files. Stream 5 runs last as final verification. Each stream commits independently.

**Tech Stack:** Bun 1.3 + Elysia 1.4.27 + Prisma 7 + HTMX 2 + DaisyUI 5.5 + Tailwind 4 + PixiJS 8 + Three.js

---

## Stream 1: i18n + ARIA Compliance

### Task 1.1: Add missing i18n keys to messages.ts

**Files:**
- Modify: `src/shared/i18n/messages.ts`

**Step 1:** Add 4 new builder keys to the `Messages` type interface (after line ~248, in the builder section):

In the `builder` readonly object of the `Messages` type, add:
```typescript
readonly gameForgeTitle: string;
readonly exitBuilder: string;
readonly contextLabel: string;
readonly projectConfigured: string;
```

**Step 2:** Add en-US values in the English messages object builder section:
```typescript
gameForgeTitle: "Game Forge",
exitBuilder: "Exit Builder",
contextLabel: "Context",
projectConfigured: "Project Configured",
```

**Step 3:** Add zh-CN values in the Chinese messages object builder section:
```typescript
gameForgeTitle: "游戏工厂",
exitBuilder: "退出编辑器",
contextLabel: "上下文",
projectConfigured: "项目已配置",
```

**Step 4:** Run typecheck to verify all locales satisfy the type:
```bash
bun run typecheck
```
Expected: PASS (both locale objects now satisfy Messages type)

**Step 5:** Commit:
```bash
git add src/shared/i18n/messages.ts
git commit -m "feat(i18n): add missing builder keys for Game Forge, Exit Builder, Context, Project Configured"
```

---

### Task 1.2: Replace hardcoded strings in builder-layout.ts

**Files:**
- Modify: `src/views/builder/builder-layout.ts:279,285,289,300`

**Step 1:** Replace line 279 `"Game Forge"` with i18n:
```
OLD: <span class="text-xl font-bold tracking-tight">Game Forge</span>
NEW: <span class="text-xl font-bold tracking-tight">${escapeHtml(messages.builder.gameForgeTitle)}</span>
```

**Step 2:** Replace line 285 `CONTEXT` with i18n:
```
OLD: CONTEXT
NEW: ${escapeHtml(messages.builder.contextLabel)}
```

**Step 3:** Replace line 289 `Project Configured` with i18n:
```
OLD: Project Configured
NEW: ${escapeHtml(messages.builder.projectConfigured)}
```

**Step 4:** Replace line 300 `Exit Builder` with i18n:
```
OLD: Exit Builder
NEW: ${escapeHtml(messages.builder.exitBuilder)}
```

**Step 5:** Run typecheck + lint:
```bash
bun run typecheck && bun run lint
```
Expected: PASS

**Step 6:** Commit:
```bash
git add src/views/builder/builder-layout.ts
git commit -m "fix(i18n): replace 4 hardcoded strings in builder sidebar with i18n messages"
```

---

### Task 1.3: Add aria-label to all HTMX indicator spinners (24 spinners across 7 files)

**Files:**
- Modify: `src/views/builder/scene-editor.ts` (lines 197, 272, 380, 470, 568, 622)
- Modify: `src/views/builder/npc-editor.ts` (lines 127, 214, 279)
- Modify: `src/views/builder/dialogue-editor.ts` (lines 107, 156, 232, 244)
- Modify: `src/views/builder/assets-editor.ts` (lines 212, 244, 277, 301, 156)
- Modify: `src/views/builder/mechanics-editor.ts` (lines 351, 78, 383, 138, 411, 197)
- Modify: `src/views/builder/automation-panel.ts` (lines 98, 58)
- Modify: `src/views/builder/ai-panel.ts` (lines 346, 390, 570)

**Step 1:** In every file, find each spinner element matching:
```html
<span ... class="loading loading-spinner ... htmx-indicator" aria-hidden="true"></span>
```
Replace `aria-hidden="true"` with `aria-label="${escapeHtml(messages.common.loading)}"`:
```html
<span ... class="loading loading-spinner ... htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
```

All 24 spinners get this treatment. The `messages` parameter is already available in every render function.

**Step 2:** Run lint:
```bash
bun run lint
```
Expected: PASS

**Step 3:** Commit:
```bash
git add src/views/builder/
git commit -m "fix(a11y): add aria-label to all 24 HTMX indicator spinners across builder views"
```

---

### Task 1.4: Add aria-required to all required form inputs (37 inputs across 6 files)

**Files:**
- Modify: `src/views/builder/scene-editor.ts` (10 inputs)
- Modify: `src/views/builder/npc-editor.ts` (10 inputs)
- Modify: `src/views/builder/dialogue-editor.ts` (3 inputs)
- Modify: `src/views/builder/assets-editor.ts` (8 inputs)
- Modify: `src/views/builder/mechanics-editor.ts` (15 inputs)
- Modify: `src/views/builder/automation-panel.ts` (1 input)

**Step 1:** In every file, find each input/textarea/select with `required` but missing `aria-required="true"`.

Pattern to find:
```html
<input ... required />
```
Replace with:
```html
<input ... required aria-required="true" />
```

Same for `<textarea ... required>` and `<select ... required>`.

Note: `src/views/builder/ai-panel.ts` already has `aria-required="true"` on all its required inputs — skip that file.

**Step 2:** Run lint:
```bash
bun run lint
```
Expected: PASS

**Step 3:** Commit:
```bash
git add src/views/builder/
git commit -m "fix(a11y): add aria-required to all 37 required form inputs missing it"
```

---

### Task 1.5: Add missing hx-indicator to 3 AI panel forms

**Files:**
- Modify: `src/views/builder/ai-panel.ts` (lines ~422, ~479, ~500)

**Step 1:** Add loading spinners and hx-indicator attributes to the 3 forms that lack them:

For the knowledge ingest form (~line 422): Add `hx-indicator="#ai-ingest-spinner"` and a spinner element inside the form.

For the knowledge search form (~line 479): Add `hx-indicator="#ai-search-spinner"` and a spinner.

For the tool plan form (~line 500): Add `hx-indicator="#ai-plan-spinner"` and a spinner.

Each spinner follows the existing pattern:
```html
<span id="ai-ingest-spinner" class="loading loading-spinner loading-xs htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
```

**Step 2:** Run typecheck + lint:
```bash
bun run typecheck && bun run lint
```
Expected: PASS

**Step 3:** Commit:
```bash
git add src/views/builder/ai-panel.ts
git commit -m "fix(a11y): add missing hx-indicator spinners to 3 AI panel forms"
```

---

## Stream 2: Config Extraction

### Task 2.1: Add new config properties to environment.ts and game-config.ts

**Files:**
- Modify: `src/config/environment.ts` (type + defaults + resolution)
- Modify: `src/shared/config/game-config.ts` (interface + defaults)

**Step 1:** Add to `AppConfig.game` type in environment.ts (after line ~103):
```typescript
readonly worldTimeWrapMs: number;
readonly combatDamageMultiplier: number;
readonly spriteAtlasMaxWidth: number;
```

**Step 2:** Add to `AppConfig.ai` type in environment.ts (after line ~141):
```typescript
readonly embeddingDimension: number;
readonly circuitBreakerThreshold: number;
readonly circuitBreakerCooldownMultiplier: number;
```

**Step 3:** Add defaults near other DEFAULT_ constants:
```typescript
const DEFAULT_GAME_WORLD_TIME_WRAP_MS = 86_400_007;
const DEFAULT_GAME_COMBAT_DAMAGE_MULTIPLIER = 1.5;
const DEFAULT_GAME_SPRITE_ATLAS_MAX_WIDTH = 2048;
const DEFAULT_AI_EMBEDDING_DIMENSION = 384;
const DEFAULT_AI_CIRCUIT_BREAKER_THRESHOLD = 2;
const DEFAULT_AI_CIRCUIT_BREAKER_COOLDOWN_MULTIPLIER = 4;
```

**Step 4:** Add resolution in the `appConfig` object:
```typescript
// In game section:
worldTimeWrapMs: parseInteger(Bun.env.GAME_WORLD_TIME_WRAP_MS, DEFAULT_GAME_WORLD_TIME_WRAP_MS, "GAME_WORLD_TIME_WRAP_MS"),
combatDamageMultiplier: parseFloat(Bun.env.GAME_COMBAT_DAMAGE_MULTIPLIER ?? String(DEFAULT_GAME_COMBAT_DAMAGE_MULTIPLIER)),
spriteAtlasMaxWidth: parseInteger(Bun.env.GAME_SPRITE_ATLAS_MAX_WIDTH, DEFAULT_GAME_SPRITE_ATLAS_MAX_WIDTH, "GAME_SPRITE_ATLAS_MAX_WIDTH"),

// In ai section:
embeddingDimension: parseInteger(Bun.env.AI_EMBEDDING_DIMENSION, DEFAULT_AI_EMBEDDING_DIMENSION, "AI_EMBEDDING_DIMENSION"),
circuitBreakerThreshold: parseInteger(Bun.env.AI_CIRCUIT_BREAKER_THRESHOLD, DEFAULT_AI_CIRCUIT_BREAKER_THRESHOLD, "AI_CIRCUIT_BREAKER_THRESHOLD"),
circuitBreakerCooldownMultiplier: parseInteger(Bun.env.AI_CIRCUIT_BREAKER_COOLDOWN_MULTIPLIER, DEFAULT_AI_CIRCUIT_BREAKER_COOLDOWN_MULTIPLIER, "AI_CIRCUIT_BREAKER_COOLDOWN_MULTIPLIER"),
```

**Step 5:** Add to `RuntimeGameConfig` interface in game-config.ts (after line ~64):
```typescript
/** World time wrapping point in milliseconds to prevent float precision loss. */
readonly worldTimeWrapMs: number;
/** Damage multiplier applied to attacker stat in combat formula. */
readonly combatDamageMultiplier: number;
/** Maximum sprite atlas strip width before row wrapping. */
readonly spriteAtlasMaxWidth: number;
```

**Step 6:** Add to `defaultGameConfig` object in game-config.ts (after line ~101):
```typescript
worldTimeWrapMs: appConfig.game.worldTimeWrapMs,
combatDamageMultiplier: appConfig.game.combatDamageMultiplier,
spriteAtlasMaxWidth: appConfig.game.spriteAtlasMaxWidth,
```

**Step 7:** Run typecheck:
```bash
bun run typecheck
```
Expected: PASS

**Step 8:** Commit:
```bash
git add src/config/environment.ts src/shared/config/game-config.ts
git commit -m "feat(config): add worldTimeWrapMs, combatDamageMultiplier, spriteAtlasMaxWidth, embeddingDimension, circuit breaker configs"
```

---

### Task 2.2: Add WebSocket close code constants to game.ts

**Files:**
- Modify: `src/shared/contracts/game.ts` (near line ~1300, after GameSseCloseReason)

**Step 1:** Add named constants:
```typescript
/** Application-defined WebSocket close code: session not found. */
export const WS_CLOSE_SESSION_MISSING = 4404 as const;

/** Application-defined WebSocket close code: resume token expired. */
export const WS_CLOSE_TOKEN_EXPIRED = 4408 as const;

/** Local-storage key for persisting game session metadata across reconnects. */
export const GAME_SESSION_STORAGE_KEY = "lotfk:game:session-meta" as const;
```

**Step 2:** Run typecheck:
```bash
bun run typecheck
```
Expected: PASS

**Step 3:** Commit:
```bash
git add src/shared/contracts/game.ts
git commit -m "feat(contracts): add WS close code constants and session storage key"
```

---

### Task 2.3: Replace magic values in game-loop.ts

**Files:**
- Modify: `src/domain/game/game-loop.ts` (lines 49, 50-60, 61-66)

**Step 1:** Import config at top of file:
```typescript
import { defaultGameConfig } from "../../shared/config/game-config.ts";
```

**Step 2:** Replace line 49:
```
OLD: const WORLD_TIME_WRAP_MS = 86_400_007;
NEW: const WORLD_TIME_WRAP_MS = defaultGameConfig.worldTimeWrapMs;
```

**Step 3:** For MULTIPLAYER_PRESENCE_OFFSETS and PRESENCE_CHARACTER_BY_ROLE — these are structural constants (array of coordinate offsets, role-to-character mapping) that are better kept as local constants in the module rather than environment-driven config. They don't change per deployment. Leave them as-is but add a comment noting they're intentionally local:

```typescript
/**
 * Fixed spawn offsets for co-player ghosts around the player.
 * Intentionally local — structural constant, not deployment-tunable.
 */
const MULTIPLAYER_PRESENCE_OFFSETS: ...
```

**Step 4:** Run typecheck + tests:
```bash
bun run typecheck && bun test
```
Expected: PASS

**Step 5:** Commit:
```bash
git add src/domain/game/game-loop.ts
git commit -m "refactor(game-loop): read worldTimeWrapMs from config instead of magic number"
```

---

### Task 2.4: Replace magic values in combat-engine.ts

**Files:**
- Modify: `src/domain/game/combat-engine.ts` (line 50)

**Step 1:** Import config:
```typescript
import { defaultGameConfig } from "../../shared/config/game-config.ts";
```

**Step 2:** Replace line 50:
```
OLD: const rawDamage = Math.max(1, Math.floor(atk * 1.5 - def));
NEW: const rawDamage = Math.max(1, Math.floor(atk * defaultGameConfig.combatDamageMultiplier - def));
```

**Step 3:** Run tests:
```bash
bun test src/domain/game/combat-engine.test.ts
```
Expected: PASS (4 tests, damage formula unchanged in value)

**Step 4:** Commit:
```bash
git add src/domain/game/combat-engine.ts
git commit -m "refactor(combat): read damage multiplier from config"
```

---

### Task 2.5: Replace magic values in sprite-packer.ts and vector-store.ts

**Files:**
- Modify: `src/domain/game/sprite-packer.ts` (line 4)
- Modify: `src/domain/ai/vector-store.ts` (line 10)

**Step 1:** In sprite-packer.ts, replace line 4:
```
OLD: const MAX_STRIP_WIDTH = 2048;
NEW: import { defaultGameConfig } from "../../shared/config/game-config.ts";
     const MAX_STRIP_WIDTH = defaultGameConfig.spriteAtlasMaxWidth;
```

**Step 2:** In vector-store.ts, replace line 10:
```
OLD: const EMBEDDING_DIMENSION = 384;
NEW: import { appConfig } from "../../config/environment.ts";
     const EMBEDDING_DIMENSION = appConfig.ai.embeddingDimension;
```

**Step 3:** Run tests:
```bash
bun test
```
Expected: PASS

**Step 4:** Commit:
```bash
git add src/domain/game/sprite-packer.ts src/domain/ai/vector-store.ts
git commit -m "refactor: extract spriteAtlasMaxWidth and embeddingDimension to config"
```

---

### Task 2.6: Replace circuit breaker magic values in model-manager.ts

**Files:**
- Modify: `src/domain/ai/model-manager.ts` (lines ~505-506)

**Step 1:** In `_registerFailure` method, replace the hardcoded threshold and multiplier:
```
OLD: if (this._consecutiveFailures >= 2) {
       this._circuitOpenUntilMs = Date.now() + Math.max(appConfig.ai.pipelineTimeoutMs * 4, 2_000);
NEW: if (this._consecutiveFailures >= appConfig.ai.circuitBreakerThreshold) {
       this._circuitOpenUntilMs = Date.now() + Math.max(appConfig.ai.pipelineTimeoutMs * appConfig.ai.circuitBreakerCooldownMultiplier, 2_000);
```

**Step 2:** Run tests:
```bash
bun test
```
Expected: PASS

**Step 3:** Commit:
```bash
git add src/domain/ai/model-manager.ts
git commit -m "refactor(ai): extract circuit breaker threshold and cooldown multiplier to config"
```

---

### Task 2.7: Replace magic close codes in game-plugin.ts and game-client.ts

**Files:**
- Modify: `src/plugins/game-plugin.ts` (search for `4404` and `4408`)
- Modify: `src/playable-game/game-client.ts` (lines ~882, ~334, and storage key)

**Step 1:** In game-plugin.ts, import and use named constants:
```typescript
import { WS_CLOSE_SESSION_MISSING, WS_CLOSE_TOKEN_EXPIRED } from "../shared/contracts/game.ts";
```
Replace all instances of `4404` with `WS_CLOSE_SESSION_MISSING` and `4408` with `WS_CLOSE_TOKEN_EXPIRED`.

**Step 2:** In game-client.ts, import and use named constants:
```typescript
import { WS_CLOSE_SESSION_MISSING, WS_CLOSE_TOKEN_EXPIRED, GAME_SESSION_STORAGE_KEY } from "../shared/contracts/game.ts";
```
Replace `4404`, `4408`, and `"lotfk:game:session-meta"` with the named constants.

**Step 3:** Run typecheck + tests:
```bash
bun run typecheck && bun test
```
Expected: PASS

**Step 4:** Commit:
```bash
git add src/plugins/game-plugin.ts src/playable-game/game-client.ts
git commit -m "refactor: replace magic WS close codes and storage key with named constants"
```

---

## Stream 3: HTMX Extension Overhaul

### Task 3.1: Create game-hud.ts TypeScript source

**Files:**
- Create: `src/htmx-extensions/game-hud.ts`

**Step 1:** Create the TypeScript source by reverse-engineering the minified `public/vendor/htmx-ext/game-hud.js`. Use the shared utilities from `src/htmx-extensions/shared.ts`:

```typescript
import { escapeHtml, getHtmx, resolveExtensionElement } from "./shared.ts";

interface HudProgress {
  readonly xp: number;
  readonly level: number;
}

interface HudDialogue {
  readonly npcLabel?: string;
  readonly line?: string;
}

interface HudPayload {
  readonly sceneId?: string;
  readonly progress?: HudProgress;
  readonly dialogue?: HudDialogue;
}

const safeJsonParse = (text: string): HudPayload | null => {
  try {
    return JSON.parse(text) as HudPayload;
  } catch {
    return null;
  }
};

const htmx = getHtmx();
if (htmx) {
  htmx.defineExtension("game-hud", {
    transformResponse(text: string, _xhr: XMLHttpRequest, element: Element): string {
      const json = safeJsonParse(text);
      if (!json) return text;

      const el = element as HTMLElement;
      const slot = el.dataset.hudSlot ?? el.id;
      const xpLabel = el.dataset.xpLabel ?? "XP";
      const levelLabel = el.dataset.levelLabel ?? "Lv";

      switch (slot) {
        case "hud-xp": {
          const p = json.progress;
          if (!p) return text;
          return `<span class="badge badge-primary badge-lg shadow-sm">${escapeHtml(xpLabel)}: ${p.xp} · ${escapeHtml(levelLabel)}${p.level}</span>`;
        }
        case "hud-dialogue": {
          const d = json.dialogue;
          if (!d?.line) return `<div id="hud-dialogue" class="hidden"></div>`;
          return `<div id="hud-dialogue" class="card card-body bg-base-200/90 shadow-lg p-3 max-w-md">
            <p class="text-xs font-bold text-primary">${escapeHtml(d.npcLabel ?? "")}</p>
            <p class="text-sm">${escapeHtml(d.line)}</p>
          </div>`;
        }
        case "hud-scene": {
          const s = json.sceneId;
          if (!s) return text;
          return `<span class="text-xl font-bold">${escapeHtml(s)}</span>`;
        }
        default:
          return text;
      }
    },
  });
}
```

**Step 2:** Verify the build pipeline already picks this up. Check `scripts/build-assets.ts` — the `buildHtmxExtensions()` function should already glob `src/htmx-extensions/` and include game-hud.ts.

**Step 3:** Build:
```bash
bun run build:assets
```
Expected: `public/vendor/htmx-ext/game-hud.js` is regenerated from TypeScript source.

**Step 4:** Commit:
```bash
git add src/htmx-extensions/game-hud.ts
git commit -m "feat(htmx): recreate game-hud extension as TypeScript source"
```

---

### Task 3.2: Consolidate shared utilities in server-toast.ts

**Files:**
- Modify: `src/htmx-extensions/server-toast.ts`

**Step 1:** The server-toast.ts currently has its own inline `escapeText()` function. Replace it with the import from shared.ts:

Add import at top:
```typescript
import { escapeHtml } from "./shared.ts";
```

Remove the local `escapeText()` function and replace all calls to `escapeText(...)` with `escapeHtml(...)`.

**Step 2:** Build and verify:
```bash
bun run build:assets
```
Expected: server-toast.js still works correctly.

**Step 3:** Commit:
```bash
git add src/htmx-extensions/server-toast.ts
git commit -m "refactor(htmx): use shared escapeHtml in server-toast instead of duplicate"
```

---

### Task 3.3: Add hx-sync to all builder forms (30 forms across 8 files)

**Files:**
- Modify: `src/views/builder/scene-editor.ts` (7 forms)
- Modify: `src/views/builder/npc-editor.ts` (3 forms)
- Modify: `src/views/builder/dialogue-editor.ts` (3 forms + 2 inline buttons)
- Modify: `src/views/builder/assets-editor.ts` (6 forms)
- Modify: `src/views/builder/mechanics-editor.ts` (9 forms)
- Modify: `src/views/builder/automation-panel.ts` (3 forms)
- Modify: `src/views/builder/ai-panel.ts` (7 forms)
- Modify: `src/views/oracle.ts` (1 form)

**Step 1:** In every `<form` tag that has an `hx-post`, `hx-patch`, `hx-put`, or `hx-delete` attribute, add `hx-sync="this:abort"` to prevent duplicate submissions. This tells HTMX to abort any in-flight request from this form when a new one is submitted.

Pattern:
```
OLD: <form ... hx-post="..." ...>
NEW: <form ... hx-post="..." hx-sync="this:abort" ...>
```

For the oracle form in `src/views/oracle.ts` (~line 44), which uses `hx-get`, add `hx-sync="this:drop"` (drop new requests while one is in-flight, since oracle responses should not be interrupted).

**Step 2:** Run lint:
```bash
bun run lint
```
Expected: PASS

**Step 3:** Commit:
```bash
git add src/views/builder/ src/views/oracle.ts
git commit -m "fix(htmx): add hx-sync to all 31 forms to prevent duplicate submissions"
```

---

### Task 3.4: Install and configure response-targets extension

**Files:**
- Modify: `src/views/layout.ts` (load extension script)
- Modify: `src/views/builder/builder-layout.ts` (load extension script)
- Modify: `src/styles/app.css` (optional: error target styling)

**Step 1:** Download the official response-targets extension. Add to static assets or vendor copy in build:
```bash
# Add to build-assets.ts copy step, or install via npm
```

Check if htmx.org ships it in node_modules:
```bash
ls node_modules/htmx.org/dist/ext/response-targets.js
```

If available, add to `copyHtmxBundle()` in `scripts/build-assets.ts` to copy to `public/vendor/htmx-ext/`.

**Step 2:** In layout.ts, add the script tag after the HTMX script (~line 128):
```html
<script src="${escapeHtml(joinUrlPath(appConfig.staticAssets.publicPrefix, 'vendor/htmx-ext/response-targets.js'))}" defer></script>
```

**Step 3:** On the `<body>` tag or main content wrapper, add:
```html
hx-ext="response-targets"
```

And add error target attributes to builder forms:
```html
hx-target-error="#toast-container"
```

**Step 4:** Build and verify:
```bash
bun run build:assets && bun run typecheck
```

**Step 5:** Commit:
```bash
git add scripts/build-assets.ts src/views/layout.ts src/views/builder/builder-layout.ts
git commit -m "feat(htmx): add response-targets extension for graceful error handling"
```

---

### Task 3.5: Install and configure idiomorph for SSE HUD swaps

**Files:**
- Modify: `src/views/layout.ts` (load extension)
- Modify: `src/views/game-page.ts` (change swap strategy on SSE containers)

**Step 1:** Copy idiomorph extension from htmx.org node_modules to vendor:
```bash
ls node_modules/htmx.org/dist/ext/idiomorph/
```
Add to build-assets.ts copy step.

**Step 2:** Load in layout.ts (after HTMX script):
```html
<script src="${escapeHtml(joinUrlPath(appConfig.staticAssets.publicPrefix, 'vendor/htmx-ext/idiomorph.js'))}" defer></script>
```

**Step 3:** In game-page.ts, on the SSE container elements (~lines 205-425), change swap strategy from `hx-swap="outerHTML"` to `hx-swap="morph:outerHTML"` on the key HUD elements:
- scene-title-heading (~line 211)
- xp badge (~line 267)
- dialogue panel (~line 305)
- combat panel (~line 316)
- inventory panel (~line 327)
- participants panel (~line 425)

This preserves DOM state (focus, animation) during SSE updates.

**Step 4:** Build and test:
```bash
bun run build:assets && bun run typecheck
```

**Step 5:** Commit:
```bash
git add scripts/build-assets.ts src/views/layout.ts src/views/game-page.ts
git commit -m "feat(htmx): add idiomorph swap strategy for SSE HUD updates"
```

---

### Task 3.6: Install preload extension for navigation links

**Files:**
- Modify: `scripts/build-assets.ts` (copy extension)
- Modify: `src/views/layout.ts` (load + add preload to nav links)

**Step 1:** Copy preload extension from htmx.org node_modules:
```bash
ls node_modules/htmx.org/dist/ext/preload.js
```
Add to build-assets.ts copy step.

**Step 2:** Load script in layout.ts after HTMX.

**Step 3:** Add `preload="mousedown"` attribute to main navigation links in layout.ts sidebar menu items:
```html
<a ... preload="mousedown">
```

**Step 4:** Build:
```bash
bun run build:assets
```

**Step 5:** Commit:
```bash
git add scripts/build-assets.ts src/views/layout.ts
git commit -m "feat(htmx): add preload extension for faster navigation perceived performance"
```

---

## Stream 4: Game Client Hardening

### Task 4.1: Add structured error logging to game client

**Files:**
- Modify: `src/playable-game/game-client.ts`

**Step 1:** Add a `clientLog` function near the top of the file:
```typescript
type LogLevel = "info" | "warn" | "error";

const clientLog = (level: LogLevel, event: string, details?: Record<string, unknown>): void => {
  const entry = { ts: new Date().toISOString(), level, event, ...details };
  if (level === "error") {
    console.error("[game-client]", JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn("[game-client]", JSON.stringify(entry));
  } else {
    console.info("[game-client]", JSON.stringify(entry));
  }
};
```

**Step 2:** Replace the silent catch in `initGameClient()` (~line 1236-1251):
```
OLD: .catch(() => { ... (silent) })
NEW: .catch((err: unknown) => {
  clientLog("error", "init.failed", { error: String(err) });
  ... (existing status update code)
})
```

**Step 3:** Add logging to WebSocket error paths:
- Socket close with unexpected code: `clientLog("warn", "ws.close", { code, reason })`
- Restore attempt failure: `clientLog("error", "restore.failed", { attempt, error })`
- Texture load failure: `clientLog("warn", "texture.load.failed", { url })`

**Step 4:** Run build:
```bash
bun run build:assets
```

**Step 5:** Commit:
```bash
git add src/playable-game/game-client.ts
git commit -m "fix(game-client): add structured error logging instead of silent catches"
```

---

### Task 4.2: Bound the texture cache with LRU eviction

**Files:**
- Modify: `src/playable-game/game-client.ts` (lines ~554-555, ~626-635)

**Step 1:** Add an LRU wrapper around the frameTextures Map:
```typescript
const MAX_FRAME_TEXTURE_CACHE = 256;
const frameTextureAccess = new Map<string, number>(); // key → last access timestamp

const evictOldestFrameTextures = (): void => {
  if (frameTextures.size <= MAX_FRAME_TEXTURE_CACHE) return;
  const entries = [...frameTextureAccess.entries()].sort((a, b) => a[1] - b[1]);
  const evictCount = frameTextures.size - MAX_FRAME_TEXTURE_CACHE;
  for (let i = 0; i < evictCount; i++) {
    const key = entries[i][0];
    const tex = frameTextures.get(key);
    if (tex) tex.destroy(true);
    frameTextures.delete(key);
    frameTextureAccess.delete(key);
  }
};
```

**Step 2:** In the frame texture retrieval code, update access time:
```typescript
frameTextureAccess.set(cacheKey, Date.now());
```

**Step 3:** Call `evictOldestFrameTextures()` after adding a new frame texture.

**Step 4:** Build:
```bash
bun run build:assets
```

**Step 5:** Commit:
```bash
git add src/playable-game/game-client.ts
git commit -m "fix(game-client): add LRU eviction to frame texture cache (max 256)"
```

---

### Task 4.3: Add spectator command feedback

**Files:**
- Modify: `src/playable-game/game-client.ts` (line ~915-918)

**Step 1:** Replace the silent early return:
```
OLD: if (runtimeSessionMeta.participantRole === "spectator") {
       return;
     }

NEW: if (runtimeSessionMeta.participantRole === "spectator") {
       const evt = new CustomEvent("showToast", {
         detail: { message: labels.spectatorCannotCommand ?? "Spectators cannot send commands", type: "warning" },
       });
       document.dispatchEvent(evt);
       return;
     }
```

**Step 2:** Ensure the labels object includes `spectatorCannotCommand`. This reads from a `data-*` attribute on the game wrapper or from a meta tag. Add the label to game-page.ts meta tags.

**Step 3:** Add the i18n key to messages.ts:
```typescript
// In game section:
spectatorCannotCommand: "Spectators cannot send commands",
// zh-CN:
spectatorCannotCommand: "旁观者无法发送命令",
```

**Step 4:** Build:
```bash
bun run build:assets
```

**Step 5:** Commit:
```bash
git add src/playable-game/game-client.ts src/shared/i18n/messages.ts src/views/game-page.ts
git commit -m "fix(game-client): show toast to spectators instead of silently dropping commands"
```

---

### Task 4.4: Add resume token clock skew tolerance

**Files:**
- Modify: `src/playable-game/game-client.ts` (line ~882)

**Step 1:** Add a clock skew tolerance constant (read from meta tag or default):
```typescript
const CLOCK_SKEW_TOLERANCE_MS = 5_000;
```

**Step 2:** Update the expiry check:
```
OLD: const tokenExpired = event.code === 4408 || runtimeSessionMeta.expiresAtMs <= Date.now();
NEW: const tokenExpired = event.code === WS_CLOSE_TOKEN_EXPIRED || runtimeSessionMeta.expiresAtMs + CLOCK_SKEW_TOLERANCE_MS <= Date.now();
```

**Step 3:** Build:
```bash
bun run build:assets
```

**Step 4:** Commit:
```bash
git add src/playable-game/game-client.ts
git commit -m "fix(game-client): add 5s clock skew tolerance for resume token expiry"
```

---

### Task 4.5: Clean up dead directories and deleted theme reference

**Files:**
- Remove: `public/game/js/` (empty directory)
- Remove: `public/game/css/` (empty directory)
- Verify: no imports reference `lotfk-theme.css`

**Step 1:** Remove empty directories:
```bash
rmdir public/game/js public/game/css 2>/dev/null || true
```

**Step 2:** Search for any reference to the old theme file:
```bash
grep -r "lotfk-theme" src/ --include="*.ts" --include="*.css"
```
If any found, update to `game-forge-theme.css`.

**Step 3:** Commit:
```bash
git add -A
git commit -m "chore: remove empty directories and verify theme file references"
```

---

## Stream 5: Build + Verify

### Task 5.1: Add bun audit to verify script

**Files:**
- Modify: `package.json`

**Step 1:** Update the verify script:
```
OLD: "verify": "bun run build:assets && bun run lint && bun run typecheck && bun test"
NEW: "verify": "bun run build:assets && bun audit && bun run lint && bun run typecheck && bun test"
```

**Step 2:** Test:
```bash
bun run verify
```

**Step 3:** Commit:
```bash
git add package.json
git commit -m "chore: add bun audit to verify pipeline"
```

---

### Task 5.2: Run full verification

**Step 1:** Run the full verify pipeline:
```bash
bun run verify
```

**Step 2:** Fix any failures. Common issues:
- Lint errors from new code: fix formatting
- Type errors from config changes: ensure all imports resolve
- Test failures from config changes: update test assertions if needed

**Step 3:** Boot the server end-to-end:
```bash
bun run start
```
Verify it starts without errors.

**Step 4:** Final commit if any fixes were needed:
```bash
git add -A
git commit -m "fix: resolve verify pipeline issues from audit changes"
```

---

### Task 5.3: Update tests for changed patterns

**Files:**
- Modify: `src/domain/game/combat-engine.test.ts` (if damage formula test needs updating)
- Modify: `tests/game-engine.test.ts` (if WS close code assertions exist)

**Step 1:** Review combat tests — they should still pass since the formula value (1.5) is unchanged, just sourced from config now. If any test hardcodes `1.5`, update to reference the config.

**Step 2:** Review game engine tests — if any test checks for raw `4404` or `4408` WebSocket codes, update to use the named constants.

**Step 3:** Run tests:
```bash
bun test
```
Expected: ALL PASS

**Step 4:** Commit if changes needed:
```bash
git add tests/ src/domain/game/
git commit -m "test: update assertions to use named constants and config values"
```

---

## Execution Order

Streams 1-4 are fully independent and can be executed in parallel.
Stream 5 must run after all other streams complete.

```
Stream 1 (Tasks 1.1-1.5) ─┐
Stream 2 (Tasks 2.1-2.7) ─┤
Stream 3 (Tasks 3.1-3.6) ─┼── Stream 5 (Tasks 5.1-5.3)
Stream 4 (Tasks 4.1-4.5) ─┘
```

## Success Criteria

- [ ] Zero hardcoded user-facing strings (4 replaced in builder-layout)
- [ ] WCAG 2.1 AA: 24 spinners have aria-label, 37 inputs have aria-required, 3 forms have indicators
- [ ] Zero magic numbers in domain code (9 values extracted to config)
- [ ] All HTMX extensions have TypeScript source (game-hud.ts created)
- [ ] Game client handles all failure modes with structured logging and feedback
- [ ] `bun run verify` passes cleanly
- [ ] Server boots and runs end-to-end
