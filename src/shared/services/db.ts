import { PrismaLibSql } from "@prisma/adapter-libsql";
import { type Prisma, PrismaClient } from "@prisma/client";
import { getLevel } from "../../domain/game/progression.ts";

declare global {
  // biome-lint: globalThis.prisma intentionally re-assigned in dev for HMR
  var _devPrisma: ExtendedPrismaClient | undefined;
}

// ── Base client ───────────────────────────────────────────────────────────────

const createBaseClient = () => {
  const url = Bun.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
};

// ── Domain error for session state ────────────────────────────────────────────

/**
 * Typed domain error carrying a discriminated error code.
 */
export class DomainError extends Error {
  readonly code: "SESSION_NOT_FOUND" | "SESSION_EXPIRED";

  constructor(code: "SESSION_NOT_FOUND" | "SESSION_EXPIRED", message: string) {
    super(message);
    this.code = code;
  }
}

// ── $extends — domain methods ─────────────────────────────────────────────────

const withDomainExtensions = (base: PrismaClient) =>
  base.$extends({
    model: {
      /**
       * GameSession domain methods.
       */
      gameSession: {
        /** Hard-deletes all sessions whose expiresAt is in the past. */
        async purgeExpired() {
          return base.gameSession.deleteMany({
            where: { expiresAt: { lt: new Date() } },
          });
        },

        /**
         * Returns the session or throws SESSION_EXPIRED / SESSION_NOT_FOUND.
         * Use instead of findUnique + manual expiry check.
         */
        async findActiveOrThrow(id: string) {
          const session = await base.gameSession.findUnique({
            where: { id },
          });
          if (!session) {
            throw new DomainError("SESSION_NOT_FOUND", "SESSION_NOT_FOUND");
          }
          if (session.expiresAt < new Date()) {
            throw new DomainError("SESSION_EXPIRED", "SESSION_EXPIRED");
          }
          return session;
        },
      },

      /**
       * PlayerProgress domain methods.
       */
      playerProgress: {
        /**
         * Adds XP and re-computes level in one atomic update.
         * Returns the updated record.
         */
        async addXp(sessionId: string, amount: number) {
          const current = await base.playerProgress.findUnique({
            where: { sessionId },
          });
          const newXp = (current?.xp ?? 0) + amount;
          const newLevel = getLevel(newXp) + 1; // getLevel returns 0-based index
          return base.playerProgress.upsert({
            where: { sessionId },
            create: {
              sessionId,
              xp: newXp,
              level: newLevel,
              visitedScenes: [] satisfies Prisma.JsonArray,
              interactions: {} satisfies Prisma.JsonObject,
            },
            update: { xp: newXp, level: newLevel },
          });
        },
      },

      /**
       * OracleInteraction domain methods.
       */
      oracleInteraction: {
        /**
         * Creates an interaction record with all three required columns populated.
         * Replaces scattered create() calls throughout the oracle service.
         */
        async recordWithSentiment(prompt: string, sentiment: string, fortune: string) {
          return base.oracleInteraction.create({
            data: { prompt, sentiment, fortune },
          });
        },
      },
    },
  });

type ExtendedPrismaClient = ReturnType<typeof withDomainExtensions>;

// ── Singleton export ──────────────────────────────────────────────────────────

const createPrismaClient = (): ExtendedPrismaClient => {
  const base = createBaseClient();
  return withDomainExtensions(base);
};

export const prisma: ExtendedPrismaClient = globalThis._devPrisma ?? createPrismaClient();

if (Bun.env.NODE_ENV !== "production") globalThis._devPrisma = prisma;
