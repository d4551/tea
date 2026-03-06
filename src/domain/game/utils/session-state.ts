import { resolveSpriteManifest } from "../../../shared/config/game-config.ts";
import type {
  Direction,
  GameLocale,
  GameSceneState,
  NpcStateMachine,
  SceneDefinition,
} from "../../../shared/contracts/game.ts";
import { resolveGameText } from "../data/game-text.ts";
import { gameSpriteManifests } from "../data/sprite-data.ts";

/**
 * Build the initial scene state from canonical scene definitions.
 */
export const buildSessionSceneState = (
  sceneDefinition: SceneDefinition,
  locale: GameLocale,
  seed: number,
): GameSceneState => {
  const playerManifest = resolveSpriteManifest("chaJiang");
  const playerBounds = playerManifest
    ? {
        x: sceneDefinition.spawn.x,
        y: sceneDefinition.spawn.y,
        width: Math.floor(playerManifest.frameWidth * 0.4),
        height: Math.floor(playerManifest.frameHeight * 0.4),
      }
    : { x: sceneDefinition.spawn.x, y: sceneDefinition.spawn.y, width: 40, height: 80 };

  const playerState = {
    id: "player",
    label: "Player",
    characterKey: "chaJiang",
    position: {
      x: sceneDefinition.spawn.x,
      y: sceneDefinition.spawn.y,
    },
    facing: "down" as Direction,
    animation: "idle-down",
    frame: 0,
    velocity: { x: 0, y: 0 },
    bounds: playerBounds,
  };

  const npcs = sceneDefinition.npcs.map((npcDefinition, index) => {
    const manifest = resolveSpriteManifest(npcDefinition.characterKey);
    const npcManifest = manifest ?? gameSpriteManifests[npcDefinition.characterKey];

    const bounds = npcManifest
      ? {
          x: npcDefinition.x,
          y: npcDefinition.y,
          width: Math.floor(npcManifest.frameWidth * 0.4),
          height: Math.floor(npcManifest.frameHeight * 0.4),
        }
      : { x: npcDefinition.x, y: npcDefinition.y, width: 40, height: 80 };

    return {
      id: `npc-${npcDefinition.characterKey}-${index}`,
      label: resolveGameText(locale, npcDefinition.labelKey),
      characterKey: npcDefinition.characterKey,
      position: { x: npcDefinition.x, y: npcDefinition.y },
      facing: ((seed + index) % 2 === 0 ? "left" : "right") as Direction,
      animation: "idle-down",
      frame: 0,
      velocity: { x: 0, y: 0 },
      bounds,
      aiEnabled: true,
      dialogueIndex: 0,
      dialogueLineKeys: [...npcDefinition.dialogueKeys],
      active: false,
      state: "idle" as NpcStateMachine,
    };
  });

  return {
    sceneId: sceneDefinition.id,
    player: playerState,
    npcs,
    collisions: sceneDefinition.collisions,
    camera: { x: 0, y: 0 },
    uiState: "playing",
    actionState: "actionQueued",
    dialogue: null,
    worldTimeMs: 0,
  };
};
