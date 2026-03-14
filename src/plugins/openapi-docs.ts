import { openapi } from "@elysiajs/openapi";
import { appConfig } from "../config/environment.ts";

/**
 * Framework-native API documentation plugin.
 * Uses Elysia OpenAPI with a Scalar UI and deterministic route metadata.
 */
export const openApiDocsPlugin = openapi({
  path: appConfig.api.docsPath,
  documentation: {
    info: {
      title: appConfig.applicationName,
      version: appConfig.applicationVersion,
      description: "Typed API contracts for the TEA game operations platform.",
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
