import { swagger } from "@elysiajs/swagger";
import { appConfig } from "../config/environment.ts";

/**
 * Framework-native API documentation plugin.
 * Uses Elysia Swagger UI with deterministic route path and metadata.
 */
export const swaggerDocsPlugin = swagger({
  path: appConfig.api.docsPath,
  documentation: {
    info: {
      title: appConfig.applicationName,
      version: appConfig.applicationVersion,
      description: "Typed API contracts for Game Forge runtime services.",
    },
    tags: [
      {
        name: "system",
        description: "Runtime health and platform metadata endpoints",
      },
      {
        name: "oracle",
        description: "Oracle interaction endpoints and state machine responses",
      },
      {
        name: "ai",
        description:
          "AI provider health, local model runtime, generation, and speech I/O endpoints",
      },
      {
        name: "builder",
        description: "Game builder project, scene, NPC, dialogue, and orchestration endpoints",
      },
      {
        name: "game",
        description: "Server-authoritative game session lifecycle, state, and command endpoints",
      },
    ],
  },
});
