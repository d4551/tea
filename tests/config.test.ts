import { describe, expect, test } from "bun:test";
import {
  appConfig,
  matchLocale,
  normalizeLocale,
  parseBoolean,
  parseInteger,
} from "../src/config/environment.ts";
import { joinLocalPath, joinUrlPath } from "../src/shared/constants/assets.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../src/shared/constants/routes.ts";

describe("environment parsing", () => {
  test("boolean parsing respects explicit true values", () => {
    expect(parseBoolean("true", false)).toBe(true);
    expect(parseBoolean("false", true)).toBe(false);
    expect(parseBoolean(undefined, true)).toBe(true);
  });

  test("integer parsing applies fallback and minimum bounds", () => {
    expect(parseInteger("42", 10, 1)).toBe(42);
    expect(parseInteger("-8", 10, 1)).toBe(1);
    expect(parseInteger("not-a-number", 10, 1)).toBe(10);
  });

  test("locale normalization maps supported families", () => {
    expect(normalizeLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeLocale("en-US")).toBe("en-US");
    expect(normalizeLocale("fr-FR")).toBe("en-US");
  });

  test("locale matcher returns null for unsupported locale families", () => {
    expect(matchLocale("zh")).toBe("zh-CN");
    expect(matchLocale("en-GB")).toBe("en-US");
    expect(matchLocale("fr-FR")).toBeNull();
  });

  test("sprite file mappings are configured through typed environment config", () => {
    expect(appConfig.spriteProcessing.chaJiangSourceFile.length).toBeGreaterThan(0);
    expect(appConfig.spriteProcessing.chaJiangOutputFile.length).toBeGreaterThan(0);
    expect(appConfig.spriteProcessing.npcSheetSourceFile.length).toBeGreaterThan(0);
    expect(appConfig.spriteProcessing.npcSheetOutputFile.length).toBeGreaterThan(0);
  });

  test("auth and oracle numeric controls are config-driven", () => {
    expect(appConfig.auth.sessionCookieName.length).toBeGreaterThan(0);
    expect(appConfig.auth.sessionCookieValue.length).toBeGreaterThan(0);
    expect(appConfig.oracle.answerHashMultiplier).toBeGreaterThan(0);
  });

  test("static asset directories are config-driven", () => {
    expect(appConfig.staticAssets.publicDirectory.length).toBeGreaterThan(0);
    expect(appConfig.staticAssets.assetsDirectory.length).toBeGreaterThan(0);
    expect(appConfig.staticAssets.rmmzPackDirectory.length).toBeGreaterThan(0);
  });

  test("playable game mounts and sprite output are config-driven", () => {
    expect(appConfig.playableGame.mountPath.length).toBeGreaterThan(0);
    expect(appConfig.playableGame.assetPrefix).toBe(`${appConfig.playableGame.mountPath}/assets`);
    expect(appConfig.playableGame.clientScriptPath).toBe(
      `${appConfig.playableGame.assetPrefix}/game-client.js`,
    );
    expect(appConfig.spriteProcessing.outputDirectory.endsWith("images/sprites")).toBe(true);
    expect(appConfig.game.defaultSceneId.length).toBeGreaterThan(0);
    expect(appRoutes.gameAssets).toBe(appConfig.playableGame.assetPrefix);
  });

  test("asset path helpers normalize url and local paths", () => {
    expect(joinUrlPath("/public/", "/vendor/htmx.min.js")).toBe("/public/vendor/htmx.min.js");
    expect(joinLocalPath("/public/", "/vendor/htmx.min.js")).toBe("public/vendor/htmx.min.js");
  });

  test("locale query helper preserves hash and existing params", () => {
    expect(withLocaleQuery("/pitch-deck", "en-US")).toBe("/pitch-deck?lang=en-US");
    expect(withLocaleQuery("/?tab=overview&lang=en-US", "zh-CN")).toBe("/?tab=overview&lang=zh-CN");
    expect(withLocaleQuery("/pitch-deck?lang=en-US&lang=zh-CN", "en-US")).toBe(
      "/pitch-deck?lang=en-US",
    );
    expect(withLocaleQuery("/#architecture", "zh-CN")).toBe("/?lang=zh-CN#architecture");
  });

  test("query parameter helper upserts values without losing hash", () => {
    expect(
      withQueryParameters("/builder/scenes#detail", { locale: "en-US", projectId: "demo" }),
    ).toBe("/builder/scenes?locale=en-US&projectId=demo#detail");
    expect(withQueryParameters("/builder/scenes?projectId=demo", { projectId: undefined })).toBe(
      "/builder/scenes",
    );
  });
});
