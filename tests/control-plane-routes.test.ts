import { describe, expect, test } from "bun:test";
import { createApp } from "../src/app.ts";
import { builderService } from "../src/domain/builder/builder-service.ts";

const uniqueProjectId = (suffix: string): string =>
  `control-plane-${suffix}-${Math.random().toString(36).slice(2, 8)}`;

describe("control plane routes", () => {
  test("serve the full platform workspace set with project context", async () => {
    const app = await createApp();
    const projectId = uniqueProjectId("routes");

    await builderService.createProject(projectId, "2d-game");

    const routeExpectations = [
      { path: `/games?lang=en-US&projectId=${projectId}`, text: "Games" },
      { path: `/libraries?lang=en-US&projectId=${projectId}`, text: "Libraries" },
      { path: `/templates?lang=en-US&projectId=${projectId}`, text: "Templates" },
      { path: `/capabilities?lang=en-US&projectId=${projectId}`, text: "Capabilities" },
      { path: `/releases?lang=en-US&projectId=${projectId}`, text: "Releases" },
      { path: `/review?lang=en-US&projectId=${projectId}`, text: "Review Queue" },
    ] as const;

    for (const route of routeExpectations) {
      const response = await app.handle(new Request(`http://localhost${route.path}`));
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain(route.text);
      expect(html).toContain(projectId);
    }
  });
});
