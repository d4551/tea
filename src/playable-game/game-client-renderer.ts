import {
  Assets,
  autoDetectRenderer,
  Container,
  Graphics,
  Rectangle,
  type Renderer,
  Sprite,
  Texture,
} from "pixi.js";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import type {
  EntityState,
  GameParticipantPresence,
  GameSceneState,
  NpcState,
  SpriteAnimationConfig,
  SpriteManifest,
} from "../shared/contracts/game.ts";
import type { GameClientRendererPreference } from "../shared/contracts/game-client-bootstrap.ts";
import { ThreeLayer } from "./three-layer.ts";

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

const resolveAnimation = (
  manifest: SpriteManifest,
  animationKey: string,
  facing: EntityState["facing"],
): SpriteAnimationConfig => {
  const animation =
    manifest.animations[animationKey] ??
    manifest.animations[`idle-${facing}`] ??
    Object.values(manifest.animations)[0];
  if (animation) {
    return animation;
  }

  throw new Error(`Sprite manifest is missing animations for ${animationKey}`);
};

const resolveAnimationFrameIndex = (
  state: GameSceneState,
  animation: SpriteAnimationConfig,
): number => {
  if (animation.frames <= 1) {
    return 0;
  }

  const framesElapsed = Math.floor((state.worldTimeMs / 1000) * animation.speed);
  return framesElapsed % animation.frames;
};

