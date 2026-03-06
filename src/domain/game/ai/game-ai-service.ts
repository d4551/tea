/**
 * Game AI Service
 *
 * High-level service for agentic game-assist features. Consumed by
 * game routes and the game loop. Routes requests through the
 * ProviderRegistry — does not know about specific providers.
 */

import { createLogger } from "../../../lib/logger.ts";
import type { GameLocale } from "../../../shared/contracts/game.ts";
import { ProviderRegistry } from "../../ai/providers/provider-registry.ts";
import type { AiCapability, AiGenerationResult } from "../../ai/providers/provider-types.ts";
import { gameTextByLocale, resolveGameText } from "../data/game-text.ts";

const logger = createLogger("game.ai-service");

/**
 * NPC dialogue generation context.
 */
export interface NpcDialogueContext {
  /** NPC identifier from game data. */
  readonly npcId: string;
  /** Player's input or prompt (for conversational NPCs). */
  readonly playerMessage?: string;
  /** Recent dialogue history for continuity. */
  readonly history?: readonly string[];
  /** Current scene identifier. */
  readonly sceneId: string;
}

/**
 * Available AI features based on currently running providers.
 */
export interface AvailableAiFeatures {
  /** Whether rich dialogue generation is available (Ollama chat). */
  readonly richDialogue: boolean;
  /** Whether vision/image analysis is available. */
  readonly visionAnalysis: boolean;
  /** Whether text classification (sentiment) is available. */
  readonly sentimentAnalysis: boolean;
  /** Whether embeddings generation is available. */
  readonly embeddings: boolean;
  /** Names of available providers. */
  readonly providers: readonly string[];
}

/**
 * System prompt template for NPC dialogue generation.
 *
 * @param npcId NPC identifier.
 * @param locale Active locale.
 * @param sceneId Current scene.
 * @returns Formatted system prompt.
 */
const buildNpcSystemPrompt = (npcId: string, locale: GameLocale, sceneId: string): string => {
  const npcLabel = resolveGameText(locale, `${npcId}.label`);
  const catalog = gameTextByLocale[locale] ?? gameTextByLocale["en-US"];
  const sceneTitle =
    catalog.scenes["scene.teaHouse.title" as keyof typeof catalog.scenes] ?? sceneId;

  const languageInstruction =
    locale === "zh-CN"
      ? "Respond entirely in Simplified Chinese (中文)."
      : "Respond entirely in English.";

  return [
    `You are ${npcLabel}, a character in the game "Leaves of the Fallen Kingdom".`,
    `You are currently in the scene: ${sceneTitle}.`,
    "The game is set in ancient China along the Yangtze River during the tea-trade era.",
    "You are deeply knowledgeable about tea, the five elements (Wu Xing), and river trade routes.",
    "Stay in character at all times. Keep responses concise (1-3 sentences).",
    "Never break the fourth wall. Never mention you are an AI.",
    languageInstruction,
  ].join("\n");
};

/**
 * System prompt for scene description generation.
 *
 * @param sceneId Scene identifier.
 * @param locale Active locale.
 * @returns Formatted system prompt.
 */
const buildSceneSystemPrompt = (sceneId: string, locale: GameLocale): string => {
  const languageInstruction =
    locale === "zh-CN"
      ? "Respond entirely in Simplified Chinese (中文)."
      : "Respond entirely in English.";

  return [
    "You are a narrator for 'Leaves of the Fallen Kingdom', a game set in ancient China.",
    `Describe the scene "${sceneId}" in vivid, atmospheric detail.`,
    "Focus on sensory details: the smell of tea, the sound of the river, the colours of silk.",
    "Keep the description to 2-4 sentences. Be poetic but concise.",
    languageInstruction,
  ].join("\n");
};

/**
 * System prompt for agentic game-design assistance.
 *
 * @returns Formatted system prompt.
 */
const buildAssistSystemPrompt = (): string => {
  return [
    "You are a game design assistant for 'Leaves of the Fallen Kingdom'.",
    "The game uses a Bun/Elysia/HTMX/PixiJS stack with server-driven AI.",
    "Help the game creator with design decisions, balancing, narrative, and implementation.",
    "Be specific, actionable, and reference the game's existing lore and mechanics.",
    "Format suggestions as concise bullet points when possible.",
  ].join("\n");
};

/**
 * Generates contextual NPC dialogue using the best available AI provider.
 *
 * @param context NPC and scene context.
 * @param locale Active locale.
 * @returns Generation result with in-character dialogue.
 */
