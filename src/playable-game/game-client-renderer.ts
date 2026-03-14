import {
  AnimatedSprite,
  Assets,
  autoDetectRenderer,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  type Spritesheet,
  Texture,
} from "pixi.js";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { PIXI_CANVAS_MISSING_ERROR } from "../shared/constants/errors.ts";
import type {
  EntityState,
  GameParticipantPresence,
  GameSceneState,
  NpcState,
  SpriteAnimationConfig,
  SpriteManifest,
} from "../shared/contracts/game.ts";
import type { GameClientRendererPreference } from "../shared/contracts/game-client-bootstrap.ts";
import { settleAsync } from "../shared/utils/async-result.ts";
import { AnimationTimeline } from "./animation-timeline.ts";
import { createSpritesheetFromManifest } from "./spritesheet-from-manifest.ts";
import { ThreeLayer } from "./three-layer.ts";

type RuntimeRendererPreference = GameClientRendererPreference | "canvas";

type LoadedSceneAssets = {
  readonly backgroundTexture: Texture;
};

const MAX_TEXTURE_CACHE_SIZE = 256;

const evictLruEntry = (cache: Map<string, Texture>): void => {
  const firstKey = cache.keys().next().value;
  if (firstKey !== undefined) {
    cache.get(firstKey)?.destroy();
    cache.delete(firstKey);
  }
};

const resolveSpriteManifest = (characterKey: string): SpriteManifest | null =>
  gameSpriteManifests[characterKey] ?? null;

const getAnimationTextures = (
  sheet: Spritesheet,
  animationKey: string,
): readonly import("pixi.js").Texture[] | null => {
  const anim = sheet.animations[animationKey];
  return anim && anim.length > 0 ? anim : null;
};

const getSceneEntities = (
  state: GameSceneState,
): readonly (EntityState | NpcState | GameParticipantPresence["entity"])[] => [
  state.player,
  ...(state.coPlayers?.map((presence) => presence.entity) ?? []),
  ...state.npcs,
];

const findPreviousEntity = (
  state: GameSceneState | null,
  entityId: string,
): EntityState | NpcState | GameParticipantPresence["entity"] | null => {
  if (!state) {
    return null;
  }

  return getSceneEntities(state).find((entity) => entity.id === entityId) ?? null;
};

const resolveLocalActor = (
  state: GameSceneState,
  participantSessionId: string,
): EntityState | GameParticipantPresence["entity"] =>
  participantSessionId.length > 0
    ? (state.coPlayers?.find((presence) => presence.sessionId === participantSessionId)?.entity ??
      state.player)
    : state.player;

const resolveLocalCamera = (
  state: GameSceneState,
  participantSessionId: string,
): Readonly<{ readonly x: number; readonly y: number }> => {
  const localActor = resolveLocalActor(state, participantSessionId);
  if (localActor.id === state.player.id) {
    return state.camera;
  }

  return {
    x: state.camera.x + (localActor.position.x - state.player.position.x),
    y: state.camera.y + (localActor.position.y - state.player.position.y),
  };
};

const resolveAnimationKey = (
  manifest: SpriteManifest,
  animationKey: string,
  facing: EntityState["facing"],
): string => {
  if (manifest.animations[animationKey]) return animationKey;
  const idleKey = `idle-${facing}`;
  if (manifest.animations[idleKey]) return idleKey;
  const firstKey = Object.keys(manifest.animations)[0];
  return firstKey ?? animationKey;
};

const resolveAnimation = (
  manifest: SpriteManifest,
  animationKey: string,
  facing: EntityState["facing"],
): SpriteAnimationConfig => {
  const key = resolveAnimationKey(manifest, animationKey, facing);
  const animation = manifest.animations[key];
  if (animation) {
    return animation;
  }
  throw new Error(`Sprite manifest is missing animations for ${animationKey}`);
};

const supportsWebGl = (): boolean => {
  const probeCanvas = document.createElement("canvas");
  return Boolean(probeCanvas.getContext("webgl2") || probeCanvas.getContext("webgl"));
};

const supportsWebGpu = (): Promise<boolean> => {
  const gpuApi = globalThis.navigator?.gpu;
  if (!gpuApi || typeof gpuApi.requestAdapter !== "function") {
    return Promise.resolve(false);
  }

  return Promise.resolve(gpuApi.requestAdapter()).then(
    (adapter) => adapter !== null,
    () => false,
  );
};

