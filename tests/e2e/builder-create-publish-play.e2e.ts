import { expect, test } from "@playwright/test";

test("create project, publish, play in en-US locale", async ({ page, request }) => {
  const projectId = `e2e-en-${Date.now()}`;

  const createRes = await request.post("/api/builder/projects", {
    form: {
      projectId,
      locale: "en-US",
      redirectPath: `/builder?lang=en-US&projectId=${projectId}`,
    },
    headers: { accept: "text/html" },
  });
  expect(createRes.ok()).toBeTruthy();

  await page.goto(`/builder?lang=en-US&projectId=${projectId}`);
  await expect(page).toHaveURL(new RegExp(`/builder.*projectId=${projectId}`));

  await page.getByRole("button", { name: /publish/i }).click();
  const playLink = page.locator("#builder-project-shell").getByRole("link", {
    name: /play published build|游玩已发布版本/i,
  });
  await playLink.waitFor({ state: "visible", timeout: 15_000 });
  await playLink.click();
  await expect(page).toHaveURL(new RegExp(`/game.*projectId=${projectId}`));

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await expect(page.locator("#game-canvas-wrapper")).toBeVisible();
});

test("create project, publish, play in zh-CN locale", async ({ page, request }) => {
  const projectId = `e2e-zh-${Date.now()}`;

  const createRes = await request.post("/api/builder/projects", {
    form: {
      projectId,
      locale: "zh-CN",
      redirectPath: `/builder?lang=zh-CN&projectId=${projectId}`,
    },
    headers: { accept: "text/html" },
  });
  expect(createRes.ok()).toBeTruthy();

  await page.goto(`/builder?lang=zh-CN&projectId=${projectId}`);
  await expect(page).toHaveURL(new RegExp(`/builder.*projectId=${projectId}`));

  await page.getByRole("button", { name: /发布|publish/i }).click();
  const playLink = page.locator("#builder-project-shell").getByRole("link", {
    name: /play published build|游玩已发布版本/i,
  });
  await playLink.waitFor({ state: "visible", timeout: 15_000 });
  await playLink.click();
  await expect(page).toHaveURL(new RegExp(`/game.*projectId=${projectId}`));

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await expect(page.locator("#game-canvas-wrapper")).toBeVisible();
});
