import { appConfig, type LocaleCode } from "../../config/environment.ts";
import { GAME_SESSION_ROUTE_PATTERNS, interpolateRoutePath } from "./route-patterns.ts";

type AppRouteMap = {
  readonly home: string;
  readonly builderStart: string;
  readonly game: string;
  readonly gameAssets: string;
  readonly gameApiSession: string;
  readonly gameApiSessionRestore: string;
  readonly gameApiSessionClose: string;
  readonly gameApiSessionState: string;
  readonly gameApiSessionCommand: string;
  readonly gameApiSessionDialogue: string;
  readonly gameApiSessionSave: string;
  readonly gameApiSessionSaveSlot: string;
  readonly gameApiSessionSaveSlots: string;
  readonly gameApiSessionRestoreSlot: string;
  readonly gameApiSessionHud: string;
  readonly gameApiSessionItemTooltip: string;
  readonly gameApiSessionWebSocket: string;
  readonly gameApiSessionInvite: string;
  readonly gameApiSessionJoin: string;
  readonly aiPlaygroundPartial: string;
  readonly oracleApi: string;
  readonly health: string;
  readonly healthApi: string;
  readonly aiStatus: string;
  readonly aiHealth: string;
  readonly aiCapabilities: string;
  readonly aiCatalog: string;
  readonly aiSettings: string;
  readonly aiKnowledgeDocuments: string;
  readonly aiKnowledgeDocumentDetail: string;
  readonly aiKnowledgeSearch: string;
  readonly aiAssistRetrieval: string;
  readonly aiPlanTools: string;
  readonly aiGenerateDialogue: string;
  readonly aiGenerateScene: string;
  readonly aiAssist: string;
  readonly aiTranscribe: string;
  readonly aiSynthesize: string;
  readonly aiHealthStream: string;
  readonly aiProviderModels: string;
  readonly aiProviderOllamaPull: string;
  readonly aiBuilderCapabilities: string;
  readonly aiBuilderTest: string;
  readonly aiBuilderAssist: string;
  readonly aiBuilderCompose: string;
  readonly aiBuilderKnowledgeList: string;
  readonly aiBuilderKnowledgeDocuments: string;
  readonly aiBuilderKnowledgeDocumentDetail: string;
  readonly aiBuilderKnowledgeSearch: string;
  readonly aiBuilderToolPlan: string;
  readonly aiBuilderHfTraining: string;
  readonly aiBuilderPatchPreview: string;
  readonly aiBuilderPatchApply: string;
  readonly aiBuilderPatchPreviewForm: string;
  readonly aiBuilderPatchApplyForm: string;
  readonly builderPlatformReadiness: string;
  readonly builder: string;
  readonly builderScenes: string;
  readonly builderNpcs: string;
  readonly builderDialogue: string;
  readonly builderAssets: string;
  readonly builderMechanics: string;
  readonly builderAutomation: string;
  readonly builderAi: string;
  readonly builderApiProjects: string;
  readonly builderApiProjectDetail: string;
  readonly builderApiProjectPublish: string;
  readonly builderApiScenes: string;
  readonly builderApiScenesCreateForm: string;
  readonly builderApiSceneDetail: string;
  readonly builderApiSceneForm: string;
  readonly builderApiSceneTilemap: string;
  readonly builderApiSceneNodes: string;
  readonly builderApiSceneNodeDelete: string;
  readonly builderApiNpcs: string;
  readonly builderApiNpcsCreateForm: string;
  readonly builderApiNpcDetail: string;
  readonly builderApiNpcForm: string;
  readonly builderApiDialogue: string;
  readonly builderApiDialogueCreateForm: string;
  readonly builderApiDialogueEntry: string;
  readonly builderApiDialogueEntryForm: string;
  readonly builderApiDialogueGenerate: string;
  readonly builderApiAssets: string;
  readonly builderApiAssetsUpload: string;
  readonly builderApiAssetsCreateForm: string;
  readonly builderApiAnimationClips: string;
  readonly builderApiAnimationClipsCreateForm: string;
  readonly builderApiDialogueGraphs: string;
  readonly builderApiDialogueGraphsCreateForm: string;
  readonly builderApiDialogueGraphDetail: string;
  readonly builderApiDialogueGraphForm: string;
  readonly builderApiQuests: string;
  readonly builderApiQuestsCreateForm: string;
  readonly builderApiQuestDetail: string;
  readonly builderApiQuestForm: string;
  readonly builderApiTriggers: string;
  readonly builderApiTriggersCreateForm: string;
  readonly builderApiTriggerDetail: string;
  readonly builderApiTriggerForm: string;
  readonly builderApiGenerationJobs: string;
  readonly builderApiGenerationJobsCreateForm: string;
  readonly builderApiGenerationJobApprove: string;
  readonly builderApiGenerationJobStream: string;
  readonly builderApiAutomationRuns: string;
  readonly builderApiAutomationRunsCreateForm: string;
  readonly builderApiAutomationRunApprove: string;
  readonly builderApiAutomationRunStream: string;
  readonly builderApiStatus: string;
};

