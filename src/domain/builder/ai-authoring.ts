import { createLogger } from "../../lib/logger.ts";
import { safeJsonParse } from "../../shared/utils/safe-json.ts";
import type { AiProvider } from "../ai/providers/provider-types.ts";

const logger = createLogger("builder.ai-authoring");

/**
 * AI-generated combat encounter output.
 */
export interface GeneratedCombatEncounter {
  readonly id: string;
  readonly sceneId: string;
  readonly enemies: readonly {
    readonly characterKey: string;
    readonly level: number;
    readonly stats: Record<string, number>;
  }[];
  readonly rewards: {
    readonly xp: number;
    readonly gold: number;
    readonly items: readonly string[];
  };
  readonly difficulty: string;
}

/**
 * AI-generated inventory item output.
 */
export interface GeneratedInventoryItem {
  readonly id: string;
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly category: "weapon" | "armor" | "consumable" | "key" | "material";
  readonly rarity: string;
  readonly stackable: boolean;
  readonly maxStack: number;
  readonly effects: Record<string, number>;
}

/**
 * AI-generated cutscene script step output.
 */
export interface GeneratedCutsceneStep {
  readonly id: string;
  readonly type: "dialogue" | "camera" | "animation" | "wait";
  readonly characterKey: string | null;
  readonly textKey: string | null;
  readonly durationMs: number;
  readonly data: Record<string, unknown>;
}

/**
 * Context for generating a combat encounter via AI.
 */
export interface CombatEncounterContext {
  /** Scene identifier for encounter placement. */
  readonly sceneId: string;
  /** Target difficulty tier. */
  readonly difficulty: "easy" | "normal" | "hard" | "boss";
  /** Expected player level. */
  readonly playerLevel: number;
}

/**
 * Context for generating an item set via AI.
 */
export interface ItemSetContext {
  /** Thematic category for generated items. */
  readonly theme: string;
  /** Number of items to generate. */
  readonly count: number;
  /** Rarity tier. */
  readonly rarity: "common" | "uncommon" | "rare" | "legendary";
}

/**
 * Context for generating a cutscene script via AI.
 */
export interface CutsceneScriptContext {
  /** Scene where the cutscene occurs. */
  readonly sceneId: string;
  /** Characters involved. */
  readonly characters: readonly string[];
  /** Narrative mood. */
  readonly mood: string;
}

/**
 * Extracts a JSON block from a raw AI response string.
 *
 * @param raw AI response text.
 * @returns Parsed JSON value or null on failure.
 */
const extractJson = (raw: string): unknown | null => {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fencedMatch ? (fencedMatch[1]?.trim() ?? "") : raw.trim();
  return safeJsonParse(jsonStr, null);
};

/**
 * AI-assisted content authoring service.
 *
 * Generates game content (encounters, items, cutscenes) by prompting an
 * AI provider with structured JSON schemas and parsing the results.
 */
export class AiAuthoringService {
  /**
   * @param provider AI provider to use for generation.
   */
  constructor(private readonly provider: AiProvider) {}

  /**
   * Generates a combat encounter using AI-driven content authoring.
   *
   * @param context Encounter generation context.
   * @returns Generated combat encounter or null on failure.
   */
  async generateCombatEncounter(
    context: CombatEncounterContext,
  ): Promise<GeneratedCombatEncounter | null> {
    const systemPrompt = `You generate JSON combat encounters for a 2D RPG. Respond ONLY with a valid JSON object matching this schema:
{
  "id": string,
  "sceneId": string,
  "enemies": [{ "characterKey": string, "level": number, "stats": { "hp": number, "maxHp": number, "mp": number, "maxMp": number, "attack": number, "defense": number, "magicAttack": number, "magicDefense": number, "speed": number, "critRate": number, "critMultiplier": number } }],
  "rewards": { "xp": number, "gold": number, "items": string[] },
  "difficulty": string
}`;

    const result = await this.provider.chat({
      messages: [
        {
          role: "user",
          content: `Generate a ${context.difficulty} combat encounter for scene "${context.sceneId}" targeting player level ${context.playerLevel}.`,
        },
      ],
      systemPrompt,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.combat.failed", { error: result.error });
      return null;
    }

    const parsed = extractJson(result.text);
    return parsed as GeneratedCombatEncounter;
  }

  /**
   * Generates a set of inventory items using AI-driven content authoring.
   *
   * @param context Item generation context.
   * @returns Generated items or empty array on failure.
   */
  async generateItemSet(context: ItemSetContext): Promise<readonly GeneratedInventoryItem[]> {
    const systemPrompt = `You generate JSON inventory items for a 2D RPG. Respond ONLY with a JSON array of objects matching this schema:
[{ "id": string, "labelKey": string, "descriptionKey": string, "category": "weapon" | "armor" | "consumable" | "key" | "material", "rarity": string, "stackable": boolean, "maxStack": number, "effects": Record<string, number> }]`;

    const result = await this.provider.chat({
      messages: [
        {
          role: "user",
          content: `Generate ${context.count} ${context.rarity} items with theme "${context.theme}".`,
        },
      ],
      systemPrompt,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.items.failed", { error: result.error });
      return [];
    }

    const parsed = extractJson(result.text);
    return Array.isArray(parsed) ? (parsed as GeneratedInventoryItem[]) : [];
  }

  /**
   * Generates a cutscene script using AI-driven content authoring.
   *
   * @param context Cutscene generation context.
   * @returns Generated cutscene steps or empty array on failure.
   */
  async generateCutsceneScript(
    context: CutsceneScriptContext,
  ): Promise<readonly GeneratedCutsceneStep[]> {
    const systemPrompt = `You generate JSON cutscene scripts for a 2D RPG. Respond ONLY with a JSON array of step objects matching this schema:
[{ "id": string, "type": "dialogue" | "camera" | "animation" | "wait", "characterKey": string | null, "textKey": string | null, "durationMs": number, "data": Record<string, unknown> }]`;

    const result = await this.provider.chat({
      messages: [
        {
          role: "user",
          content: `Generate a cutscene script for scene "${context.sceneId}" involving characters [${context.characters.join(", ")}] with a ${context.mood} mood.`,
        },
      ],
      systemPrompt,
    });

    if (!result.ok) {
      logger.warn("ai.authoring.cutscene.failed", { error: result.error });
      return [];
    }

    const parsed = extractJson(result.text);
    return Array.isArray(parsed) ? (parsed as GeneratedCutsceneStep[]) : [];
  }
}
