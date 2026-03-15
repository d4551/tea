import { describe, expect, test } from "bun:test";
import { appConfig } from "../config/environment.ts";
import { createStarterProjectBranding } from "../shared/branding/project-branding.ts";
import { GamePage } from "./game-page.ts";

describe("GamePage", () => {
  test("renders the shared creator journey on the playable game route", () => {
    const html = GamePage({
      state: "playable",
      locale: "en-US",
      sessionId: "session-1",
      participantSessionId: "participant-1",
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
      appOrigin: "http://localhost:3088",
      brand: createStarterProjectBranding("3d-game"),
    });

    expect(html).toContain('aria-label="Create playable slice"');
    expect(html).toContain("/projects/default/start?lang=en-US");
    expect(html).toContain("/projects/default/systems?lang=en-US");
    expect(html).toContain("/projects/default/playtest?lang=en-US");
    expect(html).toContain('aria-current="page">Playtest<');
    expect(html).toContain("breadcrumbs");
    expect(html).toContain("Station Runtime");
    expect(html).toContain("Orbital Foundry");
  });
});
