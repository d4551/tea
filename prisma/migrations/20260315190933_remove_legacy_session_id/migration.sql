-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "OrganizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialHash" TEXT,
    "passwordSalt" TEXT,
    "metadata" JSONB,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccountCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppPrincipalSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "principalType" TEXT NOT NULL DEFAULT 'anonymous',
    "userId" TEXT,
    "organizationId" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT true,
    "roleKeys" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AppPrincipalSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AppPrincipalSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppUserOrganizationMembership" (
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "organizationId"),
    CONSTRAINT "AppUserOrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppUserOrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppUserOrganizationMembership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditEvent" (
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
    "actorRoleKeys" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadataJson" TEXT
);
INSERT INTO "new_AuditEvent" ("action", "actorId", "actorOrganizationId", "actorRoleKeys", "actorType", "correlationId", "id", "metadataJson", "occurredAt", "policyDecision", "requestSource", "result", "targetId", "targetType") SELECT "action", "actorId", "actorOrganizationId", "actorRoleKeys", "actorType", "correlationId", "id", "metadataJson", "occurredAt", "policyDecision", "requestSource", "result", "targetId", "targetType" FROM "AuditEvent";
DROP TABLE "AuditEvent";
ALTER TABLE "new_AuditEvent" RENAME TO "AuditEvent";
CREATE INDEX "AuditEvent_occurredAt_idx" ON "AuditEvent"("occurredAt");
CREATE INDEX "AuditEvent_correlationId_idx" ON "AuditEvent"("correlationId");
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");
CREATE INDEX "AuditEvent_targetType_targetId_idx" ON "AuditEvent"("targetType", "targetId");
CREATE TABLE "new_BuilderProjectSceneNpc" (
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "characterKey" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "labelKey" TEXT NOT NULL,
    "interactRadius" INTEGER NOT NULL,
    "wanderRadius" INTEGER NOT NULL,
    "wanderSpeed" REAL NOT NULL,
    "idlePauseMinMs" INTEGER NOT NULL,
    "idlePauseMaxMs" INTEGER NOT NULL,
    "greetOnApproach" BOOLEAN NOT NULL,
    "greetLineKey" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "sceneId", "characterKey"),
    CONSTRAINT "BuilderProjectSceneNpc_projectId_sceneId_fkey" FOREIGN KEY ("projectId", "sceneId") REFERENCES "BuilderProjectScene" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BuilderProjectSceneNpc" ("characterKey", "displayName", "greetLineKey", "greetOnApproach", "idlePauseMaxMs", "idlePauseMinMs", "interactRadius", "labelKey", "ordinal", "projectId", "sceneId", "wanderRadius", "wanderSpeed", "x", "y") SELECT "characterKey", "displayName", "greetLineKey", "greetOnApproach", "idlePauseMaxMs", "idlePauseMinMs", "interactRadius", "labelKey", "ordinal", "projectId", "sceneId", "wanderRadius", "wanderSpeed", "x", "y" FROM "BuilderProjectSceneNpc";
DROP TABLE "BuilderProjectSceneNpc";
ALTER TABLE "new_BuilderProjectSceneNpc" RENAME TO "BuilderProjectSceneNpc";
CREATE INDEX "BuilderProjectSceneNpc_projectId_sceneId_idx" ON "BuilderProjectSceneNpc"("projectId", "sceneId");
CREATE UNIQUE INDEX "BuilderProjectSceneNpc_projectId_sceneId_ordinal_key" ON "BuilderProjectSceneNpc"("projectId", "sceneId", "ordinal");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "AppUser_status_idx" ON "AppUser"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "OrganizationRole_organizationId_idx" ON "OrganizationRole"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_organizationId_key_key" ON "OrganizationRole"("organizationId", "key");

-- CreateIndex
CREATE INDEX "AccountCredential_userId_idx" ON "AccountCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountCredential_provider_providerAccountId_key" ON "AccountCredential"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "AppPrincipalSession_userId_idx" ON "AppPrincipalSession"("userId");

-- CreateIndex
CREATE INDEX "AppPrincipalSession_organizationId_idx" ON "AppPrincipalSession"("organizationId");

-- CreateIndex
CREATE INDEX "AppPrincipalSession_status_idx" ON "AppPrincipalSession"("status");

-- CreateIndex
CREATE INDEX "AppUserOrganizationMembership_organizationId_roleId_idx" ON "AppUserOrganizationMembership"("organizationId", "roleId");

-- CreateIndex
CREATE INDEX "AppUserOrganizationMembership_status_idx" ON "AppUserOrganizationMembership"("status");
