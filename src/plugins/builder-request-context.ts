import { Elysia } from "elysia";
import { appConfig, type LocaleCode, normalizeLocale } from "../config/environment.ts";
import { defaultBuilderProjectId } from "../domain/builder/builder-service.ts";
import {
  appRoutes,
  resolveRequestPathname,
  resolveRequestQueryParam,
} from "../shared/constants/routes.ts";
import { resolveRequestLocale } from "../shared/i18n/translator.ts";
import type {
  AuthCookieBag,
  AuthRequestContext,
  AuthPrincipal,
} from "./auth-session.ts";
import { resolveAuthSession } from "./auth-session.ts";

type ContextSource = Record<string, unknown>;

const isContextSource = (value: unknown): value is ContextSource =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Derived builder request context available to builder page and API handlers.
 */
export interface BuilderRequestContext {
  /** Active locale resolved from explicit builder params or request negotiation. */
  readonly builderLocale: LocaleCode;
  /** Active builder project id with default fallback. */
  readonly builderProjectId: string;
  /** Active builder return path for HTMX/project shell refresh flows. */
  readonly builderCurrentPath: string;
  /** Optional builder workspace search term from the request. */
  readonly builderSearch: string;

  /** Canonical principal actor type for authorization checks. */
  readonly builderPrincipalType: AuthRequestContext["authPrincipalType"];
  /** Canonical principal user id when authenticated. */
  readonly builderPrincipalUserId: AuthRequestContext["authPrincipalUserId"];
  /** Canonical principal organization id when available. */
  readonly builderPrincipalOrganizationId: AuthRequestContext["authPrincipalOrganizationId"];
  /** Canonical principal role keys when available. */
  readonly builderPrincipalRoleKeys: AuthRequestContext["authPrincipalRoleKeys"];
}

const toContextSource = (value: unknown): ContextSource => (isContextSource(value) ? value : {});

const toSearchParamSource = (request: Request | undefined): ContextSource => {
  if (!request) {
    return {};
  }
  return {
    ...(resolveRequestQueryParam(request, "projectId")
      ? { projectId: resolveRequestQueryParam(request, "projectId") }
      : {}),
    ...(resolveRequestQueryParam(request, "locale")
      ? { locale: resolveRequestQueryParam(request, "locale") }
      : {}),
    ...(resolveRequestQueryParam(request, "lang")
      ? { lang: resolveRequestQueryParam(request, "lang") }
      : {}),
    ...(resolveRequestQueryParam(request, "currentPath")
      ? { currentPath: resolveRequestQueryParam(request, "currentPath") }
      : {}),
    ...(resolveRequestQueryParam(request, "search")
      ? { search: resolveRequestQueryParam(request, "search") }
      : {}),
    ...(resolveRequestQueryParam(request, "sessionId")
      ? { sessionId: resolveRequestQueryParam(request, "sessionId") }
      : {}),
  };
};

const readStringField = (source: ContextSource, key: string): string | undefined =>
  typeof source[key] === "string" ? source[key] : undefined;

const resolveBuilderProjectId = (
  querySource: ContextSource,
  bodySource: ContextSource,
  paramSource: ContextSource,
): string => {
  const candidate =
    readStringField(bodySource, "projectId") ??
    readStringField(querySource, "projectId") ??
    readStringField(paramSource, "projectId") ??
    "";
  const normalized = candidate.trim();
  return normalized.length > 0 ? normalized : defaultBuilderProjectId;
};

const resolveBuilderLocale = (
  request: Request | undefined,
  querySource: ContextSource,
  bodySource: ContextSource,
): LocaleCode => {
  const explicitLocale =
    readStringField(bodySource, "locale") ?? readStringField(querySource, "locale");
  if (explicitLocale) {
    return normalizeLocale(explicitLocale);
  }
  return request ? resolveRequestLocale(request) : appConfig.defaultLocale;
};

const resolveBuilderCurrentPath = (
  request: Request | undefined,
  querySource: ContextSource,
  bodySource: ContextSource,
): string => {
  const candidate =
    readStringField(bodySource, "currentPath") ??
    readStringField(bodySource, "redirectPath") ??
    readStringField(querySource, "currentPath");
  const normalized = (candidate ?? "").trim();
  if (normalized.length > 0) {
    return normalized;
  }
  return request ? resolveRequestPathname(request) : appRoutes.builder;
};

const resolveBuilderSearch = (
  querySource: ContextSource,
  bodySource: ContextSource,
  fallback = "",
): string => {
  const candidate = readStringField(bodySource, "search") ?? readStringField(querySource, "search");
  const normalized = candidate?.trim() ?? "";
  return normalized.length > 0 ? normalized : fallback;
};

/**
 * Resolves canonical builder request context from request/query/body/params sources.
 */
