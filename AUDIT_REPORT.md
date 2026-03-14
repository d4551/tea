# Tea-Main Codebase Audit Report

**Date:** March 13, 2025  
**Scope:** Error handling, logging, API routes, Elysia error boundaries

---

## 1. Error Handling (try-catch blocks)

**Audit rule:** No try-catch blocks; use framework-native error propagation (result types, Elysia error boundaries, middleware handlers).

### Findings

| Status | Location | Details |
|--------|----------|---------|
| ✅ **PASS** | `src/` | No try-catch blocks found in source code |
| ✅ **PASS** | `scripts/` | No try-catch blocks found |
| ✅ **PASS** | `tests/` | No try-catch blocks found |
| ✅ **PASS** | `packages/` | No try-catch blocks found |

**Note:** The codebase uses `ApplicationError` + `throw` for error propagation, and Elysia's global `onError` handler catches and maps errors to canonical envelopes. No remediation needed.

---

## 2. Logging (console.* usage)

**Audit rule:** Replace console.log, console.error, console.warn, console.info, console.debug with structured logging.

### Findings

| Status | Location | Details |
|--------|----------|---------|
| ✅ **PASS** | `src/` | No console.* usage in application source |
| ✅ **PASS** | `scripts/` | No console.* usage |
| ✅ **PASS** | `tests/` | No console.* usage |

**Note:** The project uses `createLogger()` from `src/lib/logger.ts` for structured JSON logging. Third-party vendor bundles (`public/vendor/builder-scene-editor.js`, `public/game/game-client.js`) contain console usage from PixiJS/Three.js; these are out of scope as they are minified third-party code.

---

## 3. API Routes (appRoutes usage)

**Audit rule:** All routes use appRoutes; no hardcoded paths. Specifically verify `/ai/patch/preview` and `/ai/patch/apply` in builder-api.ts.

### Findings

| Status | File | Line(s) | Issue | Recommended Fix |
|--------|------|---------|-------|-----------------|
| ❌ **FAIL** | `src/routes/builder-api.ts` | **1534** | Hardcoded path `"/ai/patch/preview"` | Add `aiBuilderPatchPreview` to routes.ts and use `route(appRoutes.aiBuilderPatchPreview)` |
| ❌ **FAIL** | `src/routes/builder-api.ts` | **1574** | Hardcoded path `"/ai/patch/apply"` | Add `aiBuilderPatchApply` to routes.ts and use `route(appRoutes.aiBuilderPatchApply)` |

### Status: FIXED (March 2025)

All builder-api routes now use `route(appRoutes.X)`. Added to `routes.ts`:
- `builderApiProjectDetail`, `builderApiProjectPublish`
- `builderApiScenesCreateForm`, `builderApiSceneDetail`, `builderApiSceneForm`, `builderApiSceneNodeDelete`
- `builderApiNpcsCreateForm`, `builderApiNpcDetail`, `builderApiNpcForm`
- `builderApiDialogueCreateForm`, `builderApiDialogueEntry`, `builderApiDialogueEntryForm`, `builderApiDialogueGenerate`
- `builderApiAssetsCreateForm`, `builderApiAnimationClipsCreateForm`
- `builderApiDialogueGraphsCreateForm`, `builderApiQuestsCreateForm`, `builderApiQuestDetail`, `builderApiQuestForm`
- `builderApiTriggersCreateForm`, `builderApiGenerationJobsCreateForm`, `builderApiGenerationJobApprove`
- `builderApiAutomationRunsCreateForm`, `builderApiAutomationRunApprove`, `builderApiStatus`

---

## 4. Elysia Error Boundaries

**Audit rule:** Verify error handling uses Elysia's onError, mapResponse, etc.

### Findings

| Status | File | Line(s) | Implementation |
|--------|------|---------|----------------|
| ✅ **PASS** | `src/app.ts` | **37–45** | Global `.onError()` handler wired to `createErrorResponse()` |
| ✅ **PASS** | `src/plugins/error-handler.ts` | **86–112** | `createErrorResponse()` maps framework errors to `ApplicationError` and `ErrorEnvelope` |
| ✅ **PASS** | `src/app.ts` | **46–61** | `.onAfterHandle()` for content-type normalization |
| ✅ **PASS** | `src/plugins/request-context.ts` | **26** | `.onAfterHandle()` for request timing |
| ⚠️ **INFO** | - | - | No `mapResponse` usage; current `onError` + `createErrorResponse` pattern is sufficient |

### Error flow

1. **Global handler:** `app.ts` registers `.onError()` which calls `createErrorResponse()`.
2. **Error mapping:** `error-handler.ts` maps Elysia codes (VALIDATION, NOT_FOUND, SESSION_*, etc.) to `ApplicationError` with localized messages.
3. **Response:** Returns `ErrorEnvelope` with `code`, `message`, `retryable`, `correlationId`.
4. **Logging:** `createErrorResponse` uses `createLogger("http.error")` for structured error logs.

**Conclusion:** Elysia error boundaries are correctly implemented. No changes required.

---

## Summary

| Category | Status | Action Required |
|----------|--------|-----------------|
| Error handling (try-catch) | ✅ Pass | None |
| Logging (console.*) | ✅ Pass | None |
| API routes (appRoutes) | ✅ Pass | All builder-api routes use appRoutes |
| Elysia error boundaries | ✅ Pass | None |

---

## Essential Files for Understanding

- `src/app.ts` – App bootstrap, global `onError`, `onAfterHandle`
- `src/plugins/error-handler.ts` – Error mapping, `createErrorResponse`
- `src/lib/error-envelope.ts` – `ApplicationError`, `errorEnvelope`
- `src/lib/logger.ts` – Structured logging
- `src/shared/constants/routes.ts` – `appRoutes` definitions
- `src/routes/builder-api.ts` – Builder API routes (all use appRoutes)
