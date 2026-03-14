CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "correlationId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "requestSource" TEXT NOT NULL,
  "policyDecision" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "actorOrganizationId" TEXT,
  "actorRoleKeys" TEXT NOT NULL DEFAULT '',
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "metadataJson" TEXT
);

CREATE INDEX "AuditEvent_occurredAt_idx" ON "AuditEvent"("occurredAt");
CREATE INDEX "AuditEvent_correlationId_idx" ON "AuditEvent"("correlationId");
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");
CREATE INDEX "AuditEvent_targetType_targetId_idx" ON "AuditEvent"("targetType", "targetId");
