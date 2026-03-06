import {
  Application,
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import type { SceneDefinition, SceneNodeDefinition } from "../shared/contracts/game.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";

type SceneEditorPayload = {
  readonly scene: SceneDefinition;
};

const readPayload = (element: HTMLElement): SceneEditorPayload | null => {
  const script = element.querySelector<HTMLScriptElement>('script[type="application/json"]');
  if (!script?.textContent) {
    return null;
  }

  return safeJsonParse<SceneEditorPayload | null>(script.textContent, null);
};

const isSceneNode2D = (
  node: SceneNodeDefinition,
): node is Extract<SceneNodeDefinition, { readonly nodeType: "sprite" | "tile" | "spawn" | "trigger" | "camera" }> =>
  "size" in node;

const nodeColor = (node: SceneNodeDefinition): number => {
  if (node.nodeType === "trigger") {
    return 0xf59e0b;
  }
  if (node.nodeType === "spawn") {
    return 0x10b981;
  }
  if (node.nodeType === "camera") {
    return 0x3b82f6;
  }
  if (node.nodeType === "light") {
    return 0xfbbf24;
  }
  return 0xf3f4f6;
};

const render2dScene = async (element: HTMLElement, scene: SceneDefinition): Promise<void> => {
  const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
  if (!viewport) {
    return;
  }

  const app = new Application();
  await app.init({
    backgroundAlpha: 0,
    resizeTo: viewport,
    antialias: true,
  });
  viewport.replaceChildren(app.canvas);

  const world = new Container();
  app.stage.addChild(world);

  if (scene.background.length > 0) {
    const texture = ((await Assets.load(scene.background)) as Texture | undefined) ?? Texture.EMPTY;
    const background = new Sprite(texture);
    background.width = scene.geometry.width;
    background.height = scene.geometry.height;
    background.alpha = 0.8;
    world.addChild(background);
  }

  const overlay = new Graphics();
  overlay.rect(0, 0, scene.geometry.width, scene.geometry.height).fill({ color: 0x0f172a, alpha: 0.2 });
  world.addChild(overlay);

  for (const node of scene.nodes ?? []) {
    if (!isSceneNode2D(node)) {
      continue;
    }
    const shape = new Graphics();
    shape.rect(node.position.x, node.position.y, node.size.width, node.size.height).fill({
      color: nodeColor(node),
      alpha: node.nodeType === "trigger" ? 0.35 : 0.55,
    });
    shape.stroke({
      color: nodeColor(node),
      width: 2,
      alpha: 0.95,
    });
    world.addChild(shape);

    const label = new Text({
      text: `${node.id}`,
      style: {
        fill: 0xffffff,
        fontSize: 12,
      },
    });
    label.x = node.position.x + 4;
    label.y = node.position.y + 4;
    world.addChild(label);
  }

  world.scale.set(
    Math.min(viewport.clientWidth / scene.geometry.width, viewport.clientHeight / scene.geometry.height),
  );
};

const buildThreeObject = (node: SceneNodeDefinition): THREE.Object3D => {
  if (node.nodeType === "light") {
    const light = new THREE.PointLight(nodeColor(node), 1.4, 8);
    light.position.set(node.position.x, node.position.y, node.position.z);
    light.name = node.id;
    return light;
  }

  const geometry = node.nodeType === "trigger"
    ? new THREE.BoxGeometry(1.5, 1.5, 1.5)
    : new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: nodeColor(node),
    transparent: node.nodeType === "trigger",
    opacity: node.nodeType === "trigger" ? 0.35 : 0.92,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(node.position.x, node.position.y, node.position.z);
  if ("rotation" in node) {
    mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);
    mesh.scale.set(node.scale.x, node.scale.y, node.scale.z);
  }
  mesh.name = node.id;
  return mesh;
};

const render3dScene = (element: HTMLElement, scene: SceneDefinition): void => {
  const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
  if (!viewport) {
    return;
  }

  const width = Math.max(320, viewport.clientWidth);
  const height = Math.max(180, viewport.clientHeight);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  viewport.replaceChildren(renderer.domElement);

  const threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x0f172a);
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
  camera.position.set(6, 5, 6);

  threeScene.add(new THREE.GridHelper(20, 20, 0x94a3b8, 0x334155));
  threeScene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
  directionalLight.position.set(4, 6, 4);
  threeScene.add(directionalLight);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;

  const transform = new TransformControls(camera, renderer.domElement);
  transform.addEventListener("dragging-changed", (event) => {
    orbit.enabled = !event.value;
  });
  threeScene.add(transform.getHelper());

  const objectLookup = new Map<string, THREE.Object3D>();
  for (const node of scene.nodes ?? []) {
    if ("size" in node) {
      continue;
    }
    const object = buildThreeObject(node);
    objectLookup.set(node.id, object);
    threeScene.add(object);
  }

  const selectButtons = element.querySelectorAll<HTMLElement>("[data-scene-node-select]");
  for (const button of selectButtons) {
    button.addEventListener("click", () => {
      const nodeId = button.dataset.sceneNodeSelect;
      if (!nodeId) {
        return;
      }
      const object = objectLookup.get(nodeId);
      if (!object) {
        return;
      }
      transform.attach(object);
    });
  }

  const onResize = () => {
    const nextWidth = Math.max(320, viewport.clientWidth);
    const nextHeight = Math.max(180, viewport.clientHeight);
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
  };
  window.addEventListener("resize", onResize);

  const animate = () => {
    orbit.update();
    renderer.render(threeScene, camera);
    requestAnimationFrame(animate);
  };
  animate();
};

const init = async (): Promise<void> => {
  const roots = document.querySelectorAll<HTMLElement>("[data-scene-editor]");
  for (const root of roots) {
    const payload = readPayload(root);
    if (!payload) {
      continue;
    }
    if (payload.scene.sceneMode === "3d") {
      render3dScene(root, payload.scene);
      continue;
    }
    await render2dScene(root, payload.scene);
  }
};

void init();
