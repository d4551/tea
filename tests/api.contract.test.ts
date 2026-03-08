import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { createApp } from "../src/app.ts";
import { appConfig } from "../src/config/environment.ts";
import { resetEmbeddingFallback } from "../src/domain/ai/knowledge-base-service.ts";
import { ProviderRegistry } from "../src/domain/ai/providers/provider-registry.ts";
import { vectorStore } from "../src/domain/ai/vector-store.ts";
import { BuilderPublishValidationError } from "../src/domain/builder/builder-publish-validation.ts";
import { builderService } from "../src/domain/builder/builder-service.ts";
import { gameLoop } from "../src/domain/game/game-loop.ts";
import { correlationIdHeader } from "../src/lib/correlation-id.ts";
import { defaultGameConfig } from "../src/shared/config/game-config.ts";
import { gameAssetUrls } from "../src/shared/constants/game-assets.ts";
import { contentType, httpStatus } from "../src/shared/constants/http.ts";
import { defaultOracleMode } from "../src/shared/constants/oracle.ts";
import { appRoutes, withQueryParameters } from "../src/shared/constants/routes.ts";
import { prisma, prismaBase } from "../src/shared/services/db.ts";

let app: Awaited<ReturnType<typeof createApp>>;
const baseUrl = "http://localhost";
const managedSessionIds = new Set<string>();

const toUrl = (path: string): string => `${baseUrl}${path}`;
const withSessionId = (pattern: string, sessionId: string): string =>
  pattern.replace(":id", encodeURIComponent(sessionId));
const countOccurrences = (source: string, fragment: string): number =>
  source.split(fragment).length - 1;
const drainResponseBody = async (response: Response): Promise<void> => {
  if (response.bodyUsed || !response.body) {
    return;
  }

  await response.arrayBuffer();
};

const readSseUntil = async (
  response: Response,
  predicate: (content: string) => boolean,
  maxChunks = 32,
): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  let collected = "";

  try {
    for (let index = 0; index < maxChunks; index += 1) {
      const next = await reader.read();
      if (next.done) {
        break;
      }

      const chunk: unknown = next.value;

      if (chunk instanceof Uint8Array) {
        collected += decoder.decode(chunk, { stream: true });
      } else if (chunk instanceof ArrayBuffer) {
        collected += decoder.decode(new Uint8Array(chunk), { stream: true });
      } else {
        collected += String(chunk);
      }

      if (predicate(collected)) {
        break;
      }
    }
  } finally {
    try {
      await reader.cancel();
    } finally {
      reader.releaseLock();
    }
  }

  return collected;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const readSessionCookieHeader = (response: Response): string | null => {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    return null;
  }

  return setCookie.split(";")[0] ?? null;
};

const createDeterministicEmbedding = (text: string): Float32Array => {
  const dimension = 384;
  const values = new Float32Array(dimension);
  for (const [index, character] of [...text].entries()) {
    const slot = index % dimension;
    values[slot] = (values[slot] ?? 0) + (character.codePointAt(0) ?? 0) / 1024;
  }
  values[0] = (values[0] ?? 0) === 0 ? 1 : (values[0] ?? 0);
  return values;
};

import { spyOn } from "bun:test";

const withMockedEmbeddingGeneration = async <T>(run: () => Promise<T>): Promise<T> => {
  resetEmbeddingFallback();
  vectorStore.clear();
  const registry = await ProviderRegistry.getInstance();
  const spy = spyOn(registry, "generateEmbedding").mockImplementation(async (text: string) =>
    createDeterministicEmbedding(text),
  );

  // SAFETY: try/finally is required to guarantee mockRestore runs even if the
  // test callback throws, preventing mock leaks across tests.
  try {
    return await run();
  } finally {
    spy.mockRestore();
  }
};

const createBuilderProject = async (projectId = `contract-${Date.now()}`) => {
  const response = await app.handle(
    new Request(toUrl("/api/builder/projects"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ projectId }),
    }),
  );

  const payload = (await response.json()) as {
    readonly ok: boolean;
    readonly data?: {
      readonly id: string;
      readonly checksum: string;
    };
  };

  return { response, payload };
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