const resolveRendererPreferenceOrder = async (
  rendererPreference: GameClientRendererPreference,
): Promise<readonly RuntimeRendererPreference[]> => {
  const webGlAvailable = supportsWebGl();
  const webGpuAvailable = await supportsWebGpu();

  if (rendererPreference === "webgpu") {
    return webGpuAvailable
      ? ["webgpu", "webgl", "canvas"]
      : webGlAvailable
        ? ["webgl", "canvas"]
        : ["canvas"];
  }

  return webGlAvailable
    ? ["webgl", "webgpu", "canvas"]
    : webGpuAvailable
      ? ["webgpu", "canvas"]
      : ["canvas"];
};

const createRendererRuntime = async ({
  wrapper,
  rendererPreference,
}: {
  readonly wrapper: HTMLElement;
  readonly rendererPreference: RuntimeRendererPreference;
}): Promise<GameClientRenderRuntime> => {
  const useThreeLayer = rendererPreference !== "canvas";
  const threeLayer = useThreeLayer
    ? new ThreeLayer(wrapper.clientWidth, wrapper.clientHeight, rendererPreference === "webgpu")
    : null;

  if (threeLayer) {
    await threeLayer.init();
    threeLayer.addTeaHouseEffects();
  }

  const pixiRenderer = await autoDetectRenderer({
    preference: rendererPreference,
    width: wrapper.clientWidth,
    height: wrapper.clientHeight,
    backgroundAlpha: rendererPreference === "webgpu" ? 0 : 1,
    clearBeforeRender: rendererPreference === "webgpu",
    antialias: false,
  });

  if (threeLayer) {
    const threeCanvas = threeLayer.renderer.domElement;
    threeCanvas.classList.add("absolute", "inset-0", "w-full", "h-full");
    wrapper.appendChild(threeCanvas);
  }

  const pixiCanvas = pixiRenderer.canvas;
  if (!(pixiCanvas instanceof HTMLCanvasElement)) {
    throw new Error(PIXI_CANVAS_MISSING_ERROR);
  }
  pixiCanvas.classList.add("absolute", "inset-0", "w-full", "h-full");
  wrapper.appendChild(pixiCanvas);

  const stage = new Container();
  stage.sortableChildren = true;

  const world = new Container();
  world.sortableChildren = true;
  stage.addChild(world);

  const sprites = new Map<string, AnimatedSprite>();
  const nodeSprites = new Map<string, AnimatedSprite>();
  const nodeOverlays = new Map<string, Graphics>();
  const loadedTextures = new Map<string, Texture>();
  const loadedSpritesheets = new Map<string, Spritesheet>();
  const loadedNodeSpritesheets = new Map<string, Spritesheet>();
  const tileLayerSprites = new Map<string, Map<string, Sprite>>();
  const tileLayerTextureCache = new Map<string, Map<number, Texture>>();
  const nodeParticleContainers = new Map<string, Container>();
  const nodeParticleSprites = new Map<string, Sprite[]>();
  let backgroundSprite: Sprite | null = null;
  const tileLayersContainer = new Container();
  tileLayersContainer.zIndex = -5000;
  world.addChildAt(tileLayersContainer, 0);

  const ensureTextureLoaded = async (assetUrl: string): Promise<Texture> => {
    const cached = loadedTextures.get(assetUrl);
    if (cached) {
      return cached;
    }

    const loadedTexture = await Assets.load(assetUrl).catch(() => Texture.EMPTY);
    const texture = loadedTexture instanceof Texture ? loadedTexture : Texture.EMPTY;
    loadedTextures.set(assetUrl, texture);
    if (loadedTextures.size > MAX_TEXTURE_CACHE_SIZE) {
      evictLruEntry(loadedTextures);
    }

    return texture;
  };

  const ensureSpritesheetLoaded = async (
    characterKey: string,
    manifest: SpriteManifest,
  ): Promise<Spritesheet | null> => {
    const cached = loadedSpritesheets.get(characterKey);
    if (cached) {
      return cached;
    }

    const sheetTexture = await ensureTextureLoaded(manifest.sheet);
    if (sheetTexture === Texture.EMPTY || !(sheetTexture.width > 0 && sheetTexture.height > 0)) {
      return null;
    }

    const sheet = await createSpritesheetFromManifest(sheetTexture, manifest);
    loadedSpritesheets.set(characterKey, sheet);
    return sheet;
  };

  const ensureNodeSpritesheetLoaded = async (
    assetId: string,
    source: string,
  ): Promise<Spritesheet | null> => {
    const cached = loadedNodeSpritesheets.get(assetId);
    if (cached) return cached;
    if (!source.endsWith(".json")) return null;
    const result = await settleAsync(Assets.load<Spritesheet>(source));
    if (result.ok && result.value && "animations" in result.value) {
      loadedNodeSpritesheets.set(assetId, result.value);
      return result.value;
    }
    return null;
  };

  /** Phase 3.5: Lazy-load assets when entering scene (not all upfront). */
  /** Phase 3.5: Lazy-load assets when entering scene (not all upfront). */
  const ensureSceneAssetsLoaded = async (state: GameSceneState): Promise<LoadedSceneAssets> => {
    const entities = getSceneEntities(state);

    await ensureTextureLoaded(state.background);

    for (const entity of entities) {
      const manifest = resolveSpriteManifest(entity.characterKey);
      if (manifest) {
        await ensureSpritesheetLoaded(entity.characterKey, manifest);
      }
    }

    for (const node of state.nodes ?? []) {
      if (node.nodeType === "sprite" && "assetId" in node && node.assetId) {
        const asset = state.assets?.find((a) => a.id === node.assetId);
        if (asset?.kind === "sprite-sheet" && asset.source) {
          await ensureNodeSpritesheetLoaded(node.assetId, asset.source);
        }
      }
      if ("particleEmitter" in node && node.particleEmitter?.assetId) {
        const asset = state.assets?.find((a) => a.id === node.particleEmitter?.assetId);
        if (asset?.source) {
          await ensureTextureLoaded(asset.source);
        }
      }
    }

    for (const layer of state.tilemap?.layers ?? []) {
      const asset = state.assets?.find((a) => a.id === layer.tileSetAssetId);
      if (asset?.source) {
        await ensureTextureLoaded(asset.source);
      }
    }

    const backgroundTexture = loadedTextures.get(state.background) ?? Texture.EMPTY;
    if (!backgroundSprite) {
      backgroundSprite = new Sprite(backgroundTexture);
      backgroundSprite.zIndex = -10_000;
      world.addChildAt(backgroundSprite, 0);
    } else {
      backgroundSprite.texture = backgroundTexture;
    }

    backgroundSprite.x = 0;
    backgroundSprite.y = 0;
    backgroundSprite.width = state.geometry.width;
    backgroundSprite.height = state.geometry.height;

    return { backgroundTexture };
  };

  return {
    async prepareState(state) {
      await ensureSceneAssetsLoaded(state);
    },
    renderFrame({ state, previousState, alpha, participantSessionId, deltaMs, debugMode }) {
      if (state) {
        if (threeLayer) {
          threeLayer.syncSceneState(state);
        }

        renderState(
          state,
          previousState,
          alpha,
          participantSessionId,
          sprites,
          nodeSprites,
          nodeOverlays,
          world,
          loadedSpritesheets,
          loadedNodeSpritesheets,
          loadedTextures,
          tileLayersContainer,
          tileLayerSprites,
          tileLayerTextureCache,
          nodeParticleContainers,
          nodeParticleSprites,
          debugMode ?? false,
        );
      }

      if (threeLayer) {
        threeLayer.tick(deltaMs);
      }

      pixiRenderer.render({ container: stage });
    },
    resize() {
      if (threeLayer) {
        threeLayer.resize(wrapper.clientWidth, wrapper.clientHeight);
      }
      pixiRenderer.resize(wrapper.clientWidth, wrapper.clientHeight);
    },
    dispose() {
      stage.destroy({ children: true });
      pixiRenderer.destroy();
      if (threeLayer) {
        threeLayer.dispose();
      }
      wrapper.replaceChildren();
    },
  };
};

