import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 * Uses process.env so prisma generate can run without DATABASE_URL (e.g. CI, fresh clone).
 * Database-dependent commands (migrate, db push) require DATABASE_URL.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