const renderState = (
  current: GameSceneState,
  previous: GameSceneState | null,
  alpha: number,
  participantSessionId: string,
  sprites: Map<string, Sprite>,
  nodeOverlays: Map<string, Graphics>,
  world: Container,
  resolveEntityTexture: (state: GameSceneState, entity: EntityState | NpcState) => Texture,
): void => {
  const entities = getSceneEntities(current);
  const activeNodeIds = new Set<string>();
  const camera = resolveLocalCamera(current, participantSessionId);

  for (const entity of entities) {
    const manifest = resolveSpriteManifest(entity.characterKey);
    const sprite =
      sprites.get(entity.id) ??
      (() => {
        const created = new Sprite();
        created.anchor.set(0, 0);
        world.addChild(created);
        sprites.set(entity.id, created);
        return created;
      })();

    const previousEntity = findPreviousEntity(previous, entity.id);
    const previousX = previousEntity?.position.x ?? entity.position.x;
    const previousY = previousEntity?.position.y ?? entity.position.y;

    sprite.texture = resolveEntityTexture(current, entity);
    sprite.scale.set(manifest?.scale ?? 1);
    sprite.x = previousX + (entity.position.x - previousX) * alpha - camera.x;
    sprite.y = previousY + (entity.position.y - previousY) * alpha - camera.y;
    sprite.zIndex = sprite.y;
  }

  if (current.sceneMode !== "3d") {
    for (const node of current.nodes ?? []) {
      if (!("size" in node)) {
        continue;
      }

      activeNodeIds.add(node.id);
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
  }

  for (const [nodeId, overlay] of nodeOverlays.entries()) {
    if (activeNodeIds.has(nodeId)) {
      continue;
    }

    world.removeChild(overlay);
    overlay.destroy();
    nodeOverlays.delete(nodeId);
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
  const useWebGpuMode = rendererPreference === "webgpu";
  const threeLayer = new ThreeLayer(wrapper.clientWidth, wrapper.clientHeight, useWebGpuMode);
  await threeLayer.init();
  threeLayer.addTeaHouseEffects();

  let pixiRenderer: Renderer;
  if (useWebGpuMode) {
    const threeCanvas = threeLayer.renderer.domElement;
    threeCanvas.classList.add("absolute", "inset-0", "w-full", "h-full");
    wrapper.appendChild(threeCanvas);

    pixiRenderer = await autoDetectRenderer({
      preference: "webgpu",
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
      backgroundAlpha: 0,
      clearBeforeRender: true,
      antialias: false,
    });

    const pixiCanvas = pixiRenderer.canvas as HTMLCanvasElement;
    pixiCanvas.classList.add("absolute", "inset-0", "w-full", "h-full");
    wrapper.appendChild(pixiCanvas);
  } else {
    const threeCanvas = threeLayer.renderer.domElement;
    threeCanvas.classList.add("absolute", "inset-0", "w-full", "h-full");
    wrapper.appendChild(threeCanvas);

    pixiRenderer = await autoDetectRenderer({
      preference: "webgl",
      context: threeLayer.getContext() as WebGL2RenderingContext,
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
      clearBeforeRender: false,
      antialias: false,
    });
  }

  const stage = new Container();
  stage.sortableChildren = true;

  const world = new Container();
  world.sortableChildren = true;
  stage.addChild(world);

  const sprites = new Map<string, Sprite>();
  const nodeOverlays = new Map<string, Graphics>();
  const loadedTextures = new Map<string, Texture>();
  const frameTextures = new Map<string, Texture>();
  let backgroundSprite: Sprite | null = null;

  const ensureTextureLoaded = async (assetUrl: string): Promise<Texture> => {
    const cached = loadedTextures.get(assetUrl);
    if (cached) {
      return cached;
    }

    const texture = (await Assets.load(assetUrl)) as Texture;
    loadedTextures.set(assetUrl, texture);
    if (loadedTextures.size > MAX_TEXTURE_CACHE_SIZE) {
      evictLruEntry(loadedTextures);
    }

    return texture;
  };

  const ensureSceneAssetsLoaded = async (state: GameSceneState): Promise<LoadedSceneAssets> => {
    const uniqueSheetUrls = new Set<string>([state.background]);
    const entities = getSceneEntities(state);

    for (const entity of entities) {
      const manifest = resolveSpriteManifest(entity.characterKey);
      if (manifest) {
        uniqueSheetUrls.add(manifest.sheet);
      }
    }

    await Promise.all(
      Array.from(uniqueSheetUrls.values(), (assetUrl) => ensureTextureLoaded(assetUrl)),
    );

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

  const resolveEntityTexture = (state: GameSceneState, entity: EntityState | NpcState): Texture => {
    const manifest = resolveSpriteManifest(entity.characterKey);
    if (!manifest) {
      return Texture.EMPTY;
    }

    const sheetTexture = loadedTextures.get(manifest.sheet);
    if (!sheetTexture) {
      return Texture.EMPTY;
    }

    const animation = resolveAnimation(manifest, entity.animation, entity.facing);
    const frameIndex = resolveAnimationFrameIndex(state, animation);
    const column = animation.startCol + frameIndex;
    const cacheKey = `${manifest.sheet}:${animation.row}:${column}`;
    const cached = frameTextures.get(cacheKey);
    if (cached) {
      return cached;
    }

    const texture = new Texture({
      source: sheetTexture.source,
      frame: new Rectangle(
        column * manifest.frameWidth,
        animation.row * manifest.frameHeight,
        manifest.frameWidth,
        manifest.frameHeight,
      ),
    });

    frameTextures.set(cacheKey, texture);
    if (frameTextures.size > MAX_TEXTURE_CACHE_SIZE) {
      evictLruEntry(frameTextures);
    }

    return texture;
  };

  return {
    async prepareState(state) {
      await ensureSceneAssetsLoaded(state);
    },
    renderFrame({ state, previousState, alpha, participantSessionId, deltaMs }) {
      if (state) {
        threeLayer.syncSceneState(state);
        renderState(
          state,
          previousState,
          alpha,
          participantSessionId,
          sprites,
          nodeOverlays,
          world,
          resolveEntityTexture,
        );
      }

      threeLayer.tick(deltaMs);
      pixiRenderer.render({ container: stage });
    },
    resize() {
      threeLayer.resize(wrapper.clientWidth, wrapper.clientHeight);
      pixiRenderer.resize(wrapper.clientWidth, wrapper.clientHeight);
    },
    dispose() {
      stage.destroy({ children: true });
      pixiRenderer.destroy();
      threeLayer.dispose();
      wrapper.replaceChildren();
    },
  };
};