const renderState = (
  current: GameSceneState,
  previous: GameSceneState | null,
  alpha: number,
  participantSessionId: string,
  sprites: Map<string, AnimatedSprite>,
  nodeSprites: Map<string, AnimatedSprite>,
  nodeOverlays: Map<string, Graphics>,
  world: Container,
  loadedSpritesheets: Map<string, Spritesheet>,
  loadedNodeSpritesheets: Map<string, Spritesheet>,
  loadedTextures: Map<string, Texture>,
  tileLayersContainer: Container,
  tileLayerSprites: Map<string, Map<string, Sprite>>,
  tileLayerTextureCache: Map<string, Map<number, Texture>>,
  nodeParticleContainers: Map<string, Container>,
  nodeParticleSprites: Map<string, Sprite[]>,
  debugMode: boolean,
): void => {
  const entities = getSceneEntities(current);
  const activeNodeIds = new Set<string>();
  const camera = resolveLocalCamera(current, participantSessionId);

  for (const entity of entities) {
    const manifest = resolveSpriteManifest(entity.characterKey);
    const sheet = manifest ? loadedSpritesheets.get(entity.characterKey) : null;
    const animKey = manifest ? resolveAnimationKey(manifest, entity.animation, entity.facing) : "";
    const animation = manifest ? resolveAnimation(manifest, entity.animation, entity.facing) : null;
    const textures = sheet && animKey ? getAnimationTextures(sheet, animKey) : null;

    const sprite =
      sprites.get(entity.id) ??
      (() => {
        const fallbackTextures = textures ?? [Texture.EMPTY];
        const created = new AnimatedSprite({
          textures: [...fallbackTextures],
          autoPlay: false,
          autoUpdate: false,
        });
        created.anchor.set(0, 0);
        world.addChild(created);
        sprites.set(entity.id, created);
        return created;
      })();

    if (textures && textures.length > 0) {
      const currentTextures = sprite.textures as Texture[];
      const texturesChanged =
        currentTextures.length !== textures.length ||
        textures.some((t: Texture, i: number) => currentTextures[i] !== t);
      if (texturesChanged) {
        sprite.textures = [...textures];
      }

      if (animation) {
        const timeline = new AnimationTimeline(animation);
        sprite.animationSpeed = timeline.animationSpeed;
        const frameIndex = timeline.getFrameIndex(current.worldTimeMs);
        sprite.gotoAndStop(Math.min(frameIndex, textures.length - 1));
      }
    }

    const previousEntity = findPreviousEntity(previous, entity.id);
    const previousX = previousEntity?.position.x ?? entity.position.x;
    const previousY = previousEntity?.position.y ?? entity.position.y;

    sprite.scale.set(manifest?.scale ?? 1);
    sprite.x = previousX + (entity.position.x - previousX) * alpha - camera.x;
    sprite.y = previousY + (entity.position.y - previousY) * alpha - camera.y;
    sprite.zIndex = sprite.y;
  }

  if (current.sceneMode !== "3d") {
    if (current.tilemap?.layers?.length) {
      const tileAssetUrl = (assetId: string) =>
        current.assets?.find((a) => a.id === assetId)?.source ?? "";
      for (const layer of current.tilemap.layers) {
        const texture = loadedTextures.get(tileAssetUrl(layer.tileSetAssetId)) ?? Texture.EMPTY;
        if (texture === Texture.EMPTY || !(texture.width > 0 && texture.height > 0)) continue;
        const tilesetCols = Math.max(1, Math.floor(texture.width / layer.tileWidth));
        let layerSprites = tileLayerSprites.get(layer.id);
        if (!layerSprites) {
          layerSprites = new Map();
          tileLayerSprites.set(layer.id, layerSprites);
        }
        const seen = new Set<string>();
        for (let row = 0; row < layer.data.length; row++) {
          const rowData = layer.data[row];
          if (!rowData) continue;
          for (let col = 0; col < rowData.length; col++) {
            const tileIndex = rowData[col];
            if (typeof tileIndex !== "number" || tileIndex < 0) continue;
            const key = `${row},${col}`;
            seen.add(key);
            const colInTileset = tileIndex % tilesetCols;
            const rowInTileset = Math.floor(tileIndex / tilesetCols);
            const frame = new Rectangle(
              colInTileset * layer.tileWidth,
              rowInTileset * layer.tileHeight,
              layer.tileWidth,
              layer.tileHeight,
            );
            let texCache = tileLayerTextureCache.get(layer.id);
            if (!texCache) {
              texCache = new Map();
              tileLayerTextureCache.set(layer.id, texCache);
            }
            let tileTexture = texCache.get(tileIndex);
            if (!tileTexture) {
              tileTexture = new Texture({ source: texture.source, frame });
              texCache.set(tileIndex, tileTexture);
            }
            let sprite = layerSprites.get(key);
            if (!sprite) {
              sprite = new Sprite(tileTexture);
              sprite.anchor.set(0, 0);
              tileLayersContainer.addChild(sprite);
              layerSprites.set(key, sprite);
            } else {
              sprite.texture = tileTexture;
            }
            sprite.x = col * layer.tileWidth - camera.x;
            sprite.y = row * layer.tileHeight - camera.y;
            sprite.width = layer.tileWidth;
            sprite.height = layer.tileHeight;
          }
        }
        for (const [key, sprite] of layerSprites) {
          if (!seen.has(key)) {
            tileLayersContainer.removeChild(sprite);
            sprite.destroy();
            layerSprites.delete(key);
          }
        }
      }
      for (const [layerId, layerSprites] of tileLayerSprites) {
        if (!current.tilemap.layers.some((l) => l.id === layerId)) {
          for (const sprite of layerSprites.values()) {
            tileLayersContainer.removeChild(sprite);
            sprite.destroy();
          }
          tileLayerSprites.delete(layerId);
        }
      }
    }

    for (const node of current.nodes ?? []) {
      if (!("size" in node)) {
        continue;
      }

      activeNodeIds.add(node.id);

      if (node.nodeType === "sprite" && node.assetId) {
        const sheet = loadedNodeSpritesheets.get(node.assetId);
        const animKeys = sheet ? Object.keys(sheet.animations) : [];
        const animKey = animKeys[0];
        const textures = sheet && animKey ? getAnimationTextures(sheet, animKey) : null;

        if (textures && textures.length > 0) {
          const nodeSprite =
            nodeSprites.get(node.id) ??
            (() => {
              const created = new AnimatedSprite({
                textures: [...textures],
                autoPlay: true,
                autoUpdate: true,
              });
              created.anchor.set(0, 0);
              world.addChild(created);
              nodeSprites.set(node.id, created);
              return created;
            })();

          const currentTextures = nodeSprite.textures as Texture[];
          const texturesChanged =
            currentTextures.length !== textures.length ||
            textures.some((t: Texture, i: number) => currentTextures[i] !== t);
          if (texturesChanged) {
            nodeSprite.textures = [...textures];
          }

          nodeSprite.x = node.position.x - camera.x;
          nodeSprite.y = node.position.y - camera.y;
          nodeSprite.width = node.size.width;
          nodeSprite.height = node.size.height;
          nodeSprite.zIndex = node.position.y + node.size.height - 1;
        }
      }

      if (node.nodeType !== "sprite") {
        const overlay =
          nodeOverlays.get(node.id) ??
          (() => {
            const created = new Graphics();
            world.addChild(created);
            nodeOverlays.set(node.id, created);
            return created;
          })();

        overlay.clear();
        overlay.rect(0, 0, node.size.width, node.size.height).fill({
          color: node.nodeType === "trigger" ? 0xf59e0b : 0x38bdf8,
          alpha: node.nodeType === "trigger" ? 0.22 : 0.16,
        });
        overlay.stroke({
          color: node.nodeType === "trigger" ? 0xf59e0b : 0x38bdf8,
          width: 2,
          alpha: 0.9,
        });
        overlay.x = node.position.x - camera.x;
        overlay.y = node.position.y - camera.y;
        overlay.zIndex = overlay.y + node.size.height;
      }

      if ("particleEmitter" in node && node.particleEmitter) {
        const cfg = node.particleEmitter;
        const count = Math.min(cfg.maxCount, 64);
        const particleAssetUrl = current.assets?.find((a) => a.id === cfg.assetId)?.source ?? "";
        const particleTexture =
          particleAssetUrl && loadedTextures.has(particleAssetUrl)
            ? (loadedTextures.get(particleAssetUrl) ?? Texture.EMPTY)
            : Texture.WHITE;
        let container = nodeParticleContainers.get(node.id);
        if (!container) {
          container = new Container();
          container.zIndex = node.position.y + (node.size?.height ?? 0) + 100;
          world.addChild(container);
          nodeParticleContainers.set(node.id, container);
        }
        let sprites = nodeParticleSprites.get(node.id);
        if (!sprites || sprites.length !== count) {
          sprites?.forEach((s) => {
            container?.removeChild(s);
            s.destroy();
          });
          sprites = [];
          for (let i = 0; i < count; i++) {
            const s = new Sprite(particleTexture);
            s.anchor.set(0.5, 0.5);
            const size = cfg.size[0] + (cfg.size[1] - cfg.size[0]) * Math.random();
            s.width = size;
            s.height = size;
            container.addChild(s);
            sprites.push(s);
          }
          nodeParticleSprites.set(node.id, sprites);
        }
        container.x = node.position.x - camera.x;
        container.y = node.position.y - camera.y;
        const t = (current.worldTimeMs / 1000) % 10;
        for (let i = 0; i < sprites.length; i++) {
          const s = sprites[i];
          if (!s) continue;
          const phase = (i / sprites.length) * Math.PI * 2 + t * 0.5;
          const dist = ((t * 50 + i * 10) % 80) - 40;
          s.x = Math.cos(phase) * dist;
          s.y = Math.sin(phase) * dist - t * 20;
          s.alpha = Math.max(0, 1 - ((t * 0.2 + i * 0.01) % 1));
        }
      }
    }
  }

  for (const [nodeId, container] of nodeParticleContainers.entries()) {
    if (!activeNodeIds.has(nodeId)) {
      world.removeChild(container);
      container.destroy({ children: true });
      nodeParticleContainers.delete(nodeId);
      nodeParticleSprites.delete(nodeId);
    }
  }

  for (const [nodeId, overlay] of nodeOverlays.entries()) {
    if (activeNodeIds.has(nodeId)) {
      continue;
    }

    world.removeChild(overlay);
    overlay.destroy();
    nodeOverlays.delete(nodeId);
  }

  for (const [nodeId, nodeSprite] of nodeSprites.entries()) {
    if (activeNodeIds.has(nodeId)) {
      continue;
    }

    world.removeChild(nodeSprite);
    nodeSprite.destroy();
    nodeSprites.delete(nodeId);
  }

  if (debugMode) {
    const debugKey = "debug-collision-viz";
    let debugGfx = world.getChildByName(debugKey) as Graphics | undefined;
    if (!debugGfx) {
      debugGfx = new Graphics();
      debugGfx.name = debugKey;
      debugGfx.zIndex = 100_000;
      world.addChild(debugGfx);
    }
    debugGfx.clear();
    for (const r of current.collisions ?? []) {
      debugGfx.rect(r.x - camera.x, r.y - camera.y, r.width, r.height).stroke({
        width: 2,
        color: 0xff6600,
        alpha: 0.7,
      });
    }
    for (const entity of getSceneEntities(current)) {
      const b = entity.bounds;
      const ex = entity.position.x + b.x - camera.x;
      const ey = entity.position.y + b.y - camera.y;
      debugGfx.rect(ex, ey, b.width, b.height).stroke({
        width: 2,
        color: 0x00ff00,
        alpha: 0.8,
      });
    }
  } else {
    const debugGfx = world.getChildByName("debug-collision-viz");
    if (debugGfx) {
      world.removeChild(debugGfx);
      (debugGfx as Graphics).destroy();
    }
  }
};

