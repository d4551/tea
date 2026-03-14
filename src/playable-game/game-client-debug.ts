/**
 * Debug overlay for game runtime: FPS, entity count, collision viz toggle, state dump.
 * Toggle with F3 or /debug in address bar when on game page.
 */

import type { GameSceneState } from "../shared/contracts/game.ts";

export type GameClientDebugController = {
  readonly setVisible: (visible: boolean) => void;
  readonly isVisible: () => boolean;
  readonly tick: (deltaMs: number, getState: () => GameSceneState | null) => void;
  readonly dispose: () => void;
};

/**
 * Creates the debug overlay controller. Renders a floating panel with fps, entity count,
 * collision debug placeholder, and state dump. Listens for F3 or /debug to toggle.
 */
export const createGameClientDebugController = (
  gamePageRoot: HTMLElement,
): GameClientDebugController => {
  const panel = document.createElement("aside");
  panel.id = "game-debug-overlay";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Debug overlay");
  panel.setAttribute("aria-live", "polite");
  panel.className =
    "fixed bottom-4 left-4 z-[9999] max-h-[50vh] overflow-auto rounded-lg border border-base-content/20 bg-base-100/95 p-4 font-mono text-xs shadow-xl backdrop-blur-sm";
  panel.hidden = true;

  const fpsEl = document.createElement("div");
  fpsEl.setAttribute("data-debug-fps", "");
  fpsEl.textContent = "FPS: --";
  const entityEl = document.createElement("div");
  entityEl.setAttribute("data-debug-entities", "");
  entityEl.textContent = "Entities: 0";
  const collisionEl = document.createElement("div");
  collisionEl.setAttribute("data-debug-collision", "");
  collisionEl.textContent = "Collision: drawn when overlay visible";
  const stateEl = document.createElement("pre");
  stateEl.setAttribute("data-debug-state", "");
  stateEl.className = "mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all text-[10px]";
  stateEl.textContent = "(state dump when active)";

  panel.append(fpsEl, entityEl, collisionEl, stateEl);
  gamePageRoot.appendChild(panel);

  let visible = false;
  let lastFpsUpdate = 0;
  let frameCount = 0;
  let fpsAccumulator = 0;

  const setVisible = (next: boolean): void => {
    if (visible === next) return;
    visible = next;
    panel.hidden = !visible;
    collisionEl.textContent = visible
      ? "Collision: visible on canvas"
      : "Collision: drawn when overlay visible";
  };

  const toggleVisible = (): void => setVisible(!visible);

  const handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "F3") {
      e.preventDefault();
      toggleVisible();
    }
  };

  const checkDebugQuery = (): void => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1" || params.get("debug") === "true") {
      setVisible(true);
    }
  };

  window.addEventListener("keydown", handleKeydown);
  checkDebugQuery();

  const tick = (deltaMs: number, getState: () => GameSceneState | null): void => {
    if (!visible) return;

    frameCount += 1;
    fpsAccumulator += deltaMs;
    const now = performance.now();
    if (now - lastFpsUpdate >= 200) {
      const fps = fpsAccumulator > 0 ? Math.round((frameCount * 1000) / fpsAccumulator) : 0;
      fpsEl.textContent = `FPS: ${fps}`;
      frameCount = 0;
      fpsAccumulator = 0;
      lastFpsUpdate = now;
    }

    const state = getState();
    if (state) {
      const entities = 1 + (state.coPlayers?.length ?? 0) + (state.npcs?.length ?? 0);
      entityEl.textContent = `Entities: ${entities}`;

      const summary: Record<string, unknown> = {
        sceneTitle: state.sceneTitle,
        sceneMode: state.sceneMode,
        player: state.player?.id,
        npcCount: state.npcs?.length ?? 0,
        nodeCount: state.nodes?.length ?? 0,
      };
      const serialized = JSON.stringify(summary, null, 2);
      stateEl.textContent = serialized;
    } else {
      entityEl.textContent = "Entities: --";
      stateEl.textContent = "(no state)";
    }
  };

  return {
    setVisible,
    isVisible: () => visible,
    tick,
    dispose() {
      window.removeEventListener("keydown", handleKeydown);
      panel.remove();
    },
  };
};
