import {
  Application,
  Assets,
  Container,
  type FederatedPointerEvent,
  Graphics,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import {
  DEFAULT_SCENE_SPAWN_X,
  DEFAULT_SCENE_SPAWN_Y,
} from "../shared/constants/builder-defaults.ts";
import type { SceneDefinition, SceneNodeDefinition } from "../shared/contracts/game.ts";
import { safeJsonParse } from "../shared/utils/safe-json.ts";

type SceneEditorPayload = {
  readonly scene: SceneDefinition;
};

interface SceneEditorController {
  readonly destroy: () => void;
}

interface SceneEditorRuntime {
  readonly controllers: Map<HTMLElement, SceneEditorController>;
  readonly refresh: () => void;
}

type SceneNodeFormField =
  | "positionX"
  | "positionY"
  | "positionZ"
  | "rotationX"
  | "rotationY"
  | "rotationZ"
  | "scaleX"
  | "scaleY"
  | "scaleZ";

type SceneNodeNumericValues = Partial<Record<SceneNodeFormField, number>>;

declare global {
  interface Window {
    __teaSceneEditorRuntime?: SceneEditorRuntime;
  }
}

const readPayload = (element: HTMLElement): SceneEditorPayload | null => {
  const script = element.querySelector<HTMLScriptElement>('script[type="application/json"]');
  if (!script?.textContent) {
    return null;
  }

  return safeJsonParse<SceneEditorPayload | null>(
    script.textContent ?? "",
    null,
    (v): v is SceneEditorPayload | null => true,
  );
};

const isSceneNode2D = (
  node: SceneNodeDefinition,
): node is Extract<
  SceneNodeDefinition,
  { readonly nodeType: "sprite" | "tile" | "spawn" | "trigger" | "camera" }
> => "size" in node;

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

const formatSceneNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(3).replace(/(?:\.0+|(\.\d+?)0+)$/u, "$1");
};

const isSceneNodeFormField = (value: string): value is SceneNodeFormField =>
  value === "positionX" ||
  value === "positionY" ||
  value === "positionZ" ||
  value === "rotationX" ||
  value === "rotationY" ||
  value === "rotationZ" ||
  value === "scaleX" ||
  value === "scaleY" ||
  value === "scaleZ";

const findSceneNodeForm = (root: HTMLElement, nodeId: string): HTMLFormElement | null =>
  root.querySelector<HTMLFormElement>(
    `[data-scene-node-form][data-scene-node-id="${CSS.escape(nodeId)}"]`,
  );

