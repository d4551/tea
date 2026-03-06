import * as THREE from "three";

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
    this._leafGeometry?.dispose();
    if (this._leafMesh?.material instanceof THREE.Material) {
      this._leafMesh.material.dispose();
    }
    this.renderer.dispose();
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
