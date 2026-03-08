import { appConfig, type LocaleCode } from "../../config/environment.ts";

/**
 * Canonical route map for the web app.
 * Every route path is defined once here to avoid drift across handlers and templates.
 */
export const appRoutes = {
  home: "/",
  game: appConfig.playableGame.mountPath,
  gameAssets: appConfig.playableGame.assetPrefix,
  gameApiSession: "/api/game/session",
  gameApiSessionRestore: "/api/game/session/:id",
  gameApiSessionClose: "/api/game/session/:id/close",
  gameApiSessionState: "/api/game/session/:id/state",
  gameApiSessionCommand: "/api/game/session/:id/command",
  gameApiSessionDialogue: "/api/game/session/:id/dialogue",
  gameApiSessionSave: "/api/game/session/:id/save",
  gameApiSessionHud: "/api/game/session/:id/hud",
  gameApiSessionWebSocket: "/api/game/session/:id/ws",
  gameApiSessionInvite: "/api/game/session/:id/invite",
  gameApiSessionJoin: "/api/game/session/:id/join",
  aiPlaygroundPartial: "/partials/ai-playground",
  oracleApi: "/api/oracle",
  healthApi: "/api/health",
  aiStatus: "/api/ai/status",
  aiHealth: "/api/ai/health",
  aiCapabilities: "/api/ai/capabilities",
  aiCatalog: "/api/ai/catalog",
  aiKnowledgeDocuments: "/api/ai/knowledge/documents",
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
  aiBuilderKnowledgeSearch: "/api/builder/ai/knowledge/search",
  aiBuilderToolPlan: "/api/builder/ai/plan/tools",
  aiBuilderPatchPreviewForm: "/api/builder/ai/patch/preview/form",
  aiBuilderPatchApplyForm: "/api/builder/ai/patch/apply/form",
  builderPlatformReadiness: "/api/builder/platform-readiness",
  builder: "/builder",
  builderScenes: "/builder/scenes",
  builderNpcs: "/builder/npcs",
  builderDialogue: "/builder/dialogue",
  builderAssets: "/builder/assets",
  builderMechanics: "/builder/mechanics",
  builderAutomation: "/builder/automation",
  builderAi: "/builder/ai",
  builderApiProjects: "/api/builder/projects",
  builderApiScenes: "/api/builder/scenes",
  builderApiSceneNodes: "/api/builder/scenes/:sceneId/nodes",
  builderApiNpcs: "/api/builder/npcs",
  builderApiDialogue: "/api/builder/dialogue",
  builderApiAssets: "/api/builder/assets",
  builderApiAssetsUpload: "/api/builder/assets/upload",
  builderApiAnimationClips: "/api/builder/animation-clips",
  builderApiDialogueGraphs: "/api/builder/dialogue-graphs",
  builderApiQuests: "/api/builder/quests",
  builderApiTriggers: "/api/builder/triggers",
  builderApiGenerationJobs: "/api/builder/generation-jobs",
  builderApiGenerationJobStream: "/api/builder/generation-jobs/:jobId/stream",
  builderApiAutomationRuns: "/api/builder/automation-runs",
} as const;

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
  const searchParams = new URLSearchParams(queryString);

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.length > 0) {
      searchParams.set(key, value);
      continue;
    }

    searchParams.delete(key);
  }

  const serialized = searchParams.toString();
  const nextPath = serialized.length > 0 ? `${pathname}?${serialized}` : pathname;
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
export const interpolateRoutePath = (
  path: string,
  params: Readonly<Record<string, string>>,
): string =>
  path.replaceAll(/:([A-Za-z0-9_]+)/g, (segment, key: string) => {
    const value = params[key];
    return typeof value === "string" ? encodeURIComponent(value) : segment;
  });
