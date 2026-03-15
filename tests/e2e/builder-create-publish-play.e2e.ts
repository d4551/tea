import { expect, test } from "@playwright/test";

test("create project, publish, play in en-US locale", async ({ page, request }) => {
  const projectId = `e2e-en-${Date.now()}`;

  const createRes = await request.post("/api/builder/projects", {
    form: {
      projectId,
      locale: "en-US",
      starterTemplateId: "tea-house-story",
      redirectPath: `/projects/${projectId}/start?lang=en-US`,
    },
    headers: { accept: "text/html" },
  });
  expect(createRes.ok()).toBeTruthy();

  await page.goto(`/projects/${projectId}/start?lang=en-US`);
  await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/start`));

  await page.getByRole("button", { name: /publish/i }).click();
  const playLink = page.locator("#builder-project-shell").getByRole("link", {
    name: /play published build|游玩已发布版本/i,
  });
  await playLink.waitFor({ state: "visible", timeout: 15_000 });
  await playLink.click();
  await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/playtest`));

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await expect(page.locator("#game-canvas-wrapper")).toBeVisible();
});

test("create project, publish, play in zh-CN locale", async ({ page, request }) => {
  const projectId = `e2e-zh-${Date.now()}`;

  const createRes = await request.post("/api/builder/projects", {
    form: {
      projectId,
      locale: "zh-CN",
      starterTemplateId: "tea-house-story",
      redirectPath: `/projects/${projectId}/start?lang=zh-CN`,
    },
    headers: { accept: "text/html" },
  });
  expect(createRes.ok()).toBeTruthy();

  await page.goto(`/projects/${projectId}/start?lang=zh-CN`);
  await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/start`));

  await page.getByRole("button", { name: /发布|publish/i }).click();
  const playLink = page.locator("#builder-project-shell").getByRole("link", {
    name: /play published build|游玩已发布版本/i,
  });
  await playLink.waitFor({ state: "visible", timeout: 15_000 });
  await playLink.click();
  await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/playtest`));

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await expect(page.locator("#game-canvas-wrapper")).toBeVisible();
});
