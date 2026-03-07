import { defineConfig, env } from "prisma/config";

/**
 * Prisma CLI configuration.
 * Datasource URLs are defined here for Prisma 7 compatibility.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
