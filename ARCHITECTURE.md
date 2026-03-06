# System Architecture Trace

## Runtime topology

1. `src/server.ts` boots app via `startServer`.
2. `src/app.ts` composes plugins/routes in this order:
   - request context plugin
   - i18n context plugin
   - AI context plugin
   - SSE plugin
   - app-level centralized error handler (`onError`)
   - HTML content-type normalization (`onAfterHandle`)
   - swagger docs plugin
   - static plugin mounts (`/public`, `/assets`, `/rmmz-pack`, `${PLAYABLE_GAME_MOUNT_PATH}/assets`)
   - SSR page routes
   - JSON API routes

## Plugin ownership

- `request-context` plugin owns:
  - correlation ID generation
  - `x-correlation-id` response header propagation
  - request-level structured logging metadata via `onAfterResponse`
- `i18n-context` plugin owns:
  - request-level locale and message-catalog derivation
  - standardized locale/message access for page and API route handlers
- `error-handler` module owns:
  - framework error mapping
  - `Accept-Language` aware localization for framework-level errors
  - typed error envelope fallback
  - error-level structured logs

## Domain ownership

- `domain/oracle` owns oracle state resolution logic only.
- Routes do not implement domain branching rules directly.

## API contracts

- `GET /api/health`: success envelope
- `POST /api/oracle`: typed request schema + typed response envelopes by status via Elysia `status(...)`
- API validation failures are mapped to deterministic `422` typed error envelopes
- Route-level API error wrappers are removed; all framework error envelopes are owned by the shared error plugin

## UI contracts

- All page rendering is SSR through `views/` modules.
- HTMX partial updates are constrained to `#oracle-panel` and mapped to the oracle state machine.
- HTML response content type is applied once at the page-route boundary via `onAfterHandle`.
- Navigation exposes `aria-current="page"` and a skip-to-content link for keyboard users.
- `withLocaleQuery(...)` in `src/shared/constants/routes.ts` is the single locale URL helper used by navigation, footer CTA, and home-page cards.
- Locale switch links reuse `withLocaleQuery(...)` with the current request path+query so route context is preserved while `lang` is replaced.
- Locale matching is centralized through `matchLocale(...)` in `src/config/environment.ts`; query and `Accept-Language` resolution both consume the same matcher.
- `i18n-context` plugin derives locale+catalog once per request for SSR pages and API handlers.
- `resolveRequestI18n(request)` in `src/shared/i18n/translator.ts` is the single resolver consumed by the i18n plugin and error localization.
- `resolveRequestI18nWithOverride(request, localeOverride)` is used by oracle API POST routes to explicitly support payload-locale override while keeping request-locale fallback deterministic.
- `Accept-Language` candidates are parsed with quality (`q`) weights before matching, preventing header-order ambiguity.
- Oracle form includes a hidden `lang` field and `hx-params="*"` to preserve locale in both HTMX and non-JS GET submissions.
- Oracle form fallback action now targets the full SSR home route; HTMX upgrades only the panel via `/partials/oracle`, so both enhanced and non-enhanced paths share the same state model.

## Build and asset pipeline

- `scripts/build-assets.ts` owns:
  - Tailwind/DaisyUI CSS compilation
  - HTMX bundle copy into `/public/vendor`
  - custom HTMX extension bundling into `/public/vendor/htmx-ext`
  - playable game client bundling into `PLAYABLE_GAME_SOURCE_DIRECTORY`
  - ONNX WASM asset copy into `/public/onnx`
- `scripts/dev.ts` owns:
  - setup + watcher orchestration
  - CSS watcher
  - HTMX extension watcher
  - playable game client watcher
  - server watcher
  - fail-fast child-process lifecycle management across all long-running watchers
- `scripts/process-sprites.ts` owns:
  - config-driven sprite extraction mappings and outputs
  - deterministic flood-fill / optional AI background removal
- Game image/audio assets are served from the shared `IMAGES_ASSET_PREFIX` mount; the playable-game runtime assets under `${PLAYABLE_GAME_MOUNT_PATH}/assets` are reserved for the client bundle and runtime-only assets.

## Configuration sources of truth

- Runtime config: `src/config/environment.ts`
- Static asset directories/prefixes: `appConfig.staticAssets.*`
- Playable game runtime source + mount config: `appConfig.playableGame.*`
- Asset URL/path normalization helpers: `src/shared/constants/assets.ts`
- Game media URLs: `src/shared/constants/game-assets.ts`
- Oracle mode constants: `src/shared/constants/oracle.ts`
- Routes: `src/shared/constants/routes.ts`
- Localized content: `src/shared/i18n/messages.ts`
- Prisma schema: `prisma/schema.prisma`