const updateSceneNodeSelectionUi = (root: HTMLElement, nodeId: string | null): void => {
  const selectedNodeTarget = root.querySelector<HTMLElement>("[data-scene-selected-node]");
  const selectedNodeFallback =
    selectedNodeTarget?.dataset.emptyLabel ?? selectedNodeTarget?.textContent;
  if (selectedNodeTarget) {
    selectedNodeTarget.textContent = nodeId ?? selectedNodeFallback ?? "";
  }

  for (const button of root.querySelectorAll<HTMLElement>("[data-scene-node-select]")) {
    const active = button.dataset.sceneNodeSelect === nodeId;
    button.classList.toggle("btn-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }
};

const updateSceneNodeFormValues = (
  root: HTMLElement,
  nodeId: string,
  values: SceneNodeNumericValues,
): HTMLFormElement | null => {
  const form = findSceneNodeForm(root, nodeId);
  if (!form) {
    return null;
  }

  for (const [rawField, rawValue] of Object.entries(values)) {
    if (
      !isSceneNodeFormField(rawField) ||
      typeof rawValue !== "number" ||
      !Number.isFinite(rawValue)
    ) {
      continue;
    }
    const field = rawField;
    const control = form.elements.namedItem(field);
    if (
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement ||
      control instanceof HTMLSelectElement
    ) {
      control.value = formatSceneNumber(rawValue);
    }
  }

  return form;
};

const submitSceneNodeForm = (form: HTMLFormElement | null): void => {
  if (!form || form.dataset.sceneNodeSubmitting === "true") {
    return;
  }

  form.dataset.sceneNodeSubmitting = "true";
  form.requestSubmit();
};

const setTransformModeUi = (root: HTMLElement, mode: "translate" | "rotate" | "scale"): void => {
  for (const button of root.querySelectorAll<HTMLElement>("[data-scene-transform-mode]")) {
    const active = button.dataset.sceneTransformMode === mode;
    button.classList.toggle("btn-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }
};

const render2dScene = async (
  element: HTMLElement,
  scene: SceneDefinition,
): Promise<SceneEditorController | null> => {
  const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
  if (!viewport) {
    return null;
  }

  const app = new Application();
  await app.init({
    backgroundAlpha: 0,
    resizeTo: viewport,
    antialias: true,
  });
  viewport.replaceChildren(app.canvas);

  const world = new Container();
  app.stage.eventMode = "static";
  app.stage.addChild(world);

  const updateScale = (): void => {
    const nextScale = Math.min(
      viewport.clientWidth / scene.geometry.width,
      viewport.clientHeight / scene.geometry.height,
    );
    world.scale.set(nextScale > 0 ? nextScale : 1);
  };

  if (scene.background.length > 0) {
    const loadedBackground = await Assets.load(scene.background);
    const texture = loadedBackground instanceof Texture ? loadedBackground : Texture.EMPTY;
    const background = new Container();
    const backgroundImage = new Sprite(texture);
    backgroundImage.width = scene.geometry.width;
    backgroundImage.height = scene.geometry.height;
    backgroundImage.alpha = 0.8;
    background.addChild(backgroundImage);

    const sceneBackground = new Graphics();
    sceneBackground.rect(0, 0, scene.geometry.width, scene.geometry.height).fill({
      color: 0x0f172a,
      alpha: 0.25,
    });
    background.addChild(sceneBackground);
    world.addChild(background);
  }

  const nodeContainers = new Map<string, Container>();
  let selectedNodeId: string | null = null;
  let dragState: {
    readonly nodeId: string;
    readonly offsetX: number;
    readonly offsetY: number;
  } | null = null;

  const selectNode = (nodeId: string | null): void => {
    selectedNodeId = nodeId;
    updateSceneNodeSelectionUi(element, selectedNodeId);

    for (const [currentNodeId, container] of nodeContainers.entries()) {
      container.alpha = currentNodeId === selectedNodeId ? 1 : 0.78;
    }
  };

  for (const node of scene.nodes ?? []) {
    if (!isSceneNode2D(node)) {
      continue;
    }

    const nodeContainer = new Container();
    nodeContainer.position.set(node.position.x, node.position.y);
    nodeContainer.eventMode = "static";
    nodeContainer.cursor = "pointer";

    const shape = new Graphics();
    shape.rect(0, 0, node.size.width, node.size.height).fill({
      color: nodeColor(node),
      alpha: node.nodeType === "trigger" ? 0.35 : 0.55,
    });
    shape.stroke({
      color: nodeColor(node),
      width: 2,
      alpha: 0.95,
    });
    nodeContainer.addChild(shape);

    const label = new Text({
      text: node.id,
      style: {
        fill: 0xffffff,
        fontSize: 12,
      },
    });
    label.x = 4;
    label.y = 4;
    nodeContainer.addChild(label);

    nodeContainer.on("pointerdown", (event: FederatedPointerEvent) => {
      const localPoint = world.toLocal(event.global);
      dragState = {
        nodeId: node.id,
        offsetX: localPoint.x - nodeContainer.position.x,
        offsetY: localPoint.y - nodeContainer.position.y,
      };
      selectNode(node.id);
    });

    nodeContainers.set(node.id, nodeContainer);
    world.addChild(nodeContainer);
  }

  const handleGlobalPointerMove = (event: FederatedPointerEvent): void => {
    if (!dragState) {
      return;
    }

    const container = nodeContainers.get(dragState.nodeId);
    if (!container) {
      return;
    }

    const localPoint = world.toLocal(event.global);
    const nextX = localPoint.x - dragState.offsetX;
    const nextY = localPoint.y - dragState.offsetY;
    container.position.set(nextX, nextY);
    updateSceneNodeFormValues(element, dragState.nodeId, {
      positionX: nextX,
      positionY: nextY,
    });
  };

  const commitDrag = (): void => {
    if (!dragState) {
      return;
    }

    const form = findSceneNodeForm(element, dragState.nodeId);
    dragState = null;
    submitSceneNodeForm(form);
  };

  app.stage.on("globalpointermove", handleGlobalPointerMove);
  app.stage.on("pointerup", commitDrag);
  app.stage.on("pointerupoutside", commitDrag);
  app.stage.on("pointercancel", commitDrag);

  const handleClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest<HTMLElement>("[data-scene-node-select]");
    if (!button?.dataset.sceneNodeSelect) {
      return;
    }

    selectNode(button.dataset.sceneNodeSelect);
  };
  element.addEventListener("click", handleClick);

  const resizeObserver = new ResizeObserver(() => {
    updateScale();
  });
  resizeObserver.observe(viewport);
  updateScale();
  selectNode(scene.nodes?.[0]?.id ?? null);

  return {
    destroy: () => {
      resizeObserver.disconnect();
      element.removeEventListener("click", handleClick);
      app.stage.removeAllListeners();
      app.destroy(
        { removeView: true },
        {
          children: true,
          texture: false,
          textureSource: false,
        },
      );
      viewport.replaceChildren();
    },
  };
};

const buildThreeObject = (node: SceneNodeDefinition): THREE.Object3D => {
  if (node.nodeType === "light") {
    const light = new THREE.PointLight(nodeColor(node), 1.4, 8);
    light.position.set(node.position.x, node.position.y, node.position.z);
    light.name = node.id;
    return light;
  }

  const geometry =
    node.nodeType === "trigger"
      ? new THREE.BoxGeometry(1.5, 1.5, 1.5)
      : new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: nodeColor(node),
    transparent: node.nodeType === "trigger",
    opacity: node.nodeType === "trigger" ? 0.35 : 0.92,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(node.position.x, node.position.y, "z" in node.position ? node.position.z : 0);
  if ("rotation" in node) {
    mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);
    mesh.scale.set(node.scale.x, node.scale.y, node.scale.z);
  }
  mesh.name = node.id;
  return mesh;
};

const disposeThreeObject = (object: THREE.Object3D): void => {
  if (object instanceof THREE.Mesh) {
    object.geometry.dispose();
    if (Array.isArray(object.material)) {
      for (const material of object.material) {
        material.dispose();
      }
    } else {
      object.material.dispose();
    }
  }
};

const render3dScene = (
  element: HTMLElement,
  scene: SceneDefinition,
): SceneEditorController | null => {
  const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
  if (!viewport) {
    return null;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewport.replaceChildren(renderer.domElement);

  const threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x0f172a);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(6, 5, 6);

  threeScene.add(new THREE.GridHelper(20, 20, 0x94a3b8, 0x334155));
  threeScene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
  directionalLight.position.set(4, 6, 4);
  threeScene.add(directionalLight);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;

  const transform = new TransformControls(camera, renderer.domElement);
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

  const updateSelectedNodeForm = (nodeId: string, object: THREE.Object3D): HTMLFormElement | null =>
    updateSceneNodeFormValues(element, nodeId, {
      positionX: object.position.x,
      positionY: object.position.y,
      positionZ: object.position.z,
      rotationX: object.rotation.x,
      rotationY: object.rotation.y,
      rotationZ: object.rotation.z,
      scaleX: object.scale.x,
      scaleY: object.scale.y,
      scaleZ: object.scale.z,
    });

  const selectNode = (nodeId: string | null): void => {
    updateSceneNodeSelectionUi(element, nodeId);
    if (!nodeId) {
      transform.detach();
      return;
    }

    const object = objectLookup.get(nodeId);
    if (!object) {
      transform.detach();
      return;
    }

    transform.attach(object);
    updateSelectedNodeForm(nodeId, object);
  };

  const persistSelectedNode = (): void => {
    const object = transform.object;
    if (!object || object.name.length === 0) {
      return;
    }

    const form = updateSelectedNodeForm(object.name, object);
    submitSceneNodeForm(form);
  };

  transform.addEventListener("change", () => {
    renderer.render(threeScene, camera);
  });
  transform.addEventListener("objectChange", () => {
    const object = transform.object;
    if (!object || object.name.length === 0) {
      return;
    }
    updateSelectedNodeForm(object.name, object);
  });
  transform.addEventListener("dragging-changed", (event) => {
    orbit.enabled = !event.value;
    if (!event.value) {
      persistSelectedNode();
    }
  });

  const setTransformMode = (mode: "translate" | "rotate" | "scale"): void => {
    transform.setMode(mode);
    setTransformModeUi(element, mode);
  };

  const handleUiClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const modeButton = target.closest<HTMLElement>("[data-scene-transform-mode]");
    if (
      modeButton?.dataset.sceneTransformMode === "translate" ||
      modeButton?.dataset.sceneTransformMode === "rotate" ||
      modeButton?.dataset.sceneTransformMode === "scale"
    ) {
      setTransformMode(modeButton.dataset.sceneTransformMode);
      return;
    }

    const selectButton = target.closest<HTMLElement>("[data-scene-node-select]");
    if (selectButton?.dataset.sceneNodeSelect) {
      selectNode(selectButton.dataset.sceneNodeSelect);
    }
  };
  element.addEventListener("click", handleUiClick);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pickableObjects = Array.from(objectLookup.values()).filter(
    (object): object is THREE.Mesh => object instanceof THREE.Mesh,
  );

  const handleViewportPointerDown = (event: PointerEvent): void => {
    if (transform.dragging) {
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const match = raycaster.intersectObjects(pickableObjects, false)[0]?.object;
    if (match?.name) {
      selectNode(match.name);
    }
  };
  renderer.domElement.addEventListener("pointerdown", handleViewportPointerDown);

  const resize = (): void => {
    const nextWidth = Math.max(DEFAULT_SCENE_SPAWN_X, viewport.clientWidth);
    const nextHeight = Math.max(DEFAULT_SCENE_SPAWN_Y, viewport.clientHeight);
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
  };
  const resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(viewport);
  resize();
  setTransformMode("translate");
  selectNode(scene.nodes?.find((node) => !("size" in node))?.id ?? null);

  let frameId = 0;
  const animate = (): void => {
    orbit.update();
    renderer.render(threeScene, camera);
    frameId = window.requestAnimationFrame(animate);
  };
  animate();

  return {
    destroy: () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      element.removeEventListener("click", handleUiClick);
      renderer.domElement.removeEventListener("pointerdown", handleViewportPointerDown);
      transform.detach();
      transform.dispose();
      orbit.dispose();
      for (const object of objectLookup.values()) {
        disposeThreeObject(object);
      }
      renderer.dispose();
      viewport.replaceChildren();
    },
  };
};

const mountSceneEditor = async (root: HTMLElement): Promise<SceneEditorController | null> => {
  const payload = readPayload(root);
  if (!payload) {
    return null;
  }

  if (payload.scene.sceneMode === "3d") {
    return render3dScene(root, payload.scene);
  }

  return render2dScene(root, payload.scene);
};

const getRuntime = (): SceneEditorRuntime => {
  const existing = window.__teaSceneEditorRuntime;
  if (existing) {
    return existing;
  }

  const runtime: SceneEditorRuntime = {
    controllers: new Map<HTMLElement, SceneEditorController>(),
    refresh: () => {
      void syncSceneEditors(runtime);
    },
  };
  window.__teaSceneEditorRuntime = runtime;
  return runtime;
};

const syncSceneEditors = async (runtime: SceneEditorRuntime): Promise<void> => {
  const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-scene-editor]"));
  const activeRoots = new Set(roots);

  for (const [root, controller] of runtime.controllers.entries()) {
    if (activeRoots.has(root)) {
      continue;
    }
    controller.destroy();
    runtime.controllers.delete(root);
  }

  for (const root of roots) {
    if (runtime.controllers.has(root)) {
      continue;
    }
    const controller = await mountSceneEditor(root);
    if (!controller) {
      continue;
    }
    runtime.controllers.set(root, controller);
  }
};

const bootSceneEditor = (): void => {
  const runtime = getRuntime();
  if (document.body.dataset.sceneEditorBootstrapped === "true") {
    runtime.refresh();
    return;
  }

  document.body.dataset.sceneEditorBootstrapped = "true";
  document.body.addEventListener("htmx:afterSwap", () => {
    runtime.refresh();
  });
  runtime.refresh();
};

bootSceneEditor();