/**
 * Canonical route map for the web app.
 * Every route path is defined once here to avoid drift across handlers and templates.
 */
export const appRoutes: AppRouteMap = {
  home: "/",
  builderStart: "/projects/:projectId/start",
  game: "/projects/:projectId/playtest",
  gameAssets: appConfig.playableGame.assetPrefix,
  gameApiSession: "/api/game/session",
  gameApiSessionRestore: GAME_SESSION_ROUTE_PATTERNS.restore,
  gameApiSessionClose: "/api/game/session/:id/close",
  gameApiSessionState: "/api/game/session/:id/state",
  gameApiSessionCommand: "/api/game/session/:id/command",
  gameApiSessionDialogue: "/api/game/session/:id/dialogue",
  gameApiSessionSave: "/api/game/session/:id/save",
  gameApiSessionSaveSlot: "/api/game/session/:id/save-slot",
  gameApiSessionSaveSlots: "/api/game/session/:id/save-slots",
  gameApiSessionRestoreSlot: "/api/game/session/:id/restore-slot",
  gameApiSessionHud: "/api/game/session/:id/hud",
  gameApiSessionItemTooltip: "/api/game/session/:id/item-tooltip",
  gameApiSessionWebSocket: GAME_SESSION_ROUTE_PATTERNS.websocket,
  gameApiSessionInvite: "/api/game/session/:id/invite",
  gameApiSessionJoin: "/api/game/session/:id/join",
  aiPlaygroundPartial: "/partials/ai-playground",
  oracleApi: "/api/oracle",
  health: "/health",
  healthApi: "/api/health",
  aiStatus: "/api/ai/status",
  aiHealth: "/api/ai/health",
  aiCapabilities: "/api/ai/capabilities",
  aiCatalog: "/api/ai/catalog",
  aiSettings: "/api/ai/settings",
  aiKnowledgeDocuments: "/api/ai/knowledge/documents",
  aiKnowledgeDocumentDetail: "/api/ai/knowledge/documents/:documentId",
  aiKnowledgeSearch: "/api/ai/knowledge/search",
  aiAssistRetrieval: "/api/ai/assist/retrieval",
  aiPlanTools: "/api/ai/plan/tools",
  aiGenerateDialogue: "/api/ai/generate/dialogue",
  aiGenerateScene: "/api/ai/generate/scene",
  aiAssist: "/api/ai/assist",
  aiTranscribe: "/api/ai/audio/transcribe",
  aiSynthesize: "/api/ai/audio/synthesize",
  aiHealthStream: "/api/ai/health/stream",
  aiProviderModels: "/api/ai/providers/models",
  aiProviderOllamaPull: "/api/ai/providers/ollama/pull",
  aiBuilderCapabilities: "/api/builder/ai/capabilities",
  aiBuilderTest: "/api/builder/ai/test",
  aiBuilderAssist: "/api/builder/ai/assist",
  aiBuilderCompose: "/api/builder/ai/compose",
  aiBuilderKnowledgeList: "/api/builder/ai/knowledge/list",
  aiBuilderKnowledgeDocuments: "/api/builder/ai/knowledge/documents",
  aiBuilderKnowledgeDocumentDetail: "/api/builder/ai/knowledge/documents/:documentId",
  aiBuilderKnowledgeSearch: "/api/builder/ai/knowledge/search",
  aiBuilderToolPlan: "/api/builder/ai/plan/tools",
  aiBuilderHfTraining: "/api/builder/ai/training/hf-jobs",
  aiBuilderPatchPreview: "/api/builder/ai/patch/preview",
  aiBuilderPatchApply: "/api/builder/ai/patch/apply",
  aiBuilderPatchPreviewForm: "/api/builder/ai/patch/preview/form",
  aiBuilderPatchApplyForm: "/api/builder/ai/patch/apply/form",
  builderPlatformReadiness: "/api/builder/platform-readiness",
  builder: "/projects/new",
  builderScenes: "/projects/:projectId/world",
  builderNpcs: "/projects/:projectId/characters",
  builderDialogue: "/projects/:projectId/story",
  builderAssets: "/projects/:projectId/assets",
  builderMechanics: "/projects/:projectId/systems",
  builderAutomation: "/projects/:projectId/operations",
  builderAi: "/projects/:projectId/settings",
  builderApiProjects: "/api/builder/projects",
  builderApiProjectDetail: "/api/builder/projects/:projectId",
  builderApiProjectPublish: "/api/builder/projects/:projectId/publish",
  builderApiScenes: "/api/builder/:projectId/scenes",
  builderApiScenesCreateForm: "/api/builder/:projectId/scenes/create/form",
  builderApiSceneDetail: "/api/builder/:projectId/scenes/:sceneId",
  builderApiSceneForm: "/api/builder/:projectId/scenes/:sceneId/form",
  builderApiSceneTilemap: "/api/builder/:projectId/scenes/:sceneId/tilemap",
  builderApiSceneNodes: "/api/builder/:projectId/scenes/:sceneId/nodes",
  builderApiSceneNodeDelete: "/api/builder/:projectId/scenes/:sceneId/nodes/:nodeId",
  builderApiNpcs: "/api/builder/:projectId/npcs",
  builderApiNpcsCreateForm: "/api/builder/:projectId/npcs/create/form",
  builderApiNpcDetail: "/api/builder/:projectId/npcs/:npcId",
  builderApiNpcForm: "/api/builder/:projectId/npcs/:npcId/form",
  builderApiDialogue: "/api/builder/dialogue",
  builderApiDialogueCreateForm: "/api/builder/dialogue/create/form",
  builderApiDialogueEntry: "/api/builder/:projectId/dialogue/:key",
  builderApiDialogueEntryForm: "/api/builder/:projectId/dialogue/:key/form",
  builderApiDialogueGenerate: "/api/builder/dialogue/generate",
  builderApiAssets: "/api/builder/assets",
  builderApiAssetsUpload: "/api/builder/assets/upload",
  builderApiAssetsCreateForm: "/api/builder/assets/create/form",
  builderApiAnimationClips: "/api/builder/animation-clips",
  builderApiAnimationClipsCreateForm: "/api/builder/animation-clips/create/form",
  builderApiDialogueGraphs: "/api/builder/:projectId/dialogue-graphs",
  builderApiDialogueGraphsCreateForm: "/api/builder/:projectId/dialogue-graphs/create/form",
  builderApiDialogueGraphDetail: "/api/builder/:projectId/dialogue-graphs/:graphId",
  builderApiDialogueGraphForm: "/api/builder/:projectId/dialogue-graphs/:graphId/form",
  builderApiQuests: "/api/builder/:projectId/quests",
  builderApiQuestsCreateForm: "/api/builder/:projectId/quests/create/form",
  builderApiQuestDetail: "/api/builder/:projectId/quests/:questId",
  builderApiQuestForm: "/api/builder/:projectId/quests/:questId/form",
  builderApiTriggers: "/api/builder/:projectId/triggers",
  builderApiTriggersCreateForm: "/api/builder/:projectId/triggers/create/form",
  builderApiTriggerDetail: "/api/builder/:projectId/triggers/:triggerId",
  builderApiTriggerForm: "/api/builder/:projectId/triggers/:triggerId/form",
  builderApiGenerationJobs: "/api/builder/generation-jobs",
  builderApiGenerationJobsCreateForm: "/api/builder/generation-jobs/create/form",
  builderApiGenerationJobApprove: "/api/builder/generation-jobs/:jobId/approve",
  builderApiGenerationJobStream: "/api/builder/generation-jobs/:jobId/stream",
  builderApiAutomationRuns: "/api/builder/:projectId/automation-runs",
  builderApiAutomationRunsCreateForm: "/api/builder/:projectId/automation-runs/create/form",
  builderApiAutomationRunApprove: "/api/builder/:projectId/automation-runs/:runId/approve",
  builderApiAutomationRunStream: "/api/builder/:projectId/automation-runs/:runId/stream",
  builderApiStatus: "/api/builder/status",
};

