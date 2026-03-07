import { rm } from "node:fs/promises";
import { ProviderRegistry } from "../../src/domain/ai/providers/provider-registry.ts";
import { prisma } from "../../src/shared/services/db.ts";

let providerDisposed = false;
let prismaDisconnected = false;
let testDatabaseCleaned = false;

const resolvedTestDatabaseUrl = Bun.env.DATABASE_URL ?? process.env.DATABASE_URL ?? "";

const resolveTestDatabasePath = (databaseUrl: string): string | null => {
  const normalized = databaseUrl.trim();
  const matchedPrefix = ["libsql:file:", "file:"].find((prefix) => normalized.startsWith(prefix));
  if (!matchedPrefix) {
    return null;
  }

  const pathPart = normalized.slice(matchedPrefix.length).split("?")[0]?.trim() ?? "";
  return pathPart.length > 0 ? pathPart : null;
};

const testDatabasePath = resolveTestDatabasePath(resolvedTestDatabaseUrl);

/**
 * Disposes shared AI provider state exactly once for the active Bun test process.
 */
export const disposeTestProviders = async (): Promise<void> => {
  if (providerDisposed) {
    return;
  }

  await (await ProviderRegistry.getInstance()).dispose();
  providerDisposed = true;
};

/**
 * Disconnects the shared Prisma client exactly once for the active Bun test process.
 */
export const disconnectTestPrisma = async (): Promise<void> => {
  if (prismaDisconnected) {
    return;
  }

  await prisma.$disconnect();
  prismaDisconnected = true;
};

/**
 * Removes the isolated per-process libSQL test database and sidecar files.
 */
export const cleanupTestDatabase = async (): Promise<void> => {
  if (testDatabaseCleaned || testDatabasePath === null) {
    return;
  }

  const candidatePaths = [
    testDatabasePath,
    `${testDatabasePath}-journal`,
    `${testDatabasePath}-shm`,
    `${testDatabasePath}-wal`,
  ];

  await Promise.all(
    candidatePaths.map(async (candidatePath) => {
      try {
        await rm(candidatePath, { force: true });
      } catch {
        // Ignore cleanup races between Bun workers removing the same test sidecar file.
      }
    }),
  );

  testDatabaseCleaned = true;
};
