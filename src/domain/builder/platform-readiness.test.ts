import { describe, expect, test } from "bun:test";
import {
  deriveBuilderReadinessAudit,
  evaluateBuilderPlatformReadiness,
} from "./platform-readiness.ts";

describe("deriveBuilderReadinessAudit", () => {
  test("counts sprite and tile assets separately for readiness predicates", () => {
    const audit = deriveBuilderReadinessAudit({
      scenes: [],
      assets: [
        {
          id: "asset-sprite",
          kind: "sprite-sheet",
          label: "Hero Atlas",
          sceneMode: "2d",
          source: "/hero.png",
          sourceFormat: "png",
          tags: [],
          variants: [],
          approved: true,
          createdAtMs: 1,
          updatedAtMs: 1,
        },
        {
          id: "asset-tiles",
          kind: "tiles",
          label: "Town Tiles",
          sceneMode: "2d",
          source: "/tiles.png",
          sourceFormat: "png",
          tags: [],
          variants: [],
          approved: true,
          createdAtMs: 1,
          updatedAtMs: 1,
        },
      ],
      animationClips: [],
      animationTimelines: [],
      dialogueGraphs: [],
      quests: [],
      triggers: [],
      flags: [],
      generationJobs: [],
      automationRuns: [],
      latestReleaseVersion: 0,
      publishedReleaseVersion: null,
    });

    expect(audit.spriteAssetCount).toBe(1);
    expect(audit.tileAssetCount).toBe(1);
  });
});

describe("evaluateBuilderPlatformReadiness", () => {
  test("does not mark automation or mechanics as partial without authored workflow inventory", () => {
    const readiness = evaluateBuilderPlatformReadiness({
      sceneCount: 1,
      spriteManifestCount: 0,
      aiFeatures: {
        richDialogue: true,
        visionAnalysis: false,
        sentimentAnalysis: false,
        embeddings: true,
        speechToText: false,
        speechSynthesis: false,
        localInference: true,
        providers: ["transformers"],
      },
      rendererPreference: "webgpu",
      onnxDevice: "webgpu",
      audit: {
        assetCount: 1,
        spriteAssetCount: 0,
        tileAssetCount: 0,
        scenes2dCount: 1,
        scenes3dCount: 0,
        modelAssetCount: 0,
        openUsdAssetCount: 0,
        animationClipCount: 0,
        animationTimelineCount: 0,
        mechanicCount: 0,
        generationJobCount: 0,
        automationRunCount: 0,
        automationStepCount: 0,
        latestReleaseVersion: 0,
        publishedReleaseVersion: null,
      },
    });

    expect(readiness.capabilities.find((entry) => entry.key === "automation")?.status).toBe(
      "missing",
    );
    expect(readiness.capabilities.find((entry) => entry.key === "mechanics")?.status).toBe(
      "missing",
    );
    expect(readiness.capabilities.find((entry) => entry.key === "spritePipeline")?.status).toBe(
      "missing",
    );
    expect(readiness.capabilities.find((entry) => entry.key === "runtime2d")?.status).toBe(
      "partial",
    );
  });
});
