import { describe, expect, test } from "bun:test";
import { toGameAssetUrl } from "../src/shared/constants/game-assets.ts";
import { appRoutes } from "../src/shared/constants/routes.ts";

describe("game asset URL normalization", () => {
  test("converts simple relative paths", () => {
    expect(toGameAssetUrl("images/sprites/tea-house-scene-bg.png")).toBe(
      `${appRoutes.gameAssets}/images/sprites/tea-house-scene-bg.png`,
    );
  });

  test("normalizes absolute route-prefixed paths", () => {
    expect(toGameAssetUrl(`${appRoutes.gameAssets}/images/sprites/tea-house-scene-bg.png`)).toBe(
      `${appRoutes.gameAssets}/images/sprites/tea-house-scene-bg.png`,
    );
  });

  test("deduplicates accidental duplicated game asset mount paths", () => {
    const duplicatedPrefixPath = `${appRoutes.gameAssets}/${appRoutes.gameAssets.replace(/^\//, "")}/images/sprites/tea-house-scene-bg.png`;
    expect(toGameAssetUrl(duplicatedPrefixPath)).toBe(
      `${appRoutes.gameAssets}/images/sprites/tea-house-scene-bg.png`,
    );
  });
});