/**
 * Route identifier union derived from {@link appRoutes}.
 */
export type AppRouteKey = keyof typeof appRoutes;

/**
 * Appends the current locale as a deterministic query parameter to any internal route.
 *
 * @param path Internal route path, optionally including a hash segment.
 * @param locale Locale code to preserve.
 * @returns Locale-aware path.
 */
export const withLocaleQuery = (path: string, locale: LocaleCode): string => {
  const hashIndex = path.indexOf("#");
  const pathPartRaw = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? "" : path.slice(hashIndex + 1);
  const queryIndex = pathPartRaw.indexOf("?");
  const pathname = queryIndex === -1 ? pathPartRaw : pathPartRaw.slice(0, queryIndex);
  const queryString = queryIndex === -1 ? "" : pathPartRaw.slice(queryIndex + 1);
  const params = new URLSearchParams(queryString);
  params.set("lang", locale);
  const serializedParams = params.toString();
  const withQuery = serializedParams.length > 0 ? `${pathname}?${serializedParams}` : pathname;

  if (hashPart.length === 0) {
    return withQuery;
  }

  return `${withQuery}#${hashPart}`;
};

/**
 * Appends query parameters to a relative route while preserving any hash.
 *
 * @param path Relative path, optionally with query and hash.
 * @param params Query parameters to upsert.
 * @returns Relative path with merged query parameters.
 */