describe("API contracts", () => {
  test("swagger docs endpoint is mounted", async () => {
    const response = await app.handle(new Request(toUrl(appConfig.api.docsPath)));
    const body = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(body.toLowerCase().includes("<!doctype html>")).toBe(true);
    expect(body.includes(appConfig.applicationName)).toBe(true);
  });

  test("configured static mounts serve public, runtime, and asset directories", async () => {
    const responses = await Promise.all([
      app.handle(new Request(toUrl(appConfig.stylesheetPath))),
      app.handle(new Request(toUrl(appConfig.playableGame.clientScriptPath))),
      app.handle(new Request(toUrl("/assets/images/sprites/cha-jiang-sprite.png"))),
      app.handle(new Request(toUrl(`${appConfig.staticAssets.rmmzPackPrefix}/README.md`))),
    ]);
    await Promise.all(responses.map((response) => drainResponseBody(response)));

    expect(responses.every((response) => response.status === httpStatus.ok)).toBe(true);
  });

  test("health endpoint returns success envelope", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.healthApi)));
    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly status: string;
        readonly message: string;
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(payload.data?.status).toBe("ok");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  test("home route issues an anonymous session cookie", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.home)));
    const setCookie = response.headers.get("set-cookie");
    await drainResponseBody(response);

    expect(response.status).toBe(httpStatus.ok);
    expect(setCookie?.includes(`${appConfig.auth.sessionCookieName}=`)).toBe(true);
    expect(setCookie?.toLowerCase().includes("httponly")).toBe(true);
  });

  test("oracle endpoint returns success state", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.oracleApi), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: "How should we secure river trade?",
          mode: defaultOracleMode,
          lang: "en-US",
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly state: string;
        readonly answer: string;
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(payload.data?.state).toBe("success");
    expect(payload.data?.answer.length).toBeGreaterThan(0);
  });

  test("oracle endpoint returns validation error envelope for blank questions", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.oracleApi), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: "   ",
          mode: defaultOracleMode,
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly correlationId: string;
      };
    };

    expect(response.status).toBe(httpStatus.badRequest);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
    expect(payload.error?.correlationId).toBe(
      response.headers.get(correlationIdHeader) ?? undefined,
    );
  });

  test("oracle endpoint maps retryable errors to service unavailable envelope", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.oracleApi), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: "check upstream",
          mode: "force-retryable-error",
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly retryable: boolean;
      };
    };

    expect(response.status).toBe(httpStatus.serviceUnavailable);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("UPSTREAM_ERROR");
    expect(payload.error?.retryable).toBe(true);
  });

  test("oracle endpoint maps unauthorized mode to unauthorized envelope", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.oracleApi), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: "check auth",
          mode: "force-unauthorized",
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    };

    expect(response.status).toBe(httpStatus.unauthorized);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("UNAUTHORIZED");
  });

  test("oracle endpoint honors incoming correlation id header", async () => {
    const incomingCorrelationId = "test-correlation-id-001";
    const response = await app.handle(
      new Request(toUrl(appRoutes.oracleApi), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [correlationIdHeader]: incomingCorrelationId,
        },
        body: JSON.stringify({
          question: "",
          mode: defaultOracleMode,
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly correlationId: string;
      };
    };

    expect(response.status).toBe(httpStatus.badRequest);
    expect(response.headers.get(correlationIdHeader)).toBe(incomingCorrelationId);
    expect(payload.ok).toBe(false);
    expect(payload.error?.correlationId).toBe(incomingCorrelationId);
  });

  test("oracle endpoint validates mode enum values", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.oracleApi), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: "any",
          mode: "invalid-mode",
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    };

    expect(response.status).toBe(httpStatus.unprocessableEntity);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
  });

  test("oracle endpoint body locale override has higher priority than query locale", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.oracleApi}?lang=zh-CN`), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: "route parity check",
          mode: defaultOracleMode,
          lang: "en-US",
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly state: string;
        readonly answer: string;
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(payload.data?.state).toBe("success");
    expect(/[\u3400-\u9fff]/u.test(payload.data?.answer ?? "")).toBe(false);
  });

  test("oracle endpoint falls back to request locale when body locale is invalid", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.oracleApi}?lang=zh-CN`), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: "route parity check",
          mode: defaultOracleMode,
          lang: "invalid-locale",
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly state: string;
        readonly answer: string;
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(payload.data?.state).toBe("success");
    expect(/[\u3400-\u9fff]/u.test(payload.data?.answer ?? "")).toBe(true);
  });

  test("framework validation errors are localized from accept-language", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.oracleApi), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept-language": "zh-CN",
        },
        body: JSON.stringify({
          question: "验证本地化",
          mode: "invalid-mode",
        }),
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly message: string;
      };
    };

    expect(response.status).toBe(httpStatus.unprocessableEntity);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
    expect(payload.error?.message).toBe("请求参数校验失败。");
  });

  test("framework not-found errors use centralized envelope mapping", async () => {
    const response = await app.handle(
      new Request(toUrl("/missing-system-route"), {
        headers: {
          "accept-language": "zh-CN",
        },
      }),
    );

    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly message: string;
      };
    };

    expect(response.status).toBe(httpStatus.notFound);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("NOT_FOUND");
    expect(payload.error?.message).toBe("请求的资源不存在。");
  });

  test("game session command endpoint validates payload and returns envelope", async () => {
    const createResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const createPayload = (await createResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const sessionCookie = readSessionCookieHeader(createResponse);
    const sessionId = createPayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);

    const commandResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionCommand.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(sessionCookie ? { cookie: sessionCookie } : {}),
        },
        body: JSON.stringify({
          type: "move",
          direction: "invalid",
        }),
      }),
    );

    const commandPayload = (await commandResponse.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    };

    expect(createResponse.status).toBe(httpStatus.ok);
    expect(createPayload.ok).toBe(true);
    expect(sessionId.length).toBeGreaterThan(0);
    expect(commandResponse.status).toBe(httpStatus.unprocessableEntity);
    expect(commandPayload.ok).toBe(false);
    expect(commandPayload.error?.code).toBe("VALIDATION_ERROR");
  });

  test("game session command endpoint accepts valid command payloads", async () => {
    const createResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const createPayload = (await createResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const sessionCookie = readSessionCookieHeader(createResponse);
    const sessionId = createPayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);

    const commandResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionCommand.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(sessionCookie ? { cookie: sessionCookie } : {}),
        },
        body: JSON.stringify({
          type: "move",
          direction: "up",
          durationMs: 120,
        }),
      }),
    );

    const commandPayload = (await commandResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
        readonly commandType: string;
        readonly state: string;
        readonly commandState?: string;
        readonly accepted: boolean;
      };
    };

    expect(createResponse.status).toBe(httpStatus.ok);
    expect(createPayload.ok).toBe(true);
    expect(commandResponse.status).toBe(httpStatus.ok);
    expect(commandPayload.ok).toBe(true);
    expect(commandPayload.data?.sessionId).toBe(sessionId);
    expect(commandPayload.data?.commandType).toBe("move");
    expect(commandPayload.data?.state).toBe("queued");
    expect(commandPayload.data?.commandState).toBe("loading");
    expect(commandPayload.data?.accepted).toBe(true);
  });

  test("multiplayer invite flow admits spectators and blocks spectator commands", async () => {
    const ownerCreateResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const ownerCreatePayload = (await ownerCreateResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const ownerCookie = readSessionCookieHeader(ownerCreateResponse);
    const sessionId = ownerCreatePayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);

    const spectatorHomeResponse = await app.handle(new Request(toUrl(appRoutes.home)));
    const spectatorCookie = readSessionCookieHeader(spectatorHomeResponse);

    const inviteResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionInvite.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          ...(ownerCookie ? { cookie: ownerCookie } : {}),
        },
        body: JSON.stringify({
          role: "spectator",
          locale: "en-US",
        }),
      }),
    );
    const invitePayload = (await inviteResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly inviteToken: string;
      };
    };

    const joinResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionJoin.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(spectatorCookie ? { cookie: spectatorCookie } : {}),
        },
        body: JSON.stringify({
          inviteToken: invitePayload.data?.inviteToken ?? "",
        }),
      }),
    );
    const joinPayload = (await joinResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly participantRole?: string;
        readonly participants?: readonly { readonly role: string }[];
        readonly state?: {
          readonly coPlayers?: readonly {
            readonly sessionId: string;
            readonly role: string;
            readonly entity: { readonly id: string };
          }[];
        };
      };
    };

    const spectatorCommandResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionCommand.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(spectatorCookie ? { cookie: spectatorCookie } : {}),
        },
        body: JSON.stringify({
          type: "move",
          direction: "up",
          durationMs: 120,
        }),
      }),
    );

    expect(inviteResponse.status).toBe(httpStatus.ok);
    expect(joinResponse.status).toBe(httpStatus.ok);
    expect(joinPayload.ok).toBe(true);
    expect(joinPayload.data?.participantRole).toBe("spectator");
    expect(
      joinPayload.data?.participants?.some((participant) => participant.role === "spectator"),
    ).toBe(true);
    expect(
      joinPayload.data?.state?.coPlayers?.some(
        (presence) => presence.role === "spectator" && presence.sessionId.length > 0,
      ),
    ).toBe(true);
    expect(spectatorCommandResponse.status).toBe(httpStatus.unauthorized);
  });

  test("controller command flow moves the controller avatar without moving the owner avatar", async () => {
    const ownerCreateResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const ownerCreatePayload = (await ownerCreateResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const ownerCookie = readSessionCookieHeader(ownerCreateResponse);
    const sessionId = ownerCreatePayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);

    const controllerHomeResponse = await app.handle(new Request(toUrl(appRoutes.home)));
    const controllerCookie = readSessionCookieHeader(controllerHomeResponse);

    const inviteResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionInvite.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          ...(ownerCookie ? { cookie: ownerCookie } : {}),
        },
        body: JSON.stringify({
          role: "controller",
          locale: "en-US",
        }),
      }),
    );
    const invitePayload = (await inviteResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly inviteToken: string;
      };
    };

    const joinResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionJoin.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(controllerCookie ? { cookie: controllerCookie } : {}),
        },
        body: JSON.stringify({
          inviteToken: invitePayload.data?.inviteToken ?? "",
        }),
      }),
    );
    const joinPayload = (await joinResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly participantSessionId?: string;
        readonly state?: {
          readonly player: { readonly position: { readonly x: number } };
          readonly coPlayers?: readonly {
            readonly sessionId: string;
            readonly role: string;
            readonly entity: { readonly position: { readonly x: number } };
          }[];
        };
      };
    };
    const controllerSessionId = joinPayload.data?.participantSessionId ?? "";
    const initialOwnerX = joinPayload.data?.state?.player.position.x ?? 0;
    const initialControllerX =
      joinPayload.data?.state?.coPlayers?.find(
        (presence) => presence.sessionId === controllerSessionId && presence.role === "controller",
      )?.entity.position.x ?? 0;

    const commandResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionCommand.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(controllerCookie ? { cookie: controllerCookie } : {}),
        },
        body: JSON.stringify({
          type: "move",
          direction: "right",
          durationMs: defaultGameConfig.tickMs,
        }),
      }),
    );

    await gameLoop.tick(sessionId, defaultGameConfig.tickMs);
    const nextState = await gameLoop.getSessionState(sessionId, controllerSessionId);
    const movedControllerX =
      nextState?.state.coPlayers?.find((presence) => presence.sessionId === controllerSessionId)
        ?.entity.position.x ?? 0;

    expect(joinResponse.status).toBe(httpStatus.ok);
    expect(commandResponse.status).toBe(httpStatus.ok);
    expect(controllerSessionId.length > 0).toBe(true);
    expect(nextState?.state.player.position.x).toBe(initialOwnerX);
    expect(movedControllerX > initialControllerX).toBe(true);
  });

  test("game session state endpoint repairs malformed normalized scene metadata", async () => {
    if (appConfig.game.sessionStore !== "prisma") {
      expect(true).toBe(true);
      return;
    }

    const ownerCookie = `${appConfig.auth.sessionCookieName}=anonymous`;
    const createResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: ownerCookie,
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const createPayload = (await createResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const sessionCookie = readSessionCookieHeader(createResponse) ?? ownerCookie;
    const sessionId = createPayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);

    await prismaBase.gameSessionSceneState.update({
      where: { sessionId },
      data: {
        sceneMode: "invalid-scene-mode",
      },
    });

    const stateResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionState.replace(":id", sessionId)), {
        headers: {
          ...(sessionCookie ? { cookie: sessionCookie } : {}),
        },
      }),
    );
    const statePayload = (await stateResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
        readonly state?: {
          readonly sceneId?: string;
          readonly player?: {
            readonly id?: string;
          };
        };
      };
    };

    const repairedSceneStateRow = await prismaBase.gameSessionSceneState.findUnique({
      where: { sessionId },
    });

    expect(createResponse.status).toBe(httpStatus.ok);
    expect(createPayload.ok).toBe(true);
    expect(stateResponse.status).toBe(httpStatus.ok);
    expect(statePayload.ok).toBe(true);
    expect(statePayload.data?.sessionId).toBe(sessionId);
    expect(statePayload.data?.state?.sceneId?.length).toBeGreaterThan(0);
    expect(statePayload.data?.state?.player?.id).toBe("player");
    expect(repairedSceneStateRow?.sceneMode).toBe("2d");
    expect(repairedSceneStateRow?.sceneTitle?.length).toBeGreaterThan(0);
  });

  test("game sessions persist runtime actor state in normalized session tables", async () => {
    const createResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const createPayload = (await createResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const sessionId = createPayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);

    const [
      sceneStateRow,
      sceneCollisionRows,
      sceneNodeRows,
      sceneAssetRows,
      actorRows,
      runtimeStateRow,
      npcRows,
      npcDialogueKeyRows,
      npcDialogueEntryRows,
      questRows,
      flagRows,
    ] = await Promise.all([
      prismaBase.gameSessionSceneState.findUnique({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneCollision.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneNode.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneAsset.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionActor.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionRuntimeState.findUnique({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpc.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpcDialogueKey.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpcDialogueEntry.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionQuest.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionFlag.findMany({
        where: { sessionId },
      }),
    ]);

    expect(createResponse.status).toBe(httpStatus.ok);
    expect(createPayload.ok).toBe(true);
    expect(sceneStateRow).not.toBeNull();
    expect(Array.isArray(sceneCollisionRows)).toBe(true);
    expect(Array.isArray(sceneNodeRows)).toBe(true);
    expect(Array.isArray(sceneAssetRows)).toBe(true);
    expect(actorRows.length).toBeGreaterThan(0);
    expect(runtimeStateRow).not.toBeNull();
    expect(npcRows.length).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(npcDialogueKeyRows)).toBe(true);
    expect(Array.isArray(npcDialogueEntryRows)).toBe(true);
    expect(Array.isArray(questRows)).toBe(true);
    expect(Array.isArray(flagRows)).toBe(true);
  });

  test("game sessions repair missing normalized runtime state into canonical tables", async () => {
    const createResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const createPayload = (await createResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const sessionId = createPayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);
    const sessionCookie = readSessionCookieHeader(createResponse) ?? "";

    await prismaBase.$transaction([
      prismaBase.gameSessionActor.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneState.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneCollision.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneNode.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneAssetVariant.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneAssetTag.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneAsset.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionRuntimeState.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpcDialogueEntry.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpcDialogueKey.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpc.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionQuestStep.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionQuest.deleteMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionFlag.deleteMany({
        where: { sessionId },
      }),
    ]);

    const stateResponse = await app.handle(
      new Request(toUrl(withSessionId(appRoutes.gameApiSessionState, sessionId)), {
        headers: {
          cookie: sessionCookie,
        },
      }),
    );
    const statePayload = (await stateResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly state: {
          readonly sceneId?: string;
          readonly player?: { readonly id: string };
        };
      };
    };

    const [
      repairedActorRows,
      repairedRuntimeStateRow,
      repairedSceneStateRow,
      repairedSceneCollisionRows,
      repairedSceneNodeRows,
      repairedSceneAssetRows,
      repairedSceneAssetTagRows,
      repairedSceneAssetVariantRows,
      repairedNpcRows,
      repairedNpcDialogueKeyRows,
      repairedNpcDialogueEntryRows,
      repairedQuestRows,
      repairedFlagRows,
    ] = await Promise.all([
      prismaBase.gameSessionActor.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionRuntimeState.findUnique({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneState.findUnique({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneCollision.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneNode.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneAsset.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneAssetTag.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionSceneAssetVariant.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpc.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpcDialogueKey.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionNpcDialogueEntry.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionQuest.findMany({
        where: { sessionId },
      }),
      prismaBase.gameSessionFlag.findMany({
        where: { sessionId },
      }),
    ]);

    expect(stateResponse.status).toBe(httpStatus.ok);
    expect(statePayload.ok).toBe(true);
    expect(statePayload.data?.state.sceneId?.length).toBeGreaterThan(0);
    expect(statePayload.data?.state.player?.id).toBe("player");
    expect(repairedActorRows.length).toBeGreaterThan(0);
    expect(repairedRuntimeStateRow).not.toBeNull();
    expect(repairedSceneStateRow?.sceneMode).toBe("2d");
    expect(Array.isArray(repairedSceneCollisionRows)).toBe(true);
    expect(Array.isArray(repairedSceneNodeRows)).toBe(true);
    expect(Array.isArray(repairedSceneAssetRows)).toBe(true);
    expect(Array.isArray(repairedSceneAssetTagRows)).toBe(true);
    expect(Array.isArray(repairedSceneAssetVariantRows)).toBe(true);
    expect(Array.isArray(repairedNpcRows)).toBe(true);
    expect(Array.isArray(repairedNpcDialogueKeyRows)).toBe(true);
    expect(Array.isArray(repairedNpcDialogueEntryRows)).toBe(true);
    expect(Array.isArray(repairedQuestRows)).toBe(true);
    expect(Array.isArray(repairedFlagRows)).toBe(true);
  });

  test("game session save endpoint returns not found envelope for missing session", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionSave.replace(":id", "missing-session-id")), {
        method: "POST",
      }),
    );
    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    };

    expect(response.status).toBe(httpStatus.notFound);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("SESSION_NOT_FOUND");
  });

  test("builder endpoints support project read/write and dialogue mutation flow", async () => {
    const { response: createProjectResponse, payload: createProjectPayload } =
      await createBuilderProject();

    expect(createProjectResponse.status).toBe(httpStatus.ok);
    expect(createProjectPayload.ok).toBe(true);
    expect(createProjectPayload.data?.id.length).toBeGreaterThan(0);

    const projectId = createProjectPayload.data?.id ?? "";
    const dialogueKey = `contract-${Date.now()}`;

    const updateResponse = await app.handle(
      new Request(toUrl("/api/builder/dialogue"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          key: dialogueKey,
          locale: "en-US",
          text: "Builder contract check line.",
        }),
      }),
    );

    const updatePayload = (await updateResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly payload?: {
          readonly key: string;
          readonly text: string;
        };
      };
    };

    expect(updateResponse.status).toBe(httpStatus.ok);
    expect(updatePayload.ok).toBe(true);
    expect(updatePayload.data?.payload?.key).toBe(dialogueKey);
    expect(updatePayload.data?.payload?.text).toBe("Builder contract check line.");

    const detailResponse = await app.handle(
      new Request(
        toUrl(
          `/api/builder/dialogue/${encodeURIComponent(dialogueKey)}?projectId=${projectId}&locale=en-US`,
        ),
      ),
    );
    const detailHtml = await detailResponse.text();
    expect(detailResponse.status).toBe(httpStatus.ok);
    expect(detailHtml.includes(dialogueKey)).toBe(true);

    const removePayloadResponse = await app.handle(
      new Request(
        toUrl(
          `/api/builder/dialogue/${encodeURIComponent(dialogueKey)}?projectId=${projectId}&locale=en-US`,
        ),
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
          },
        },
      ),
    );
    const removePayload = (await removePayloadResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly result?: { readonly action: string };
      };
    };
    expect(removePayloadResponse.status).toBe(httpStatus.ok);
    expect(removePayload.ok).toBe(true);
    expect(removePayload.data?.result?.action).toBe("deleted");
  });

  test("scene node form updates preserve unspecified authored fields", async () => {
    const projectId = `scene-node-${Date.now()}`;
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
        nodes: [
          {
            id: "hero-marker",
            nodeType: "sprite",
            assetId: "asset-hero",
            animationClipId: "clip-idle",
            position: { x: 10, y: 20 },
            size: { width: 32, height: 48 },
            layer: "background",
          },
        ],
      },
    });

    const response = await app.handle(
      new Request(toUrl(`/api/builder/scenes/${teaHouse.id}/nodes`), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          locale: "en-US",
          id: "hero-marker",
          positionX: "44",
          positionY: "55",
        }),
      }),
    );
    const updatedScene = await builderService.getScene(projectId, teaHouse.id);
    const updatedNode = updatedScene?.nodes?.find((node) => node.id === "hero-marker");

    expect(response.status).toBe(httpStatus.ok);
    expect(updatedNode).toEqual({
      id: "hero-marker",
      nodeType: "sprite",
      assetId: "asset-hero",
      animationClipId: "clip-idle",
      position: { x: 44, y: 55 },
      size: { width: 32, height: 48 },
      layer: "background",
    });
  });

  test("scene form updates preserve authored collisions npcs and nodes", async () => {
    const projectId = `scene-form-${crypto.randomUUID()}`;
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
        collisions: [{ x: 1, y: 2, width: 3, height: 4 }],
        nodes: [
          {
            id: "draft-camera",
            nodeType: "camera",
            position: { x: 11, y: 22 },
            size: { width: 320, height: 180 },
            layer: "foreground",
          },
        ],
      },
    });

    const response = await app.handle(
      new Request(toUrl(`/api/builder/scenes/${teaHouse.id}/form`), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          locale: "en-US",
          titleKey: "scene.teaHouse.updated",
          geometryWidth: "800",
        }),
      }),
    );

    const updatedScene = await builderService.getScene(projectId, teaHouse.id);

    expect(response.status).toBe(httpStatus.ok);
    expect(updatedScene?.titleKey).toBe("scene.teaHouse.updated");
    expect(updatedScene?.geometry.width).toBe(800);
    expect(updatedScene?.geometry.height).toBe(teaHouse.geometry.height);
    expect(updatedScene?.npcs).toEqual(teaHouse.npcs);
    expect(updatedScene?.collisions).toEqual([{ x: 1, y: 2, width: 3, height: 4 }]);
    expect(updatedScene?.nodes).toEqual([
      {
        id: "draft-camera",
        nodeType: "camera",
        position: { x: 11, y: 22 },
        size: { width: 320, height: 180 },
        layer: "foreground",
      },
    ]);
  });

  test("scene persistence preserves the full authored node repertoire", async () => {
    const projectId = `scene-node-repertoire-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    await builderService.saveScene(projectId, {
      id: "scene.repertoire.2d",
      scene: {
        id: "scene.repertoire.2d",
        titleKey: "scene.repertoire.2d",
        background: "/images/repertoire-2d.png",
        sceneMode: "2d",
        geometry: { width: 640, height: 360 },
        spawn: { x: 32, y: 48 },
        npcs: [],
        collisions: [],
        nodes: [
          {
            id: "tile-1",
            nodeType: "tile",
            position: { x: 10, y: 20 },
            size: { width: 16, height: 16 },
            layer: "background",
          },
          {
            id: "camera-1",
            nodeType: "camera",
            position: { x: 30, y: 40 },
            size: { width: 320, height: 180 },
            layer: "foreground",
          },
        ],
      },
    });

    await builderService.saveScene(projectId, {
      id: "scene.repertoire.3d",
      scene: {
        id: "scene.repertoire.3d",
        titleKey: "scene.repertoire.3d",
        background: "/images/repertoire-3d.png",
        sceneMode: "3d",
        geometry: { width: 640, height: 360 },
        spawn: { x: 0, y: 0 },
        npcs: [],
        collisions: [],
        nodes: [
          {
            id: "spawn-3d",
            nodeType: "spawn",
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
          },
          {
            id: "trigger-3d",
            nodeType: "trigger",
            position: { x: 4, y: 5, z: 6 },
            rotation: { x: 0, y: 0.5, z: 0 },
            scale: { x: 2, y: 2, z: 2 },
          },
        ],
      },
    });

    const restored2d = await builderService.getScene(projectId, "scene.repertoire.2d");
    const restored3d = await builderService.getScene(projectId, "scene.repertoire.3d");

    expect(restored2d?.nodes).toEqual([
      {
        id: "tile-1",
        nodeType: "tile",
        position: { x: 10, y: 20 },
        size: { width: 16, height: 16 },
        layer: "background",
      },
      {
        id: "camera-1",
        nodeType: "camera",
        position: { x: 30, y: 40 },
        size: { width: 320, height: 180 },
        layer: "foreground",
      },
    ]);
    expect(restored3d?.nodes).toEqual([
      {
        id: "spawn-3d",
        nodeType: "spawn",
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      {
        id: "trigger-3d",
        nodeType: "trigger",
        position: { x: 4, y: 5, z: 6 },
        rotation: { x: 0, y: 0.5, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
      },
    ]);
  });

  test("npc form updates preserve unspecified dialogue keys and AI tuning", async () => {
    const projectId = `npc-form-${crypto.randomUUID()}`;
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

    await builderService.saveNpc(projectId, {
      sceneId: teaHouse.id,
      npc: {
        characterKey: "guide",
        labelKey: "npc.guide.name",
        x: 40,
        y: 50,
        dialogueKeys: ["guide.intro", "guide.followup"],
        interactRadius: 30,
        ai: {
          wanderRadius: 18,
          wanderSpeed: 1.5,
          idlePauseMs: [1000, 3000],
          greetOnApproach: true,
          greetLineKey: "guide.custom.greet",
        },
      },
    });

    const response = await app.handle(
      new Request(toUrl("/api/builder/npcs/guide/form"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          locale: "en-US",
          sceneId: teaHouse.id,
          x: "77",
        }),
      }),
    );

    const updatedNpc = await builderService.findNpc(projectId, "guide");

    expect(response.status).toBe(httpStatus.ok);
    expect(updatedNpc).toEqual({
      characterKey: "guide",
      labelKey: "npc.guide.name",
      x: 77,
      y: 50,
      dialogueKeys: ["guide.intro", "guide.followup"],
      interactRadius: 30,
      ai: {
        wanderRadius: 18,
        wanderSpeed: 1.5,
        idlePauseMs: [1000, 3000],
        greetOnApproach: true,
        greetLineKey: "guide.custom.greet",
      },
    });
  });

  test("quest form updates preserve additional authored steps", async () => {
    const projectId = `quest-form-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    await builderService.saveQuest(projectId, {
      id: "quest.branching",
      quest: {
        id: "quest.branching",
        title: "Original title",
        description: "Original description",
        steps: [
          {
            id: "quest.branching.step.1",
            title: "Step one",
            description: "First step",
            triggerId: "trigger.one",
          },
          {
            id: "quest.branching.step.2",
            title: "Step two",
            description: "Second step",
            triggerId: "trigger.two",
          },
        ],
      },
    });

    const response = await app.handle(
      new Request(toUrl("/api/builder/quests/quest.branching/form"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          locale: "en-US",
          id: "quest.branching",
          title: "Updated title",
          description: "Updated description",
          triggerId: "trigger.updated",
        }),
      }),
    );

    const updatedQuest = (await builderService.listQuests(projectId)).find(
      (candidate) => candidate.id === "quest.branching",
    );

    expect(response.status).toBe(httpStatus.ok);
    expect(updatedQuest).toEqual({
      id: "quest.branching",
      title: "Updated title",
      description: "Updated description",
      steps: [
        {
          id: "quest.branching.step.1",
          title: "Updated title",
          description: "Updated description",
          triggerId: "trigger.updated",
        },
        {
          id: "quest.branching.step.2",
          title: "Step two",
          description: "Second step",
          triggerId: "trigger.two",
        },
      ],
    });
  });

  test("builder project creation stores authored assets and clips outside the draft state blob", async () => {
    const projectId = `media-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    const snapshot = await builderService.getProject(projectId);
    expect(snapshot).not.toBeNull();
    if (!snapshot) {
      return;
    }

    const expectedTagCount = [...snapshot.assets.values()].reduce(
      (count, asset) => count + asset.tags.length,
      0,
    );
    const expectedVariantCount = [...snapshot.assets.values()].reduce(
      (count, asset) => count + asset.variants.length,
      0,
    );

    const [projectRow, assetCount, assetTagCount, assetVariantCount, clipCount] = await Promise.all(
      [
        prisma.builderProject.findUnique({
          where: { id: projectId },
          select: { state: true },
        }),
        prisma.builderProjectAsset.count({ where: { projectId } }),
        prisma.builderProjectAssetTag.count({ where: { projectId } }),
        prisma.builderProjectAssetVariant.count({ where: { projectId } }),
        prisma.builderProjectAnimationClip.count({ where: { projectId } }),
      ],
    );

    const stateRecord = asRecord(projectRow?.state);
    expect("assets" in stateRecord).toBe(false);
    expect("animationClips" in stateRecord).toBe(false);
    expect(assetCount).toBeGreaterThan(0);
    expect(assetTagCount).toBe(expectedTagCount);
    expect(assetVariantCount).toBe(expectedVariantCount);
    expect(clipCount).toBeGreaterThan(0);
  });

  test("builder project creation stores scenes and localized dialogue entries outside the draft state blob", async () => {
    const projectId = `content-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    const [
      projectRow,
      sceneCount,
      sceneCollisionCount,
      sceneNpcCount,
      sceneNodeCount,
      dialogueEntryCount,
    ] = await Promise.all([
      prisma.builderProject.findUnique({
        where: { id: projectId },
        select: { state: true },
      }),
      prisma.builderProjectScene.count({ where: { projectId } }),
      prisma.builderProjectSceneCollision.count({ where: { projectId } }),
      prisma.builderProjectSceneNpc.count({ where: { projectId } }),
      prisma.builderProjectSceneNode.count({ where: { projectId } }),
      prisma.builderProjectDialogueEntry.count({ where: { projectId } }),
    ]);

    const stateRecord = asRecord(projectRow?.state);
    expect("scenes" in stateRecord).toBe(false);
    expect("dialogues" in stateRecord).toBe(false);
    expect(sceneCount).toBeGreaterThan(0);
    expect(sceneCollisionCount).toBeGreaterThan(0);
    expect(sceneNpcCount).toBeGreaterThan(0);
    expect(sceneNodeCount).toBeGreaterThan(0);
    expect(dialogueEntryCount).toBeGreaterThan(0);
  });

  test("builder mechanics state stores dialogue graphs quests triggers and flags outside the draft state blob", async () => {
    const projectId = `mechanics-state-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const snapshot = await builderService.getProject(projectId);
    expect(snapshot).not.toBeNull();
    if (!snapshot) {
      return;
    }

    const [
      projectRow,
      dialogueGraphCount,
      dialogueGraphNodeCount,
      dialogueGraphEdgeCount,
      questCount,
      questStepCount,
      triggerCount,
      triggerRequiredFlagCount,
      triggerSetFlagCount,
      flagCount,
      flagRows,
    ] = await Promise.all([
      prisma.builderProject.findUnique({
        where: { id: projectId },
        select: { state: true },
      }),
      prisma.builderProjectDialogueGraph.count({ where: { projectId } }),
      prisma.builderProjectDialogueGraphNode.count({ where: { projectId } }),
      prisma.builderProjectDialogueGraphEdge.count({ where: { projectId } }),
      prisma.builderProjectQuest.count({ where: { projectId } }),
      prisma.builderProjectQuestStep.count({ where: { projectId } }),
      prisma.builderProjectTrigger.count({ where: { projectId } }),
      prisma.builderProjectTriggerRequiredFlag.count({ where: { projectId } }),
      prisma.builderProjectTriggerSetFlag.count({ where: { projectId } }),
      prisma.builderProjectFlag.count({ where: { projectId } }),
      prisma.builderProjectFlag.findMany({
        where: { projectId },
        select: {
          key: true,
          valueType: true,
          stringValue: true,
          numberValue: true,
          boolValue: true,
        },
      }),
    ]);

    const expectedDialogueGraphNodeCount = [...snapshot.dialogueGraphs.values()].reduce(
      (count, graph) => count + graph.nodes.length,
      0,
    );
    const expectedDialogueGraphEdgeCount = [...snapshot.dialogueGraphs.values()].reduce(
      (count, graph) =>
        count + graph.nodes.reduce((nodeCount, node) => nodeCount + node.edges.length, 0),
      0,
    );
    const expectedQuestStepCount = [...snapshot.quests.values()].reduce(
      (count, quest) => count + quest.steps.length,
      0,
    );
    const expectedTriggerRequiredFlagCount = [...snapshot.triggers.values()].reduce(
      (count, trigger) => count + Object.keys(trigger.requiredFlags ?? {}).length,
      0,
    );
    const expectedTriggerSetFlagCount = [...snapshot.triggers.values()].reduce(
      (count, trigger) => count + Object.keys(trigger.setFlags ?? {}).length,
      0,
    );

    const stateRecord = asRecord(projectRow?.state);
    expect("dialogueGraphs" in stateRecord).toBe(false);
    expect("quests" in stateRecord).toBe(false);
    expect("triggers" in stateRecord).toBe(false);
    expect("flags" in stateRecord).toBe(false);
    expect(dialogueGraphCount).toBeGreaterThan(0);
    expect(dialogueGraphNodeCount).toBe(expectedDialogueGraphNodeCount);
    expect(dialogueGraphEdgeCount).toBe(expectedDialogueGraphEdgeCount);
    expect(questCount).toBeGreaterThan(0);
    expect(questStepCount).toBe(expectedQuestStepCount);
    expect(triggerCount).toBeGreaterThan(0);
    expect(triggerRequiredFlagCount).toBe(expectedTriggerRequiredFlagCount);
    expect(triggerSetFlagCount).toBe(expectedTriggerSetFlagCount);
    expect(flagCount).toBeGreaterThan(0);
    expect(flagRows.length).toBe(flagCount);
    expect(
      flagRows.every(
        (row) =>
          row.valueType === "string" || row.valueType === "number" || row.valueType === "boolean",
      ),
    ).toBe(true);
  });

  test("builder worker state stores jobs artifacts and automation runs outside the draft state blob", async () => {
    const projectId = `worker-state-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    await builderService.saveGenerationJob(projectId, {
      id: "job.contract",
      job: {
        id: "job.contract",
        kind: "portrait",
        status: "queued",
        prompt: "Generate a reviewable portrait",
        artifactIds: [],
        statusMessage: "queued",
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      },
    });
    await builderService.saveAutomationRun(projectId, {
      id: "run.contract",
      run: {
        id: "run.contract",
        status: "queued",
        goal: "Capture builder review evidence",
        steps: [
          {
            id: "step.open-builder",
            action: "browser",
            summary: "automation.step.browser.goto",
            status: "pending",
            spec: {
              kind: "goto",
              path: `/builder?projectId=${projectId}`,
            },
          },
        ],
        artifactIds: [],
        statusMessage: "queued",
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      },
    });
    await builderService.processQueuedWork(projectId);

    const [
      projectRow,
      jobCount,
      jobArtifactCount,
      artifactCount,
      automationRunCount,
      automationRunStepCount,
      automationRunArtifactCount,
    ] = await Promise.all([
      prisma.builderProject.findUnique({
        where: { id: projectId },
        select: { state: true },
      }),
      prisma.builderProjectGenerationJob.count({ where: { projectId } }),
      prisma.builderProjectGenerationJobArtifact.count({ where: { projectId } }),
      prisma.builderProjectArtifact.count({ where: { projectId } }),
      prisma.builderProjectAutomationRun.count({ where: { projectId } }),
      prisma.builderProjectAutomationRunStep.count({ where: { projectId } }),
      prisma.builderProjectAutomationRunArtifact.count({ where: { projectId } }),
    ]);

    const snapshot = await builderService.getProject(projectId);
    expect(snapshot).not.toBeNull();
    if (!snapshot) {
      return;
    }

    const expectedJobArtifactCount = [...snapshot.generationJobs.values()].reduce(
      (count, job) => count + job.artifactIds.length,
      0,
    );
    const expectedAutomationRunStepCount = [...snapshot.automationRuns.values()].reduce(
      (count, run) => count + run.steps.length,
      0,
    );
    const expectedAutomationRunArtifactCount = [...snapshot.automationRuns.values()].reduce(
      (count, run) => count + run.artifactIds.length,
      0,
    );

    const stateRecord = asRecord(projectRow?.state);
    expect("generationJobs" in stateRecord).toBe(false);
    expect("artifacts" in stateRecord).toBe(false);
    expect("automationRuns" in stateRecord).toBe(false);
    expect(jobCount).toBeGreaterThan(0);
    expect(jobArtifactCount).toBe(expectedJobArtifactCount);
    expect(artifactCount).toBeGreaterThan(0);
    expect(automationRunCount).toBeGreaterThan(0);
    expect(automationRunStepCount).toBe(expectedAutomationRunStepCount);
    expect(automationRunArtifactCount).toBe(expectedAutomationRunArtifactCount);
  });

  test("game command queue overflow maps to conflict state", async () => {
    const createResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSession), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          locale: "en-US",
        }),
      }),
    );
    const createPayload = (await createResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    };
    const sessionCookie = readSessionCookieHeader(createResponse);
    const sessionId = createPayload.data?.sessionId ?? "";
    managedSessionIds.add(sessionId);
    const targetPath = appRoutes.gameApiSessionCommand.replace(":id", sessionId);

    const commandRequests = Array.from(
      { length: Math.max(1, appConfig.game.maxCommandsPerTick + 2) },
      (_, index) =>
        app.handle(
          new Request(toUrl(targetPath), {
            method: "POST",
            headers: {
              "content-type": "application/json",
              ...(sessionCookie ? { cookie: sessionCookie } : {}),
            },
            body: JSON.stringify({
              type: "interact",
              npcId: `overflow-${index}`,
            }),
          }),
        ),
    );
    const responses = await Promise.all(commandRequests);
    const conflictResponse = responses.find((response) => response.status === httpStatus.conflict);
    const commandPayload = conflictResponse
      ? ((await conflictResponse.json()) as {
          readonly ok: boolean;
          readonly error?: {
            readonly code: string;
            readonly message: string;
          };
        })
      : null;
    await Promise.all(
      responses.map((response) =>
        response === conflictResponse ? Promise.resolve() : drainResponseBody(response),
      ),
    );

    expect(createResponse.status).toBe(httpStatus.ok);
    expect(createPayload.ok).toBe(true);
    expect(sessionId.length).toBeGreaterThan(0);
    expect(conflictResponse).toBeDefined();
    expect(commandPayload?.ok).toBe(false);
    expect(commandPayload?.error?.code).toBe("CONFLICT");
    expect(commandPayload?.error?.message).toBe("Command queue is full.");
  });

  test("builder AI capabilities endpoint returns capability flags", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.aiBuilderCapabilities)));
    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly features?: {
          readonly assist: boolean;
          readonly test: boolean;
          readonly toolLikeSuggestions: boolean;
          readonly streaming: boolean;
          readonly offlineFallback: boolean;
        };
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(typeof payload.data?.features?.assist).toBe("boolean");
    expect(typeof payload.data?.features?.test).toBe("boolean");
  });

  test("builder platform readiness endpoint exposes partial and missing capability states", async () => {
    const projectId = `readiness-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builderPlatformReadiness}?projectId=${projectId}`)),
    );
    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly partialCount: number;
        readonly missingCount: number;
        readonly capabilities: ReadonlyArray<{
          readonly key: string;
          readonly status: string;
        }>;
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(payload.data?.partialCount).toBeGreaterThan(0);
    expect(payload.data?.missingCount).toBeGreaterThan(0);
    expect(
      payload.data?.capabilities.some(
        (capability) => capability.key === "automation" && capability.status === "partial",
      ),
    ).toBe(true);
    expect(
      payload.data?.capabilities.some(
        (capability) => capability.key === "runtime2d" && capability.status === "partial",
      ),
    ).toBe(true);
    expect(
      payload.data?.capabilities.some(
        (capability) => capability.key === "runtime3d" && capability.status === "missing",
      ),
    ).toBe(true);
  });

  test("AI status endpoint exposes local runtime and speech capabilities", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.aiStatus)));
    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly features?: {
          readonly speechToText: boolean;
          readonly speechSynthesis: boolean;
          readonly localInference: boolean;
        };
        readonly localRuntime?: {
          readonly transformers?: {
            readonly integration: string;
          };
          readonly onnx?: {
            readonly backend: string;
          };
          catalog?: Array<{
            key: string;
          }>;
        };
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(typeof payload.data?.features?.speechToText).toBe("boolean");
    expect(typeof payload.data?.features?.speechSynthesis).toBe("boolean");
    expect(typeof payload.data?.features?.localInference).toBe("boolean");
    expect(payload.data?.localRuntime?.transformers?.integration).toBe("huggingface");
    expect(payload.data?.localRuntime?.onnx?.backend).toBe(appConfig.ai.onnxDevice);
    expect(payload.data?.localRuntime?.catalog?.some((entry) => entry.key === "speechToText")).toBe(
      true,
    );
    expect(payload.data?.localRuntime?.catalog?.some((entry) => entry.key === "textToSpeech")).toBe(
      true,
    );
  });

  test("AI catalog endpoint exposes configurable local model targets", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.aiCatalog)));
    const payload = (await response.json()) as {
      readonly ok: boolean;
      readonly data?: {
        catalog?: Array<{
          configKey: string;
          model: string;
        }>;
      };
    };

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(payload.data?.catalog?.length).toBeGreaterThan(0);
    expect(
      payload.data?.catalog?.some(
        (entry) => entry.configKey === "AI_LOCAL_SPEECH_TO_TEXT_MODEL" && entry.model.length > 0,
      ),
    ).toBe(true);
  });

  test("AI knowledge routes ingest list and semantically search indexed documents", async () => {
    await withMockedEmbeddingGeneration(async () => {
      const projectId = `knowledge-${crypto.randomUUID()}`;
      await app.handle(
        new Request(toUrl(appRoutes.aiKnowledgeDocuments), {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            title: "Lighting Checklist",
            source: "design/lighting.md",
            text: [
              "Ambient lantern intensity should stay low in the tea house foyer.",
              "OpenUSD variants should keep source fidelity before conversion.",
            ].join("\n\n"),
            locale: "en-US",
          }),
        }),
      );
      const ingestResponse = await app.handle(
        new Request(toUrl(appRoutes.aiKnowledgeDocuments), {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            title: "Combat Design Notes",
            source: "design/combat.md",
            text: [
              "The tea guardian encounter should use stamina instead of mana.",
              "Parry timing should reward controller-role co-op players with a stagger window.",
              "OpenUSD props should remain source assets until converted to runtime variants.",
            ].join("\n\n"),
            locale: "en-US",
          }),
        }),
      );
      if (!ingestResponse.ok) {
        console.error("INGEST ERROR:", await ingestResponse.clone().text());
      }
      const ingestPayload = (await ingestResponse.json()) as {
        readonly ok: boolean;
        readonly data?: {
          readonly id: string;
          readonly projectId: string | null;
          readonly chunkCount: number;
        };
      };

      const listResponse = await app.handle(
        new Request(toUrl(`${appRoutes.aiKnowledgeDocuments}?projectId=${projectId}`)),
      );
      const listPayload = (await listResponse.json()) as {
        readonly ok: boolean;
        readonly data?: {
          readonly documents?: ReadonlyArray<{
            readonly id: string;
            readonly projectId: string | null;
            readonly chunkCount: number;
          }>;
        };
      };

      const searchResponse = await app.handle(
        new Request(toUrl(appRoutes.aiKnowledgeSearch), {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            query: "How should parry timing work for co-op players?",
            locale: "en-US",
            limit: 3,
          }),
        }),
      );
      const searchPayload = (await searchResponse.json()) as {
        readonly ok: boolean;
        readonly data?: {
          readonly matches?: ReadonlyArray<{
            readonly title: string;
            readonly source: string;
            readonly text: string;
            readonly score: number;
          }>;
        };
      };
      const termCount = await prismaBase.aiKnowledgeChunkTerm.count({
        where: {
          chunk: {
            document: {
              projectId,
            },
          },
        },
      });

      expect(ingestResponse.status).toBe(httpStatus.ok);
      expect(ingestPayload.ok).toBe(true);
      expect(ingestPayload.data?.projectId).toBe(projectId);
      expect((ingestPayload.data?.chunkCount ?? 0) > 0).toBe(true);

      expect(listResponse.status).toBe(httpStatus.ok);
      expect(listPayload.ok).toBe(true);
      expect(
        listPayload.data?.documents?.some((document) => document.projectId === projectId),
      ).toBe(true);

      expect(searchResponse.status).toBe(httpStatus.ok);
      expect(searchPayload.ok).toBe(true);
      expect(searchPayload.data?.matches?.length).toBeGreaterThan(0);
      expect(searchPayload.data?.matches?.[0]?.title).toBe("Combat Design Notes");
      expect(searchPayload.data?.matches?.[0]?.source).toBe("design/combat.md");
      expect(searchPayload.data?.matches?.[0]?.text.includes("Parry timing")).toBe(true);
      expect(typeof searchPayload.data?.matches?.[0]?.score).toBe("number");
      expect(termCount).toBeGreaterThan(0);
    });
  });

  test("AI knowledge routes delete indexed documents", async () => {
    await withMockedEmbeddingGeneration(async () => {
      const projectId = `knowledge-delete-${crypto.randomUUID()}`;
      const ingestResponse = await app.handle(
        new Request(toUrl(appRoutes.aiKnowledgeDocuments), {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            title: "Delete Me",
            source: "notes/delete.md",
            text: "Temporary indexed text.",
            locale: "en-US",
          }),
        }),
      );
      const ingestPayload = (await ingestResponse.json()) as {
        readonly ok: boolean;
        readonly data?: { readonly id: string };
      };

      const deleteResponse = await app.handle(
        new Request(
          toUrl(
            `${appRoutes.aiKnowledgeDocuments}/${ingestPayload.data?.id}?projectId=${encodeURIComponent(projectId)}`,
          ),
          {
            method: "DELETE",
          },
        ),
      );
      const deletePayload = (await deleteResponse.json()) as {
        readonly ok: boolean;
        readonly data?: { readonly deleted: boolean };
      };

      expect(deleteResponse.status).toBe(httpStatus.ok);
      expect(deletePayload.ok).toBe(true);
      expect(deletePayload.data?.deleted).toBe(true);
    });
  });
});

