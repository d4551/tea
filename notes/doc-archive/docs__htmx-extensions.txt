# HTMX extensions and lifecycle ownership

This document describes the HTMX lifecycle model used by TEA after the progressive-enhancement cleanup.

## Why extensions exist here

TEA keeps HTMX behavior centralized so route templates do not reimplement loading, focus, validation, and error handling on a per-page basis.

The current design follows HTMX lifecycle guidance built around:

- `htmx:configRequest`
- `htmx:beforeRequest`
- `htmx:afterRequest`
- `htmx:beforeSwap`
- `htmx:afterSwap`
- `htmx:afterSettle`
- `htmx:sendError`
- `htmx:responseError`
- `htmx:timeout`

## Shared extension policy

- Prefer native HTMX attributes first.
- Use shared extensions only for cross-route UI contracts.
- Do not add route-local scripts for focus, validation swap, drawer state, or toasts when the shared extension surface already owns those concerns.
- Allow `422` validation responses to swap when the fragment is the intended validation surface.
- Treat focus restoration as a platform concern, not a page concern.

## Extension matrix

| Extension | File | Primary responsibility |
| --- | --- | --- |
| `layout-controls` | `src/htmx-extensions/layout-controls.ts` | Shared shell state, request busy state, validation swap policy, focus restoration |
| `focus-panel` | `src/htmx-extensions/focus-panel.ts` | Focus trapping and keyboard flow inside swapped panels |
| `oracle-indicator` | `src/htmx-extensions/oracle-indicator.ts` | Oracle form loading feedback |
| `server-toast` | `src/htmx-extensions/server-toast.ts` | Server-driven toast rendering |
| `game-hud` | `src/htmx-extensions/game-hud.ts` | Game HUD SSE payload rendering |

## `layout-controls`

Global shell extension enabled from the SSR layout.

### Owned behaviors

- Drawer toggle state.
- `aria-expanded` synchronization on controls.
- Escape-to-close behavior for drawers.
- Theme preference restore and persistence.
- Request busy-state tracking.
- Validation swap enablement on `422`.
- Post-swap focus restoration.

### Event ownership

| Event | Behavior |
| --- | --- |
| `htmx:beforeRequest` | Mark target/shell busy state |
| `htmx:afterRequest` | Clear busy state on successful completion |
| `htmx:sendError` | Clear busy state on network failure |
| `htmx:responseError` | Clear busy state on HTTP error responses |
| `htmx:beforeSwap` | Permit intended validation swaps and retarget shared error surfaces when needed |
| `htmx:afterSwap` | Rehydrate post-swap shell defaults |
| `htmx:afterSettle` | Return focus to swapped focus panel or `#main-content` |

## `focus-panel`

This extension owns keyboard flow inside panel-like HTMX fragments.

Rules:

- Swapped panel content may declare `[data-focus-panel="true"]`.
- Focus should move into the panel deterministically.
- Focus should not be stranded on detached DOM nodes after a swap.

## `oracle-indicator`

This extension owns oracle-specific loading feedback only.

Rules:

- Show loading intent before request dispatch.
- Clear loading state on the HTMX completion path.
- Do not embed bespoke loading logic inside the oracle fragment markup.

## `server-toast`

This extension renders server-originated feedback using the shared DaisyUI toast surface.

Presentation rules:

- Toast container owns placement.
- Alert semantics come from DaisyUI alert patterns.
- Server payloads should already be localized before they reach the browser.

## `game-hud`

This extension converts game HUD SSE payloads into HTML fragments for HUD slots.

Owned slot families:

- scene title
- dialogue
- experience / level
- participant state

The HUD stream is the source of truth for HUD rendering. Retired partial endpoints should not be reintroduced.

## Recommended markup patterns

Use native HTMX attributes first:

```html
<form
  hx-post="/example"
  hx-target="#panel"
  hx-swap="innerHTML"
  hx-indicator="#panel-loading"
  hx-ext="layout-controls"
></form>
```

Validation rerender pattern:

```html
<section id="panel" data-focus-panel="true"></section>
```

Toast container pattern:

```html
<div class="toast toast-end toast-top" id="server-toast-root"></div>
```

## Accessibility rules

- Interactive shells must preserve keyboard flow after swaps.
- Loading and failure surfaces should use live-region or alert semantics where appropriate.
- Focus restoration targets must be visible and intentional.
- Drawer and panel controls must keep ARIA state synchronized with DOM state.

## What not to add

- Page-local `htmx:*` listeners for concerns already owned here.
- Silent error swallowing in extension code.
- Hidden fallback behavior that bypasses the shared state machine.
- Inline scripts that mutate shell state without going through the shared extension layer.
