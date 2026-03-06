import type { GameSceneState } from "../../shared/contracts/game.ts";

/**
 * Utility type to recursively strip `readonly` modifiers from types.
 * Used exclusively within the game loop domain services to allow
 * in-place mutation of the game state before persistence.
 */
export type Mutable<T> = T extends readonly (infer U)[]
  ? Mutable<U>[]
  : T extends object
    ? { -readonly [P in keyof T]: Mutable<T[P]> }
    : T;

export type MutableGameSceneState = Mutable<GameSceneState>;