export const withQueryParameters = (
  path: string,
  params: Readonly<Record<string, string | undefined>>,
): string => {
  const hashIndex = path.indexOf("#");
  const pathPartRaw = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? "" : path.slice(hashIndex + 1);
  const queryIndex = pathPartRaw.indexOf("?");
  const pathname = queryIndex === -1 ? pathPartRaw : pathPartRaw.slice(0, queryIndex);
  const queryString = queryIndex === -1 ? "" : pathPartRaw.slice(queryIndex + 1);
  const routeParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && pathname.includes(`:${key}`)) {
      routeParams[key] = value;
    }
  }
  const interpolatedPathname = interpolateRoutePath(pathname, routeParams);
  const searchParams = new URLSearchParams(queryString);

  for (const [key, value] of Object.entries(params)) {
    if (interpolatedPathname !== pathname && pathname.includes(`:${key}`)) {
      continue;
    }

    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
      continue;
    }

    searchParams.delete(key);
  }

  const serialized = searchParams.toString();
  const nextPath =
    serialized.length > 0 ? `${interpolatedPathname}?${serialized}` : interpolatedPathname;
  return hashPart.length > 0 ? `${nextPath}#${hashPart}` : nextPath;
};

/**
 * Resolves the request pathname plus serialized query string as a relative path.
 *
 * @param request Incoming request.
 * @returns Relative request path including query parameters.
 */
export const resolveRequestPathWithQuery = (request: Request): string => {
  const url = new URL(request.url);
  return `${url.pathname}${url.search}`;
};

/**
 * Resolves the request pathname without query parameters.
 *
 * @param request Incoming request.
 * @returns Relative request pathname.
 */
export const resolveRequestPathname = (request: Request): string => new URL(request.url).pathname;

/**
 * Resolves a single request query parameter without mutating or trimming it.
 *
 * @param request Incoming request.
 * @param key Query-string key to read.
 * @returns Query parameter value when present.
 */
export const resolveRequestQueryParam = (request: Request, key: string): string | undefined => {
  const value = new URL(request.url).searchParams.get(key);
  return value ?? undefined;
};

/**
 * Replaces `:param` segments in a route pattern with URL-encoded values.
 *
 * @param path Route pattern such as `/api/game/session/:id/hud`.
 * @param params Route parameter bag.
 * @returns Concrete route path with all known params interpolated.
 */
export { interpolateRoutePath };
