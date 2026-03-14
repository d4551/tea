import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { USDLoader } from "three/addons/loaders/USDLoader.js";
import { WebGPURenderer } from "three/webgpu";
import type { GameSceneState, SceneNode3D } from "../shared/contracts/game.ts";

const LEAF_COUNT = 80;
const LEAF_SPREAD_X = 8;
const LEAF_SPREAD_Y = 6;

/** LOD distance thresholds: high at 0, medium at threshold1, low at threshold2. */
const LOD_THRESHOLD_MEDIUM = 8;
const LOD_THRESHOLD_LOW = 16;
const LEAF_FALL_SPEED_MIN = 0.002;
const LEAF_FALL_SPEED_MAX = 0.008;
const LEAF_DRIFT_AMPLITUDE = 0.003;

/**
 * Shared Three.js environment layer rendered beneath the Pixi sprite scene.
 */
export class ThreeLayer {
  readonly renderer: THREE.WebGLRenderer | WebGPURenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;

  private _leafGeometry: THREE.BufferGeometry | null = null;
  private _leafMesh: THREE.Points | null = null;
  private _leafVelocities: Float32Array | null = null;
  private _elapsedMs = 0;
  private _authoredNodes = new Map<string, THREE.Object3D>();
  private _authoredModelCache = new Map<string, Promise<THREE.Object3D | null>>();
  private _lastNodeSignature = "";
  private _nodeRenderVersion = 0;
  private _modelFallbackGeometry: THREE.BufferGeometry;
  private _modelFallbackMaterial: THREE.Material;
  private readonly _gltfLoader = new GLTFLoader();
  private readonly _usdLoader = new USDLoader();
  private readonly _useWebGpu: boolean;

