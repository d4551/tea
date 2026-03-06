import { gameAssetRelativePaths, joinUrlPath } from "./assets.ts";
import { appRoutes } from "./routes.ts";

/**
 * Returns the mounted public URL for a browser-game asset.
 *
 * @param relativePath Relative asset path under the configured images directory.
 * @returns Public asset URL.
 */
export const toGameAssetUrl = (relativePath: string): string =>
  joinUrlPath(appRoutes.gameAssets, relativePath);

/**
 * Canonical public URLs for server-rendered game media.
 */
export const gameAssetUrls = {
  chaJiangSprite: toGameAssetUrl(gameAssetRelativePaths.chaJiangSprite),
  npcSpriteSheet: toGameAssetUrl(gameAssetRelativePaths.npcSpriteSheet),
  teaHouseBackground: toGameAssetUrl(gameAssetRelativePaths.teaHouseBackground),
} as const;
