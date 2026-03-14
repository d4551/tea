/**
 * Deterministic sine-based PRNG for server-authoritative game simulation.
 *
 * Produces consistent pseudo-random values for the same seed and time,
 * enabling deterministic NPC AI and replay verification without Math.random().
 *
 * Algorithm: sin(seed + t + offset) * 10000, fractional part only.
 * Produces values in [0, 1).
 */
export class SeededPrng {
  constructor(private readonly seed: number) {}

  /**
   * Returns a value in [0, 1) for the given world time and per-entity offset.
   * Identical inputs always produce identical output (deterministic).
   */
  next(worldTimeMs: number, offset = 0): number {
    const x = Math.sin(this.seed + worldTimeMs + offset) * 10_000;
    return x - Math.floor(x);
  }

  /**
   * Returns an integer in [min, max) for the given world time and offset.
   */
  int(worldTimeMs: number, min: number, max: number, offset = 0): number {
    return Math.floor(this.next(worldTimeMs, offset) * (max - min)) + min;
  }

  /**
   * Picks a random element from an array in a deterministic way.
   */
  pick<T>(worldTimeMs: number, arr: readonly T[], offset = 0): T {
    if (arr.length === 0) {
      throw new RangeError("Cannot pick from an empty collection.");
    }

    const index = this.int(worldTimeMs, 0, arr.length, offset);
    const value = arr[index];
    if (value === undefined) {
      throw new RangeError(`Deterministic selection out of bounds: index ${index} for length ${arr.length}.`);
    }

    return value;
  }
}

/**
 * Convenience factory.
 */
export const createPrng = (seed: number): SeededPrng => new SeededPrng(seed);
