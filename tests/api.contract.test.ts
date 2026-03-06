import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createApp } from "../src/app.ts";
import { appConfig } from "../src/config/environment.ts";
import { ProviderRegistry } from "../src/domain/ai/providers/provider-registry.ts";
import { correlationIdHeader } from "../src/lib/correlation-id.ts";
import { contentType, httpStatus } from "../src/shared/constants/http.ts";
import { defaultOracleMode } from "../src/shared/constants/oracle.ts";
import { appRoutes } from "../src/shared/constants/routes.ts";
import { prisma } from "../src/shared/services/db.ts";

let app: Awaited<ReturnType<typeof createApp>>;
const baseUrl = "http://localhost";

const toUrl = (path: string): string => `${baseUrl}${path}`;
const countOccurrences = (source: string, fragment: string): number =>
  source.split(fragment).length - 1;

beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  await (await ProviderRegistry.getInstance()).dispose();
  await prisma.$disconnect();
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
    const sessionId = createPayload.data?.sessionId ?? "";

    const commandResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionCommand.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
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
    const sessionId = createPayload.data?.sessionId ?? "";

    const commandResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionCommand.replace(":id", sessionId)), {
        method: "POST",
        headers: {
          "content-type": "application/json",
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

  test("game session state endpoint repairs malformed persisted scene payloads", async () => {
    if (appConfig.game.sessionStore !== "prisma") {
      expect(true).toBe(true);
      return;
    }

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

    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        state: "malformed-state",
      },
    });

    const stateResponse = await app.handle(
      new Request(toUrl(appRoutes.gameApiSessionState.replace(":id", sessionId))),
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

    const repairedRow = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    expect(createResponse.status).toBe(httpStatus.ok);
    expect(createPayload.ok).toBe(true);
    expect(stateResponse.status).toBe(httpStatus.ok);
    expect(statePayload.ok).toBe(true);
    expect(statePayload.data?.sessionId).toBe(sessionId);
    expect(statePayload.data?.state?.sceneId?.length).toBeGreaterThan(0);
    expect(statePayload.data?.state?.player?.id).toBe("player");
    expect(repairedRow?.state).not.toBeNull();
    expect(typeof repairedRow?.state).toBe("object");
    expect(
      typeof repairedRow?.state === "object" &&
        repairedRow.state !== null &&
        "sceneId" in repairedRow.state,
    ).toBe(true);
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
    const createProjectResponse = await app.handle(
      new Request(toUrl("/api/builder/projects"), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectId: `contract-${Date.now()}`,
        }),
      }),
    );

    const createProjectPayload = (await createProjectResponse.json()) as {
      readonly ok: boolean;
      readonly data?: {
        readonly id: string;
        readonly checksum: string;
      };
    };

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
    const sessionId = createPayload.data?.sessionId ?? "";
    const targetPath = appRoutes.gameApiSessionCommand.replace(":id", sessionId);

    const commandRequests = Array.from(
      { length: Math.max(1, appConfig.game.maxCommandsPerTick + 2) },
      (_, index) =>
        app.handle(
          new Request(toUrl(targetPath), {
            method: "POST",
            headers: {
              "content-type": "application/json",
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
          };
        })
      : null;

    expect(createResponse.status).toBe(httpStatus.ok);
    expect(createPayload.ok).toBe(true);
    expect(sessionId.length).toBeGreaterThan(0);
    expect(conflictResponse).toBeDefined();
    expect(commandPayload?.ok).toBe(false);
    expect(commandPayload?.error?.code).toBe("CONFLICT");
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
    expect(payload.data?.localRuntime?.onnx?.backend).toBe("wasm");
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
    expect(html.includes("/pitch-deck?lang=en-US")).toBe(true);
    expect(html.includes("/narrative-bible?lang=en-US")).toBe(true);
    expect(html.includes("/dev-plan?lang=en-US")).toBe(true);
    expect(html.includes("/?lang=en-US#architecture")).toBe(true);
    expect(countOccurrences(html, '/pitch-deck?lang=en-US"')).toBeGreaterThanOrEqual(2);
    expect(countOccurrences(html, '/narrative-bible?lang=en-US"')).toBeGreaterThanOrEqual(2);
    expect(countOccurrences(html, '/dev-plan?lang=en-US"')).toBeGreaterThanOrEqual(2);
    expect(html.includes('name="lang" value="en-US"')).toBe(true);
    expect(html.includes('hx-params="*"')).toBe(true);
    expect(html.includes('aria-label="Switch language to Chinese"')).toBe(true);
    expect(html.includes(appRoutes.aiCatalog)).toBe(true);
    expect(html.includes(appRoutes.aiTranscribe)).toBe(true);
    expect(html.includes(appConfig.api.docsPath)).toBe(true);
  });

  test("oracle form preserves locale in progressive-enhancement flow", async () => {
    const response = await app.handle(new Request(toUrl(`${appRoutes.home}?lang=zh-CN`)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes('name="lang" value="zh-CN"')).toBe(true);
    expect(html.includes('action="/"')).toBe(true);
    expect(html.includes('hx-get="/partials/oracle"')).toBe(true);
    expect(html.includes('hx-ext="oracle-indicator"')).toBe(true);
    expect(html.includes('data-loading-title="占卜进行中"')).toBe(true);
    expect(html.includes('aria-label="切换到英文"')).toBe(true);
  });

  test("feature scripts are scoped to the home page", async () => {
    const response = await app.handle(new Request(toUrl(appRoutes.home)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("/public/vendor/htmx-ext/oracle-indicator.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/focus-panel.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/game-hud.js")).toBe(false);
  });

  test("home route handles non-js oracle form fallback as full SSR page", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.home}?lang=en-US&question=river%20trade&mode=auto`)),
    );
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.toLowerCase().includes("<!doctype html>")).toBe(true);
    expect(html.includes('id="oracle-panel"')).toBe(true);
    expect(html.includes("Oracle reading")).toBe(true);
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
      new Request(toUrl(`${appRoutes.oraclePartial}?question=test&mode=auto&lang=en-US`), {
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
          `${appRoutes.oraclePartial}?question=%E6%B2%B3%E9%81%93%E8%B7%AF%E7%BA%BF&lang=zh-CN`,
        ),
      ),
    );

    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("占卜")).toBe(true);
  });

  test("oracle partial avoids inline event handlers", async () => {
    const response = await app.handle(
      new Request(toUrl(`${appRoutes.oraclePartial}?mode=force-retryable-error&question=retry`)),
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
    expect(html.includes("/public/vendor/htmx-ext/game-hud.js")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/oracle-indicator.js")).toBe(false);
    expect(countOccurrences(html, 'data-hud-slot="hud-xp"')).toBe(1);
    expect(html.includes('data-connected-label="connected"')).toBe(true);
  });

  test("builder dashboard preserves locale-aware navigation links", async () => {
    const response = await app.handle(new Request(toUrl(`${appRoutes.builder}?lang=zh-CN`)));
    const html = await response.text();

    expect(response.status).toBe(httpStatus.ok);
    expect(html.includes("/builder/scenes?lang=zh-CN")).toBe(true);
    expect(html.includes("/builder/npcs?lang=zh-CN")).toBe(true);
    expect(html.includes("/builder/ai?lang=zh-CN")).toBe(true);
    expect(html.includes("/public/vendor/htmx-ext/focus-panel.js")).toBe(true);
  });
});
