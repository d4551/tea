import { gameAssetUrls } from "../../../shared/constants/game-assets.ts";
import type {
  CollisionMask,
  NpcAiBlueprint,
  SceneDefinition,
  SpriteManifest,
} from "../../../shared/contracts/game.ts";

/**
 * Canonical sprite manifests sourced from the baseline art set.
 */
export const gameSpriteManifests: Record<string, SpriteManifest> = {
  chaJiang: {
    sheet: gameAssetUrls.chaJiangSprite,
    frameWidth: 160,
    frameHeight: 160,
    cols: 4,
    rows: 4,
    scale: 0.6,
    speed: 2.5,
    animations: {
      "idle-down": { row: 0, frames: 1, startCol: 0, speed: 20 },
      "walk-down": { row: 0, frames: 4, startCol: 0, speed: 8 },
      "idle-left": { row: 1, frames: 1, startCol: 0, speed: 20 },
      "walk-left": { row: 1, frames: 4, startCol: 0, speed: 8 },
      "idle-right": { row: 2, frames: 1, startCol: 0, speed: 20 },
      "walk-right": { row: 2, frames: 4, startCol: 0, speed: 8 },
      "idle-up": { row: 3, frames: 1, startCol: 0, speed: 20 },
      "walk-up": { row: 3, frames: 4, startCol: 0, speed: 8 },
    },
  },
  teaMonk: {
    sheet: gameAssetUrls.npcSpriteSheet,
    frameWidth: 72,
    frameHeight: 160,
    cols: 9,
    rows: 4,
    scale: 0.6,
    speed: 1,
    npcColOffset: 0,
    animations: {
      "idle-down": { row: 0, frames: 1, startCol: 0, speed: 24 },
      "walk-down": { row: 0, frames: 3, startCol: 0, speed: 10 },
      "idle-left": { row: 1, frames: 1, startCol: 0, speed: 24 },
      "walk-left": { row: 1, frames: 3, startCol: 0, speed: 10 },
      "idle-right": { row: 2, frames: 1, startCol: 0, speed: 24 },
      "walk-right": { row: 2, frames: 3, startCol: 0, speed: 10 },
      "idle-up": { row: 3, frames: 1, startCol: 0, speed: 24 },
      "walk-up": { row: 3, frames: 3, startCol: 0, speed: 10 },
    },
  },
  riverPilot: {
    sheet: gameAssetUrls.npcSpriteSheet,
    frameWidth: 72,
    frameHeight: 160,
    cols: 9,
    rows: 4,
    scale: 0.6,
    speed: 1,
    npcColOffset: 3,
    animations: {
      "idle-down": { row: 0, frames: 1, startCol: 3, speed: 24 },
      "walk-down": { row: 0, frames: 3, startCol: 3, speed: 10 },
      "idle-left": { row: 1, frames: 1, startCol: 3, speed: 24 },
      "walk-left": { row: 1, frames: 3, startCol: 3, speed: 10 },
      "idle-right": { row: 2, frames: 1, startCol: 3, speed: 24 },
      "walk-right": { row: 2, frames: 3, startCol: 3, speed: 10 },
      "idle-up": { row: 3, frames: 1, startCol: 3, speed: 24 },
      "walk-up": { row: 3, frames: 3, startCol: 3, speed: 10 },
    },
  },
  merchant: {
    sheet: gameAssetUrls.npcSpriteSheet,
    frameWidth: 72,
    frameHeight: 160,
    cols: 9,
    rows: 4,
    scale: 0.6,
    speed: 1,
    npcColOffset: 6,
    animations: {
      "idle-down": { row: 0, frames: 1, startCol: 6, speed: 24 },
      "walk-down": { row: 0, frames: 3, startCol: 6, speed: 10 },
      "idle-left": { row: 1, frames: 1, startCol: 6, speed: 24 },
      "walk-left": { row: 1, frames: 3, startCol: 6, speed: 10 },
      "idle-right": { row: 2, frames: 1, startCol: 6, speed: 24 },
      "walk-right": { row: 2, frames: 3, startCol: 6, speed: 10 },
      "idle-up": { row: 3, frames: 1, startCol: 6, speed: 24 },
      "walk-up": { row: 3, frames: 3, startCol: 6, speed: 10 },
    },
  },
};

const teaHouseCollisions: readonly CollisionMask[] = [
  { x: 0, y: 0, width: 640, height: 120 },
  { x: 0, y: 0, width: 40, height: 640 },
  { x: 580, y: 0, width: 60, height: 640 },
  { x: 0, y: 520, width: 640, height: 120 },
  { x: 200, y: 160, width: 180, height: 80 },
  { x: 60, y: 300, width: 120, height: 60 },
];

