ALTER TABLE "BuilderProjectArtifact"
ADD COLUMN "generationSource" TEXT;

ALTER TABLE "BuilderProjectArtifact"
ADD COLUMN "generationReason" TEXT;
