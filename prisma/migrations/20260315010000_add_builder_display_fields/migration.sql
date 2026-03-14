ALTER TABLE "BuilderProjectScene"
ADD COLUMN "displayTitle" TEXT NOT NULL DEFAULT '';

UPDATE "BuilderProjectScene"
SET "displayTitle" = "titleKey"
WHERE "displayTitle" = '';

ALTER TABLE "BuilderProjectSceneNpc"
ADD COLUMN "displayName" TEXT NOT NULL DEFAULT '';

UPDATE "BuilderProjectSceneNpc"
SET "displayName" = "labelKey"
WHERE "displayName" = '';
