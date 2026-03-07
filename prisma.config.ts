import { defineConfig, env } from "prisma/config";

/**
 * Prisma CLI configuration.
 * Datasource URLs are defined here for the Bun-native Prisma CLI.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