describe("HTMX partial rendering", () => {
  test("home page renders accessible responsive navigation", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.home)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(response.headers.get("content-type")?.includes(contentType.htmlUtf8)).toBe(true);
    expect(html.includes("Open navigation menu")).toBe(true);
    expect(html.includes('aria-label="Primary navigation"')).toBe(true);
    expect(html.includes("Skip to main content")).toBe(true);
    expect(html.includes('aria-label="Mobile navigation"')).toBe(true);
    expect(html.includes('aria-current="page"')).toBe(true);
    expect(html.includes("/builder?lang=en-US")).toBe(true);
    expect(html.includes("/game?lang=en-US")).toBe(true);
    expect(html.includes('name="lang" value="en-US"')).toBe(true);
    expect(html.includes('hx-params="*"')).toBe(true);
    expect(html.includes('aria-label="Switch language to Chinese"')).toBe(true);
    expect(html.includes('data-drawer-toggle-target="main-nav-drawer"')).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/layout-controls.js")).toBe(true);
  });

  test("oracle form preserves locale in progressive-enhancement flow", async () => {
    const response = await app.handle(new Request(toUrl(`${appRoutes.home}?lang=zh-CN`)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes('name="lang" value="zh-CN"')).toBe(true);
    expect(html.includes('action="/"')).toBe(true);
    expect(html.includes('hx-get="/partials/ai-playground"')).toBe(true);
    expect(html.includes('hx-ext="oracle-indicator"')).toBe(true);
    expect(html.includes('data-loading-title="正在创建"')).toBe(true);
    expect(html.includes('aria-label="切换到英文"')).toBe(true);
  });

  test("feature scripts are scoped to the home page", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.home)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("/public/vendor/htmx-ext/layout-controls.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/oracle-indicator.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/focus-panel.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/game-hud.js")).toBe(false);
  });

  test("builder AI page renders knowledge and tool-planning workspaces", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builderAi}?projectId=default`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("Knowledge workspace")).toBe(true);
    expect(html.includes(appRoutes.aiBuilderKnowledgeDocuments)).toBe(true);
    expect(html.includes(appRoutes.aiBuilderKnowledgeSearch)).toBe(true);
    expect(html.includes(appRoutes.aiBuilderToolPlan)).toBe(true);
    expect(html.includes("Tool plan preview")).toBe(true);
  });

  test("home route handles non-js oracle form fallback as full SSR page", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.home}?lang=en-US&question=river%20trade&mode=auto`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.toLowerCase().includes("<!doctype html>")).toBe(true);
    expect(html.includes('id="oracle-panel"')).toBe(true);
    expect(html.includes("AI Assistant")).toBe(true);
    expect(html.includes('value="river trade"')).toBe(true);
    expect(html.includes('href="/?lang=zh-CN&amp;question=river+trade&amp;mode=auto"')).toBe(true);
  });

  test("locale resolver parses Accept-Language priority list", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.home), {
        headers: {
          "accept-language": "fr-FR, zh-CN;q=0.8, en-US;q=0.7",
        },
      }),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes('lang="zh-CN"')).toBe(true);
    expect(html.includes('name="lang" value="zh-CN"')).toBe(true);
  });

  test("locale resolver honors q-weight priority", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.home), {
        headers: {
          "accept-language": "en-US;q=0.2, zh-CN;q=0.9",
        },
      }),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes('lang="zh-CN"')).toBe(true);
    expect(html.includes('name="lang" value="zh-CN"')).toBe(true);
  });

  test("locale resolver excludes zero-quality languages", async () => {
    const response = await app.handle(
      new Request(toUrl(appRoutes.home), {
        headers: {
          "accept-language": "zh-CN;q=0, en-US;q=0.5",
        },
      }),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes('lang="en-US"')).toBe(true);
    expect(html.includes('name="lang" value="en-US"')).toBe(true);
  });

  test("query locale takes precedence over accept-language", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.home}?lang=en-US`), {
        headers: {
          "accept-language": "zh-CN, en-US;q=0.7",
        },
      }),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes('lang="en-US"')).toBe(true);
    expect(html.includes('name="lang" value="en-US"')).toBe(true);
  });

  test("oracle partial returns panel markup", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.aiPlaygroundPartial}?question=test&mode=auto&lang=en-US`), {
        headers: {
          "hx-request": "true",
        },
      }),
    );

    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(response.headers.get("content-type")?.includes(contentType.htmlUtf8)).toBe(true);
    expect(html.includes('id="oracle-panel"')).toBe(true);
  });

  test("oracle partial supports Chinese locale", async () => {
    const response = await app.handle(
      new Request(
        toUrl(
          `${appRoutes.aiPlaygroundPartial}?question=%E6%B2%B3%E9%81%93%E8%B7%AF%E7%BA%BF&lang=zh-CN`,
        ),
      ),
    );

    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("生成内容")).toBe(true);
  });

  test("oracle partial avoids inline event handlers", async () => {
    const response = await app.handle(
      new Request(
        toUrl(`${appRoutes.aiPlaygroundPartial}?mode=force-retryable-error&question=retry`),
      ),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("onclick=")).toBe(false);
    expect(html.includes('form="oracle-form"')).toBe(true);
  });

  test("game page renders a single canonical HUD target and page-scoped assets", async () => {
    const response = await app.handle(new Request(toUrl(`${appRoutes.game}?lang=en-US`)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(response.headers.get("content-type")?.includes(contentType.htmlUtf8)).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/game-hud.js")).toBe(false);
    expect(html.includes('hx-ext="sse"')).toBe(true);
    expect(html.includes('hx-ext="sse,game-hud"')).toBe(false);
    expect(html.includes("/public/vendor/htmx-ext/oracle-indicator.js")).toBe(false);
    expect(countOccurrences(html, 'data-hud-slot="hud-xp"')).toBe(1);
    expect(html.includes('data-connected-label="connected"')).toBe(true);
    expect(html.includes('name="game-client-command-send-interval-ms"')).toBe(true);
    expect(html.includes('name="game-client-command-ttl-ms"')).toBe(true);
    expect(html.includes('name="game-client-socket-reconnect-delay-ms"')).toBe(true);
    expect(html.includes('name="game-client-restore-request-timeout-ms"')).toBe(true);
    expect(html.includes('name="game-client-restore-max-attempts"')).toBe(true);
    expect(html.includes('hx-boost="false"')).toBe(true);
    expect(countOccurrences(html, 'id="main-content"')).toBe(1);
    expect(html.includes('role="img"')).toBe(false);
    expect(html.includes('id="game-canvas-wrapper"')).toBe(true);
    expect(html.includes('tabindex="0"')).toBe(true);
    expect(html.includes("data-runtime-focus-active-label=")).toBe(true);
    expect(html.includes('id="game-runtime-help"')).toBe(true);
    expect(html.includes('id="game-controls-list"')).toBe(true);
    expect(html.includes("No project bound")).toBe(true);
    expect(html.includes(">English<")).toBe(true);
    expect(html.includes("Scene mode")).toBe(true);
    expect(html.includes('id="game-scene-title-heading"')).toBe(true);
    expect(html.includes('sse-swap="scene-title-heading"')).toBe(true);
    expect(html.includes('id="game-objective-card"')).toBe(true);
    expect(html.includes('sse-swap="objective-card"')).toBe(true);
    expect(html.includes('id="game-scene-mode-value"')).toBe(true);
    expect(html.includes('sse-swap="scene-mode"')).toBe(true);
  });

  test("builder dashboard preserves locale-aware navigation links", async () => {
    const projectId = `builder-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builder}?lang=zh-CN&projectId=${projectId}`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes(`/game?lang=zh-CN&amp;projectId=${projectId}`)).toBe(true);
    expect(html.includes(`/builder/scenes?lang=zh-CN&amp;projectId=${projectId}`)).toBe(true);
    expect(html.includes(`/builder/npcs?lang=zh-CN&amp;projectId=${projectId}`)).toBe(true);
    expect(html.includes(`/builder/ai?lang=zh-CN&amp;projectId=${projectId}`)).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/focus-panel.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/layout-controls.js")).toBe(true);
    expect(html.includes("/public/vendor/builder-scene-editor.js")).toBe(true);
    expect(html.includes('id="builder-project-shell"')).toBe(true);
    expect(html.includes(projectId)).toBe(true);
    expect(html.includes('id="builder-platform-readiness"')).toBe(true);
    expect(html.includes('href="#"')).toBe(false);
    expect(html.includes("退出构建器")).toBe(true);
  });

  test("mechanics workspace detail pane uses the shared focus-panel contract", async () => {
    const projectId = `mechanics-focus-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builderMechanics}?lang=en-US&projectId=${projectId}`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes('id="mechanics-detail"')).toBe(true);
    expect(html.includes('data-focus-panel="true"')).toBe(true);
    expect(html.includes('hx-ext="focus-panel"')).toBe(true);
    expect(html.includes('tabindex="-1"')).toBe(true);
  });

  test("scene editor preview avoids inline style attributes", async () => {
    const projectId = `scene-preview-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builderScenes}?lang=en-US&projectId=${projectId}`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("<svg")).toBe(true);
    expect(html.includes("style=")).toBe(false);
    expect(html.includes("data-scene-editor")).toBe(true);
    expect(html.includes("data-scene-node-form")).toBe(true);
    expect(html.includes("data-scene-selected-node")).toBe(true);
  });

  test("builder assets page makes sprite and animation pipeline gaps explicit", async () => {
    const projectId = `assets-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builderAssets}?lang=en-US&projectId=${projectId}`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("Sprite pipeline")).toBe(true);
    expect(html.includes("Animation pipeline")).toBe(true);
    expect(html.includes("Platform readiness")).toBe(true);
  });

  test("builder asset creation preserves OpenUSD source metadata and runtime variant policy", async () => {
    const projectId = `usd-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    const usdzAssetId = `asset-${crypto.randomUUID().slice(0, 8)}`;
    const usdzResponse = await app.handle(
      new Request(toUrl("/api/builder/assets/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: usdzAssetId,
          label: "Tea House USDZ",
          kind: "model",
          sceneMode: "3d",
          source: "/assets/models/tea-house.usdz",
        }).toString(),
      }),
    );

    const usdAssetId = `asset-${crypto.randomUUID().slice(0, 8)}`;
    const usdResponse = await app.handle(
      new Request(toUrl("/api/builder/assets/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: usdAssetId,
          label: "Tea House USDA",
          kind: "model",
          sceneMode: "3d",
          source: "/assets/models/tea-house.usda",
        }).toString(),
      }),
    );

    const project = await builderService.getProject(projectId);
    const usdzAsset = project?.assets.get(usdzAssetId);
    const usdAsset = project?.assets.get(usdAssetId);

    expect(usdzResponse.status).toBe(httpStatus.ok);
    expect(usdResponse.status).toBe(httpStatus.ok);
    expect(usdzAsset?.sourceFormat).toBe("usdz");
    expect(usdzAsset?.variants.some((variant) => variant.usage === "runtime")).toBe(true);
    expect(usdAsset?.sourceFormat).toBe("usda");
    expect(usdAsset?.variants.every((variant) => variant.usage === "source")).toBe(true);
  });

  test("builder AI page exposes AI authoring and automation readiness", async () => {
    const projectId = `ai-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builderAi}?lang=en-US&projectId=${projectId}`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("AI authoring")).toBe(true);
    expect(html.includes("Automation / RPA")).toBe(true);
    expect(html.includes("Platform readiness")).toBe(true);
  });

  test("builder publish shell exposes play link for published projects", async () => {
    const projectId = `publish-${crypto.randomUUID()}`;
    const { payload } = await createBuilderProject(projectId);
    expect(payload.ok).toBe(true);

    const publishResponse = await app.handle(
      new Request(toUrl(`/api/builder/projects/${projectId}/publish`), {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          accept: "text/html",
        },
        body: JSON.stringify({
          published: true,
          locale: "en-US",
          currentPath: appRoutes.builder,
        }),
      }),
    );
    const publishHtml = await publishResponse.text();

    expect(publishResponse.status).toBe(httpStatus.ok);
    expect(publishHtml.includes('id="builder-project-shell"')).toBe(true);
    expect(publishHtml.includes(`/game?lang=en-US&amp;projectId=${projectId}`)).toBe(true);
    expect(publishHtml.includes("/api/builder/projects/")).toBe(true);
  });

  test("builder publish rejects invalid scene node asset references", async () => {
    const projectId = `publish-invalid-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    const [scene] = await builderService.listScenes(projectId);
    expect(scene).toBeDefined();
    if (!scene) {
      return;
    }

    await builderService.saveSceneNode(projectId, {
      sceneId: scene.id,
      id: `node-${crypto.randomUUID().slice(0, 8)}`,
      nodeType: "sprite",
      assetId: "missing-asset",
    });

    let publishError: unknown = null;
    try {
      await builderService.publishProject(projectId, true);
    } catch (error) {
      publishError = error;
    }

    expect(publishError).toBeInstanceOf(BuilderPublishValidationError);
    if (publishError instanceof BuilderPublishValidationError) {
      expect(publishError.issues.some((issue) => issue.code === "scene-node-asset-missing")).toBe(
        true,
      );
    }

    const publishResponse = await app.handle(
      new Request(toUrl(`/api/builder/projects/${projectId}/publish`), {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          published: true,
          locale: "en-US",
          currentPath: appRoutes.builder,
        }),
      }),
    );

    const payload = (await publishResponse.json()) as {
      readonly ok: false;
      readonly error: {
        readonly code: string;
        readonly message: string;
      };
    };

    expect(publishResponse.status).toBe(httpStatus.unprocessableEntity);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(payload.error.message.includes("Publish blocked until builder validation passes.")).toBe(
      true,
    );
    expect(payload.error.message.includes("references missing asset missing-asset.")).toBe(true);
  });

  test("builder HTML form mutations refresh the project shell out-of-band", async () => {
    const projectId = `forms-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const sceneId = `scene-${crypto.randomUUID().slice(0, 8)}`;
    const npcId = `npc-${crypto.randomUUID().slice(0, 8)}`;
    const dialogueKey = `npc.${npcId}.intro`;

    const sceneResponse = await app.handle(
      new Request(toUrl("/api/builder/scenes/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: sceneId,
          titleKey: `${sceneId}.title`,
          background: gameAssetUrls.teaHouseBackground,
          geometryWidth: "640",
          geometryHeight: "360",
          spawnX: "320",
          spawnY: "180",
        }).toString(),
      }),
    );
    const sceneHtml = await sceneResponse.text();

    expect(sceneResponse.status).toBe(httpStatus.ok);
    expect(sceneHtml.includes('hx-swap-oob="outerHTML"')).toBe(true);
    expect(sceneHtml.includes(sceneId)).toBe(true);
    expect(sceneHtml.includes("style=")).toBe(false);
    expect(sceneHtml.includes('data-focus-panel="true"')).toBe(true);

    const npcResponse = await app.handle(
      new Request(toUrl("/api/builder/npcs/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          sceneId,
          characterKey: npcId,
          labelKey: `${npcId}.label`,
        }).toString(),
      }),
    );
    const npcHtml = await npcResponse.text();

    expect(npcResponse.status).toBe(httpStatus.ok);
    expect(npcHtml.includes('hx-swap-oob="outerHTML"')).toBe(true);
    expect(npcHtml.includes(npcId)).toBe(true);

    const dialogueResponse = await app.handle(
      new Request(toUrl("/api/builder/dialogue/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          key: dialogueKey,
          text: "Fresh builder line.",
        }).toString(),
      }),
    );
    const dialogueHtml = await dialogueResponse.text();

    expect(dialogueResponse.status).toBe(httpStatus.ok);
    expect(dialogueHtml.includes('hx-swap-oob="outerHTML"')).toBe(true);
    expect(dialogueHtml.includes(dialogueKey)).toBe(true);
  });

  test("builder creator workspaces render and round-trip authored asset, mechanics, and automation forms", async () => {
    const projectId = `creator-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    const mechanicsPageResponse = await app.handle(
      new Request(toUrl(`${appRoutes.builderMechanics}?lang=en-US&projectId=${projectId}`)),
    );
    const mechanicsPageHtml = await mechanicsPageResponse.text();
    expect(mechanicsPageResponse.status).toBe(httpStatus.ok);
    expect(mechanicsPageHtml.includes('id="builder-project-shell"')).toBe(true);
    expect(mechanicsPageHtml.includes("Quests")).toBe(true);

    const automationPageResponse = await app.handle(
      new Request(toUrl(`${appRoutes.builderAutomation}?lang=en-US&projectId=${projectId}`)),
    );
    const automationPageHtml = await automationPageResponse.text();
    expect(automationPageResponse.status).toBe(httpStatus.ok);
    expect(automationPageHtml.includes('id="builder-project-shell"')).toBe(true);
    expect(automationPageHtml.includes("Automation workspace")).toBe(true);

    const uploadAssetId = `upload-${crypto.randomUUID().slice(0, 8)}`;
    const uploadPayload = new FormData();
    uploadPayload.set("projectId", projectId);
    uploadPayload.set("locale", "en-US");
    uploadPayload.set("id", uploadAssetId);
    uploadPayload.set("label", "Uploaded Builder Portrait");
    uploadPayload.set("kind", "portrait");
    uploadPayload.set("sceneMode", "2d");
    uploadPayload.set(
      "file",
      new File([new Uint8Array([137, 80, 78, 71])], "portrait.png", { type: "image/png" }),
    );
    const uploadResponse = await app.handle(
      new Request(toUrl(appRoutes.builderApiAssetsUpload), {
        method: "POST",
        headers: {
          accept: "text/html",
        },
        body: uploadPayload,
      }),
    );
    const uploadHtml = await uploadResponse.text();
    expect(uploadResponse.status).toBe(httpStatus.ok);
    expect(uploadHtml.includes(uploadAssetId)).toBe(true);

    const assetId = `asset-${crypto.randomUUID().slice(0, 8)}`;
    const assetResponse = await app.handle(
      new Request(toUrl("/api/builder/assets/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: assetId,
          label: "Creator Portrait",
          kind: "portrait",
          sceneMode: "2d",
          source: "/assets/images/custom/creator-portrait.png",
        }).toString(),
      }),
    );
    const assetHtml = await assetResponse.text();
    expect(assetResponse.status).toBe(httpStatus.ok);
    expect(assetHtml.includes('hx-swap-oob="outerHTML"')).toBe(true);
    expect(assetHtml.includes(assetId)).toBe(true);

    const clipId = `clip-${crypto.randomUUID().slice(0, 8)}`;
    const clipResponse = await app.handle(
      new Request(toUrl("/api/builder/animation-clips/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: clipId,
          assetId,
          stateTag: "idle-down",
          frameCount: "4",
          playbackFps: "8",
        }).toString(),
      }),
    );
    const clipHtml = await clipResponse.text();
    expect(clipResponse.status).toBe(httpStatus.ok);
    expect(clipHtml.includes(clipId)).toBe(true);

    const generationResponse = await app.handle(
      new Request(toUrl("/api/builder/generation-jobs/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          kind: "portrait",
          prompt: "Generate a review-ready tea trader portrait.",
          targetId: assetId,
        }).toString(),
      }),
    );
    const generationHtml = await generationResponse.text();
    expect(generationResponse.status).toBe(httpStatus.ok);
    expect(generationHtml.includes("Queued")).toBe(true);
    await builderService.processQueuedWork(projectId);
    const refreshedAssetsResponse = await app.handle(
      new Request(
        toUrl(
          withQueryParameters(appRoutes.builderAssets, {
            projectId,
            locale: "en-US",
          }),
        ),
      ),
    );
    const refreshedAssetsHtml = await refreshedAssetsResponse.text();
    expect(refreshedAssetsResponse.status).toBe(httpStatus.ok);
    expect(refreshedAssetsHtml.includes("Awaiting approval")).toBe(true);
    expect(refreshedAssetsHtml.includes("Review Portrait")).toBe(true);
    expect(refreshedAssetsHtml.includes("Generated draft for")).toBe(true);
    expect(refreshedAssetsHtml.includes("generation.artifact.label.review:portrait")).toBe(false);
    expect(refreshedAssetsHtml.includes("generation.artifact.summary.target:")).toBe(false);
    const generationJobIdMatch = refreshedAssetsHtml.match(/generation-jobs\/([^/"?]+)\/approve/);
    expect(generationJobIdMatch).not.toBeNull();
    const generationJobId = generationJobIdMatch?.[1];
    expect(generationJobId).toBeDefined();
    if (!generationJobId) {
      return;
    }

    const generationStreamResponse = await app.handle(
      new Request(
        toUrl(
          withQueryParameters(
            appRoutes.builderApiGenerationJobStream.replace(":jobId", generationJobId),
            {
              projectId,
              locale: "en-US",
            },
          ),
        ),
        {
          headers: {
            accept: "text/event-stream",
          },
        },
      ),
    );
    const generationStreamText = await readSseUntil(
      generationStreamResponse,
      (content) => content.includes('"ok":true') && content.includes(generationJobId),
    );
    expect(generationStreamResponse.status).toBe(httpStatus.ok);
    expect(generationStreamResponse.headers.get("content-type")).toContain("text/event-stream");
    expect(generationStreamText.includes('"ok":true')).toBe(true);
    expect(generationStreamText.includes(generationJobId)).toBe(true);

    const generationApproveResponse = await app.handle(
      new Request(toUrl(`/api/builder/generation-jobs/${generationJobId}/approve`), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          approved: "true",
        }).toString(),
      }),
    );
    const generationApproveHtml = await generationApproveResponse.text();
    expect(generationApproveResponse.status).toBe(httpStatus.ok);
    expect(generationApproveHtml.includes("Succeeded")).toBe(true);
    expect(generationApproveHtml.includes(`asset.generated.${generationJobId}`)).toBe(true);
    expect(generationApproveHtml.includes("Generated Portrait")).toBe(true);
    expect(generationApproveHtml.includes("generation.asset.label.generated:portrait")).toBe(false);

    const triggerId = `trigger-${crypto.randomUUID().slice(0, 8)}`;
    const triggerResponse = await app.handle(
      new Request(toUrl("/api/builder/triggers/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: triggerId,
          label: "Meet the builder guide",
          event: "npc-interact",
          sceneId: "teaHouse",
          npcId: "teaMonk",
        }).toString(),
      }),
    );
    const triggerHtml = await triggerResponse.text();
    expect(triggerResponse.status).toBe(httpStatus.ok);
    expect(triggerHtml.includes(triggerId)).toBe(true);
    const createdTrigger = (await builderService.listTriggers(projectId)).find(
      (candidate) => candidate.id === triggerId,
    );
    expect(createdTrigger).toEqual({
      id: triggerId,
      label: "Meet the builder guide",
      event: "npc-interact",
      sceneId: "teaHouse",
      npcId: "teaMonk",
    });

    const questId = `quest-${crypto.randomUUID().slice(0, 8)}`;
    const questResponse = await app.handle(
      new Request(toUrl("/api/builder/quests/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: questId,
          title: "Builder intro",
          description: "Walk through the first authored mechanic.",
          triggerId,
        }).toString(),
      }),
    );
    const questHtml = await questResponse.text();
    expect(questResponse.status).toBe(httpStatus.ok);
    expect(questHtml.includes(questId)).toBe(true);
    const createdQuest = (await builderService.listQuests(projectId)).find(
      (candidate) => candidate.id === questId,
    );
    expect(createdQuest).toEqual({
      id: questId,
      title: "Builder intro",
      description: "Walk through the first authored mechanic.",
      steps: [
        {
          id: `${questId}.step.1`,
          title: "Builder intro",
          description: "Walk through the first authored mechanic.",
          triggerId,
        },
      ],
    });

    const graphId = `graph-${crypto.randomUUID().slice(0, 8)}`;
    const graphResponse = await app.handle(
      new Request(toUrl("/api/builder/dialogue-graphs/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          id: graphId,
          title: "Guide intro graph",
          npcId: "teaMonk",
          line: "npc.teaMonk.greet",
        }).toString(),
      }),
    );
    const graphHtml = await graphResponse.text();
    expect(graphResponse.status).toBe(httpStatus.ok);
    expect(graphHtml.includes(graphId)).toBe(true);
    const createdGraph = (await builderService.listDialogueGraphs(projectId)).find(
      (candidate) => candidate.id === graphId,
    );
    expect(createdGraph?.id).toBe(graphId);
    expect(createdGraph?.title).toBe("Guide intro graph");
    expect(createdGraph?.npcId).toBe("teaMonk");
    expect(createdGraph?.rootNodeId).toBe("root");
    expect(createdGraph?.nodes).toEqual([
      {
        id: "root",
        line: "npc.teaMonk.greet",
        edges: [],
      },
    ]);

    const automationResponse = await app.handle(
      new Request(toUrl("/api/builder/automation-runs/create/form"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          goal: "Collect builder review evidence for the new quest flow.",
        }).toString(),
      }),
    );
    const automationHtml = await automationResponse.text();
    expect(automationResponse.status).toBe(httpStatus.ok);
    expect(automationHtml.includes("Queued")).toBe(true);
    await builderService.processQueuedWork(projectId);
    const refreshedAutomationResponse = await app.handle(
      new Request(
        toUrl(
          withQueryParameters(appRoutes.builderAutomation, {
            projectId,
            locale: "en-US",
          }),
        ),
      ),
    );
    const refreshedAutomationHtml = await refreshedAutomationResponse.text();
    expect(refreshedAutomationResponse.status).toBe(httpStatus.ok);
    expect(refreshedAutomationHtml.includes("Failed")).toBe(true);
    expect(
      refreshedAutomationHtml.includes(
        "Local builder automation origin is unavailable. Start the builder runtime and retry.",
      ),
    ).toBe(true);
    expect(refreshedAutomationHtml.includes("automation-origin-unreachable")).toBe(false);
    expect(refreshedAutomationHtml.includes("/approve")).toBe(false);
  });

  test("AI patch preview and apply form routes expose review flow and refresh project shell", async () => {
    const projectId = `patch-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const operationsJson = JSON.stringify([
      {
        op: "replace",
        path: "/dialogues/en-US/npc.teaMonk.greet",
        value: "Reviewed patch line.",
      },
    ]);

    const previewResponse = await app.handle(
      new Request(toUrl(appRoutes.aiBuilderPatchPreviewForm), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          operationsJson,
        }).toString(),
      }),
    );
    const previewHtml = await previewResponse.text();

    expect(previewResponse.status).toBe(httpStatus.ok);
    expect(previewHtml.includes('name="expectedVersion"')).toBe(true);
    expect(previewHtml.includes(appRoutes.aiBuilderPatchApplyForm)).toBe(true);

    const applyResponse = await app.handle(
      new Request(toUrl(appRoutes.aiBuilderPatchApplyForm), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          expectedVersion: "1",
          operationsJson,
        }).toString(),
      }),
    );
    const applyHtml = await applyResponse.text();

    expect(applyResponse.status).toBe(httpStatus.ok);
    expect(applyHtml.includes('hx-swap-oob="outerHTML"')).toBe(true);
    expect(applyHtml.includes('id="builder-project-shell"')).toBe(true);
  });

  test("game route renders explicit missing and unpublished project states", async () => {
    const missingProjectId = `missing-${crypto.randomUUID()}`;
    const missingResponse = await app.handle(
      new Request(toUrl(`${appRoutes.game}?projectId=${missingProjectId}`)),
    );
    const missingHtml = await missingResponse.text();

    expect(missingResponse.status).toBe(httpStatus.ok);
    expect(missingHtml.includes(missingProjectId)).toBe(true);
    expect(missingHtml.includes(`/builder?lang=en-US&amp;projectId=${missingProjectId}`)).toBe(
      true,
    );
    expect(missingHtml.includes('id="game-canvas-wrapper"')).toBe(false);

    const unpublishedProjectId = `unpublished-${crypto.randomUUID()}`;
    await createBuilderProject(unpublishedProjectId);
    const unpublishedResponse = await app.handle(
      new Request(toUrl(`${appRoutes.game}?projectId=${unpublishedProjectId}`)),
    );
    const unpublishedHtml = await unpublishedResponse.text();

    expect(unpublishedResponse.status).toBe(httpStatus.ok);
    expect(unpublishedHtml.includes(unpublishedProjectId)).toBe(true);
    expect(
      unpublishedHtml.includes(`/builder?lang=en-US&amp;projectId=${unpublishedProjectId}`),
    ).toBe(true);
    expect(unpublishedHtml.includes('id="game-canvas-wrapper"')).toBe(false);
  });

  test("game route renders a deterministic session-unavailable state when hydration fails", async () => {
    const originalGetSessionState = gameLoop.getSessionState.bind(gameLoop);

    gameLoop.getSessionState = async () => null;

    try {
      const response = await app.handle(new Request(toUrl(`${appRoutes.game}?lang=en-US`)));
      const html = await response.text();

      expect(response.status).toBe(httpStatus.ok);
      expect(html.includes("Session could not be restored")).toBe(true);
      expect(html.includes('id="game-canvas-wrapper"')).toBe(false);
    } finally {
      gameLoop.getSessionState = originalGetSessionState;
    }
  });

  test("tool planning route returns structured steps", async () => {
    const registry = await ProviderRegistry.getInstance();
    const originalPlanTools = registry.planTools.bind(registry);
    registry.planTools = async () => ({
      ok: true,
      steps: [
        { id: "step-1", title: "Inspect the active scene", kind: "analysis" },
        { id: "step-2", title: "Apply the reviewed builder mutation", kind: "builder" },
      ],
      model: "ramalama-local",
      durationMs: 42,
    });

    try {
      const response = await app.handle(
        new Request(toUrl(appRoutes.aiPlanTools), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ goal: "Review and update the active project scene." }),
        }),
      );
      const payload = (await response.json()) as {
        readonly ok: true;
        readonly data: {
          readonly steps: readonly { readonly id: string; readonly title: string }[];
        };
      };

      expect(response.status).toBe(httpStatus.ok);
      expect(payload.ok).toBe(true);
      expect(payload.data.steps[0]?.title).toBe("Inspect the active scene");
      expect(payload.data.steps[1]?.id).toBe("step-2");
    } finally {
      registry.planTools = originalPlanTools;
    }
  });

  test("transcribe route returns typed validation errors for invalid wav payloads", async () => {
    const incomingCorrelationId = "ai-transcribe-correlation-id";
    const response = await app.handle(
      new Request(toUrl(appRoutes.aiTranscribe), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          [correlationIdHeader]: incomingCorrelationId,
        },
        body: JSON.stringify({
          audioBase64: Buffer.from("not-a-valid-wav").toString("base64"),
        }),
      }),
    );
    const payload = (await response.json()) as {
      readonly ok: false;
      readonly error: {
        readonly code: string;
        readonly category: string;
        readonly message: string;
        readonly correlationId: string;
      };
    };

    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(payload.error.category).toBe("validation");
    expect(response.headers.get(correlationIdHeader)).toBe(incomingCorrelationId);
    expect(payload.error.correlationId).toBe(incomingCorrelationId);
  });
});
