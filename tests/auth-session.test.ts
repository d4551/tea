import { describe, expect, test } from "bun:test";
import { appConfig } from "../src/config/environment.ts";
import {
  type AuthCookieBag,
  resolveAuthRequestContext,
  resolveAuthSession,
} from "../src/plugins/auth-session.ts";

/**
 * Auth session plugin unit tests.
 *
 * Tests the pure session resolution logic in isolation using
 * mock cookie bag objects (no Elysia server required).
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const COOKIE_NAME = appConfig.auth.sessionCookieName;

/**
 * Creates a minimal mock cookie bag for testing.
 *
 * @param sessionValue Optional session cookie value.
 * @returns Mock cookie bag compatible with AuthCookieBag.
 */
const createMockCookieBag = (sessionValue?: string): AuthCookieBag => {
  return {
    [COOKIE_NAME]: {
      value: sessionValue,
      set: () => {},
    },
  };
};

describe("resolveAuthSession", () => {
  test("generates a new UUID when no cookie exists", () => {
    const cookie = createMockCookieBag();
    const session = resolveAuthSession(cookie);

    expect(session.sessionId).toMatch(UUID_REGEX);
    expect(session.hasSession).toBe(false);
  });

  test("returns existing ID when cookie is set", () => {
    const existingId = "existing-session-12345";
    const cookie = createMockCookieBag(existingId);
    const session = resolveAuthSession(cookie);

    expect(session.sessionId).toBe(existingId);
    expect(session.hasSession).toBe(true);
  });

  test("treats empty string cookie as no session", () => {
    const cookie = createMockCookieBag("");
    const session = resolveAuthSession(cookie);

    expect(session.sessionId).toMatch(UUID_REGEX);
    expect(session.hasSession).toBe(false);
  });

  test("caches result per cookie bag via WeakMap", () => {
    const cookie = createMockCookieBag();
    const session1 = resolveAuthSession(cookie);
    const session2 = resolveAuthSession(cookie);

    expect(session1).toBe(session2);
    expect(session1.sessionId).toBe(session2.sessionId);
  });

  test("different cookie bags get different sessions", () => {
    const cookie1 = createMockCookieBag();
    const cookie2 = createMockCookieBag();
    const session1 = resolveAuthSession(cookie1);
    const session2 = resolveAuthSession(cookie2);

    expect(session1.sessionId).not.toBe(session2.sessionId);
  });
});

describe("resolveAuthRequestContext", () => {
  test("derives authSessionId and authHasSession from cookie", () => {
    const existingId = "ctx-session-xyz";
    const cookie = createMockCookieBag(existingId);
    const ctx = resolveAuthRequestContext(cookie);

    expect(ctx.authSessionId).toBe(existingId);
    expect(ctx.authHasSession).toBe(true);
  });

  test("creates new session when no cookie", () => {
    const cookie = createMockCookieBag();
    const ctx = resolveAuthRequestContext(cookie);

    expect(ctx.authSessionId).toMatch(UUID_REGEX);
    expect(ctx.authHasSession).toBe(false);
  });
});
