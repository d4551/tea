import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { createApp } from "../src/app.ts";
import { appConfig } from "../src/config/environment.ts";
import { ProviderRegistry } from "../src/domain/ai/providers/provider-registry.ts";
import { builderService } from "../src/domain/builder/builder-service.ts";
import { gameScenes } from "../src/domain/game/data/sprite-data.ts";
import { gameLoop } from "../src/domain/game/game-loop.ts";
import { gameStateStore } from "../src/domain/game/services/GameStateStore.ts";
import { buildSessionSceneState } from "../src/domain/game/utils/session-state.ts";
import { defaultGameConfig } from "../src/shared/config/game-config.ts";
import { gameAssetUrls } from "../src/shared/constants/game-assets.ts";
import { httpStatus } from "../src/shared/constants/http.ts";
import { appRoutes } from "../src/shared/constants/routes.ts";
import { prisma } from "../src/shared/services/db.ts";

let app: Awaited<ReturnType<typeof createApp>>;
const baseUrl = "http://localhost";
const managedSessionIds = new Set<string>();

const toUrl = (path: string): string => `${baseUrl}${path}`;
const withSessionId = (pattern: string, sessionId: string): string =>
  pattern.replace(":id", encodeURIComponent(sessionId));
const readSseUntil = async (
  response: Response,
  predicate: (content: string) => boolean,
  maxChunks = 12,
): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  let collected = "";
  for (let index = 0; index < maxChunks; index += 1) {
    const next = await reader.read();
    if (next.done) {
      break;
    }

    const chunk: unknown = next.value;

    if (chunk instanceof Uint8Array) {
      collected += decoder.decode(chunk, { stream: true });
      continue;
    }

    if (chunk instanceof ArrayBuffer) {
      collected += decoder.decode(new Uint8Array(chunk), { stream: true });
      continue;
    }

    collected += String(chunk);
    if (predicate(collected)) {
      break;
    }
  }
  return collected;
};

const waitUntil = async (
  predicate: () => Promise<boolean>,
  timeoutMs = defaultGameConfig.tickMs * 12,
): Promise<boolean> => {
  const startedAtMs = Date.now();
  while (Date.now() - startedAtMs < timeoutMs) {
    if (await predicate()) {
      return true;
    }

    await Bun.sleep(defaultGameConfig.tickMs);
  }

  return false;
};

beforeAll(async () => {
  app = await createApp();
});

afterEach(async () => {
  for (const sessionId of managedSessionIds) {
    await gameLoop.closeSession(sessionId);
  }
  managedSessionIds.clear();
});

afterAll(async () => {
  await (await ProviderRegistry.getInstance()).dispose();
  await prisma.$disconnect();
});