  constructor(width: number, height: number, useWebGpu = false) {
    this._useWebGpu = useWebGpu;
    if (useWebGpu) {
      this.renderer = new WebGPURenderer({
        antialias: false,
        alpha: true,
      });
    } else {
      this.renderer = new THREE.WebGLRenderer({
        antialias: false,
        stencil: true,
        alpha: true,
      });
    }

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    this._modelFallbackGeometry = new THREE.IcosahedronGeometry(0.8, 1);
    this._modelFallbackMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: 0x020617,
      roughness: 0.65,
      metalness: 0.1,
      transparent: false,
    });
  }

  async init(): Promise<void> {
    if (this._useWebGpu && "init" in this.renderer) {
      await this.renderer.init();
    }
  }

  /**
   * Returns the shared WebGL context used by Pixi.
   *
   * @returns Active renderer context.
   */
  getContext(): WebGLRenderingContext | WebGL2RenderingContext | null {
    if (this.renderer instanceof THREE.WebGLRenderer) {
      return this.renderer.getContext();
    }
    return null;
  }

  /**
   * Resizes the renderer and keeps the camera projection in sync.
   *
   * @param width Target width in pixels.
   * @param height Target height in pixels.
   */
  resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Applies the tea-house scene atmosphere and particles.
   */
  addTeaHouseEffects(): void {
    this.scene.fog = new THREE.FogExp2(0x1a0d05, 0.04);
    this.scene.background = new THREE.Color(0x0d0702);

    this._buildLeafParticles();
    this._buildLanternLights();
  }

  /**
   * Syncs authored runtime nodes into the Three scene for 3D scenes.
   *
   * @param state Current game scene state.
   */
  syncSceneState(state: GameSceneState): void {
    const nodes = state.sceneMode === "3d" ? (state.nodes ?? []) : [];
    const signature = JSON.stringify(
      nodes.map((node) =>
        "scale" in node
          ? [
              node.id,
              node.nodeType,
              node.assetId,
              node.position.x,
              node.position.y,
              node.position.z,
              node.rotation.x,
              node.rotation.y,
              node.rotation.z,
              node.scale.x,
              node.scale.y,
              node.scale.z,
            ]
          : [node.id, node.nodeType, node.assetId],
      ),
    );
    if (signature === this._lastNodeSignature) {
      return;
    }

    this._lastNodeSignature = signature;
    this._nodeRenderVersion += 1;
    for (const object of this._authoredNodes.values()) {
      this.scene.remove(object);
    }
    this._authoredNodes.clear();

    for (const node of nodes) {
      if (!("scale" in node)) {
        continue;
      }
      const object = this._createAuthoredNodeObject(node, state, this._nodeRenderVersion);
      this.scene.add(object);
      this._authoredNodes.set(node.id, object);
    }
  }

  /**
   * Advances the environment simulation and renders one frame.
   *
   * @param deltaMs Elapsed time since the previous tick.
   */
  tick(deltaMs: number): void {
    this._elapsedMs += deltaMs;
    this._updateLeaves();

    if (this.renderer instanceof THREE.WebGLRenderer) {
      this.renderer.resetState();
    }
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Releases GPU resources held by the layer.
   */
  dispose(): void {
    for (const object of this._authoredNodes.values()) {
      this.scene.remove(object);
    }
    this._authoredNodes.clear();
    this._leafGeometry?.dispose();
    if (this._leafMesh?.material instanceof THREE.Material) {
      this._leafMesh.material.dispose();
    }
    this._modelFallbackGeometry.dispose();
    this._modelFallbackMaterial.dispose();
    this.renderer.dispose();
  }

  private _createAuthoredNodeObject(
    node: SceneNode3D,
    state: GameSceneState,
    renderVersion: number,
  ): THREE.Object3D {
    if (node.nodeType === "light") {
      const light = new THREE.PointLight(0x7dd3fc, 1.4, 12);
      light.position.set(node.position.x, node.position.y, node.position.z);
      return light;
    }

    // Particle emitter scaffold: Three.js Points/PointsMaterial when node has particleEmitter
    if (node.particleEmitter) {
      const count = Math.min(node.particleEmitter.maxCount, 500);
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: 0xffd700,
        size: (node.particleEmitter.size[0] + node.particleEmitter.size[1]) / 2,
        transparent: true,
        opacity: 0.8,
      });
      const points = new THREE.Points(geometry, material);
      points.position.set(node.position.x, node.position.y, node.position.z);
      return points;
    }

    if (node.nodeType === "model" && typeof node.assetId === "string" && node.assetId.length > 0) {
      const container = new THREE.Group();
      container.position.set(node.position.x, node.position.y, node.position.z);
      container.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);
      container.scale.set(node.scale.x, node.scale.y, node.scale.z);
      container.add(this._createModelFallbackObject());
      void this._resolveModelObject(state, node.assetId).then((resolved) => {
        const currentObject = this._authoredNodes.get(node.id);
        if (!resolved || currentObject !== container || this._nodeRenderVersion !== renderVersion) {
          return;
        }

        container.clear();
        const lodObject = this._createModelLOD(resolved);
        container.add(lodObject);
      });
      return container;
    }

    const geometry =
      node.nodeType === "camera"
        ? new THREE.ConeGeometry(0.24, 0.6, 8)
        : node.nodeType === "trigger"
          ? new THREE.BoxGeometry(1.2, 1.2, 1.2)
          : new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color:
        node.nodeType === "trigger"
          ? 0xf59e0b
          : node.nodeType === "spawn"
            ? 0x22c55e
            : node.nodeType === "camera"
              ? 0xe879f9
              : 0xf8fafc,
      transparent: node.nodeType === "trigger",
      opacity: node.nodeType === "trigger" ? 0.45 : 0.92,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(node.position.x, node.position.y, node.position.z);
    mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);
    mesh.scale.set(node.scale.x, node.scale.y, node.scale.z);
    return mesh;
  }

  private _resolveModelObject(
    state: GameSceneState,
    assetId: string,
  ): Promise<THREE.Object3D | null> {
    const runtimeAsset = this._resolveRuntimeAsset(state, assetId);
    if (!runtimeAsset) {
      return Promise.resolve(null);
    }

    const cacheKey = `${runtimeAsset.format}:${runtimeAsset.source}`;
    const cached = this._authoredModelCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const pending =
      runtimeAsset.format === "glb" || runtimeAsset.format === "gltf"
        ? this._gltfLoader
            .loadAsync(runtimeAsset.source)
            .then((gltf) => gltf.scene)
            .catch(() => null)
        : runtimeAsset.format === "usdz"
          ? this._usdLoader.loadAsync(runtimeAsset.source).catch(() => null)
          : Promise.resolve(null);
    this._authoredModelCache.set(cacheKey, pending);
    return pending;
  }

  private _createModelFallbackObject(): THREE.Object3D {
    const mesh = new THREE.Mesh(this._modelFallbackGeometry, this._modelFallbackMaterial);
    mesh.position.set(0, -0.35, 0);
    return mesh;
  }

  /**
   * Wraps a model in THREE.LOD with high/medium/low levels based on camera distance.
   * High at 0, medium at LOD_THRESHOLD_MEDIUM, low at LOD_THRESHOLD_LOW.
   */
  private _createModelLOD(resolved: THREE.Object3D): THREE.LOD {
    const lod = new THREE.LOD();
    lod.addLevel(resolved.clone(true), 0);

    const mediumMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 0),
      this._modelFallbackMaterial,
    );
    mediumMesh.position.set(0, -0.35, 0);
    lod.addLevel(mediumMesh, LOD_THRESHOLD_MEDIUM);

    const lowMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      this._modelFallbackMaterial,
    );
    lowMesh.position.set(0, -0.35, 0);
    lod.addLevel(lowMesh, LOD_THRESHOLD_LOW);

    return lod;
  }

  private _resolveRuntimeAsset(
    state: GameSceneState,
    assetId: string,
  ): { readonly source: string; readonly format: string } | null {
    const asset = state.assets?.find((candidate) => candidate.id === assetId);
    if (!asset) {
      return null;
    }

    const runtimeVariant =
      asset.variants.find((variant) => variant.usage === "runtime") ??
      asset.variants.find((variant) => variant.usage === "source");
    if (runtimeVariant) {
      return {
        source: runtimeVariant.source,
        format: runtimeVariant.format.toLowerCase(),
      };
    }

    return {
      source: asset.source,
      format: asset.sourceFormat.toLowerCase(),
    };
  }

  private _buildLeafParticles(): void {
    const positions = new Float32Array(LEAF_COUNT * 3);
    const velocities = new Float32Array(LEAF_COUNT * 3);
    const colors = new Float32Array(LEAF_COUNT * 3);
    const palette: readonly THREE.Color[] = [
      new THREE.Color(0xc2691d),
      new THREE.Color(0xe8a027),
      new THREE.Color(0x8b3a0f),
      new THREE.Color(0xd4a853),
    ];
    const fallbackColor = palette[0] ?? new THREE.Color(0xd4a853);

    for (let index = 0; index < LEAF_COUNT; index += 1) {
      const offset = index * 3;
      positions[offset] = (Math.random() - 0.5) * LEAF_SPREAD_X;
      positions[offset + 1] = (Math.random() - 0.5) * LEAF_SPREAD_Y + 3;
      positions[offset + 2] = (Math.random() - 0.5) * 2;

      velocities[offset] = (Math.random() - 0.5) * LEAF_DRIFT_AMPLITUDE;
      velocities[offset + 1] = -(
        LEAF_FALL_SPEED_MIN +
        Math.random() * (LEAF_FALL_SPEED_MAX - LEAF_FALL_SPEED_MIN)
      );
      velocities[offset + 2] = 0;

      const color = palette[Math.floor(Math.random() * palette.length)] ?? fallbackColor;
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }

    this._leafGeometry = new THREE.BufferGeometry();
    this._leafGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this._leafGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    this._leafMesh = new THREE.Points(
      this._leafGeometry,
      new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      }),
    );
    this._leafVelocities = velocities;
    this.scene.add(this._leafMesh);
  }

  private _buildLanternLights(): void {
    const positions: readonly [number, number, number][] = [
      [-2.5, 1.5, 1],
      [2.5, 1.5, 1],
      [0, 2, 0.5],
    ];

    for (const [x, y, z] of positions) {
      const light = new THREE.PointLight(0xffaa44, 1.2, 4);
      light.position.set(x, y, z);
      this.scene.add(light);
    }

    this.scene.add(new THREE.AmbientLight(0x301a08, 0.4));
  }

  private _updateLeaves(): void {
    if (!this._leafGeometry || !this._leafVelocities) {
      return;
    }

    const leafVelocities = this._leafVelocities;
    const positionAttribute = this._leafGeometry.getAttribute("position");
    const positions = positionAttribute?.array;
    if (!(positions instanceof Float32Array) || !positionAttribute) {
      return;
    }

    const timeSeconds = this._elapsedMs * 0.001;

    for (let index = 0; index < LEAF_COUNT; index += 1) {
      const offset = index * 3;
      const nextX =
        (positions[offset] ?? 0) +
        (leafVelocities[offset] ?? 0) +
        Math.sin(timeSeconds + index * 0.7) * 0.0015;
      const nextY = (positions[offset + 1] ?? 0) + (leafVelocities[offset + 1] ?? 0);
      const nextZ = (positions[offset + 2] ?? 0) + (leafVelocities[offset + 2] ?? 0);

      positions[offset] = nextX;
      positions[offset + 1] = nextY;
      positions[offset + 2] = nextZ;

      if (nextY < -LEAF_SPREAD_Y / 2 - 1) {
        positions[offset] = (Math.random() - 0.5) * LEAF_SPREAD_X;
        positions[offset + 1] = LEAF_SPREAD_Y / 2 + 1;
        positions[offset + 2] = (Math.random() - 0.5) * 2;
      }
    }

    positionAttribute.needsUpdate = true;
  }
}
