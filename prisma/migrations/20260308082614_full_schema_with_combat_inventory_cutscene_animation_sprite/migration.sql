-- CreateTable
CREATE TABLE "OracleInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "fortune" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AiKnowledgeDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "contentHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AiKnowledgeChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "searchText" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "tokenEstimate" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiKnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "AiKnowledgeDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiKnowledgeChunkTerm" (
    "chunkId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "occurrenceCount" INTEGER NOT NULL,

    PRIMARY KEY ("chunkId", "term"),
    CONSTRAINT "AiKnowledgeChunkTerm_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "AiKnowledgeChunk" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerSessionId" TEXT NOT NULL DEFAULT 'anonymous',
    "seed" INTEGER NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "sceneId" TEXT NOT NULL DEFAULT 'teaHouse',
    "projectId" TEXT,
    "releaseVersion" INTEGER,
    "stateVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GameSessionSceneState" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "sceneMode" TEXT NOT NULL,
    "sceneTitle" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "geometryWidth" INTEGER NOT NULL,
    "geometryHeight" INTEGER NOT NULL,
    CONSTRAINT "GameSessionSceneState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionSceneCollision" (
    "sessionId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,

    PRIMARY KEY ("sessionId", "ordinal"),
    CONSTRAINT "GameSessionSceneCollision_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionSceneNode" (
    "sessionId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "nodeType" TEXT NOT NULL,
    "assetId" TEXT,
    "animationClipId" TEXT,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    "positionZ" REAL,
    "sizeWidth" REAL,
    "sizeHeight" REAL,
    "layer" TEXT,
    "rotationX" REAL,
    "rotationY" REAL,
    "rotationZ" REAL,
    "scaleX" REAL,
    "scaleY" REAL,
    "scaleZ" REAL,

    PRIMARY KEY ("sessionId", "id"),
    CONSTRAINT "GameSessionSceneNode_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionSceneAsset" (
    "sessionId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sceneMode" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceFormat" TEXT NOT NULL,
    "sourceMimeType" TEXT,
    "approved" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("sessionId", "id"),
    CONSTRAINT "GameSessionSceneAsset_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionSceneAssetTag" (
    "sessionId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    PRIMARY KEY ("sessionId", "assetId", "ordinal"),
    CONSTRAINT "GameSessionSceneAssetTag_sessionId_assetId_fkey" FOREIGN KEY ("sessionId", "assetId") REFERENCES "GameSessionSceneAsset" ("sessionId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionSceneAssetVariant" (
    "sessionId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "mimeType" TEXT,

    PRIMARY KEY ("sessionId", "assetId", "id"),
    CONSTRAINT "GameSessionSceneAssetVariant_sessionId_assetId_fkey" FOREIGN KEY ("sessionId", "assetId") REFERENCES "GameSessionSceneAsset" ("sessionId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionParticipant" (
    "sessionId" TEXT NOT NULL,
    "participantSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("sessionId", "participantSessionId"),
    CONSTRAINT "GameSessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionActor" (
    "sessionId" TEXT NOT NULL,
    "participantSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "characterKey" TEXT NOT NULL,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    "facing" TEXT NOT NULL,
    "animation" TEXT NOT NULL,
    "frame" INTEGER NOT NULL,
    "velocityX" REAL NOT NULL,
    "velocityY" REAL NOT NULL,
    "boundsX" REAL NOT NULL,
    "boundsY" REAL NOT NULL,
    "boundsWidth" REAL NOT NULL,
    "boundsHeight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("sessionId", "participantSessionId"),
    CONSTRAINT "GameSessionActor_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionRuntimeState" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "cameraX" REAL NOT NULL,
    "cameraY" REAL NOT NULL,
    "uiState" TEXT NOT NULL,
    "actionState" TEXT NOT NULL,
    "worldTimeMs" INTEGER NOT NULL,
    "dialogueNpcId" TEXT,
    "dialogueNpcLabel" TEXT,
    "dialogueLine" TEXT,
    "dialogueLineKey" TEXT,
    CONSTRAINT "GameSessionRuntimeState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionNpc" (
    "sessionId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "characterKey" TEXT NOT NULL,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    "label" TEXT NOT NULL,
    "facing" TEXT NOT NULL,
    "animation" TEXT NOT NULL,
    "frame" INTEGER NOT NULL,
    "velocityX" REAL NOT NULL,
    "velocityY" REAL NOT NULL,
    "boundsX" REAL NOT NULL,
    "boundsY" REAL NOT NULL,
    "boundsWidth" REAL NOT NULL,
    "boundsHeight" REAL NOT NULL,
    "aiEnabled" BOOLEAN NOT NULL,
    "dialogueIndex" INTEGER NOT NULL,
    "interactRadius" REAL NOT NULL,
    "homePositionX" REAL NOT NULL,
    "homePositionY" REAL NOT NULL,
    "wanderRadius" REAL NOT NULL,
    "wanderSpeed" REAL NOT NULL,
    "idlePauseMinMs" INTEGER NOT NULL,
    "idlePauseMaxMs" INTEGER NOT NULL,
    "greetOnApproach" BOOLEAN NOT NULL,
    "greetLineKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "state" TEXT NOT NULL,

    PRIMARY KEY ("sessionId", "id"),
    CONSTRAINT "GameSessionNpc_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionNpcDialogueKey" (
    "sessionId" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "key" TEXT NOT NULL,

    PRIMARY KEY ("sessionId", "npcId", "ordinal"),
    CONSTRAINT "GameSessionNpcDialogueKey_sessionId_npcId_fkey" FOREIGN KEY ("sessionId", "npcId") REFERENCES "GameSessionNpc" ("sessionId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionNpcDialogueEntry" (
    "sessionId" TEXT NOT NULL,
    "npcId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    PRIMARY KEY ("sessionId", "npcId", "ordinal"),
    CONSTRAINT "GameSessionNpcDialogueEntry_sessionId_npcId_fkey" FOREIGN KEY ("sessionId", "npcId") REFERENCES "GameSessionNpc" ("sessionId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionTrigger" (
    "sessionId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "sceneId" TEXT,
    "npcId" TEXT,
    "nodeId" TEXT,
    "questId" TEXT,
    "questStepId" TEXT,

    PRIMARY KEY ("sessionId", "id"),
    CONSTRAINT "GameSessionTrigger_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionTriggerRequiredFlag" (
    "sessionId" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" REAL,
    "boolValue" BOOLEAN,

    PRIMARY KEY ("sessionId", "triggerId", "key"),
    CONSTRAINT "GameSessionTriggerRequiredFlag_sessionId_triggerId_fkey" FOREIGN KEY ("sessionId", "triggerId") REFERENCES "GameSessionTrigger" ("sessionId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionTriggerSetFlag" (
    "sessionId" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" REAL,
    "boolValue" BOOLEAN,

    PRIMARY KEY ("sessionId", "triggerId", "key"),
    CONSTRAINT "GameSessionTriggerSetFlag_sessionId_triggerId_fkey" FOREIGN KEY ("sessionId", "triggerId") REFERENCES "GameSessionTrigger" ("sessionId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionQuest" (
    "sessionId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,

    PRIMARY KEY ("sessionId", "id"),
    CONSTRAINT "GameSessionQuest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionQuestStep" (
    "sessionId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    PRIMARY KEY ("sessionId", "questId", "id"),
    CONSTRAINT "GameSessionQuestStep_sessionId_questId_fkey" FOREIGN KEY ("sessionId", "questId") REFERENCES "GameSessionQuest" ("sessionId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionFlag" (
    "sessionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" REAL,
    "boolValue" BOOLEAN,

    PRIMARY KEY ("sessionId", "key"),
    CONSTRAINT "GameSessionFlag_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" JSONB NOT NULL,
    "checksum" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "updatedBy" TEXT NOT NULL DEFAULT 'system',
    "source" TEXT NOT NULL DEFAULT 'builder-service-seed',
    "latestReleaseVersion" INTEGER NOT NULL DEFAULT 0,
    "publishedReleaseVersion" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BuilderProjectRelease" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "releaseVersion" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuilderProjectRelease_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectScene" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "sceneMode" TEXT,
    "titleKey" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "geometryWidth" INTEGER NOT NULL,
    "geometryHeight" INTEGER NOT NULL,
    "spawnX" INTEGER NOT NULL,
    "spawnY" INTEGER NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectScene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectSceneCollision" (
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    PRIMARY KEY ("projectId", "sceneId", "ordinal"),
    CONSTRAINT "BuilderProjectSceneCollision_projectId_sceneId_fkey" FOREIGN KEY ("projectId", "sceneId") REFERENCES "BuilderProjectScene" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectSceneNpc" (
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "characterKey" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "BuilderProjectSceneNpcDialogueKey" (
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "characterKey" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "key" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "sceneId", "characterKey", "ordinal"),
    CONSTRAINT "BuilderProjectSceneNpcDialogueKey_projectId_sceneId_characterKey_fkey" FOREIGN KEY ("projectId", "sceneId", "characterKey") REFERENCES "BuilderProjectSceneNpc" ("projectId", "sceneId", "characterKey") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectSceneNode" (
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "nodeType" TEXT NOT NULL,
    "assetId" TEXT,
    "animationClipId" TEXT,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    "positionZ" REAL,
    "sizeWidth" REAL,
    "sizeHeight" REAL,
    "layer" TEXT,
    "rotationX" REAL,
    "rotationY" REAL,
    "rotationZ" REAL,
    "scaleX" REAL,
    "scaleY" REAL,
    "scaleZ" REAL,

    PRIMARY KEY ("projectId", "sceneId", "id"),
    CONSTRAINT "BuilderProjectSceneNode_projectId_sceneId_fkey" FOREIGN KEY ("projectId", "sceneId") REFERENCES "BuilderProjectScene" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectDialogueEntry" (
    "projectId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "locale", "key"),
    CONSTRAINT "BuilderProjectDialogueEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAsset" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sceneMode" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceFormat" TEXT NOT NULL DEFAULT 'dat',
    "sourceMimeType" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAssetTag" (
    "projectId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "assetId", "ordinal"),
    CONSTRAINT "BuilderProjectAssetTag_projectId_assetId_fkey" FOREIGN KEY ("projectId", "assetId") REFERENCES "BuilderProjectAsset" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAssetVariant" (
    "projectId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "mimeType" TEXT,

    PRIMARY KEY ("projectId", "assetId", "id"),
    CONSTRAINT "BuilderProjectAssetVariant_projectId_assetId_fkey" FOREIGN KEY ("projectId", "assetId") REFERENCES "BuilderProjectAsset" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAnimationClip" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sceneMode" TEXT NOT NULL,
    "stateTag" TEXT NOT NULL,
    "playbackFps" INTEGER NOT NULL,
    "startFrame" INTEGER NOT NULL,
    "frameCount" INTEGER NOT NULL,
    "loop" BOOLEAN NOT NULL,
    "direction" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectAnimationClip_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BuilderProjectAnimationClip_projectId_assetId_fkey" FOREIGN KEY ("projectId", "assetId") REFERENCES "BuilderProjectAsset" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectGenerationJob" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "targetId" TEXT,
    "statusMessage" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectGenerationJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectGenerationJobArtifact" (
    "projectId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "artifactId" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "jobId", "ordinal"),
    CONSTRAINT "BuilderProjectGenerationJobArtifact_projectId_jobId_fkey" FOREIGN KEY ("projectId", "jobId") REFERENCES "BuilderProjectGenerationJob" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectDialogueGraph" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "npcId" TEXT,
    "rootNodeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectDialogueGraph_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectDialogueGraphNode" (
    "projectId" TEXT NOT NULL,
    "graphId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "line" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "graphId", "id"),
    CONSTRAINT "BuilderProjectDialogueGraphNode_projectId_graphId_fkey" FOREIGN KEY ("projectId", "graphId") REFERENCES "BuilderProjectDialogueGraph" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectDialogueGraphEdge" (
    "projectId" TEXT NOT NULL,
    "graphId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "requiredFlag" TEXT,
    "advanceQuestStepId" TEXT,

    PRIMARY KEY ("projectId", "graphId", "nodeId", "ordinal"),
    CONSTRAINT "BuilderProjectDialogueGraphEdge_projectId_graphId_nodeId_fkey" FOREIGN KEY ("projectId", "graphId", "nodeId") REFERENCES "BuilderProjectDialogueGraphNode" ("projectId", "graphId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectQuest" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectQuest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectQuestStep" (
    "projectId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "questId", "id"),
    CONSTRAINT "BuilderProjectQuestStep_projectId_questId_fkey" FOREIGN KEY ("projectId", "questId") REFERENCES "BuilderProjectQuest" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectTrigger" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "sceneId" TEXT,
    "npcId" TEXT,
    "nodeId" TEXT,
    "questId" TEXT,
    "questStepId" TEXT,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectTrigger_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectTriggerRequiredFlag" (
    "projectId" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" REAL,
    "boolValue" BOOLEAN,

    PRIMARY KEY ("projectId", "triggerId", "key"),
    CONSTRAINT "BuilderProjectTriggerRequiredFlag_projectId_triggerId_fkey" FOREIGN KEY ("projectId", "triggerId") REFERENCES "BuilderProjectTrigger" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectTriggerSetFlag" (
    "projectId" TEXT NOT NULL,
    "triggerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "stringValue" TEXT,
    "numberValue" REAL,
    "boolValue" BOOLEAN,

    PRIMARY KEY ("projectId", "triggerId", "key"),
    CONSTRAINT "BuilderProjectTriggerSetFlag_projectId_triggerId_fkey" FOREIGN KEY ("projectId", "triggerId") REFERENCES "BuilderProjectTrigger" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectFlag" (
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'boolean',
    "stringValue" TEXT,
    "numberValue" REAL,
    "boolValue" BOOLEAN DEFAULT false,

    PRIMARY KEY ("projectId", "key"),
    CONSTRAINT "BuilderProjectFlag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectArtifact" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "previewSource" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "mimeType" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectArtifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAutomationRun" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "statusMessage" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectAutomationRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAutomationRunStep" (
    "projectId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "evidenceSource" TEXT,

    PRIMARY KEY ("projectId", "runId", "id"),
    CONSTRAINT "BuilderProjectAutomationRunStep_projectId_runId_fkey" FOREIGN KEY ("projectId", "runId") REFERENCES "BuilderProjectAutomationRun" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAutomationRunArtifact" (
    "projectId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "artifactId" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "runId", "ordinal"),
    CONSTRAINT "BuilderProjectAutomationRunArtifact_projectId_runId_fkey" FOREIGN KEY ("projectId", "runId") REFERENCES "BuilderProjectAutomationRun" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerProgress_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerProgressVisitedScene" (
    "sessionId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "sceneId" TEXT NOT NULL,

    PRIMARY KEY ("sessionId", "ordinal"),
    CONSTRAINT "PlayerProgressVisitedScene_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PlayerProgress" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerProgressInteraction" (
    "sessionId" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("sessionId", "interactionId"),
    CONSTRAINT "PlayerProgressInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PlayerProgress" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiGenerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GameSessionInventorySlot" (
    "sessionId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("sessionId", "slotIndex"),
    CONSTRAINT "GameSessionInventorySlot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionEquipment" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "weapon" TEXT,
    "armor" TEXT,
    "accessory" TEXT,
    "currency" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GameSessionEquipment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionCombatState" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "encounterId" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'intro',
    "turnIndex" INTEGER NOT NULL DEFAULT 0,
    "activeActorIndex" INTEGER NOT NULL DEFAULT 0,
    "lootTableId" TEXT,
    "combatLog" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "GameSessionCombatState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionCombatant" (
    "sessionId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "characterKey" TEXT NOT NULL,
    "isPlayer" BOOLEAN NOT NULL DEFAULT false,
    "maxHp" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "maxMp" INTEGER NOT NULL DEFAULT 0,
    "mp" INTEGER NOT NULL DEFAULT 0,
    "attack" INTEGER NOT NULL DEFAULT 10,
    "defense" INTEGER NOT NULL DEFAULT 5,
    "magicAttack" INTEGER NOT NULL DEFAULT 0,
    "magicDefense" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 10,
    "critRate" REAL NOT NULL DEFAULT 0.05,
    "critMultiplier" REAL NOT NULL DEFAULT 1.5,
    "alive" BOOLEAN NOT NULL DEFAULT true,
    "ordinal" INTEGER NOT NULL DEFAULT 0,
    "statusEffects" TEXT NOT NULL DEFAULT '[]',

    PRIMARY KEY ("sessionId", "id"),
    CONSTRAINT "GameSessionCombatant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameSessionCutsceneState" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "cutsceneId" TEXT NOT NULL,
    "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
    "stepElapsedMs" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL DEFAULT 'playing',
    CONSTRAINT "GameSessionCutsceneState_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectEnemyTemplate" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "labelKey" TEXT NOT NULL,
    "characterKey" TEXT NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "maxMp" INTEGER NOT NULL DEFAULT 0,
    "attack" INTEGER NOT NULL DEFAULT 10,
    "defense" INTEGER NOT NULL DEFAULT 5,
    "magicAttack" INTEGER NOT NULL DEFAULT 0,
    "magicDefense" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 10,
    "critRate" REAL NOT NULL DEFAULT 0.05,
    "critMultiplier" REAL NOT NULL DEFAULT 1.5,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "dropIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectEnemyTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectItemDefinition" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "labelKey" TEXT NOT NULL,
    "descriptionKey" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "equipSlot" TEXT,
    "stackable" BOOLEAN NOT NULL DEFAULT true,
    "maxStack" INTEGER NOT NULL DEFAULT 99,
    "statEffects" TEXT NOT NULL DEFAULT '[]',
    "useEffects" TEXT NOT NULL DEFAULT '[]',
    "sellValue" INTEGER NOT NULL DEFAULT 0,
    "spriteAssetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectItemDefinition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectCutsceneDefinition" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "triggerId" TEXT,
    "skippable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectCutsceneDefinition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectCutsceneStep" (
    "projectId" TEXT NOT NULL,
    "cutsceneId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "speakerKey" TEXT,
    "dialogueKey" TEXT,
    "entityId" TEXT,
    "animationKey" TEXT,
    "cameraTargetX" REAL,
    "cameraTargetY" REAL,
    "flagKey" TEXT,
    "flagValue" TEXT,
    "soundAssetId" TEXT,

    PRIMARY KEY ("projectId", "cutsceneId", "id"),
    CONSTRAINT "BuilderProjectCutsceneStep_projectId_cutsceneId_fkey" FOREIGN KEY ("projectId", "cutsceneId") REFERENCES "BuilderProjectCutsceneDefinition" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAnimationTimeline" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "stateTag" TEXT NOT NULL,
    "sceneMode" TEXT NOT NULL DEFAULT '2d',
    "durationMs" INTEGER NOT NULL DEFAULT 1000,
    "loop" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectAnimationTimeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectAnimationTrack" (
    "projectId" TEXT NOT NULL,
    "timelineId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "keyframes" TEXT NOT NULL DEFAULT '[]',

    PRIMARY KEY ("projectId", "timelineId", "id"),
    CONSTRAINT "BuilderProjectAnimationTrack_projectId_timelineId_fkey" FOREIGN KEY ("projectId", "timelineId") REFERENCES "BuilderProjectAnimationTimeline" ("projectId", "id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuilderProjectSpriteAtlas" (
    "projectId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "atlasWidth" INTEGER NOT NULL,
    "atlasHeight" INTEGER NOT NULL,
    "frames" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("projectId", "id"),
    CONSTRAINT "BuilderProjectSpriteAtlas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BuilderProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AiKnowledgeDocument_projectId_idx" ON "AiKnowledgeDocument"("projectId");

-- CreateIndex
CREATE INDEX "AiKnowledgeDocument_projectId_locale_idx" ON "AiKnowledgeDocument"("projectId", "locale");

-- CreateIndex
CREATE INDEX "AiKnowledgeChunk_documentId_idx" ON "AiKnowledgeChunk"("documentId");

-- CreateIndex
CREATE INDEX "AiKnowledgeChunk_documentId_ordinal_idx" ON "AiKnowledgeChunk"("documentId", "ordinal");

-- CreateIndex
CREATE INDEX "AiKnowledgeChunk_documentId_searchText_idx" ON "AiKnowledgeChunk"("documentId", "searchText");

-- CreateIndex
CREATE INDEX "AiKnowledgeChunkTerm_term_idx" ON "AiKnowledgeChunkTerm"("term");

-- CreateIndex
CREATE INDEX "AiKnowledgeChunkTerm_term_chunkId_idx" ON "AiKnowledgeChunkTerm"("term", "chunkId");

-- CreateIndex
CREATE INDEX "GameSessionSceneCollision_sessionId_idx" ON "GameSessionSceneCollision"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionSceneNode_sessionId_idx" ON "GameSessionSceneNode"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionSceneNode_sessionId_ordinal_key" ON "GameSessionSceneNode"("sessionId", "ordinal");

-- CreateIndex
CREATE INDEX "GameSessionSceneAsset_sessionId_idx" ON "GameSessionSceneAsset"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionSceneAssetTag_sessionId_assetId_idx" ON "GameSessionSceneAssetTag"("sessionId", "assetId");

-- CreateIndex
CREATE INDEX "GameSessionSceneAssetVariant_sessionId_assetId_idx" ON "GameSessionSceneAssetVariant"("sessionId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionSceneAssetVariant_sessionId_assetId_ordinal_key" ON "GameSessionSceneAssetVariant"("sessionId", "assetId", "ordinal");

-- CreateIndex
CREATE INDEX "GameSessionParticipant_sessionId_idx" ON "GameSessionParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionActor_sessionId_idx" ON "GameSessionActor"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionNpc_sessionId_idx" ON "GameSessionNpc"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionNpc_sessionId_ordinal_key" ON "GameSessionNpc"("sessionId", "ordinal");

-- CreateIndex
CREATE INDEX "GameSessionNpcDialogueKey_sessionId_npcId_idx" ON "GameSessionNpcDialogueKey"("sessionId", "npcId");

-- CreateIndex
CREATE INDEX "GameSessionNpcDialogueEntry_sessionId_npcId_idx" ON "GameSessionNpcDialogueEntry"("sessionId", "npcId");

-- CreateIndex
CREATE INDEX "GameSessionTrigger_sessionId_idx" ON "GameSessionTrigger"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionTriggerRequiredFlag_sessionId_triggerId_idx" ON "GameSessionTriggerRequiredFlag"("sessionId", "triggerId");

-- CreateIndex
CREATE INDEX "GameSessionTriggerSetFlag_sessionId_triggerId_idx" ON "GameSessionTriggerSetFlag"("sessionId", "triggerId");

-- CreateIndex
CREATE INDEX "GameSessionQuest_sessionId_idx" ON "GameSessionQuest"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionQuest_sessionId_ordinal_key" ON "GameSessionQuest"("sessionId", "ordinal");

-- CreateIndex
CREATE INDEX "GameSessionQuestStep_sessionId_questId_idx" ON "GameSessionQuestStep"("sessionId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionQuestStep_sessionId_questId_ordinal_key" ON "GameSessionQuestStep"("sessionId", "questId", "ordinal");

-- CreateIndex
CREATE INDEX "GameSessionFlag_sessionId_idx" ON "GameSessionFlag"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectRelease_projectId_releaseVersion_key" ON "BuilderProjectRelease"("projectId", "releaseVersion");

-- CreateIndex
CREATE INDEX "BuilderProjectScene_projectId_idx" ON "BuilderProjectScene"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectSceneCollision_projectId_sceneId_idx" ON "BuilderProjectSceneCollision"("projectId", "sceneId");

-- CreateIndex
CREATE INDEX "BuilderProjectSceneNpc_projectId_sceneId_idx" ON "BuilderProjectSceneNpc"("projectId", "sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectSceneNpc_projectId_sceneId_ordinal_key" ON "BuilderProjectSceneNpc"("projectId", "sceneId", "ordinal");

-- CreateIndex
CREATE INDEX "BuilderProjectSceneNpcDialogueKey_projectId_sceneId_characterKey_idx" ON "BuilderProjectSceneNpcDialogueKey"("projectId", "sceneId", "characterKey");

-- CreateIndex
CREATE INDEX "BuilderProjectSceneNode_projectId_sceneId_idx" ON "BuilderProjectSceneNode"("projectId", "sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectSceneNode_projectId_sceneId_ordinal_key" ON "BuilderProjectSceneNode"("projectId", "sceneId", "ordinal");

-- CreateIndex
CREATE INDEX "BuilderProjectDialogueEntry_projectId_idx" ON "BuilderProjectDialogueEntry"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectDialogueEntry_projectId_locale_idx" ON "BuilderProjectDialogueEntry"("projectId", "locale");

-- CreateIndex
CREATE INDEX "BuilderProjectAsset_projectId_idx" ON "BuilderProjectAsset"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectAssetTag_projectId_assetId_idx" ON "BuilderProjectAssetTag"("projectId", "assetId");

-- CreateIndex
CREATE INDEX "BuilderProjectAssetVariant_projectId_assetId_idx" ON "BuilderProjectAssetVariant"("projectId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectAssetVariant_projectId_assetId_ordinal_key" ON "BuilderProjectAssetVariant"("projectId", "assetId", "ordinal");

-- CreateIndex
CREATE INDEX "BuilderProjectAnimationClip_projectId_idx" ON "BuilderProjectAnimationClip"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectGenerationJob_projectId_idx" ON "BuilderProjectGenerationJob"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectGenerationJobArtifact_projectId_jobId_idx" ON "BuilderProjectGenerationJobArtifact"("projectId", "jobId");

-- CreateIndex
CREATE INDEX "BuilderProjectDialogueGraph_projectId_idx" ON "BuilderProjectDialogueGraph"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectDialogueGraphNode_projectId_graphId_idx" ON "BuilderProjectDialogueGraphNode"("projectId", "graphId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectDialogueGraphNode_projectId_graphId_ordinal_key" ON "BuilderProjectDialogueGraphNode"("projectId", "graphId", "ordinal");

-- CreateIndex
CREATE INDEX "BuilderProjectDialogueGraphEdge_projectId_graphId_nodeId_idx" ON "BuilderProjectDialogueGraphEdge"("projectId", "graphId", "nodeId");

-- CreateIndex
CREATE INDEX "BuilderProjectQuest_projectId_idx" ON "BuilderProjectQuest"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectQuestStep_projectId_questId_idx" ON "BuilderProjectQuestStep"("projectId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectQuestStep_projectId_questId_ordinal_key" ON "BuilderProjectQuestStep"("projectId", "questId", "ordinal");

-- CreateIndex
CREATE INDEX "BuilderProjectTrigger_projectId_idx" ON "BuilderProjectTrigger"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectTriggerRequiredFlag_projectId_triggerId_idx" ON "BuilderProjectTriggerRequiredFlag"("projectId", "triggerId");

-- CreateIndex
CREATE INDEX "BuilderProjectTriggerSetFlag_projectId_triggerId_idx" ON "BuilderProjectTriggerSetFlag"("projectId", "triggerId");

-- CreateIndex
CREATE INDEX "BuilderProjectFlag_projectId_idx" ON "BuilderProjectFlag"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectArtifact_projectId_idx" ON "BuilderProjectArtifact"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectAutomationRun_projectId_idx" ON "BuilderProjectAutomationRun"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectAutomationRunStep_projectId_runId_idx" ON "BuilderProjectAutomationRunStep"("projectId", "runId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectAutomationRunStep_projectId_runId_ordinal_key" ON "BuilderProjectAutomationRunStep"("projectId", "runId", "ordinal");

-- CreateIndex
CREATE INDEX "BuilderProjectAutomationRunArtifact_projectId_runId_idx" ON "BuilderProjectAutomationRunArtifact"("projectId", "runId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProgress_sessionId_key" ON "PlayerProgress"("sessionId");

-- CreateIndex
CREATE INDEX "PlayerProgressVisitedScene_sessionId_idx" ON "PlayerProgressVisitedScene"("sessionId");

-- CreateIndex
CREATE INDEX "PlayerProgressInteraction_sessionId_idx" ON "PlayerProgressInteraction"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionInventorySlot_sessionId_idx" ON "GameSessionInventorySlot"("sessionId");

-- CreateIndex
CREATE INDEX "GameSessionCombatant_sessionId_idx" ON "GameSessionCombatant"("sessionId");

-- CreateIndex
CREATE INDEX "BuilderProjectEnemyTemplate_projectId_idx" ON "BuilderProjectEnemyTemplate"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectItemDefinition_projectId_idx" ON "BuilderProjectItemDefinition"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectCutsceneDefinition_projectId_idx" ON "BuilderProjectCutsceneDefinition"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectCutsceneStep_projectId_cutsceneId_idx" ON "BuilderProjectCutsceneStep"("projectId", "cutsceneId");

-- CreateIndex
CREATE UNIQUE INDEX "BuilderProjectCutsceneStep_projectId_cutsceneId_ordinal_key" ON "BuilderProjectCutsceneStep"("projectId", "cutsceneId", "ordinal");

-- CreateIndex
CREATE INDEX "BuilderProjectAnimationTimeline_projectId_idx" ON "BuilderProjectAnimationTimeline"("projectId");

-- CreateIndex
CREATE INDEX "BuilderProjectAnimationTimeline_projectId_assetId_idx" ON "BuilderProjectAnimationTimeline"("projectId", "assetId");

-- CreateIndex
CREATE INDEX "BuilderProjectAnimationTrack_projectId_timelineId_idx" ON "BuilderProjectAnimationTrack"("projectId", "timelineId");

-- CreateIndex
CREATE INDEX "BuilderProjectSpriteAtlas_projectId_idx" ON "BuilderProjectSpriteAtlas"("projectId");
