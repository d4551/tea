import { gameAssetRelativePaths, joinUrlPath } from "./assets.ts";
import { defaultAppRouteRoots } from "./route-defaults.ts";

const resolveRouteRelativeAssetPath = (relativePath: string): string => {
  const withNormalizedSlashes = relativePath.replace(/\\/g, "/").trim();
  const base = withNormalizedSlashes.replace(/^\/+/g, "");
  const routeSegment = defaultAppRouteRoots.gameAssets.replace(/^\//, "");
  const duplicatedPrefix = `${routeSegment}/${routeSegment}/`;
  const duplicatePrefix = `${routeSegment}/assets/`;
  const routePrefix = `${routeSegment}/`;

  if (base.startsWith(duplicatedPrefix)) {
    return base.slice(duplicatedPrefix.length);
  }

  if (base.startsWith(duplicatePrefix)) {
    return base.slice(duplicatePrefix.length);
  }

  if (base.startsWith(routePrefix)) {
    return base.slice(routePrefix.length);
  }

  return base;
};

/**
 * Returns the mounted public URL for a browser-game asset.
 *
 * @param relativePath Relative asset path under the configured images directory.
 * @returns Public asset URL.
 */
export const toGameAssetUrl = (relativePath: string): string =>
  joinUrlPath(defaultAppRouteRoots.gameAssets, resolveRouteRelativeAssetPath(relativePath));

/**
 * Canonical public URLs for server-rendered game media.
 */
export const gameAssetUrls = {
  chaJiangSprite: toGameAssetUrl(gameAssetRelativePaths.chaJiangSprite),
  npcSpriteSheet: toGameAssetUrl(gameAssetRelativePaths.npcSpriteSheet),
  teaHouseBackground: toGameAssetUrl(gameAssetRelativePaths.teaHouseBackground),
} as const;
