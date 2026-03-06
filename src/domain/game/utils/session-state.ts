import { resolveSpriteManifest } from "../../../shared/config/game-config.ts";
import type {
  Direction,
  GameFlagDefinition,
  GameDialogueEntry,
  GameLocale,
  GameQuestState,
  GameSceneState,
  NpcStateMachine,
  QuestDefinition,
  SceneDefinition,
} from "../../../shared/contracts/game.ts";
import { resolveGameText } from "../data/game-text.ts";
import { gameSpriteManifests } from "../data/sprite-data.ts";

const COLLISION_SIZE_RATIO = 0.4;

const createLocalBounds = (
  frameWidth: number,
  frameHeight: number,
): {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
} => {
  const width = Math.max(16, Math.floor(frameWidth * COLLISION_SIZE_RATIO));
  const height = Math.max(24, Math.floor(frameHeight * COLLISION_SIZE_RATIO));

  return {
    x: Math.max(0, Math.floor((frameWidth - width) / 2)),
    y: Math.max(0, frameHeight - height),
    width,
    height,
  };
};

const resolveDialogueEntryText = (
  locale: GameLocale,
  key: string,
  dialogues: Readonly<Record<string, string>>,
): string => dialogues[key] ?? resolveGameText(locale, key);

const buildDialogueEntries = (
  locale: GameLocale,
  _sceneDefinition: SceneDefinition,
  npcDefinition: SceneDefinition["npcs"][number],
  dialogues: Readonly<Record<string, string>>,
): readonly GameDialogueEntry[] => {
  const keys = [
    ...(npcDefinition.ai.greetOnApproach ? [npcDefinition.ai.greetLineKey] : []),
    ...npcDefinition.dialogueKeys,
  ].filter((key, index, values) => values.indexOf(key) === index);

  return keys.map((key) => ({
    key,
    text: resolveDialogueEntryText(locale, key, dialogues),
  }));
};

/**
 * Build the initial scene state from canonical scene definitions.
 */
export const buildSessionSceneState = (
  sceneDefinition: SceneDefinition,
  locale: GameLocale,
  seed: number,
  dialogues: Readonly<Record<string, string>> = {},
  flags: readonly GameFlagDefinition[] = [],
  quests: readonly QuestDefinition[] = [],
): GameSceneState => {
  const playerManifest = resolveSpriteManifest("chaJiang");
  const playerBounds = playerManifest
    ? createLocalBounds(playerManifest.frameWidth, playerManifest.frameHeight)
    : { x: 8, y: 48, width: 40, height: 80 };

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
      ? createLocalBounds(npcManifest.frameWidth, npcManifest.frameHeight)
      : { x: 8, y: 48, width: 40, height: 80 };
    const dialogueEntries = buildDialogueEntries(locale, sceneDefinition, npcDefinition, dialogues);

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
      dialogueLineKeys: dialogueEntries.map((entry) => entry.key),
      dialogueEntries,
      interactRadius: npcDefinition.interactRadius,
      homePosition: { x: npcDefinition.x, y: npcDefinition.y },
      aiProfile: {
        ...npcDefinition.ai,
      },
      active: false,
      state: "idle" as NpcStateMachine,
    };
  });

  return {
    sceneId: sceneDefinition.id,
    sceneMode: sceneDefinition.sceneMode,
    sceneTitle: resolveGameText(locale, sceneDefinition.titleKey),
    background: sceneDefinition.background,
    geometry: sceneDefinition.geometry,
    player: playerState,
    npcs,
    collisions: sceneDefinition.collisions,
    nodes: sceneDefinition.nodes ?? [],
    camera: { x: 0, y: 0 },
    uiState: "playing",
    actionState: "actionQueued",
    dialogue: null,
    quests: quests.map(
      (quest): GameQuestState => ({
        id: quest.id,
        title: quest.title,
        description: quest.description,
        completed: false,
        steps: quest.steps.map((step, index) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          state: index === 0 ? "active" : "pending",
        })),
      }),
    ),
    flags: Object.fromEntries(flags.map((flag) => [flag.key, flag.initialValue])),
    worldTimeMs: 0,
  };
};
