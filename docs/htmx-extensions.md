# HTMX Extensions

Custom HTMX extensions registered and loaded by the application.
All extensions reside in `src/htmx-extensions/` and are transpiled to browser-ready JS via `scripts/build-assets.ts`.

---

## Registered Extensions (`htmx.defineExtension`)

### `oracle-indicator`

**File:** `src/htmx-extensions/oracle-indicator.ts`
**Purpose:** Manages visual loading state for the AI oracle form.
**Lifecycle hook:** `onEvent` — listens for `htmx:beforeRequest` and `htmx:afterOnLoad` to toggle form button/spinner visibility.
**Usage:**

```html
<form hx-ext="oracle-indicator">...</form>
```

---

### `game-hud`

**File:** `src/htmx-extensions/game-hud.ts`
**Purpose:** Transforms JSON `GameSceneState` SSE payloads into DOM-ready HTML fragments for the game HUD slots (XP, dialogue, scene title).
**Lifecycle hook:** `transformResponse` — parses incoming JSON and routes to slot-specific HTML renderers based on `data-hud-slot`.
**Data attributes:**
- `data-hud-slot` — `"hud-xp"` | `"hud-dialogue"` | `"hud-scene"`
- `data-xp-label` — Localised XP label
- `data-level-label` — Localised level label

---

### `focus-panel`

**File:** `src/htmx-extensions/focus-panel.ts`
**Purpose:** Manages focus trap and keyboard navigation within modal/panel overlays.
**Lifecycle hook:** `onEvent` — listens for `htmx:afterSwap` to trap focus within the swapped panel element.

---

## Script-Only (no `defineExtension`)

### `layout-controls`

**File:** `src/htmx-extensions/layout-controls.ts`
**Purpose:** Manages drawer toggle state, keyboard escape handling, and theme persistence.
**Features:**
- Drawer toggles via `data-drawer-toggle-target` + `data-drawer-toggle-mode` attributes
- `aria-expanded` synchronisation on toggle controls
- Keyboard `Escape` closes all open drawers
- Theme selection persisted to `localStorage` key `"app-theme-preference"`
- Theme restored on `DOMContentLoaded` and `htmx:afterSwap`

---

### `server-toast`

**File:** `src/htmx-extensions/server-toast.ts`
**Purpose:** Displays server-sent toast notifications as DaisyUI alerts.
**Mechanism:** Listens for custom events and renders transient alert elements in the toast container.

---

## SSE Plugin (Server-side)

**File:** `src/plugins/sse-plugin.ts`
**Purpose:** Elysia plugin decorating context with SSE formatting utilities.
**API:**
- `sse.event(name, html, options?)` — Named SSE event with HTMX-compatible `data` payload
- `sse.ping()` — Keep-alive comment
- `sse.comment(text)` — Debug comment
