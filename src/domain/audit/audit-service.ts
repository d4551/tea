import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { prisma } from "../../shared/services/db.ts";
import { settleAsync } from "../../shared/utils/async-result.ts";

const logger = createLogger("compliance.audit");

export type AuditPolicyDecision = "allow" | "deny" | "requires-approval";
export type AuditResult = "success" | "failure" | "queued" | "skipped";

export interface AuditActor {
  readonly type: "anonymous" | "user" | "system";
  readonly id: string | null;
  readonly organizationId: string | null;
  readonly roleKeys: readonly string[];
}

export interface AuditTarget {
  readonly type: string;
  readonly id: string;
}

export interface AuditEventInput {
  readonly correlationId: string;
  readonly action: string;
  readonly requestSource: string;
  readonly policyDecision: AuditPolicyDecision;
  readonly result: AuditResult;
  readonly actor: AuditActor;
  readonly target: AuditTarget;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly occurredAtMs?: number;
}

export interface AuditEventRecord extends AuditEventInput {
  readonly id: string;
  readonly occurredAt: string;
}

const toJsonString = (value: unknown): string => JSON.stringify(value ?? {});

const readCsv = (value: string): readonly string[] =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const hasTableMissingError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.message.includes("no such table") ||
    error.message.includes("does not exist") ||
    error.message.includes("Unknown table"));

export const auditService = {
  async record(event: AuditEventInput): Promise<void> {
    const occurredAt = new Date(event.occurredAtMs ?? Date.now());
    const actorRoleKeys = [...event.actor.roleKeys];

    const result = await prisma.$executeRawUnsafe(
      `
        INSERT INTO "AuditEvent" (
          "id",
          "occurredAt",
          "correlationId",
          "action",
          "requestSource",
          "policyDecision",
          "result",
          "actorType",
          "actorId",
          "actorOrganizationId",
          "actorRoleKeys",
          "targetType",
          "targetId",
          "metadataJson"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      crypto.randomUUID(),
      occurredAt.toISOString(),
      event.correlationId,
      event.action,
      event.requestSource,
      event.policyDecision,
      event.result,
      event.actor.type,
      event.actor.id,
      event.actor.organizationId,
      toJsonString(actorRoleKeys),
      event.target.type,
      event.target.id,
      toJsonString(event.metadata),
    );

    if (typeof result !== "number") {
      logger.debug("audit.record.nonstandard-result", { resultType: typeof result });
    }
  },

  async tryRecord(event: AuditEventInput): Promise<void> {
    const result = await settleAsync(this.record(event));
    if (result.ok) return;
    const error = result.error;
    if (hasTableMissingError(error)) {
      logger.warn("audit.table.missing", {
        action: event.action,
        correlationId: event.correlationId,
      });
      return;
    }
    logger.error("audit.record.failed", {
      action: event.action,
      correlationId: event.correlationId,
      message: error.message,
    });
  },

  async listRecent(limit = 100): Promise<readonly AuditEventRecord[]> {
    const boundedLimit = Math.max(1, Math.min(1000, limit));
    const result = await settleAsync(
      prisma.$queryRawUnsafe(
        `
          SELECT
            "id",
            "occurredAt",
            "correlationId",
            "action",
            "requestSource",
            "policyDecision",
            "result",
            "actorType",
            "actorId",
            "actorOrganizationId",
            "actorRoleKeys",
            "targetType",
            "targetId",
            "metadataJson"
          FROM "AuditEvent"
          ORDER BY "occurredAt" DESC
          LIMIT ?
        `,
        boundedLimit,
      ),
    );
    if (!result.ok) {
      if (hasTableMissingError(result.error)) return [];
      throw result.error;
    }
    const rows = result.value as Array<Record<string, unknown>>;
    return rows.map((row) => ({
      id: String(row.id ?? ""),
      occurredAt: String(row.occurredAt ?? new Date(0).toISOString()),
      correlationId: String(row.correlationId ?? ""),
      action: String(row.action ?? ""),
      requestSource: String(row.requestSource ?? ""),
      policyDecision: (String(row.policyDecision ?? "deny") as AuditPolicyDecision) ?? "deny",
      result: (String(row.result ?? "failure") as AuditResult) ?? "failure",
      actor: {
        type: (String(row.actorType ?? "system") as AuditActor["type"]) ?? "system",
        id: row.actorId == null ? null : String(row.actorId),
        organizationId: row.actorOrganizationId == null ? null : String(row.actorOrganizationId),
        roleKeys: readCsv(String(row.actorRoleKeys ?? "")),
      },
      target: {
        type: String(row.targetType ?? ""),
        id: String(row.targetId ?? ""),
      },
      metadata:
        typeof row.metadataJson === "string"
          ? (JSON.parse(row.metadataJson) as Record<string, unknown>)
          : undefined,
    }));
  },

  retentionPolicy() {
    return {
      auditRetentionDays: appConfig.compliance.auditRetentionDays,
      artifactRetentionDays: appConfig.compliance.artifactRetentionDays,
      exportDirectory: appConfig.compliance.exportDirectory,
    };
  },
};
