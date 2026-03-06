import type { Prisma } from "@prisma/client";
import { prisma } from "../../shared/services/db.ts";

interface ParsedInteractionMap {
  readonly [key: string]: boolean;
}

type MutableInteractionMap = { [key: string]: boolean };

const toRecordFromParsed = (value: unknown): ParsedInteractionMap => {
  if (value === null || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) =>
      typeof key === "string" && typeof entry === "boolean" ? [[key, entry]] : [],
    ),
  ) as ParsedInteractionMap;
};

/**
 * Parses persisted interaction maps while dropping malformed values.
 */

const parseInteractionMap = (
  source: Prisma.JsonValue,
): { readonly map: ParsedInteractionMap; readonly repaired: boolean } => {
  if (source !== null && typeof source === "object" && !Array.isArray(source)) {
    return { map: toRecordFromParsed(source), repaired: false };
  }
  return { map: {}, repaired: true };
};

/**
 * Normalizes scene completion markers to deterministic values.
 */
const sanitizeInteractionFlag = (value: unknown): boolean =>
  typeof value === "boolean" ? value : false;

/**
 * Merges persisted interaction maps with boolean coercion for deterministic writes.
 */
const rebuildInteractionMap = (raw: ParsedInteractionMap): MutableInteractionMap => {
  const next: MutableInteractionMap = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key === "string" && key.length > 0) {
      next[key] = sanitizeInteractionFlag(value);
    }
  }

  return next;
};

export const XP_CONFIG = {
  interaction: 10,
  sceneDiscovery: 15,
  dialogue: 5,
  levelsXp: [0, 50, 120, 220, 350, 520, 740, 1000] as const,
};

export function getLevel(xp: number): number {
  for (let i = XP_CONFIG.levelsXp.length - 1; i >= 0; i--) {
    const threshold = XP_CONFIG.levelsXp[i];
    if (threshold !== undefined && xp >= threshold) return i;
  }
  return 0;
}

export function getLevelProgress(xp: number): number {
  const lvl = getLevel(xp);
  const cur = XP_CONFIG.levelsXp[lvl] || 0;

  if (lvl >= XP_CONFIG.levelsXp.length - 1) return 100;

  const next = XP_CONFIG.levelsXp[lvl + 1] as number;
  const progress = ((xp - cur) / (next - cur)) * 100;
  return Math.max(0, Math.min(progress, 100));
}

/**
 * Ensures player progress record exists for a session.
 */
export async function initializeProgress(sessionId: string): Promise<void> {
  await prisma.playerProgress.upsert({
    where: { sessionId },
    update: {},
    create: {
      sessionId,
      xp: 0,
      level: 1,
      visitedScenes: [] satisfies Prisma.JsonArray,
      interactions: {} satisfies Prisma.JsonObject,
    },
  });
}

/**
 * Awards XP and checks for level up.
 * Returns true if the player leveled up.
 */
export async function awardXp(
  sessionId: string,
  amount: number,
  _reason: string,
): Promise<boolean> {
  const current = await prisma.playerProgress.findUnique({ where: { sessionId } });
  if (!current) return false;

  const oldLevel = getLevel(current.xp);
  const updated = await prisma.playerProgress.addXp(sessionId, amount);
  return updated.level > oldLevel + 1;
}

/**
 * Intercept interaction/discovery to grant XP if not done before.
 */
export async function processInteractionProgress(
  sessionId: string,
  interactionId: string,
): Promise<boolean> {
  const current = await prisma.playerProgress.findUnique({ where: { sessionId } });
  if (!current) return false;

  const parsed = parseInteractionMap(current.interactions);
  const interactions = rebuildInteractionMap(parsed.map);

  if (interactions[interactionId]) {
    if (parsed.repaired) {
      await prisma.playerProgress.update({
        where: { sessionId },
        data: { interactions },
      });
    }

    return false;
  }

  interactions[interactionId] = true;
  await prisma.playerProgress.update({
    where: { sessionId },
    data: { interactions },
  });

  return await awardXp(sessionId, XP_CONFIG.interaction, `Interaction: ${interactionId}`);
}
