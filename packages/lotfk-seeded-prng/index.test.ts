import { describe, test, expect } from "bun:test";
import { SeededPrng, createPrng } from "./index.ts";

describe("SeededPrng", () => {
  test("same seed + time + offset always produces same value", () => {
    const prng = new SeededPrng(42);
    const a = prng.next(1000, 0);
    const b = prng.next(1000, 0);
    expect(a).toBe(b);
  });

  test("different seeds produce different values", () => {
    const a = new SeededPrng(42).next(1000, 0);
    const b = new SeededPrng(99).next(1000, 0);
    expect(a).not.toBe(b);
  });

  test("output is in [0, 1)", () => {
    const prng = new SeededPrng(7);
    for (let t = 0; t < 10_000; t += 100) {
      const v = prng.next(t, t % 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test("int is in [min, max)", () => {
    const prng = new SeededPrng(13);
    for (let t = 0; t < 5_000; t += 50) {
      const v = prng.int(t, -4, 5);
      expect(v).toBeGreaterThanOrEqual(-4);
      expect(v).toBeLessThan(5);
    }
  });

  test("pick returns a valid array element", () => {
    const prng = createPrng(21);
    const arr: readonly string[] = ["north", "south", "east", "west"];
    for (let t = 0; t < 2_000; t += 100) {
      const v = prng.pick(t, arr);
      expect(arr).toContain(v);
    }
  });

  test("deterministic replay: seed=42, same command sequence → same outputs", () => {
    const sequence = (seed: number) => {
      const prng = new SeededPrng(seed);
      return Array.from({ length: 8 }, (_, i) => prng.next(i * 16, i));
    };
    expect(sequence(42)).toEqual(sequence(42));
    expect(sequence(42)).not.toEqual(sequence(43));
  });
});
