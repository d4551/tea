import { expect, test } from "@playwright/test";

test("builder route opens AI drawer from deep-link query", async ({ page }) => {
  const question = "How do I balance this scene?";
  await page.goto(
    `/projects/default/start?lang=en-US&openAiAssistant=true&question=${encodeURIComponent(question)}`,
  );
  await expect(page).toHaveURL(/\/projects\/default\/start/);
  await expect(page.locator("#ai-chat-drawer")).toBeChecked();
  await expect(page.locator("#oracle-question")).toHaveValue(question);
});

test("game route opens AI drawer from deep-link query", async ({ page }) => {
  const question = "How can I improve this combat encounter?";
  await page.goto(
    `/projects/default/playtest?lang=en-US&openAiAssistant=true&question=${encodeURIComponent(question)}`,
  );
  await expect(page).toHaveURL(/\/projects\/default\/playtest/);
  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await expect(page.locator("#ai-chat-drawer")).toBeChecked();
  await expect(page.locator("#oracle-question")).toHaveValue(question);
  await expect(page.locator("#oracle-panel")).toBeVisible();
});