export const resolveBuilderRequestContext = (input: {
  readonly request?: Request;
  readonly query?: unknown;
  readonly body?: unknown;
  readonly params?: unknown;
  readonly auth?: unknown;
}): BuilderRequestContext => {
  const querySource =
    input.query === undefined ? toSearchParamSource(input.request) : toContextSource(input.query);
  const bodySource = toContextSource(input.body);
  const paramSource = toContextSource(input.params);
  const authCookieSource = isAuthCookieSource(input.auth) ? input.auth : {};

  const authSession = resolveAuthSession(authCookieSource);
  const principal = authSession.principal as AuthPrincipal;

  return {
    builderLocale: resolveBuilderLocale(input.request, querySource, bodySource),
    builderProjectId: resolveBuilderProjectId(querySource, bodySource, paramSource),
    builderCurrentPath: resolveBuilderCurrentPath(input.request, querySource, bodySource),
    builderSearch: resolveBuilderSearch(querySource, bodySource),
    builderPrincipalType: principal.actorType,
    builderPrincipalUserId: principal.actorId,
    builderPrincipalOrganizationId: principal.organizationId,
    builderPrincipalRoleKeys: principal.roleKeys,
  };
};

const isAuthCookieSource = (value: unknown): value is AuthCookieBag =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).length >= 0;

/**
 * Merges validated body/query/params overrides onto an existing request-derived builder context.
 */
export const mergeBuilderRequestContext = (
  base: BuilderRequestContext,
  input: {
    readonly body?: unknown;
    readonly query?: unknown;
    readonly params?: unknown;
  },
): BuilderRequestContext => {
  const querySource = toContextSource(input.query);
  const bodySource = toContextSource(input.body);
  const paramSource = toContextSource(input.params);

  return {
    builderLocale:
      (readStringField(bodySource, "locale") ?? readStringField(querySource, "locale"))
        ? resolveBuilderLocale(undefined, querySource, bodySource)
        : base.builderLocale,
    builderProjectId:
      (readStringField(bodySource, "projectId") ??
      readStringField(querySource, "projectId") ??
      readStringField(paramSource, "projectId"))
        ? resolveBuilderProjectId(querySource, bodySource, paramSource)
        : base.builderProjectId,
    builderCurrentPath:
      (readStringField(bodySource, "currentPath") ??
      readStringField(bodySource, "redirectPath") ??
      readStringField(querySource, "currentPath"))
        ? resolveBuilderCurrentPath(undefined, querySource, bodySource)
        : base.builderCurrentPath,
    builderSearch:
      (readStringField(bodySource, "search") ?? readStringField(querySource, "search"))
        ? resolveBuilderSearch(querySource, bodySource, base.builderSearch)
        : base.builderSearch,
    builderPrincipalType: base.builderPrincipalType,
    builderPrincipalUserId: base.builderPrincipalUserId,
    builderPrincipalOrganizationId: base.builderPrincipalOrganizationId,
    builderPrincipalRoleKeys: base.builderPrincipalRoleKeys,
  };
};

/**
 * Reads canonical builder context from one scoped request context plus optional body/query/param
 * overrides in a single owner-controlled merge.
 *
 * @param base Existing scoped builder request context.
 * @param input Optional body/query/param override payloads.
 * @returns Canonical builder context with all provided overrides applied in builder precedence order.
 */
export const readBuilderScopedContext = (
  base: Pick<BuilderRequestContext, "builderLocale" | "builderProjectId" | "builderCurrentPath"> &
    Partial<
      Pick<
        BuilderRequestContext,
        "builderSearch" | "builderPrincipalType" | "builderPrincipalUserId" | "builderPrincipalOrganizationId" | "builderPrincipalRoleKeys"
      >
    >,
  input: {
    readonly body?: unknown;
    readonly query?: unknown;
    readonly params?: unknown;
  },
): BuilderRequestContext =>
  mergeBuilderRequestContext(
    {
      builderLocale: base.builderLocale,
      builderProjectId: base.builderProjectId,
      builderCurrentPath: base.builderCurrentPath,
      builderSearch: base.builderSearch ?? "",
      builderPrincipalType: base.builderPrincipalType ?? "anonymous",
      builderPrincipalUserId: base.builderPrincipalUserId ?? null,
      builderPrincipalOrganizationId: base.builderPrincipalOrganizationId ?? null,
      builderPrincipalRoleKeys: base.builderPrincipalRoleKeys ?? [],
    },
    input,
  );

/**
 * Elysia plugin that derives canonical builder locale, project, and current path per request.
 */
export const builderRequestContextPlugin = new Elysia({ name: "builder-request-context" }).derive(
  { as: "scoped" },
  ({ request, cookie }) => {
    const context = resolveBuilderRequestContext({ request, auth: cookie });

    return {
      builderLocale: context.builderLocale,
      builderProjectId: context.builderProjectId,
      builderCurrentPath: context.builderCurrentPath,
      builderSearch: context.builderSearch,
      builderPrincipalType: context.builderPrincipalType,
      builderPrincipalUserId: context.builderPrincipalUserId,
      builderPrincipalOrganizationId: context.builderPrincipalOrganizationId,
      builderPrincipalRoleKeys: context.builderPrincipalRoleKeys,
    };
  },
);
