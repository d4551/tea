import { appConfig, type LocaleCode } from "../../config/environment.ts";

/**
 * Canonical route map for the web app.
 * Every route path is defined once here to avoid drift across handlers and templates.
 */
export const appRoutes = {
  home: "/",
  pitchDeck: "/pitch-deck",
  narrativeBible: "/narrative-bible",
  developmentPlan: "/dev-plan",
  game: appConfig.playableGame.mountPath,
  gameAssets: appConfig.playableGame.assetPrefix,
  gameApiSession: "/api/game/session",
  gameApiSessionRestore: "/api/game/session/:id",
  gameApiSessionJoin: "/api/game/session/:id/join",
  gameApiSessionClose: "/api/game/session/:id/close",
  gameApiSessionState: "/api/game/session/:id/state",
  gameApiSessionCommand: "/api/game/session/:id/command",
  gameApiSessionDialogue: "/api/game/session/:id/dialogue",
  gameApiSessionSave: "/api/game/session/:id/save",
  gameApiSessionHud: "/api/game/session/:id/hud",
  gameApiHudPartial: "/api/game/session/:id/partials/hud",
  gameApiDialoguePartial: "/api/game/session/:id/partials/dialogue",
  gameApiSessionWebSocket: "/api/game/session/:id/ws",
  oraclePartial: "/partials/oracle",
  oracleApi: "/api/oracle",
  healthApi: "/api/health",
  aiStatus: "/api/ai/status",
  aiHealth: "/api/ai/health",
  aiCapabilities: "/api/ai/capabilities",
  aiGenerateDialogue: "/api/ai/generate/dialogue",
  aiGenerateScene: "/api/ai/generate/scene",
  aiAssist: "/api/ai/assist",
  aiBuilderCapabilities: "/api/builder/ai/capabilities",
  aiBuilderTest: "/api/builder/ai/test",
  aiBuilderAssist: "/api/builder/ai/assist",
  aiBuilderCompose: "/api/builder/ai/compose",
  builder: "/builder",
  builderScenes: "/builder/scenes",
  builderNpcs: "/builder/npcs",
  builderDialogue: "/builder/dialogue",
  builderAssets: "/builder/assets",
  builderAi: "/builder/ai",
  builderApiScenes: "/api/builder/scenes",
  builderApiNpcs: "/api/builder/npcs",
  builderApiDialogue: "/api/builder/dialogue",
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
