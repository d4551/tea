import { appConfig } from "../../config/environment.ts";
import type {
  AnimationClip,
  BuilderAsset,
  BuilderAssetKind,
  SceneDefinition,
  SceneMode,
  SceneNode2D,
  SceneNode3D,
} from "../../shared/contracts/game.ts";
import type { BuilderProjectState } from "./builder-project-state-store.ts";

/**
 * Stable publish-validation issue identifiers for builder release gating.
 */
export type BuilderPublishValidationIssueCode =
  | "no-scenes"
  | "scene-spawn-out-of-bounds"
  | "scene-npc-out-of-bounds"
  | "scene-node-asset-missing"
  | "scene-node-asset-unapproved"
  | "scene-node-asset-scene-mode-mismatch"
  | "scene-node-asset-kind-mismatch"
  | "scene-node-asset-format-unsupported"
  | "scene-node-clip-missing"
  | "scene-node-clip-scene-mode-mismatch"
  | "scene-node-clip-asset-mismatch"
  | "animation-clip-asset-missing"
  | "animation-clip-asset-scene-mode-mismatch"
  | "3d-scene-needs-webgpu";

/**
 * Structured publish-validation issue payload.
 */
export interface BuilderPublishValidationIssue {
  /** Stable issue code. */
  readonly code: BuilderPublishValidationIssueCode;
  /** Optional scene identifier. */
  readonly sceneId?: string;
  /** Optional scene node identifier. */
  readonly nodeId?: string;
  /** Optional NPC identifier. */
  readonly npcId?: string;
  /** Optional asset identifier. */
  readonly assetId?: string;
  /** Optional animation clip identifier. */
  readonly clipId?: string;
  /** Optional asset kind. */
  readonly assetKind?: BuilderAssetKind;
  /** Optional expected scene mode. */
  readonly expectedSceneMode?: SceneMode;
  /** Optional actual scene mode. */
  readonly actualSceneMode?: SceneMode;
  /** Optional source format. */
  readonly sourceFormat?: string;
}

const spriteNodeAssetKinds = new Set<BuilderAssetKind>(["sprite-sheet", "portrait", "background"]);
const tileNodeAssetKinds = new Set<BuilderAssetKind>(["tiles", "tile-set", "sprite-sheet"]);
const supported3dModelFormats = new Set(["glb", "gltf", "usd", "usda", "usdc"]);

const getSceneMode = (scene: SceneDefinition): SceneMode =>
  scene.sceneMode === "3d" ? "3d" : "2d";

