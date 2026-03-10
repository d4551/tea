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
    expect(parseBoolean("true", false, "TEST_BOOL")).toBe(true);
    expect(parseBoolean("false", true, "TEST_BOOL")).toBe(false);
    expect(parseBoolean(undefined, true, "TEST_BOOL")).toBe(true);
    expect(() => parseBoolean("yes", false, "TEST_BOOL")).toThrow(
      "Invalid environment variable TEST_BOOL",
    );
  });

  test("integer parsing rejects malformed and out-of-range values", () => {
    expect(parseInteger("42", 10, 1, "TEST_INT")).toBe(42);
    expect(parseInteger(undefined, 10, 1, "TEST_INT")).toBe(10);
    expect(() => parseInteger("-8", 10, 1, "TEST_INT")).toThrow(
      "Invalid environment variable TEST_INT",
    );
    expect(() => parseInteger("not-a-number", 10, 1, "TEST_INT")).toThrow(
      "Invalid environment variable TEST_INT",
    );
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
    expect(["development", "test", "production"]).toContain(appConfig.runtime.nodeEnv);
    expect(appConfig.auth.sessionCookieName.length).toBeGreaterThan(0);
    expect(appConfig.auth.sessionMaxAgeSeconds).toBeGreaterThan(0);
    expect(appConfig.auth.resumeTokenSecret.length).toBeGreaterThan(0);
    expect(appConfig.oracle.answerHashMultiplier).toBeGreaterThan(0);
  });

  test("static asset directories are config-driven", () => {
    expect(appConfig.bootstrap.supportedBunRange).toBe("1.3.x");
    expect(appConfig.bootstrap.installBunVersion.startsWith("1.3.")).toBe(true);
    expect(appConfig.database.url.length).toBeGreaterThan(0);
    expect(appConfig.paths.builderUploadsDirectory.length).toBeGreaterThan(0);
    expect(appConfig.paths.aiCacheDirectory.length).toBeGreaterThan(0);
    expect(appConfig.paths.aiLocalModelDirectory.length).toBeGreaterThan(0);
    expect(appConfig.staticAssets.publicDirectory.length).toBeGreaterThan(0);
    expect(appConfig.staticAssets.assetsDirectory.length).toBeGreaterThan(0);
    expect(appConfig.staticAssets.rmmzPackDirectory.length).toBeGreaterThan(0);
    expect(appConfig.staticAssets.cacheMaxAgeSeconds).toBeGreaterThanOrEqual(0);
    expect(appConfig.builder.workerPollIntervalMs).toBeGreaterThanOrEqual(100);
    const configuredAutomationOrigin = Bun.env.BUILDER_LOCAL_AUTOMATION_ORIGIN;
    expect(typeof configuredAutomationOrigin).toBe("string");
    expect(appConfig.builder.localAutomationOrigin).toBe(configuredAutomationOrigin ?? "");
    expect(appConfig.builder.automationProbeTimeoutMs).toBeGreaterThanOrEqual(100);
    expect(appConfig.ui.defaultTheme.length).toBeGreaterThan(0);
    expect(
      typeof appConfig.ui.socialLinks.githubUrl === "string" ||
        appConfig.ui.socialLinks.githubUrl === null,
    ).toBe(true);
    expect(
      typeof appConfig.ui.socialLinks.discordUrl === "string" ||
        appConfig.ui.socialLinks.discordUrl === null,
    ).toBe(true);
    expect(
      typeof appConfig.ui.socialLinks.twitterUrl === "string" ||
        appConfig.ui.socialLinks.twitterUrl === null,
    ).toBe(true);
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
    expect(appConfig.ai.routing.defaultPolicy).toBe("local-first");
    expect(appConfig.ai.routing.cloudFallbackEnabled).toBe(true);
    expect(appConfig.ai.routing.ragPersistence).toBe("prisma");
    expect(appConfig.ai.openAiCompatible.local.baseUrl.length).toBeGreaterThan(0);
    expect(appConfig.ai.openAiCompatible.local.providerLabel.length).toBeGreaterThan(0);
    expect(appConfig.ai.openAiCompatible.local.chatModel.length).toBeGreaterThan(0);
    expect(appConfig.ai.openAiCompatible.cloud.baseUrl.length).toBeGreaterThan(0);
    expect(appConfig.ai.openAiCompatible.cloud.providerLabel.length).toBeGreaterThan(0);
    expect(appConfig.ai.openAiCompatible.cloud.chatModel.length).toBeGreaterThan(0);
    expect(appConfig.ai.ragChunkSize).toBeGreaterThanOrEqual(100);
    expect(appConfig.ai.ragChunkOverlap).toBeGreaterThanOrEqual(0);
    expect(appConfig.ai.ragSearchLimit).toBeGreaterThan(0);
    expect(appConfig.ai.ragHashDimension).toBeGreaterThanOrEqual(8);
    expect(appConfig.ai.audioInputSampleRateHz).toBeGreaterThanOrEqual(8000);
    expect(appConfig.ai.audioUploadMaxBytes).toBeGreaterThan(0);
    expect(appRoutes.aiCatalog).toBe("/api/ai/catalog");
    expect(appRoutes.aiKnowledgeDocuments).toBe("/api/ai/knowledge/documents");
    expect(appRoutes.aiKnowledgeSearch).toBe("/api/ai/knowledge/search");
    expect(appRoutes.aiAssistRetrieval).toBe("/api/ai/assist/retrieval");
    expect(appRoutes.aiPlanTools).toBe("/api/ai/plan/tools");
    expect(appRoutes.aiTranscribe).toBe("/api/ai/audio/transcribe");
    expect(appRoutes.aiSynthesize).toBe("/api/ai/audio/synthesize");
    expect(appRoutes.aiBuilderKnowledgeList).toBe("/api/builder/ai/knowledge/list");
    expect(appRoutes.aiBuilderKnowledgeDocuments).toBe("/api/builder/ai/knowledge/documents");
    expect(appRoutes.aiBuilderKnowledgeSearch).toBe("/api/builder/ai/knowledge/search");
    expect(appRoutes.aiBuilderToolPlan).toBe("/api/builder/ai/plan/tools");
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
