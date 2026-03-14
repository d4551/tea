import { expect, test } from "@playwright/test";

test("game page: key bindings modal opens and closes", async ({ page }) => {
  await page.goto("/game?lang=en-US");
  await expect(page).toHaveURL(/\/game/);

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: /key bindings/i }).click();
  await expect(page.locator("#key_bindings_modal")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("#key_bindings_modal")).toBeHidden();
});
