/**
 * XP thresholds and award amounts used by runtime progression.
 */
export const XP_CONFIG = {
  interaction: 10,
  sceneDiscovery: 15,
  dialogue: 5,
  levelsXp: [0, 50, 120, 220, 350, 520, 740, 1000],
};

/**
 * Resolves the zero-based progression tier for an XP total.
 *
 * @param xp Total accumulated XP.
 * @returns Zero-based level tier.
 */
export function getLevel(xp: number): number {
  for (let i = XP_CONFIG.levelsXp.length - 1; i >= 0; i--) {
    const threshold = XP_CONFIG.levelsXp[i];
    if (threshold !== undefined && xp >= threshold) return i;
  }
  return 0;
}

/**
 * Computes normalized percentage progress toward the next level threshold.
 *
 * @param xp Total accumulated XP.
 * @returns Percentage in the inclusive range `[0, 100]`.
 */
export function getLevelProgress(xp: number): number {
  const lvl = getLevel(xp);
  const cur = XP_CONFIG.levelsXp[lvl] || 0;

  if (lvl >= XP_CONFIG.levelsXp.length - 1) return 100;

  const next = XP_CONFIG.levelsXp[lvl + 1] ?? cur;
  const progress = ((xp - cur) / (next - cur)) * 100;
  return Math.max(0, Math.min(progress, 100));
}