/**
 * Render frame payload consumed by the playable runtime renderer.
 */
export type GameClientRenderFrame = {
  readonly state: GameSceneState | null;
  readonly previousState: GameSceneState | null;
  readonly alpha: number;
  readonly participantSessionId: string;
  readonly deltaMs: number;
  /** When true, collision bounds and scene collisions are drawn for debug. */
  readonly debugMode?: boolean;
};

/**
 * Browser render runtime for the playable game surface.
 */
export type GameClientRenderRuntime = {
  readonly prepareState: (state: GameSceneState) => Promise<void>;
  readonly renderFrame: (frame: GameClientRenderFrame) => void;
  readonly resize: () => void;
  readonly dispose: () => void;
};

/**
 * Options used to create the playable runtime renderer.
 */
export type GameClientRenderOptions = {
  readonly wrapper: HTMLElement;
  readonly rendererPreference: GameClientRendererPreference;
};

/**
 * Creates the Pixi/Three render runtime used by the playable browser client.
 */
export const createGameClientRenderRuntime = async ({
  wrapper,
  rendererPreference,
}: GameClientRenderOptions): Promise<GameClientRenderRuntime> => {
  const preferredRenderers = await resolveRendererPreferenceOrder(rendererPreference);
  let lastFailure: Error | null = null;

  for (const candidate of preferredRenderers) {
    const result = await settleAsync(
      createRendererRuntime({
        wrapper,
        rendererPreference: candidate,
      }),
    );
    if (result.ok) {
      return result.value;
    }

    lastFailure = result.error;
    wrapper.replaceChildren();
  }

  throw lastFailure ?? new Error("Unable to initialize the playable renderer.");
};
