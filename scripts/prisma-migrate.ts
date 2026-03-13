import { extractKnowledgeSearchTerms } from "../src/domain/ai/knowledge-search-text.ts";
import { createLogger } from "../src/lib/logger.ts";
import { prismaBase } from "../src/shared/services/db.ts";
import { settleAsync } from "../src/shared/utils/async-result.ts";

const logger = createLogger("prisma.migrate");

const runCommand = async (command: readonly string[], description: string): Promise<void> => {
  logger.info("prisma.migrate.step.started", {
    command: description,
  });

  const subprocess = Bun.spawn({
    cmd: [...command],
    cwd: process.cwd(),
    stdout: "inherit",
    stderr: "inherit",
    stdin: "ignore",
  });

  const exitCode = await subprocess.exited;

  if (exitCode !== 0) {
    logger.error("prisma.migrate.step.failed", {
      command: description,
      exitCode,
    });
    throw new Error(`Migration step failed: ${description}`);
  }

  logger.info("prisma.migrate.step.completed", {
    command: description,
  });
};

const rebuildKnowledgeChunkTerms = async (): Promise<void> => {
  const chunks = await prismaBase.aiKnowledgeChunk.findMany({
    select: {
      id: true,
      searchText: true,
    },
  });

  const termRows = chunks.flatMap((chunk) =>
    extractKnowledgeSearchTerms(chunk.searchText).map((term) => ({
      chunkId: chunk.id,
      term: term.term,
      occurrenceCount: term.occurrenceCount,
    })),
  );

  await prismaBase.$transaction(async (tx) => {
    await tx.aiKnowledgeChunkTerm.deleteMany({});

    if (termRows.length > 0) {
      await tx.aiKnowledgeChunkTerm.createMany({
        data: termRows,
      });
    }
  });

  logger.info("prisma.knowledge-terms.rebuilt", {
    chunkCount: chunks.length,
    termCount: termRows.length,
  });
};

const migrationResult = await settleAsync(
  runCommand(
    ["bunx", "--bun", "prisma", "migrate", "deploy"],
    "bunx --bun prisma migrate deploy",
  ).then(() => rebuildKnowledgeChunkTerms()),
);

const disconnectResult = await settleAsync(prismaBase.$disconnect());
if (!disconnectResult.ok) {
  logger.warn("prisma.disconnect.failed", {
    error: disconnectResult.error.message,
  });
}

if (!migrationResult.ok) {
  throw migrationResult.error;
}
