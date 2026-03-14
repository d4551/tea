-- CreateTable
CREATE TABLE "GameSaveSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerSessionId" TEXT NOT NULL,
    "slotName" TEXT,
    "slotIndex" INTEGER,
    "sceneTitle" TEXT NOT NULL,
    "sessionSnapshot" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "GameSaveSlot_ownerSessionId_idx" ON "GameSaveSlot"("ownerSessionId");

-- CreateIndex
CREATE INDEX "GameSaveSlot_ownerSessionId_slotIndex_idx" ON "GameSaveSlot"("ownerSessionId", "slotIndex");