describe("game engine runtime", () => {
  test("buildSessionSceneState keeps entity bounds local and materializes NPC interaction data", () => {
    const teaHouseScene = gameScenes.teaHouse;
    expect(teaHouseScene).toBeDefined();
    if (!teaHouseScene) {
      return;
    }

    const scene = buildSessionSceneState(teaHouseScene, "en-US", 42);
    const teaMonk = scene.npcs[0];
    const teaMonkDefinition = teaHouseScene.npcs[0];

    expect(teaMonkDefinition).toBeDefined();
    if (!teaMonkDefinition) {
      return;
    }

    expect(scene.player.bounds.x).toBeLessThan(scene.player.position.x);
    expect(scene.player.bounds.y).toBeLessThan(scene.player.position.y);
    expect(scene.player.bounds.x).toBeGreaterThanOrEqual(0);
    expect(scene.player.bounds.y).toBeGreaterThanOrEqual(0);
    expect(teaMonk?.bounds.x).toBeLessThan(teaMonk?.position.x ?? 0);
    expect(teaMonk?.bounds.y).toBeLessThan(teaMonk?.position.y ?? 0);
    expect(teaMonk?.interactRadius).toBe(teaMonkDefinition.interactRadius);
    expect(teaMonk?.homePosition).toEqual({
      x: teaMonkDefinition.x,
      y: teaMonkDefinition.y,
    });
    expect(teaMonk?.dialogueEntries[0]?.key).toBe(teaMonkDefinition.ai.greetLineKey);
    expect(teaMonk?.dialogueEntries[0]?.text.length).toBeGreaterThan(0);
  });

  test("queued commands advance without a websocket tick owner", async () => {
    const session = await gameLoop.createSession("en-US", "teaHouse");
    managedSessionIds.add(session.sessionId);
    const initialWorldTimeMs = session.state.worldTimeMs;

    const accepted = gameLoop.processCommand(
      session.sessionId,
      { type: "move", direction: "right" },
      "en-US",
    );
    expect(accepted.state).toBe("queued");

    const advanced = await waitUntil(async () => {
      const next = await gameLoop.getSessionState(session.sessionId);
      return (
        (next?.commandQueueDepth ?? 1) === 0 &&
        (next?.state.worldTimeMs ?? initialWorldTimeMs) > initialWorldTimeMs
      );
    });

    expect(advanced).toBe(true);
  });

  test("confirmDialogue closes an active NPC conversation", async () => {
    const session = await gameLoop.createSession("en-US", "teaHouse");
    managedSessionIds.add(session.sessionId);
    const runtimeStore = gameLoop as unknown as {
      readonly liveSessions: Map<
        string,
        {
          scene: {
            dialogue: {
              npcId: string;
              npcLabel: string;
              line: string;
              lineKey: string;
            } | null;
            npcs: Array<{ id: string; label: string; state: string }>;
          };
        }
      >;
    };
    const runtimeSession = runtimeStore.liveSessions.get(session.sessionId);
    const targetNpc = runtimeSession?.scene.npcs[0];
    expect(targetNpc).toBeDefined();
    if (!runtimeSession || !targetNpc) {
      return;
    }

    runtimeSession.scene.dialogue = {
      npcId: targetNpc.id,
      npcLabel: targetNpc.label,
      line: "Test dialogue line",
      lineKey: "npc.test.line",
    };
    targetNpc.state = "talking";

    const confirmResult = gameLoop.processCommand(
      session.sessionId,
      { type: "confirmDialogue" },
      "en-US",
    );
    expect(confirmResult.state).toBe("queued");
    await gameLoop.tick(session.sessionId, defaultGameConfig.tickMs);

    const dialogueClosed = await gameLoop.getSessionState(session.sessionId);
    expect(dialogueClosed?.state.dialogue).toBeNull();
    expect(dialogueClosed?.state.npcs.some((npc) => npc.state === "talking")).toBe(false);
  });

  test("published builder projects seed runtime scene overrides and dialogue text", async () => {
    const projectId = `runtime-${crypto.randomUUID()}`;
    const project = await builderService.createProject(projectId);
    expect(project).not.toBeNull();
    if (!project) {
      return;
    }

    const teaHouse = project.scenes.get("teaHouse");
    expect(teaHouse).toBeDefined();
    if (!teaHouse) {
      return;
    }

    await builderService.saveScene(projectId, {
      id: teaHouse.id,
      scene: {
        ...teaHouse,
        background: gameAssetUrls.npcSpriteSheet,
      },
    });
    await builderService.saveDialogue(projectId, {
      key: "npc.teaMonk.greet",
      text: "Published runtime greeting",
      locale: "en-US",
    });
    await builderService.publishProject(projectId, true);

    const session = await gameLoop.createSession("en-US", "teaHouse", projectId);
    managedSessionIds.add(session.sessionId);
    const seededState = await gameLoop.getSessionState(session.sessionId);

    expect(seededState?.state.background).toBe(gameAssetUrls.npcSpriteSheet);
    expect(
      seededState?.state.npcs
        .find((npc) => npc.characterKey === "teaMonk")
        ?.dialogueEntries.some((entry) => entry.text === "Published runtime greeting"),
    ).toBe(true);

    const stored = await gameStateStore.getSession(session.sessionId);
    expect(stored.ok).toBe(true);
    if (stored.ok) {
      expect(stored.payload.projectId).toBe(projectId);
    }
  });

  test("published builder projects seed authored flags and quest state", async () => {
    const projectId = `mechanics-seed-${crypto.randomUUID()}`;
    const project = await builderService.createProject(projectId);
    expect(project).not.toBeNull();
    if (!project) {
      return;
    }

    await builderService.publishProject(projectId, true);

    const session = await gameLoop.createSession("en-US", "teaHouse", projectId);
    managedSessionIds.add(session.sessionId);
    const seededState = await gameLoop.getSessionState(session.sessionId);

    expect(seededState?.state.flags?.teaHouseVisited).toBe(true);
    expect(seededState?.state.flags?.teaMonkMet).toBe(false);
    const welcomeQuest = seededState?.state.quests?.find(
      (quest) => quest.id === "quest.teaHouse.welcome",
    );
    expect(welcomeQuest).toBeDefined();
    expect(welcomeQuest?.completed).toBe(false);
    expect(welcomeQuest?.steps[0]?.state).toBe("active");
  });

  test("npc interact triggers authored flag mutation and quest completion", async () => {
    const projectId = `mechanics-trigger-${crypto.randomUUID()}`;
    const project = await builderService.createProject(projectId);
    expect(project).not.toBeNull();
    if (!project) {
      return;
    }

    await builderService.publishProject(projectId, true);

    const session = await gameLoop.createSession("en-US", "teaHouse", projectId);
    managedSessionIds.add(session.sessionId);
    const runtimeStore = gameLoop as unknown as {
      readonly liveSessions: Map<
        string,
        {
          scene: {
            player: {
              position: { x: number; y: number };
            };
            npcs: Array<{
              id: string;
              characterKey: string;
              position: { x: number; y: number };
            }>;
          };
        }
      >;
    };
    const runtimeSession = runtimeStore.liveSessions.get(session.sessionId);
    const teaMonk = runtimeSession?.scene.npcs.find((npc) => npc.characterKey === "teaMonk");
    expect(teaMonk).toBeDefined();
    if (!runtimeSession || !teaMonk) {
      return;
    }

    runtimeSession.scene.player.position.x = teaMonk.position.x;
    runtimeSession.scene.player.position.y = teaMonk.position.y;

    const interactResult = gameLoop.processCommand(
      session.sessionId,
      { type: "interact" },
      "en-US",
    );
    expect(interactResult.state).toBe("queued");
    await gameLoop.tick(session.sessionId, defaultGameConfig.tickMs);

    const triggeredState = await gameLoop.getSessionState(session.sessionId);
    expect(triggeredState?.state.flags?.teaMonkMet).toBe(true);
    const welcomeQuest = triggeredState?.state.quests?.find(
      (quest) => quest.id === "quest.teaHouse.welcome",
    );
    expect(welcomeQuest?.completed).toBe(true);
    expect(welcomeQuest?.steps[0]?.state).toBe("completed");
  });

  test("published mechanics remain immutable until republish", async () => {
    const projectId = `mechanics-release-${crypto.randomUUID()}`;
    const created = await builderService.createProject(projectId);
    expect(created).not.toBeNull();
    if (!created) {
      return;
    }

    await builderService.publishProject(projectId, true);
    const releaseOne = await builderService.getPublishedProject(projectId);
    expect(releaseOne?.triggers.get("trigger.meet-teaMonk")?.label).toBe("Meet the tea monk");

    await builderService.saveTrigger(projectId, {
      id: "trigger.meet-teaMonk",
      trigger: {
        id: "trigger.meet-teaMonk",
        label: "Meet the published guide",
        event: "npc-interact",
        sceneId: "teaHouse",
        npcId: "teaMonk",
        setFlags: {
          teaMonkMet: true,
        },
        questId: "quest.teaHouse.welcome",
        questStepId: "step.meet-teaMonk",
      },
    });

    const stillReleaseOne = await builderService.getPublishedProject(projectId);
    expect(stillReleaseOne?.triggers.get("trigger.meet-teaMonk")?.label).toBe("Meet the tea monk");

    await builderService.publishProject(projectId, true);
    const releaseTwo = await builderService.getPublishedProject(projectId);
    expect(releaseTwo?.triggers.get("trigger.meet-teaMonk")?.label).toBe(
      "Meet the published guide",
    );
  });

  test("published builder releases remain immutable until republish", async () => {
    const projectId = `release-${crypto.randomUUID()}`;
    const created = await builderService.createProject(projectId);
    expect(created).not.toBeNull();
    if (!created) {
      return;
    }

    await builderService.saveDialogue(projectId, {
      key: "npc.teaMonk.greet",
      text: "Release one greeting",
      locale: "en-US",
    });
    await builderService.publishProject(projectId, true);

    const releaseOne = await builderService.getPublishedProject(projectId);
    expect(releaseOne?.dialogues.get("en-US")?.get("npc.teaMonk.greet")).toBe(
      "Release one greeting",
    );

    await builderService.saveDialogue(projectId, {
      key: "npc.teaMonk.greet",
      text: "Draft greeting two",
      locale: "en-US",
    });

    const stillReleaseOne = await builderService.getPublishedProject(projectId);
    expect(stillReleaseOne?.dialogues.get("en-US")?.get("npc.teaMonk.greet")).toBe(
      "Release one greeting",
    );

    await builderService.publishProject(projectId, true);
    const releaseTwo = await builderService.getPublishedProject(projectId);
    expect(releaseTwo?.dialogues.get("en-US")?.get("npc.teaMonk.greet")).toBe("Draft greeting two");
  });

  test("failed persistence does not mutate in-memory stateVersion", async () => {
    const session = await gameLoop.createSession("en-US", "teaHouse");
    managedSessionIds.add(session.sessionId);
    const runtimeStore = gameLoop as unknown as {
      readonly liveSessions: Map<string, { stateVersion: number }>;
    };
    const runtimeSession = runtimeStore.liveSessions.get(session.sessionId);
    expect(runtimeSession).toBeDefined();
    if (!runtimeSession) {
      return;
    }

    const initialVersion = runtimeSession.stateVersion;
    const originalSaveSession = gameStateStore.saveSession.bind(gameStateStore);
    let saveAttempts = 0;
    (gameStateStore as unknown as { saveSession: (value: unknown) => Promise<void> }).saveSession =
      async () => {
        saveAttempts += 1;
        throw new Error("simulated-save-failure");
      };

    try {
      await expect(gameLoop.saveSessionNow(session.sessionId)).rejects.toThrow(
        "simulated-save-failure",
      );
      expect(runtimeSession.stateVersion).toBe(initialVersion);
      expect(saveAttempts).toBe(1);
    } finally {
      (
        gameStateStore as unknown as { saveSession: typeof gameStateStore.saveSession }
      ).saveSession = originalSaveSession;
    }
  });
});

