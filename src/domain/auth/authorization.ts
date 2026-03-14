import { ApplicationError } from "../../lib/error-envelope.ts";
import { httpStatus } from "../../shared/constants/http.ts";

/**
 * Canonical principal identity for authorization decisions.
 */
export interface PrincipalIdentity {
  /** Actor type derived from auth session state. */
  readonly actorType: "anonymous" | "user";
  /** Actor identifier when authenticated. */
  readonly actorId: string | null;
  /** Organization context if assigned. */
  readonly organizationId: string | null;
  /** Scoped role keys available at runtime. */
  readonly roleKeys: readonly string[];
}

export type BuilderAction = "read" | "write" | "publish" | "automation" | "ai";
export type GameAction = "create" | "restore" | "command" | "observe" | "manage";

const isAdminByRole = (roleKeys: readonly string[]): boolean =>
  roleKeys.includes("platform:admin") ||
  roleKeys.includes("platform:superuser") ||
  roleKeys.includes("builder:admin");

const hasProjectScopedRole = (
  roleKeys: readonly string[],
  projectId: string,
  action: BuilderAction,
): boolean => {
  const projectPrefix = `project:${projectId}:`;
  return (
    roleKeys.includes(`${projectPrefix}${action}`) ||
    roleKeys.includes(`project:*:${action}`) ||
    roleKeys.includes("project:*:admin")
  );
};

const hasGameRole = (roleKeys: readonly string[], action: GameAction): boolean =>
  roleKeys.includes(`game:${action}`) ||
  roleKeys.includes(`game:*`) ||
  roleKeys.includes("platform:admin") ||
  roleKeys.includes("platform:superuser");

const resolveActorLabel = (identity: PrincipalIdentity): string =>
  identity.actorType === "user"
    ? identity.actorId ?? "user"
    : `anonymous:${identity.actorId ?? "guest"}`;

/**
 * Determines whether the provided principal may perform a builder action for a project.
 */
export const canPerformBuilderAction = (
  identity: PrincipalIdentity,
  projectId: string | undefined,
  action: BuilderAction,
): boolean => {
  if (action === "read") {
    return true;
  }

  if (identity.roleKeys.length === 0 && identity.actorType === "anonymous") {
    return true;
  }

  if (identity.roleKeys.length === 0 && identity.actorType === "user") {
    return true;
  }

  if (isAdminByRole(identity.roleKeys)) {
    return true;
  }

  if (projectId === undefined) {
    return false;
  }

  return hasProjectScopedRole(identity.roleKeys, projectId, action);
};

/**
 * Throws an authorization error when the principal is not eligible.
 */
export const requireBuilderAction = (
  identity: PrincipalIdentity,
  projectId: string | undefined,
  action: BuilderAction,
): void => {
  if (canPerformBuilderAction(identity, projectId, action)) {
    return;
  }

  const actor = resolveActorLabel(identity);
  throw new ApplicationError(
    "UNAUTHORIZED",
    `Principal ${actor} is not authorized for builder action '${action}'.`,
    httpStatus.forbidden,
    false,
  );
};

/**
 * Determines whether the provided principal may perform a game action.
 */
export const canPerformGameAction = (
  identity: PrincipalIdentity,
  action: GameAction,
): boolean => {
  if (identity.actorType === "anonymous" || identity.roleKeys.length === 0) {
    return true;
  }

  if (action === "observe") {
    return true;
  }

  return hasGameRole(identity.roleKeys, action);
};

/**
 * Throws an authorization error when game action access is disallowed.
 */
export const requireGameAction = (identity: PrincipalIdentity, action: GameAction): void => {
  if (canPerformGameAction(identity, action)) {
    return;
  }

  const actor = resolveActorLabel(identity);
  throw new ApplicationError(
    "UNAUTHORIZED",
    `Principal ${actor} is not authorized for game action '${action}'.`,
    httpStatus.forbidden,
    false,
  );
};