export const generateNpcDialogue = async (
  context: NpcDialogueContext,
  locale: GameLocale,
): Promise<AiGenerationResult> => {
  const registry = await ProviderRegistry.getInstance();

  const systemPrompt = buildNpcSystemPrompt(context.npcId, locale, context.sceneId);

  const userContent = context.playerMessage ?? "Greet the player who has just approached you.";

  const result = await registry.chat({
    systemPrompt,
    messages: [
      ...(context.history ?? []).map((line) => ({
        role: "assistant" as const,
        content: line,
      })),
      { role: "user" as const, content: userContent },
    ],
    maxTokens: 120,
    temperature: 0.8,
  });

  if (!result.ok) {
    logger.warn("game.ai.dialogue.failed", {
      npcId: context.npcId,
      error: result.error,
    });

    const fallbackLine = resolveGameText(locale, `${context.npcId}.greet`);
    return {
      ok: true,
      text: fallbackLine,
      model: "fallback",
      durationMs: 0,
    };
  }

  return result;
};

/**
 * Generates a streaming NPC dialogue response.
 *
 * @param context NPC and scene context.
 * @param locale Active locale.
 * @returns Async generator yielding token strings.
 */
export async function* streamNpcDialogue(
  context: NpcDialogueContext,
  locale: GameLocale,
): AsyncGenerator<string> {
  const registry = await ProviderRegistry.getInstance();

  const systemPrompt = buildNpcSystemPrompt(context.npcId, locale, context.sceneId);

  const userContent = context.playerMessage ?? "Greet the player who has just approached you.";

  yield* registry.chatStream({
    systemPrompt,
    messages: [{ role: "user", content: userContent }],
    maxTokens: 120,
    temperature: 0.8,
  });
}

/**
 * Generates an atmospheric scene description.
 *
 * @param sceneId Scene identifier.
 * @param locale Active locale.
 * @returns Generation result with scene description.
 */
export const generateSceneDescription = async (
  sceneId: string,
  locale: GameLocale,
): Promise<AiGenerationResult> => {
  const registry = await ProviderRegistry.getInstance();

  return registry.chat({
    systemPrompt: buildSceneSystemPrompt(sceneId, locale),
    messages: [{ role: "user", content: `Describe the scene: ${sceneId}` }],
    maxTokens: 200,
    temperature: 0.9,
  });
};

/**
 * Uses a vision model to critique or describe a game asset.
 *
 * @param imageData Raw image bytes.
 * @param assetType Description of what the asset is (e.g. "NPC sprite sheet").
 * @returns Generation result with critique.
 */
export const critiqueGameAsset = async (
  imageData: Uint8Array,
  assetType: string,
): Promise<AiGenerationResult> => {
  const registry = await ProviderRegistry.getInstance();

  const prompt = [
    `Analyze this ${assetType} for a pixel-art RPG game set in ancient China.`,
    "Evaluate: colour palette, readability at small sizes, animation potential,",
    "and cultural authenticity. Suggest specific improvements.",
  ].join(" ");

  return registry.describeImage(imageData, prompt);
};

/**
 * Provides agentic game-design assistance.
 *
 * @param userPrompt Creator's question or request.
 * @param gameContext Optional context about current game state.
 * @returns Generation result with design guidance.
 */
export const suggestUserFlowStep = async (
  userPrompt: string,
  gameContext?: string,
): Promise<AiGenerationResult> => {
  const registry = await ProviderRegistry.getInstance();

  const messages = [
    ...(gameContext
      ? [{ role: "user" as const, content: `Current game state: ${gameContext}` }]
      : []),
    { role: "user" as const, content: userPrompt },
  ];

  return registry.chat({
    systemPrompt: buildAssistSystemPrompt(),
    messages,
    maxTokens: 300,
    temperature: 0.7,
  });
};

/**
 * Detects which AI features are currently available.
 *
 * @returns Feature availability snapshot.
 */
export const detectAvailableFeatures = async (): Promise<AvailableAiFeatures> => {
  const registry = await ProviderRegistry.getInstance();
  const status = await registry.getStatus();

  const hasCapability = (cap: AiCapability): boolean =>
    registry.findModelsWithCapability(cap).length > 0;

  return {
    richDialogue: hasCapability("chat"),
    visionAnalysis: hasCapability("vision"),
    sentimentAnalysis: hasCapability("text-classification"),
    embeddings: hasCapability("embeddings"),
    providers: status.providers.filter((p) => p.available).map((p) => p.name),
  };
};
