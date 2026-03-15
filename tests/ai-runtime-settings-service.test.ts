import { afterEach, describe, expect, test } from "bun:test";
import { aiRuntimeSettingsService } from "../src/domain/ai/ai-runtime-settings-service.ts";
import { appConfig } from "../src/config/environment.ts";
import { prismaBase } from "../src/shared/services/db.ts";

afterEach(async () => {
  await prismaBase.aiRuntimeSetting.deleteMany();
  await aiRuntimeSettingsService.resetForTests();
});

describe("AI runtime settings service", () => {
  test("persists and applies override values to the effective runtime config", async () => {
    const original = appConfig.ai.localSpeechToTextModel;

    await aiRuntimeSettingsService.updateSettings([
      {
        key: "AI_LOCAL_SPEECH_TO_TEXT_MODEL",
        value: "microsoft/vibe-voice",
      },
    ]);

    const setting = await aiRuntimeSettingsService.getSetting("AI_LOCAL_SPEECH_TO_TEXT_MODEL");

    expect(setting?.value).toBe("microsoft/vibe-voice");
    expect(setting?.source).toBe("override");
    expect(appConfig.ai.localSpeechToTextModel).toBe("microsoft/vibe-voice");
    expect(original.length).toBeGreaterThan(0);
  });

  test("reset removes the persisted override and restores the base runtime value", async () => {
    const baseValue = appConfig.ai.imageGenerationSteps;

    await aiRuntimeSettingsService.updateSettings([
      {
        key: "AI_IMAGE_GENERATION_STEPS",
        value: 12,
      },
    ]);
    await aiRuntimeSettingsService.updateSettings([
      {
        key: "AI_IMAGE_GENERATION_STEPS",
        reset: true,
      },
    ]);

    const setting = await aiRuntimeSettingsService.getSetting("AI_IMAGE_GENERATION_STEPS");

    expect(setting?.source).not.toBe("override");
    expect(setting?.value).toBe(baseValue);
    expect(appConfig.ai.imageGenerationSteps).toBe(baseValue);
  });
});