const teaHouseNpcAiTemplate: Readonly<NpcAiBlueprint> = {
  wanderRadius: 35,
  wanderSpeed: 0.32,
  idlePauseMs: [2000, 5000],
  greetOnApproach: true,
  greetLineKey: "npc.greet.tea-house",
};

/**
 * Canonical scene baseline data sourced from the world configuration.
 */
export const gameScenes: Record<string, SceneDefinition> = {
  teaHouse: {
    id: "teaHouse",
    sceneMode: "2d",
    displayTitle: "Yangtze Tea House",
    titleKey: "scene.teaHouse.title",
    background: gameAssetUrls.teaHouseBackground,
    geometry: {
      width: 640,
      height: 640,
    },
    spawn: {
      x: 300,
      y: 380,
    },
    nodes: [
      {
        id: "node.teaHouse.background",
        nodeType: "sprite",
        assetId: "asset.background.teaHouse",
        position: { x: 0, y: 0 },
        size: { width: 640, height: 640 },
        layer: "background",
      },
      {
        id: "node.teaHouse.spawn",
        nodeType: "spawn",
        position: { x: 300, y: 380 },
        size: { width: 24, height: 24 },
        layer: "gameplay",
      },
    ],
    npcs: [
      {
        characterKey: "teaMonk",
        displayName: "Tea Monk",
        x: 180,
        y: 200,
        labelKey: "npc.teaMonk.label",
        dialogueKeys: ["npc.teaMonk.lines.wood-cycle", "npc.teaMonk.lines.overcome"],
        interactRadius: 60,
        ai: {
          ...teaHouseNpcAiTemplate,
          greetLineKey: "npc.teaMonk.greet",
          wanderRadius: 25,
          wanderSpeed: 0.2,
        },
      },
      {
        characterKey: "merchant",
        displayName: "Silk Merchant",
        x: 450,
        y: 260,
        labelKey: "npc.merchant.label",
        dialogueKeys: [
          "npc.merchant.lines.quality",
          "npc.merchant.lines.routes",
          "npc.merchant.lines.shipment",
        ],
        interactRadius: 60,
        ai: {
          ...teaHouseNpcAiTemplate,
          greetLineKey: "npc.merchant.greet",
          wanderRadius: 35,
          wanderSpeed: 0.35,
          idlePauseMs: [2000, 4000],
        },
      },
      {
        characterKey: "riverPilot",
        displayName: "River Pilot",
        x: 340,
        y: 180,
        labelKey: "npc.riverPilot.label",
        dialogueKeys: ["npc.riverPilot.lines.oracle-intro", "npc.riverPilot.lines.oracle-quote"],
        interactRadius: 70,
        ai: {
          ...teaHouseNpcAiTemplate,
          greetLineKey: "npc.riverPilot.greet",
          wanderRadius: 15,
          wanderSpeed: 0.15,
          idlePauseMs: [4000, 8000],
        },
      },
    ],
    collisions: teaHouseCollisions,
  },
  crystalCavern: {
    id: "crystalCavern",
    sceneMode: "3d",
    displayTitle: "Crystal Cavern",
    titleKey: "scene.crystalCavern.title",
    background: gameAssetUrls.teaHouseBackground,
    geometry: {
      width: 1000,
      height: 1000,
    },
    spawn: {
      x: 0,
      y: 0,
    },
    nodes: [
      {
        id: "node.crystalCavern.model",
        nodeType: "model",
        assetId: "asset.model.cavernModel",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "node.crystalCavern.light",
        nodeType: "light",
        position: { x: 5, y: 10, z: 5 },
        rotation: { x: -0.5, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "node.crystalCavern.spawn",
        nodeType: "spawn",
        position: { x: 0, y: 0, z: 2 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    ],
    npcs: [],
    collisions: [],
  },
};

/**
 * 2D-only starter: Pixel Garden — sprite-based garden scene.
 */
const pixelGardenNpcAi: Readonly<NpcAiBlueprint> = {
  wanderRadius: 40,
  wanderSpeed: 0.3,
  idlePauseMs: [1500, 4000],
  greetOnApproach: true,
  greetLineKey: "npc.greet.garden",
};

export const gameScenes2d: Record<string, SceneDefinition> = {
  pixelGarden: {
    id: "pixelGarden",
    sceneMode: "2d",
    displayTitle: "Pixel Garden",
    titleKey: "scene.pixelGarden.title",
    background: gameAssetUrls.teaHouseBackground,
    geometry: {
      width: 640,
      height: 640,
    },
    spawn: {
      x: 320,
      y: 400,
    },
    nodes: [
      {
        id: "node.pixelGarden.background",
        nodeType: "sprite",
        assetId: "asset.background.pixelGarden",
        position: { x: 0, y: 0 },
        size: { width: 640, height: 640 },
        layer: "background",
      },
      {
        id: "node.pixelGarden.spawn",
        nodeType: "spawn",
        position: { x: 320, y: 400 },
        size: { width: 24, height: 24 },
        layer: "gameplay",
      },
    ],
    npcs: [
      {
        characterKey: "chaJiang",
        displayName: "Garden Keeper",
        x: 200,
        y: 220,
        labelKey: "npc.gardenKeeper.label",
        dialogueKeys: ["npc.gardenKeeper.lines.seeds", "npc.gardenKeeper.lines.harvest"],
        interactRadius: 55,
        ai: {
          ...pixelGardenNpcAi,
          greetLineKey: "npc.gardenKeeper.greet",
          wanderRadius: 30,
          wanderSpeed: 0.25,
        },
      },
      {
        characterKey: "teaMonk",
        displayName: "Wandering Sage",
        x: 420,
        y: 280,
        labelKey: "npc.wanderingSage.label",
        dialogueKeys: ["npc.wanderingSage.lines.meditation", "npc.wanderingSage.lines.peace"],
        interactRadius: 60,
        ai: {
          ...pixelGardenNpcAi,
          greetLineKey: "npc.wanderingSage.greet",
          wanderRadius: 35,
          wanderSpeed: 0.2,
        },
      },
    ],
    collisions: [
      { x: 0, y: 0, width: 640, height: 100 },
      { x: 0, y: 0, width: 50, height: 640 },
      { x: 560, y: 0, width: 80, height: 640 },
      { x: 0, y: 540, width: 640, height: 100 },
      { x: 180, y: 180, width: 140, height: 70 },
    ],
  },
};

/**
 * 3D-only starter: Orbital Station — model, light, spawn.
 */
export const gameScenes3d: Record<string, SceneDefinition> = {
  orbitalStation: {
    id: "orbitalStation",
    sceneMode: "3d",
    displayTitle: "Orbital Station",
    titleKey: "scene.orbitalStation.title",
    background: gameAssetUrls.teaHouseBackground,
    geometry: {
      width: 1000,
      height: 1000,
    },
    spawn: {
      x: 0,
      y: 0,
    },
    nodes: [
      {
        id: "node.orbitalStation.model",
        nodeType: "model",
        assetId: "asset.model.orbitalModel",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "node.orbitalStation.light",
        nodeType: "light",
        position: { x: 8, y: 12, z: 8 },
        rotation: { x: -0.6, y: 0.3, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "node.orbitalStation.spawn",
        nodeType: "spawn",
        position: { x: 0, y: 0, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    ],
    npcs: [],
    collisions: [],
  },
};

/**
 * Localized text keys used by the owned engine.
 */
export const gameTextKeys: {
  scenes: Record<string, string>;
  npcs: Record<string, string>;
} = {
  scenes: {
    "scene.teaHouse.title": "scene.teaHouse.title",
    "scene.crystalCavern.title": "scene.crystalCavern.title",
    "scene.pixelGarden.title": "scene.pixelGarden.title",
    "scene.orbitalStation.title": "scene.orbitalStation.title",
  },
  npcs: {
    "npc.teaMonk.label": "npc.teaMonk.label",
    "npc.teaMonk.lines.wood-cycle": "npc.teaMonk.lines.wood-cycle",
    "npc.teaMonk.lines.overcome": "npc.teaMonk.lines.overcome",
    "npc.teaMonk.greet": "npc.teaMonk.greet",
    "npc.merchant.label": "npc.merchant.label",
    "npc.merchant.lines.quality": "npc.merchant.lines.quality",
    "npc.merchant.lines.routes": "npc.merchant.lines.routes",
    "npc.merchant.lines.shipment": "npc.merchant.lines.shipment",
    "npc.merchant.greet": "npc.merchant.greet",
    "npc.riverPilot.label": "npc.riverPilot.label",
    "npc.riverPilot.lines.oracle-intro": "npc.riverPilot.lines.oracle-intro",
    "npc.riverPilot.lines.oracle-quote": "npc.riverPilot.lines.oracle-quote",
    "npc.riverPilot.greet": "npc.riverPilot.greet",
    "npc.gardenKeeper.label": "npc.gardenKeeper.label",
    "npc.gardenKeeper.greet": "npc.gardenKeeper.greet",
    "npc.gardenKeeper.lines.seeds": "npc.gardenKeeper.lines.seeds",
    "npc.gardenKeeper.lines.harvest": "npc.gardenKeeper.lines.harvest",
    "npc.wanderingSage.label": "npc.wanderingSage.label",
    "npc.wanderingSage.greet": "npc.wanderingSage.greet",
    "npc.wanderingSage.lines.meditation": "npc.wanderingSage.lines.meditation",
    "npc.wanderingSage.lines.peace": "npc.wanderingSage.lines.peace",
  },
};