describe("game engine HTTP contracts", () => {
  test("restore route requires a valid resume token", async () => {
    const session = await gameLoop.createSession("en-US", "teaHouse");
    managedSessionIds.add(session.sessionId);
    const state = await gameLoop.getSessionState(session.sessionId);
    const path = withSessionId(appRoutes.gameApiSessionRestore, session.sessionId);
    const ownerCookie = `${appConfig.auth.sessionCookieName}=anonymous`;

    const unauthorizedResponse = await app.handle(
      new Request(toUrl(path), {
        method: "POST",
        headers: {
          cookie: ownerCookie,
          "content-type": "application/json",
        },
        body: JSON.stringify({ resumeToken: "invalid-token" }),
      }),
    );
    const authorizedResponse = await app.handle(
      new Request(toUrl(path), {
        method: "POST",
        headers: {
          cookie: ownerCookie,
          "content-type": "application/json",
        },
        body: JSON.stringify({ resumeToken: state?.resumeToken ?? "" }),
      }),
    );

    expect(unauthorizedResponse.status).toBe(httpStatus.unauthorized);
    expect(authorizedResponse.status).toBe(httpStatus.ok);
  });

  test("restore route rejects resume token with wrong owner session cookie", async () => {
    const ownerSessionId = crypto.randomUUID();
    const session = await gameLoop.createSession("en-US", "teaHouse", undefined, ownerSessionId);
    managedSessionIds.add(session.sessionId);
    const state = await gameLoop.getSessionState(session.sessionId, ownerSessionId);
    const path = withSessionId(appRoutes.gameApiSessionRestore, session.sessionId);

    const response = await app.handle(
      new Request(toUrl(path), {
        method: "POST",
        headers: {
          cookie: `${appConfig.auth.sessionCookieName}=${crypto.randomUUID()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ resumeToken: state?.resumeToken ?? "" }),
      }),
    );

    expect(response.status).toBe(httpStatus.unauthorized);
  });

  test("save route enforces the configured cooldown", async () => {
    const session = await gameLoop.createSession("en-US", "teaHouse");
    managedSessionIds.add(session.sessionId);
    const path = withSessionId(appRoutes.gameApiSessionSave, session.sessionId);
    const ownerCookie = `${appConfig.auth.sessionCookieName}=anonymous`;

    const firstSave = await app.handle(
      new Request(toUrl(path), {
        method: "POST",
        headers: {
          cookie: ownerCookie,
        },
      }),
    );
    const secondSave = await app.handle(
      new Request(toUrl(path), {
        method: "POST",
        headers: {
          cookie: ownerCookie,
        },
      }),
    );
    const payload = (await secondSave.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly message: string;
      };
    };

    expect(firstSave.status).toBe(httpStatus.ok);
    expect(secondSave.status).toBe(httpStatus.tooManyRequests);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("CONFLICT");
    expect(payload.error?.message.includes("save-cooldown:")).toBe(true);
  });

  test("hud stream escapes runtime dialogue content", async () => {
    const session = await gameLoop.createSession("en-US", "teaHouse");
    managedSessionIds.add(session.sessionId);
    const ownerCookie = `${appConfig.auth.sessionCookieName}=anonymous`;
    const stored = await gameStateStore.getSession(session.sessionId);
    expect(stored.ok).toBe(true);
    if (!stored.ok) {
      return;
    }

    await gameStateStore.saveSession({
      ...stored.payload,
      scene: {
        ...stored.payload.scene,
        dialogue: {
          npcId: "npc-danger",
          npcLabel: "<script>alert('npc')</script>",
          line: "<img src=x onerror=alert('line')>",
          lineKey: "unsafe",
        },
      },
    });

    const response = await app.handle(
      new Request(toUrl(withSessionId(appRoutes.gameApiSessionHud, session.sessionId)), {
        headers: {
          cookie: ownerCookie,
        },
      }),
    );
    const body = await readSseUntil(response, (content) => content.includes("event: dialogue"));

    expect(response.status).toBe(httpStatus.ok);
    expect(body.includes("<script>alert('npc')</script>")).toBe(false);
    expect(body.includes("<img src=x onerror=alert('line')>")).toBe(false);
    expect(body.includes("&lt;script&gt;alert(&#39;npc&#39;)&lt;/script&gt;")).toBe(true);
    expect(body.includes("&lt;img src=x onerror=alert(&#39;line&#39;)&gt;")).toBe(true);
  });

  test("builder assets page renders the authored asset and generation workspace", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.builderAssets)));
    const body = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(body.includes('id="builder-project-shell"')).toBe(true);
    expect(body.includes('hx-post="/api/builder/assets/create/form"')).toBe(true);
    expect(body.includes("Animation clips")).toBe(true);
    expect(body.includes("Queue generation job")).toBe(true);
  });

  test("state route rejects requests from a different session owner", async () => {
    const ownerSessionId = crypto.randomUUID();
    const session = await gameLoop.createSession("en-US", "teaHouse", undefined, ownerSessionId);
    managedSessionIds.add(session.sessionId);
    const path = withSessionId(appRoutes.gameApiSessionState, session.sessionId);

    const response = await app.handle(
      new Request(toUrl(path), {
        headers: {
          cookie: `${appConfig.auth.sessionCookieName}=${crypto.randomUUID()}`,
        },
      }),
    );

    expect(response.status).toBe(httpStatus.unauthorized);
  });
});
