import * as THREE from "three";
import type { GameSceneState, SceneNode3D } from "../shared/contracts/game.ts";

const LEAF_COUNT = 80;
const LEAF_SPREAD_X = 8;
const LEAF_SPREAD_Y = 6;
const LEAF_FALL_SPEED_MIN = 0.002;
const LEAF_FALL_SPEED_MAX = 0.008;
const LEAF_DRIFT_AMPLITUDE = 0.003;

/**
 * Shared Three.js environment layer rendered beneath the Pixi sprite scene.
 */
export class ThreeLayer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;

  private _leafGeometry: THREE.BufferGeometry | null = null;
  private _leafMesh: THREE.Points | null = null;
  private _leafVelocities: Float32Array | null = null;
  private _elapsedMs = 0;
  private _authoredNodes = new Map<string, THREE.Object3D>();
  private _lastNodeSignature = "";

  constructor(width: number, height: number) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      stencil: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5);
  }

  /**
   * Returns the shared WebGL context used by Pixi.
   *
   * @returns Active renderer context.
   */
  getContext(): WebGLRenderingContext | WebGL2RenderingContext {
    return this.renderer.getContext() as WebGLRenderingContext | WebGL2RenderingContext;
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
    const nodes = state.sceneMode === "3d" ? state.nodes ?? [] : [];
    const signature = JSON.stringify(
      nodes.map((node) =>
        "scale" in node
          ? [
              node.id,
              node.nodeType,
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
          : [node.id, node.nodeType],
      ),
    );
    if (signature === this._lastNodeSignature) {
      return;
    }

    this._lastNodeSignature = signature;
    for (const object of this._authoredNodes.values()) {
      this.scene.remove(object);
    }
    this._authoredNodes.clear();

    for (const node of nodes) {
      if (!("scale" in node)) {
        continue;
      }
      const object = this._createAuthoredNodeObject(node);
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

    this.renderer.resetState();
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
    this.renderer.dispose();
  }

  private _createAuthoredNodeObject(node: SceneNode3D): THREE.Object3D {
    if (node.nodeType === "light") {
      const light = new THREE.PointLight(0x7dd3fc, 1.4, 12);
      light.position.set(node.position.x, node.position.y, node.position.z);
      return light;
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

  private _buildLeafParticles(): void {
    const positions = new Float32Array(LEAF_COUNT * 3);
    const velocities = new Float32Array(LEAF_COUNT * 3);
    const colors = new Float32Array(LEAF_COUNT * 3);
    const palette = [
      new THREE.Color(0xc2691d),
      new THREE.Color(0xe8a027),
      new THREE.Color(0x8b3a0f),
      new THREE.Color(0xd4a853),
    ] as const;

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

      const color = palette[Math.floor(Math.random() * palette.length)] as THREE.Color;
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
    const positions = [
      [-2.5, 1.5, 1],
      [2.5, 1.5, 1],
      [0, 2, 0.5],
    ] as const;

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
