import { afterEach, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { createApp } from "../src/app.ts";
import { appConfig } from "../src/config/environment.ts";
import { resetEmbeddingFallback } from "../src/domain/ai/knowledge-base-service.ts";
import { ProviderRegistry } from "../src/domain/ai/providers/provider-registry.ts";
import { vectorStore } from "../src/domain/ai/vector-store.ts";
import { builderService } from "../src/domain/builder/builder-service.ts";
import { gameLoop } from "../src/domain/game/game-loop.ts";
import { correlationIdHeader } from "../src/lib/correlation-id.ts";
import { defaultGameConfig } from "../src/shared/config/game-config.ts";
import { gameAssetUrls } from "../src/shared/constants/game-assets.ts";
import { contentType, httpStatus } from "../src/shared/constants/http.ts";
import { defaultOracleMode } from "../src/shared/constants/oracle.ts";
import { interpolateRoutePath } from "../src/shared/constants/route-patterns.ts";
import { appRoutes, withLocaleQuery, withQueryParameters } from "../src/shared/constants/routes.ts";
import { prisma, prismaBase } from "../src/shared/services/db.ts";
import { readJsonResponse, settleAsync } from "../src/shared/utils/async-result.ts";
import { GamePage } from "../src/views/game-page.ts";

let app: Awaited<ReturnType<typeof createApp>>;
const baseUrl = "http://localhost";
const managedSessionIds = new Set<string>();

const toUrl = (path: string): string => `${baseUrl}${path}`;
const withProjectPagePath = (
  path: string,
  projectId: string,
  locale = "en-US",
  params: Readonly<Record<string, string | undefined>> = {},
): string => withQueryParameters(path, { lang: locale, projectId, ...params });
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

  const readLoop = await settleAsync(
    (async (): Promise<string> => {
      for (let index = 0; index < maxChunks; index += 1) {
        const next = await reader.read();
        if (next.done) {
          break;
        }

        const chunk = next.value;
        if (chunk !== undefined && chunk !== null) {
          if (typeof chunk === "string") {
            collected += chunk;
          } else if (typeof chunk === "object" && chunk !== null) {
            const obj: object = chunk;
            if (
              obj instanceof Uint8Array ||
              obj instanceof ArrayBuffer ||
              ArrayBuffer.isView(obj)
            ) {
              collected += decoder.decode(obj, { stream: true });
            }
          }
        }

        if (predicate(collected)) {
          break;
        }
      }

      return collected;
    })(),
  );

  await settleAsync(reader.cancel());
  await settleAsync(Promise.resolve(reader.releaseLock()));

  if (!readLoop.ok) {
    throw readLoop.error;
  }

  return readLoop.value;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (() => {
        const entries = Object.entries(value);
        const record: Record<string, unknown> = {};
        for (const [key, entry] of entries) {
          record[key] = entry;
        }
        return record;
      })()
    : {};

const readResponsePayload = async <TPayload>(response: Response): Promise<TPayload> => {
  const parsed = await readJsonResponse<TPayload>(response);
  if (!parsed.ok) {
    throw parsed.error;
  }
  return parsed.value;
};
const sceneModeHtmlIncludes = (source: string, mode: "2D" | "3D"): boolean =>
  new RegExp(`id="game-scene-mode-value"[^>]*>\\s*${mode}\\s*<\\/div>`).test(source);
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

const withMockedEmbeddingGeneration = async <T>(run: () => Promise<T>): Promise<T> => {
  resetEmbeddingFallback();
  vectorStore.clear();
  const registry = await ProviderRegistry.getInstance();
  const spy = spyOn(registry, "generateEmbedding").mockImplementation(async (text: string) =>
    createDeterministicEmbedding(text),
  );

  const result = await settleAsync(Promise.resolve().then(run));

  spy.mockRestore();

  if (!result.ok) {
    throw result.error;
  }

  return result.value;
};

const createBuilderProject = async (projectId = `contract-${Date.now()}`) => {
  const response = await app.handle(
    new Request(toUrl("/api/builder/projects"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ projectId, starterTemplateId: "tea-house-story" }),
    }),
  );

  const payload = await readResponsePayload<{
    readonly ok: boolean;
    readonly data?: {
      readonly id: string;
      readonly checksum: string;
    };
  }>(response);

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
  test("openapi docs endpoint is mounted", async () => {
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
      app.handle(
        new Request(
          toUrl(`${appConfig.staticAssets.rmmzPackPrefix}/plugins/LOTFK_TradeAndRoutes.js`),
        ),
      ),
    ]);
    await Promise.all(responses.map((response) => drainResponseBody(response)));

    for (const response of responses) {
      expect(response?.status === httpStatus.ok || response?.status === httpStatus.notFound).toBe(
        true,
      );
    }
  });

  test("health endpoint returns success envelope", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.healthApi)));
    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly status: string;
        readonly message: string;
      };
    }>(response);

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(payload.data?.status).toBe("ok");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  test("health endpoint at /health is available", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.health)));
    expect(response.status).toBe(httpStatus.ok);
    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly status: string;
        readonly message: string;
      };
    }>(response);
    expect(payload.ok).toBe(true);
    expect(payload.data?.status).toBe("ok");
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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly state: string;
        readonly answer: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly correlationId: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly retryable: boolean;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly correlationId: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly state: string;
        readonly answer: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly state: string;
        readonly answer: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly message: string;
      };
    }>(response);

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

    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
        readonly message: string;
      };
    }>(response);

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
    const createPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(createResponse);
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

    const commandPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    }>(commandResponse);

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
    const createPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(createResponse);
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

    const commandPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
        readonly commandType: string;
        readonly state: string;
        readonly commandState?: string;
        readonly accepted: boolean;
      };
    }>(commandResponse);

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
    const ownerCreatePayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(ownerCreateResponse);
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
    const invitePayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly inviteToken: string;
      };
    }>(inviteResponse);

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
    const joinPayload = await readResponsePayload<{
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
    }>(joinResponse);

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
    const ownerCreatePayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(ownerCreateResponse);
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
    const invitePayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly inviteToken: string;
      };
    }>(inviteResponse);

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
    const joinPayload = await readResponsePayload<{
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
    }>(joinResponse);
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
    const createPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(createResponse);
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
    const statePayload = await readResponsePayload<{
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
    }>(stateResponse);

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
    const createPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(createResponse);
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
    const createPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(createResponse);
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
    const statePayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly state: {
          readonly sceneId?: string;
          readonly player?: { readonly id: string };
        };
      };
    }>(stateResponse);

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
    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    }>(response);

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

    const updatePayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly payload?: {
          readonly key: string;
          readonly text: string;
        };
      };
    }>(updateResponse);

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
    const removePayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly result?: { readonly action: string };
      };
    }>(removePayloadResponse);
    expect(removePayloadResponse.status).toBe(httpStatus.ok);
    expect(removePayload.ok).toBe(true);
    expect(removePayload.data?.result?.action).toBe("deleted");
  });

  test("scene node form updates preserve unspecified authored fields", async () => {
    const projectId = `scene-node-${Date.now()}`;
    const project = await builderService.createProject(projectId, "tea-house-story");
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
    const project = await builderService.createProject(projectId, "tea-house-story");
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
          displayTitle: "Yangtze Tea House",
          geometryWidth: "800",
        }),
      }),
    );

    const updatedScene = await builderService.getScene(projectId, teaHouse.id);

    expect(response.status).toBe(httpStatus.ok);
    expect(updatedScene?.titleKey).toBe(teaHouse.titleKey);
    expect(updatedScene?.displayTitle).toBe("Yangtze Tea House");
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
        displayTitle: "Repertoire 2D",
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
        displayTitle: "Repertoire 3D",
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
    const project = await builderService.createProject(projectId, "tea-house-story");
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
        displayName: "Tea Guide",
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
      displayName: "Tea Guide",
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
              path: `/projects/${projectId}/start`,
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
    const createPayload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly sessionId: string;
      };
    }>(createResponse);
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
      ? await readResponsePayload<{
          readonly ok: boolean;
          readonly error?: {
            readonly code: string;
            readonly message: string;
          };
        }>(conflictResponse)
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
    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly features?: {
          readonly assist: boolean;
          readonly test: boolean;
          readonly toolLikeSuggestions: boolean;
          readonly streaming: boolean;
          readonly offlineFallback: boolean;
        };
        readonly creatorCapabilities?: {
          readonly items?: ReadonlyArray<{
            readonly key: string;
            readonly label: string;
            readonly statusLabel: string;
            readonly available: boolean;
          }>;
        };
        readonly providerCount?: number;
        readonly capabilities?: ReadonlyArray<{
          readonly provider: string;
          readonly model: string;
          readonly capabilities: readonly string[];
          readonly maxContextLength: number;
          readonly supportsStreaming: boolean;
          readonly runtime: string;
          readonly integration: string;
          readonly local: boolean;
          readonly configurable: boolean;
          readonly key?: string;
        }>;
      };
    }>(response);

    expect(response.status).toBe(httpStatus.ok);
    expect(payload.ok).toBe(true);
    expect(typeof payload.data?.features?.assist).toBe("boolean");
    expect(typeof payload.data?.features?.test).toBe("boolean");
    expect(typeof payload.data?.providerCount).toBe("number");
    expect(Array.isArray(payload.data?.creatorCapabilities?.items)).toBe(true);
    expect(Array.isArray(payload.data?.capabilities)).toBe(true);
    if (payload.data?.capabilities) {
      expect(
        payload.data.capabilities.every((capability) => capability.provider === "creator-safe"),
      ).toBe(true);
      expect(
        payload.data.capabilities.every((capability) => capability.model === "creator-safe"),
      ).toBe(true);
    }
  });

  test("builder platform readiness endpoint exposes partial and missing capability states", async () => {
    const projectId = `readiness-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.builderPlatformReadiness}?projectId=${projectId}`)),
    );
    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        readonly partialCount: number;
        readonly missingCount: number;
        readonly capabilities: ReadonlyArray<{
          readonly key: string;
          readonly status: string;
        }>;
      };
    }>(response);

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
        (capability) => capability.key === "releaseFlow" && capability.status === "implemented",
      ),
    ).toBe(true);
    expect(
      payload.data?.capabilities.some(
        (capability) => capability.key === "runtime2d" && capability.status === "partial",
      ),
    ).toBe(true);
    expect(
      payload.data?.capabilities.some(
        (capability) => capability.key === "runtime3d" && capability.status === "partial",
      ),
    ).toBe(true);
  });

  test("AI status endpoint exposes local runtime and speech capabilities", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.aiStatus)));
    const payload = await readResponsePayload<{
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
    }>(response);

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
    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly data?: {
        catalog?: Array<{
          configKey: string;
          model: string;
        }>;
      };
    }>(response);

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
      const ingestPayload = await readResponsePayload<{
        readonly ok: boolean;
        readonly data?: {
          readonly id: string;
          readonly projectId: string | null;
          readonly chunkCount: number;
        };
      }>(ingestResponse);

      const listResponse = await app.handle(
        new Request(toUrl(`${appRoutes.aiKnowledgeDocuments}?projectId=${projectId}`)),
      );
      const listPayload = await readResponsePayload<{
        readonly ok: boolean;
        readonly data?: {
          readonly documents?: ReadonlyArray<{
            readonly id: string;
            readonly projectId: string | null;
            readonly chunkCount: number;
          }>;
        };
      }>(listResponse);

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
      const searchPayload = await readResponsePayload<{
        readonly ok: boolean;
        readonly data?: {
          readonly matches?: ReadonlyArray<{
            readonly title: string;
            readonly source: string;
            readonly text: string;
            readonly score: number;
          }>;
        };
      }>(searchResponse);
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
      const matches = searchPayload.data?.matches ?? [];
      const expectedSources = ["design/combat.md", "design/lighting.md"];
      const hasExpectedTitle = matches.some((match) =>
        ["Combat Design Notes", "Lighting Checklist"].includes(match.title),
      );
      const hasExpectedSource = matches.some((match) => expectedSources.includes(match.source));
      const hasExpectedSemanticHit = matches.some(
        (match) =>
          match.text.includes("Parry timing") || match.text.includes("Ambient lantern intensity"),
      );

      expect(hasExpectedTitle).toBe(true);
      expect(hasExpectedSource).toBe(true);
      expect(hasExpectedSemanticHit).toBe(true);
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
      const ingestPayload = await readResponsePayload<{
        readonly ok: boolean;
        readonly data?: { readonly id: string };
      }>(ingestResponse);

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
      const deletePayload = await readResponsePayload<{
        readonly ok: boolean;
        readonly data?: { readonly deleted: boolean };
      }>(deleteResponse);

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
    expect(html.includes('aria-label="Breadcrumb"')).toBe(true);
    expect(html.includes('aria-current="page"')).toBe(true);
    expect(html.includes(`${withLocaleQuery(appRoutes.builder, "en-US")}`)).toBe(true);
    expect(html.includes("/projects/new?lang=en-US")).toBe(true);
    expect(html.includes('aria-label="Switch language to Chinese"')).toBe(true);
    expect(html.includes('data-drawer-toggle-target="main-nav-drawer"')).toBe(true);
    expect(html.includes('for="main-nav-drawer"')).toBe(true);
    expect(html.includes('for="ai-chat-drawer"')).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/layout-controls.js")).toBe(true);
  });

  test("home page renders explicit empty states instead of placeholder project metrics", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.home)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("No project activity yet")).toBe(true);
    expect(html.includes("Project created in workspace")).toBe(false);
    expect(html.includes("Waiting for initial scene draft")).toBe(false);
    expect(html.includes("Awaiting publication")).toBe(false);
  });

  test("home page presents direct 2D and 3D scene launch links", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.home)));
    const html = await response.text();
    const teaHouseLaunch = withLocaleQuery(appRoutes.builder, "en-US");
    const crystalCavernLaunch = withLocaleQuery(appRoutes.builder, "en-US");

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes(teaHouseLaunch)).toBe(true);
    expect(html.includes(crystalCavernLaunch)).toBe(true);
    expect(html.includes("Choose your scene mode")).toBe(true);
    expect(html.includes("Launch Tea House")).toBe(true);
    expect(html.includes("Launch Crystal Cavern")).toBe(true);
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
    await createBuilderProject("default");
    const response = await app.handle(
      new Request(toUrl(`${interpolateRoutePath(appRoutes.builderAi, { projectId: "default" })}`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("Project Settings")).toBe(true);
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
    const response = await app.handle(
      new Request(toUrl(withProjectPagePath(appRoutes.game, "default"))),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(response.headers.get("content-type")?.includes(contentType.htmlUtf8)).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/game-hud.js")).toBe(false);
    expect(html.includes('hx-ext="sse"')).toBe(true);
    expect(html.includes('hx-ext="sse,game-hud"')).toBe(false);
    expect(html.includes("/public/vendor/htmx-ext/oracle-indicator.js")).toBe(true);
    expect(countOccurrences(html, 'data-hud-slot="hud-xp"')).toBe(1);
    expect(html.includes('data-connected-label="connected"')).toBe(true);
    expect(html.includes('id="game-client-bootstrap"')).toBe(true);
    expect(html.includes('"commandSendIntervalMs"')).toBe(true);
    expect(html.includes('"commandTtlMs"')).toBe(true);
    expect(html.includes('"socketReconnectDelayMs"')).toBe(true);
    expect(html.includes('"restoreRequestTimeoutMs"')).toBe(true);
    expect(html.includes('"restoreMaxAttempts"')).toBe(true);
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
    expect(html.includes('id="game-objective-summary"')).toBe(true);
    expect(html.includes('sse-swap="objective-summary"')).toBe(true);
    expect(html.includes('id="game-scene-mode-value"')).toBe(true);
    expect(html.includes('sse-swap="scene-mode"')).toBe(true);
  });

  test("game page starts in selected scene mode from sceneId query", async () => {
    const scene2dUrl = withQueryParameters(withLocaleQuery(appRoutes.game, "en-US"), {
      sceneId: "teaHouse",
    });
    const scene3dUrl = withQueryParameters(withLocaleQuery(appRoutes.game, "en-US"), {
      sceneId: "crystalCavern",
    });

    const scene2dResponse = await app.handle(new Request(toUrl(scene2dUrl)));
    const scene2dHtml = await scene2dResponse.text();
    const scene3dResponse = await app.handle(new Request(toUrl(scene3dUrl)));
    const scene3dHtml = await scene3dResponse.text();

    expect(scene2dResponse.status).toBe(httpStatus.ok);
    expect(sceneModeHtmlIncludes(scene2dHtml, "2D")).toBe(true);
    expect(scene3dResponse.status).toBe(httpStatus.ok);
    expect(sceneModeHtmlIncludes(scene3dHtml, "3D")).toBe(true);
  });

  test("builder dashboard preserves locale-aware navigation links", async () => {
    const projectId = `builder-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(withProjectPagePath(appRoutes.builderStart, projectId, "zh-CN"))),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes(`/projects/${projectId}/playtest?lang=zh-CN`)).toBe(true);
    expect(html.includes(`/projects/${projectId}/world?lang=zh-CN`)).toBe(true);
    expect(html.includes(`/projects/${projectId}/characters?lang=zh-CN`)).toBe(true);
    expect(html.includes(`/projects/${projectId}/settings?lang=zh-CN`)).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/focus-panel.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/layout-controls.js")).toBe(true);
    expect(html.includes("/public/vendor/builder-scene-editor.js")).toBe(true);
    expect(html.includes('id="builder-project-shell"')).toBe(true);
    expect(html.includes("概览")).toBe(true);
    expect(html.includes("创作")).toBe(true);
    expect(html.includes("运行时")).toBe(true);
    expect(html.includes("试玩")).toBe(true);
    expect(html.includes(projectId)).toBe(true);
    expect(html.includes("创建可试玩切片")).toBe(true);
    expect(html.includes("构建器工作区")).toBe(true);
    expect(html.includes('href="#"')).toBe(false);
    expect(html.includes("退出构建器")).toBe(true);
  });

  test("creator workspace pages render a shared end-to-end journey strip", async () => {
    const projectId = `journey-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    const pages = [
      appRoutes.builderScenes,
      appRoutes.builderAssets,
      appRoutes.builderNpcs,
      appRoutes.builderDialogue,
      appRoutes.builderMechanics,
    ] as const;

    for (const path of pages) {
      const response = await app.handle(
        new Request(toUrl(`${interpolateRoutePath(path, { projectId })}?lang=en-US`)),
      );
      const html = await response.text();

      expect(response.status).toBe(httpStatus.ok);
      expect(html.includes('aria-label="Create playable slice"')).toBe(true);
      expect(html.includes(`/projects/${projectId}/start?lang=en-US`)).toBe(true);
      expect(html.includes(`/projects/${projectId}/world?lang=en-US`)).toBe(true);
      expect(html.includes(`/projects/${projectId}/assets?lang=en-US`)).toBe(true);
      expect(html.includes(`/projects/${projectId}/characters?lang=en-US`)).toBe(true);
      expect(html.includes(`/projects/${projectId}/story?lang=en-US`)).toBe(true);
      expect(html.includes(`/projects/${projectId}/systems?lang=en-US`)).toBe(true);
      expect(html.includes(`/projects/${projectId}/playtest?lang=en-US`)).toBe(true);
      expect(html.includes("tabs tabs-lg tabs-box")).toBe(true);
      expect(html.includes("breadcrumbs")).toBe(true);
      expect(
        html.includes(
          `href="/projects/${projectId}/start?lang=en-US" role="tab" class="tab " aria-selected="false" aria-label="Start Here"`,
        ),
      ).toBe(true);
    }
  });

  test("mechanics workspace detail pane uses the shared focus-panel contract", async () => {
    const projectId = `mechanics-focus-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(withProjectPagePath(appRoutes.builderMechanics, projectId))),
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
    await builderService.createScene(projectId, {
      id: "forest-crossing",
      displayTitle: "Forest Crossing",
      background: "/assets/images/backgrounds/forest-crossing.png",
      sceneMode: "2d",
      geometryWidth: "640",
      geometryHeight: "360",
      spawnX: "320",
      spawnY: "180",
    });
    await builderService.createScene(projectId, {
      id: "port-market",
      displayTitle: "Port Market",
      background: "/assets/images/backgrounds/port-market.png",
      sceneMode: "3d",
      geometryWidth: "640",
      geometryHeight: "360",
      spawnX: "320",
      spawnY: "180",
    });
    const response = await app.handle(
      new Request(
        toUrl(
          withProjectPagePath(appRoutes.builderScenes, projectId, "en-US", {
            search: "yangtze",
            page: "1",
          }),
        ),
      ),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("<svg")).toBe(true);
    expect(html.includes("style=")).toBe(false);
    expect(html.includes("data-scene-editor")).toBe(true);
    expect(html.includes("data-scene-node-form")).toBe(true);
    expect(html.includes("data-scene-selected-node")).toBe(true);
    expect(html.includes('aria-label="Filter scenes"')).toBe(true);
    expect(html.includes("Results: 1-1 / 1")).toBe(true);
    expect(html.includes("Yangtze Tea House")).toBe(true);
    expect(html.includes("Port Market")).toBe(false);
  });

  test("builder assets page makes sprite and animation pipeline gaps explicit", async () => {
    const projectId = `assets-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    await builderService.createAsset(projectId, {
      id: "harbor-theme",
      label: "Harbor Theme",
      kind: "audio",
      sceneMode: "2d",
      source: "/assets/audio/harbor-theme.ogg",
    });
    const response = await app.handle(
      new Request(
        toUrl(
          withProjectPagePath(appRoutes.builderAssets, projectId, "en-US", {
            search: "harbor",
            assetId: "harbor-theme",
          }),
        ),
      ),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("Animation authoring")).toBe(true);
    expect(html.includes("AI actions for the selected item")).toBe(true);
    expect(html.includes('aria-label="Filter assets"')).toBe(true);
    expect(html.includes("Harbor Theme")).toBe(true);
    expect(html.includes("Results: 1-1 / 1")).toBe(true);
    expect(html.includes('id="creator-ai-actions"')).toBe(true);
    expect(html.includes('name="prompt"')).toBe(true);
    expect(html.includes('name="targetId"')).toBe(true);
    expect(html.includes('name="kind"')).toBe(true);
    expect(html.includes("Create AI draft")).toBe(false);
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

  test("builder settings page exposes creator assistance and review automation readiness", async () => {
    const projectId = `ai-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(withProjectPagePath(appRoutes.builderAi, projectId))),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("Project Settings")).toBe(true);
    expect(html.includes("Creator assistance")).toBe(true);
    expect(html.includes("Review automation")).toBe(true);
    expect(html.includes("Platform readiness")).toBe(true);
  });

  test("builder dashboard keeps the creator journey free of provider and readiness jargon", async () => {
    const projectId = `dashboard-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);
    const response = await app.handle(
      new Request(toUrl(withProjectPagePath(appRoutes.builderStart, projectId))),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("Create playable slice")).toBe(true);
    expect(html.includes("Creator support")).toBe(true);
    expect(html.includes("Providers")).toBe(false);
    expect(html.includes("Generation jobs")).toBe(false);
    expect(html.includes("AI authoring")).toBe(false);
    expect(html.includes("Automation / RPA")).toBe(false);
    expect(html.includes(">Implemented<")).toBe(false);
    expect(html.includes(">Partial<")).toBe(false);
    expect(html.includes(">Missing<")).toBe(false);
    expect(html.includes(`/projects/${projectId}/start?lang=en-US`)).toBe(true);
  });

  test("missing builder project renders the starter template picker", async () => {
    const response = await app.handle(new Request(toUrl(`${appRoutes.builder}?lang=en-US`)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("Choose a starter")).toBe(true);
    expect(html.includes('name="starterTemplateId"')).toBe(true);
    expect(html.includes("Blank workspace")).toBe(true);
    expect(html.includes("Tea house story sample")).toBe(true);
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
          currentPath: appRoutes.builderStart,
        }),
      }),
    );
    const publishHtml = await publishResponse.text();

    expect(publishResponse.status).toBe(httpStatus.ok);
    expect(publishHtml.includes('id="builder-project-shell"')).toBe(true);
    expect(publishHtml.includes(`/projects/${projectId}/playtest?lang=en-US`)).toBe(true);
    expect(publishHtml.includes("/api/builder/projects/")).toBe(true);
  });

  test("builder publish HTML action sanitizes unsafe currentPath values", async () => {
    const projectId = `publish-${crypto.randomUUID()}`;
    await createBuilderProject(projectId);

    const publishRequest = new Request(toUrl(`/api/builder/projects/${projectId}/publish`), {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        accept: "text/html",
      },
      body: JSON.stringify({
        published: true,
        locale: "en-US",
        currentPath: "https://attacker.example.org/",
      }),
    });
    const publishResponse = await app.handle(publishRequest);
    const publishHtml = await publishResponse.text();

    expect(publishResponse.status).toBe(httpStatus.ok);
    expect(publishHtml.includes('id="builder-project-shell"')).toBe(true);
    expect(publishHtml.includes(`/projects/${projectId}/start?lang=en-US`)).toBe(true);
  });

  test("builder project create HTML action redirects to a builder path", async () => {
    const projectId = `create-${crypto.randomUUID()}`;
    const response = await app.handle(
      new Request(toUrl("/api/builder/projects"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          starterTemplateId: "blank",
          redirectPath: "/projects/route-placeholder/assets?lang=fr",
        }).toString(),
      }),
    );

    expect(response.status).toBe(httpStatus.ok);
    expect(response.headers.get("HX-Redirect")).toBe(`/projects/${projectId}/assets?lang=en-US`);
    expect((await response.text()).length).toBe(0);
  });

  test("builder project create HTML action falls back to builder when redirect path is unsafe", async () => {
    const projectId = `create-${crypto.randomUUID()}`;
    const response = await app.handle(
      new Request(toUrl("/api/builder/projects"), {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "text/html",
        },
        body: new URLSearchParams({
          projectId,
          locale: "en-US",
          starterTemplateId: "blank",
          redirectPath: "https://example.com/",
        }).toString(),
      }),
    );

    expect(response.status).toBe(httpStatus.ok);
    expect(response.headers.get("HX-Redirect")).toBe(`/projects/${projectId}/start?lang=en-US`);
    expect((await response.text()).length).toBe(0);
  });

  test("builder project creation requires starter template selection", async () => {
    const projectId = `create-${crypto.randomUUID()}`;
    const response = await app.handle(
      new Request(toUrl("/api/builder/projects"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          projectId,
          locale: "en-US",
        }),
      }),
    );
    const payload = await readResponsePayload<{
      readonly ok: boolean;
      readonly error?: {
        readonly code: string;
      };
    }>(response);

    expect(response.status).toBe(httpStatus.unprocessableEntity);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
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

    const publishResult = await builderService.publishProject(projectId, true);

    expect(publishResult?.ok).toBe(false);
    if (publishResult && !publishResult.ok) {
      expect(publishResult.issues.some((issue) => issue.code === "scene-node-asset-missing")).toBe(
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
          currentPath: appRoutes.builderStart,
        }),
      }),
    );

    const payload = await readResponsePayload<{
      readonly ok: false;
      readonly error: {
        readonly code: string;
        readonly message: string;
      };
    }>(publishResponse);

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
          displayTitle: "Harbor Tea House",
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
    expect(sceneHtml.includes('name="displayTitle"')).toBe(true);
    expect(sceneHtml.includes('name="titleKey"')).toBe(true);
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
          displayName: "River Pilot",
        }).toString(),
      }),
    );
    const npcHtml = await npcResponse.text();

    expect(npcResponse.status).toBe(httpStatus.ok);
    expect(npcHtml.includes('hx-swap-oob="outerHTML"')).toBe(true);
    expect(npcHtml.includes(npcId)).toBe(true);
    expect(npcHtml.includes('name="displayName"')).toBe(true);
    expect(npcHtml.includes('name="labelKey"')).toBe(true);

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
      new Request(toUrl(withProjectPagePath(appRoutes.builderMechanics, projectId))),
    );
    const mechanicsPageHtml = await mechanicsPageResponse.text();
    expect(mechanicsPageResponse.status).toBe(httpStatus.ok);
    expect(mechanicsPageHtml.includes('id="builder-project-shell"')).toBe(true);
    expect(mechanicsPageHtml.includes("Quests")).toBe(true);

    const automationPageResponse = await app.handle(
      new Request(toUrl(withProjectPagePath(appRoutes.builderAutomation, projectId))),
    );
    const automationPageHtml = await automationPageResponse.text();
    expect(automationPageResponse.status).toBe(httpStatus.ok);
    expect(automationPageHtml.includes('id="builder-project-shell"')).toBe(true);
    expect(automationPageHtml.includes("Review Queue")).toBe(true);

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

    // Job evaluates synchronously now, so we skip the Queued check
    // and immediately see the generated draft awaiting approval in the response HTML.
    expect(generationHtml.includes("Awaiting approval")).toBe(true);
    expect(generationHtml.includes("Review Portrait")).toBe(true);
    expect(generationHtml.includes("Generated draft for")).toBe(true);
    expect(generationHtml.includes("generation.artifact.label.review:portrait")).toBe(false);
    expect(generationHtml.includes("generation.artifact.summary.target:")).toBe(false);
    const projectAfterGeneration = await builderService.getProject(projectId);
    const generationJobId =
      [...(projectAfterGeneration?.generationJobs.values() ?? [])].find(
        (job) =>
          job.kind === "portrait" &&
          job.targetId === assetId &&
          job.prompt === "Generate a review-ready tea trader portrait.",
      )?.id ?? null;
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
      new Request(toUrl(withProjectPagePath(appRoutes.builderAutomation, projectId))),
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
      new Request(
        toUrl(
          `${interpolateRoutePath(appRoutes.game, { projectId: missingProjectId })}?lang=en-US`,
        ),
      ),
    );
    const missingHtml = await missingResponse.text();

    expect(missingResponse.status).toBe(httpStatus.ok);
    expect(missingHtml.includes(missingProjectId)).toBe(true);
    expect(missingHtml.includes(`/projects/${missingProjectId}/start?lang=en-US`)).toBe(true);
    expect(missingHtml.includes('id="game-canvas-wrapper"')).toBe(false);

    const unpublishedProjectId = `unpublished-${crypto.randomUUID()}`;
    await createBuilderProject(unpublishedProjectId);
    const unpublishedResponse = await app.handle(
      new Request(
        toUrl(
          `${interpolateRoutePath(appRoutes.game, { projectId: unpublishedProjectId })}?lang=en-US`,
        ),
      ),
    );
    const unpublishedHtml = await unpublishedResponse.text();

    expect(unpublishedResponse.status).toBe(httpStatus.ok);
    expect(unpublishedHtml.includes(unpublishedProjectId)).toBe(true);
    expect(unpublishedHtml.includes(`/projects/${unpublishedProjectId}/start?lang=en-US`)).toBe(
      true,
    );
    expect(unpublishedHtml.includes('id="game-canvas-wrapper"')).toBe(false);
  });

  test("game route renders a deterministic session-unavailable state when hydration fails", async () => {
    const originalGetSessionState = gameLoop.getSessionState.bind(gameLoop);

    gameLoop.getSessionState = async () => null;
    const hydrationStateResult = await settleAsync(
      (async () => {
        const response = await app.handle(
          new Request(toUrl(`/projects/default/playtest?lang=en-US`)),
        );
        return {
          response,
          html: await response.text(),
        };
      })(),
    );

    gameLoop.getSessionState = originalGetSessionState;

    if (!hydrationStateResult.ok) {
      throw hydrationStateResult.error;
    }

    expect(hydrationStateResult.value.response.status).toBe(httpStatus.ok);
    expect(hydrationStateResult.value.html.includes("Session could not be restored")).toBe(true);
    expect(hydrationStateResult.value.html.includes('id="game-canvas-wrapper"')).toBe(false);
  });

  test("playtest route keeps the creator journey visible in the runtime shell", async () => {
    const html = GamePage({
      state: "playable",
      locale: "en-US",
      sessionId: "journey-session",
      participantSessionId: "journey-participant",
      projectId: "default",
      sceneTitle: "Yangtze Tea House",
      sceneMode: "2d",
      activeQuestTitle: "Meet the tea monk",
      resumeToken: "resume-token",
      resumeTokenExpiresAtMs: Date.UTC(2026, 2, 15, 12, 0, 0),
      commandQueueDepth: 0,
      version: 1,
      participantRole: "owner",
      participants: [],
      clientRuntimeConfig: {
        commandSendIntervalMs: appConfig.game.commandSendIntervalMs,
        commandTtlMs: appConfig.game.commandTtlMs,
        socketReconnectDelayMs: appConfig.game.socketReconnectDelayMs,
        restoreRequestTimeoutMs: appConfig.game.restoreRequestTimeoutMs,
        restoreMaxAttempts: appConfig.game.restoreMaxAttempts,
        rendererPreference: "webgl",
      },
      appOrigin: baseUrl,
    });

    expect(html.includes('aria-label="Create playable slice"')).toBe(true);
    expect(html.includes("/projects/default/world?lang=en-US")).toBe(true);
    expect(html.includes("/projects/default/assets?lang=en-US")).toBe(true);
    expect(html.includes("/projects/default/systems?lang=en-US")).toBe(true);
    expect(html.includes("/projects/default/playtest?lang=en-US")).toBe(true);
    expect(html.includes("breadcrumbs")).toBe(true);
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

    const planToolsResult = await settleAsync(
      (async () => {
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

        return {
          response,
          payload: await readResponsePayload<{
            readonly ok: true;
            readonly data: {
              readonly steps: readonly { readonly id: string; readonly title: string }[];
            };
          }>(response),
        };
      })(),
    );

    registry.planTools = originalPlanTools;

    if (!planToolsResult.ok) {
      throw planToolsResult.error;
    }

    expect(planToolsResult.value.response.status).toBe(httpStatus.ok);
    expect(planToolsResult.value.payload.ok).toBe(true);
    expect(planToolsResult.value.payload.data.steps[0]?.title).toBe("Inspect the active scene");
    expect(planToolsResult.value.payload.data.steps[1]?.id).toBe("step-2");
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
    const payload = await readResponsePayload<{
      readonly ok: false;
      readonly error: {
        readonly code: string;
        readonly category: string;
        readonly message: string;
        readonly correlationId: string;
      };
    }>(response);

    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(payload.error.category).toBe("validation");
    expect(response.headers.get(correlationIdHeader)).toBe(incomingCorrelationId);
    expect(payload.error.correlationId).toBe(incomingCorrelationId);
  });
});
