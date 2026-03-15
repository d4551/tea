import { describe, expect, test } from "bun:test";
import type {
  AiCapability,
  AiChatParams,
  AiClassificationResult,
  AiGenerationResult,
  AiImageGenerationResult,
  AiModelCapabilities,
  AiProvider,
  AiSpeechSynthesisParams,
  AiSpeechSynthesisResult,
  AiToolPlanResult,
  AiTranscriptionParams,
  AiTranscriptionResult,
} from "../src/domain/ai/providers/provider-types.ts";
import { AiAuthoringService } from "../src/domain/builder/ai-authoring.ts";

class StubAiProvider implements AiProvider {
  public readonly name = "stub";

  public constructor(private readonly text: string) {}

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async readiness(): Promise<"ready" | "degraded" | "offline"> {
    return "ready";
  }

  public async detectCapabilities(): Promise<readonly AiModelCapabilities[]> {
    return [
      {
        provider: "stub",
        model: "stub-model",
        capabilities: new Set<AiCapability>(["chat"]),
        maxContextLength: 1024,
        supportsStreaming: false,
        runtime: "onnx-cpu",
        integration: "huggingface",
        local: true,
        configurable: false,
      },
    ];
  }

  public async chat(_params: AiChatParams): Promise<AiGenerationResult> {
    return {
      ok: true,
      text: this.text,
      model: "stub-model",
      durationMs: 1,
    };
  }

  public async *chatStream(_params: AiChatParams): AsyncGenerator<string> {
    yield this.text;
  }

  public async classify(_text: string, _model?: string): Promise<AiClassificationResult | null> {
    return null;
  }

  public async transcribeAudio(_params: AiTranscriptionParams): Promise<AiTranscriptionResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async synthesizeSpeech(
    _params: AiSpeechSynthesisParams,
  ): Promise<AiSpeechSynthesisResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async describeImage(_image: Uint8Array, _prompt: string): Promise<AiGenerationResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async generateImage(): Promise<AiImageGenerationResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async generateEmbedding(_text: string): Promise<Float32Array | null> {
    return null;
  }

  public async planTools(): Promise<AiToolPlanResult> {
    return {
      ok: false,
      error: "unsupported",
      retryable: false,
    };
  }

  public async dispose(): Promise<void> {}
}

describe("AI authoring validation", () => {
  test("combat encounter generation rejects malformed JSON payloads", async () => {
    const service = new AiAuthoringService(
      new StubAiProvider('{ "id": 42, "sceneId": "intro", "enemies": [] }'),
    );

    const encounter = await service.generateCombatEncounter({
      prompt: "Generate an easy opening encounter for the intro scene.",
      sceneId: "intro",
      difficulty: "easy",
      playerLevel: 1,
    });

    expect(encounter.ok).toBe(false);
    if (encounter.ok) {
      return;
    }
    expect(encounter.error).toContain("invalid combat encounter payload");
  });

  test("item and cutscene generation filter malformed entries instead of casting them through", async () => {
    const itemService = new AiAuthoringService(
      new StubAiProvider(
        JSON.stringify([
          {
            id: "item-valid",
            labelKey: "item.valid.label",
            descriptionKey: "item.valid.description",
            category: "weapon",
            rarity: "rare",
            stackable: false,
            maxStack: 1,
            effects: { attack: 3 },
          },
          {
            id: "item-bad",
            labelKey: "item.bad.label",
            descriptionKey: "item.bad.description",
            category: "weapon",
            rarity: "rare",
            stackable: "nope",
            maxStack: 1,
            effects: {},
          },
        ]),
      ),
    );
    const cutsceneService = new AiAuthoringService(
      new StubAiProvider(
        JSON.stringify([
          {
            id: "step-valid",
            type: "dialogue",
            characterKey: "hero",
            textKey: "cutscene.hero.line",
            durationMs: 800,
            data: { emphasis: 1 },
          },
          {
            id: "step-bad",
            type: "dialogue",
            characterKey: "hero",
            textKey: "cutscene.hero.line",
            durationMs: "fast",
            data: {},
          },
        ]),
      ),
    );

    const items = await itemService.generateItemSet({
      prompt: "Generate two rare forest-themed items.",
      theme: "forest",
      count: 2,
      rarity: "rare",
    });
    const cutscene = await cutsceneService.generateCutsceneScript({
      prompt: "Generate a tense hero introduction cutscene.",
      sceneId: "intro",
      characters: ["hero"],
      mood: "tense",
    });

    expect(items.ok).toBe(true);
    if (!items.ok) {
      return;
    }
    expect(items.items).toHaveLength(1);
    expect(items.items[0]?.id).toBe("item-valid");

    expect(cutscene.ok).toBe(true);
    if (!cutscene.ok) {
      return;
    }
    expect(cutscene.steps).toHaveLength(1);
    expect(cutscene.steps[0]?.id).toBe("step-valid");
  });

  test("animation plan generation returns a typed failure for malformed JSON payloads", async () => {
    const service = new AiAuthoringService(
      new StubAiProvider('{ "targetId": "hero", "suggestedClips": [{ "id": 42 }] }'),
    );

    const plan = await service.generateAnimationPlan({
      prompt: "Add an idle and walk loop",
      targetId: "asset.hero",
    });

    expect(plan.ok).toBe(false);
    if (plan.ok) {
      return;
    }
    expect(plan.error).toContain("invalid animation plan payload");
  });
});
