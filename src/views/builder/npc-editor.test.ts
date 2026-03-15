import { describe, expect, test } from "bun:test";
import type { SceneDefinition, SceneNpcDefinition } from "../../shared/contracts/game.ts";
import { getMessages } from "../../shared/i18n/translator.ts";
import { renderNpcEditor } from "./npc-editor.ts";

const npc: SceneNpcDefinition = {
  characterKey: "npc.forest-guide",
  displayName: "Forest Guide",
  x: 4,
  y: 6,
  labelKey: "npc.forestGuide.name",
  dialogueKeys: ["npc.forestGuide.greet"],
  interactRadius: 24,
  ai: {
    wanderRadius: 3,
    wanderSpeed: 1,
    idlePauseMs: [500, 1200],
    greetOnApproach: true,
    greetLineKey: "npc.forestGuide.greet",
  },
};

const scene: SceneDefinition = {
  id: "scene.forest",
  sceneMode: "2d",
  displayTitle: "Forest Path",
  titleKey: "scene.forest.title",
  background: "/backgrounds/forest.png",
  geometry: { width: 640, height: 360 },
  spawn: { x: 32, y: 32 },
  npcs: [npc],
  nodes: [],
  collisions: [],
};

describe("renderNpcEditor", () => {
  test("does not render an empty advanced-tools disclosure in the create form", () => {
    const messages = getMessages("en-US");
    const html = renderNpcEditor(messages, { [scene.id]: scene }, {}, "en-US", "default");

    expect(html).not.toContain(messages.builder.advancedTools);
  });

  test("renders a specific missing-manifest preview state", () => {
    const messages = getMessages("en-US");
    const html = renderNpcEditor(messages, { [scene.id]: scene }, {}, "en-US", "default");

    expect(html).toContain(messages.builder.npcPreviewUnavailable);
  });
});