const isPointWithinScene = (scene: SceneDefinition, x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x <= scene.geometry.width && y <= scene.geometry.height;

const validateNodeAssetKind = (
  sceneMode: SceneMode,
  node: SceneNode2D | SceneNode3D,
  asset: BuilderAsset,
): BuilderPublishValidationIssue | null => {
  if (sceneMode === "3d") {
    if (node.nodeType !== "model") {
      return null;
    }
    if (asset.kind !== "model") {
      return {
        code: "scene-node-asset-kind-mismatch",
        nodeId: node.id,
        assetId: asset.id,
        assetKind: asset.kind,
      };
    }
    if (!supported3dModelFormats.has(asset.sourceFormat)) {
      return {
        code: "scene-node-asset-format-unsupported",
        nodeId: node.id,
        assetId: asset.id,
        sourceFormat: asset.sourceFormat,
      };
    }
    return null;
  }

  if (node.nodeType === "sprite" && !spriteNodeAssetKinds.has(asset.kind)) {
    return {
      code: "scene-node-asset-kind-mismatch",
      nodeId: node.id,
      assetId: asset.id,
      assetKind: asset.kind,
    };
  }

  if (node.nodeType === "tile" && !tileNodeAssetKinds.has(asset.kind)) {
    return {
      code: "scene-node-asset-kind-mismatch",
      nodeId: node.id,
      assetId: asset.id,
      assetKind: asset.kind,
    };
  }

  return null;
};

const validateNodeReferences = (
  scene: SceneDefinition,
  state: BuilderProjectState,
): readonly BuilderPublishValidationIssue[] => {
  const sceneMode = getSceneMode(scene);
  const issues: BuilderPublishValidationIssue[] = [];

  for (const node of scene.nodes ?? []) {
    const asset = node.assetId ? state.assets[node.assetId] : undefined;
    if (node.assetId && !asset) {
      issues.push({
        code: "scene-node-asset-missing",
        sceneId: scene.id,
        nodeId: node.id,
        assetId: node.assetId,
      });
    } else if (asset) {
      if (!asset.approved) {
        issues.push({
          code: "scene-node-asset-unapproved",
          sceneId: scene.id,
          nodeId: node.id,
          assetId: asset.id,
        });
      }
      if (asset.sceneMode !== sceneMode) {
        issues.push({
          code: "scene-node-asset-scene-mode-mismatch",
          sceneId: scene.id,
          nodeId: node.id,
          assetId: asset.id,
          expectedSceneMode: sceneMode,
          actualSceneMode: asset.sceneMode,
        });
      }
      const kindIssue = validateNodeAssetKind(sceneMode, node, asset);
      if (kindIssue) {
        issues.push({
          ...kindIssue,
          sceneId: scene.id,
        });
      }
    }

    const clip = node.animationClipId ? state.animationClips[node.animationClipId] : undefined;
    if (node.animationClipId && !clip) {
      issues.push({
        code: "scene-node-clip-missing",
        sceneId: scene.id,
        nodeId: node.id,
        clipId: node.animationClipId,
      });
      continue;
    }

    if (!clip) {
      continue;
    }

    if (clip.sceneMode !== sceneMode) {
      issues.push({
        code: "scene-node-clip-scene-mode-mismatch",
        sceneId: scene.id,
        nodeId: node.id,
        clipId: clip.id,
        expectedSceneMode: sceneMode,
        actualSceneMode: clip.sceneMode,
      });
    }

    if (node.assetId && clip.assetId !== node.assetId) {
      issues.push({
        code: "scene-node-clip-asset-mismatch",
        sceneId: scene.id,
        nodeId: node.id,
        assetId: node.assetId,
        clipId: clip.id,
      });
    }
  }

  return issues;
};

const validateAnimationClip = (
  clip: AnimationClip,
  state: BuilderProjectState,
): readonly BuilderPublishValidationIssue[] => {
  const asset = state.assets[clip.assetId];
  if (!asset) {
    return [
      {
        code: "animation-clip-asset-missing",
        clipId: clip.id,
        assetId: clip.assetId,
      },
    ];
  }

  if (asset.sceneMode !== clip.sceneMode) {
    return [
      {
        code: "animation-clip-asset-scene-mode-mismatch",
        clipId: clip.id,
        assetId: clip.assetId,
        expectedSceneMode: asset.sceneMode,
        actualSceneMode: clip.sceneMode,
      },
    ];
  }

  return [];
};

/**
 * Result of publishing validation.
 */
export type BuilderPublishValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly issues: readonly BuilderPublishValidationIssue[] };

/**
 * Validates whether a builder project is internally consistent enough to publish.
 *
 * @param state Canonical builder project state.
 * @returns Result with any publish-blocking issues.
 */
export const validateBuilderProjectForPublish = (
  state: BuilderProjectState,
): BuilderPublishValidationResult => {
  const scenes = Object.values(state.scenes);
  if (scenes.length === 0) {
    return { ok: false, issues: [{ code: "no-scenes" }] };
  }

  const issues: BuilderPublishValidationIssue[] = [];

  for (const scene of scenes) {
    if (getSceneMode(scene) === "3d" && appConfig.playableGame.rendererPreference !== "webgpu") {
      issues.push({
        code: "3d-scene-needs-webgpu",
        sceneId: scene.id,
      });
    }

    if (!isPointWithinScene(scene, scene.spawn.x, scene.spawn.y)) {
      issues.push({
        code: "scene-spawn-out-of-bounds",
        sceneId: scene.id,
      });
    }

    for (const npc of scene.npcs) {
      if (!isPointWithinScene(scene, npc.x, npc.y)) {
        issues.push({
          code: "scene-npc-out-of-bounds",
          sceneId: scene.id,
          npcId: npc.characterKey,
        });
      }
    }

    issues.push(...validateNodeReferences(scene, state));
  }

  for (const clip of Object.values(state.animationClips)) {
    issues.push(...validateAnimationClip(clip, state));
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true };
};
