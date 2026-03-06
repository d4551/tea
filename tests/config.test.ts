import { describe, expect, test } from "bun:test";
import {
  appConfig,
  matchLocale,
  normalizeLocale,
  parseBoolean,
  parseInteger,
} from "../src/config/environment.ts";
import {
  assetRelativePaths,
  joinLocalPath,
  joinUrlPath,
  resolveStaticAssetMounts,
} from "../src/shared/constants/assets.ts";
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

  test("auth and oracle numeric controls are config-driven", () => {
    expect(appConfig.auth.sessionCookieName.length).toBeGreaterThan(0);
    expect(appConfig.auth.sessionMaxAgeSeconds).toBeGreaterThan(0);
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
    expect(assetRelativePaths.htmxExtensionsOutputDirectory).toBe("vendor/htmx-ext");
    expect(appConfig.game.defaultSceneId.length).toBeGreaterThan(0);
    expect(appRoutes.gameAssets).toBe(appConfig.playableGame.assetPrefix);
  });

  test("local AI runtime settings are config-driven", () => {
    expect(typeof appConfig.ai.warmupOnBoot).toBe("boolean");
    expect(appConfig.ai.transformersCacheDirectory.length).toBeGreaterThan(0);
    expect(appConfig.ai.transformersLocalModelPath.length).toBeGreaterThan(0);
    expect(appConfig.ai.onnxWasmPath.length).toBeGreaterThan(0);
    expect(appConfig.ai.localSpeechToTextModel.length).toBeGreaterThan(0);
    expect(appConfig.ai.localTextToSpeechModel.length).toBeGreaterThan(0);
    expect(appConfig.ai.audioInputSampleRateHz).toBeGreaterThanOrEqual(8000);
    expect(appConfig.ai.audioUploadMaxBytes).toBeGreaterThan(0);
    expect(appRoutes.aiCatalog).toBe("/api/ai/catalog");
    expect(appRoutes.aiTranscribe).toBe("/api/ai/audio/transcribe");
    expect(appRoutes.aiSynthesize).toBe("/api/ai/audio/synthesize");
  });

  test("asset path helpers normalize url and local paths", () => {
    expect(joinUrlPath("/public/", "/vendor/htmx.min.js")).toBe("/public/vendor/htmx.min.js");
    expect(joinLocalPath("/public/", "/vendor/htmx.min.js")).toBe("public/vendor/htmx.min.js");
  });

  test("static asset mounts are derived from a single manifest", () => {
    expect(resolveStaticAssetMounts(appConfig)).toEqual([
      {
        assets: appConfig.staticAssets.publicDirectory,
        prefix: appConfig.staticAssets.publicPrefix,
      },
      {
        assets: appConfig.staticAssets.assetsDirectory,
        prefix: appConfig.staticAssets.assetsPrefix,
      },
      {
        assets: appConfig.playableGame.sourceDirectory,
        prefix: appConfig.playableGame.assetPrefix,
      },
      {
        assets: appConfig.staticAssets.rmmzPackDirectory,
        prefix: appConfig.staticAssets.rmmzPackPrefix,
      },
    ]);
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
