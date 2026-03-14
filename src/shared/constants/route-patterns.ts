export const GAME_SESSION_ROUTE_PATTERNS = {
  restore: "/api/game/session/:id",
  websocket: "/api/game/session/:id/ws",
} as const;

export type RoutePathParams = Readonly<Record<string, string>>;

/**
 * Replaces `:param` segments in a route pattern with URL-encoded values.
 *
 * @param path Route pattern such as `/api/game/session/:id/hud`.
 * @param params Route parameter bag.
 * @returns Concrete route path with all known params interpolated.
 */
export const interpolateRoutePath = (path: string, params: RoutePathParams): string =>
  path.replaceAll(/:([A-Za-z0-9_]+)/g, (segment, key: string) => {
    const value = params[key];
    return typeof value === "string" ? encodeURIComponent(value) : segment;
  });
