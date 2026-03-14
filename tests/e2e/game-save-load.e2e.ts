import { expect, test } from "@playwright/test";

test("navigate to game, play briefly, save, reload, load slot, verify redirect to game", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\//);

  await page.goto("/projects/default/playtest?lang=en-US");
  await expect(page).toHaveURL(/\/projects\/default\/playtest/);

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("#save_slot_modal")).toBeVisible();

  const slotName = `E2E-${Date.now()}`;
  await page.locator("#save-slot-name").fill(slotName);
  await page.locator("#save-slot-form button[type=submit]").click();

  await expect(page.locator("#save-slot-result .alert-success")).toBeVisible({
    timeout: 10_000,
  });

  await page.reload();
  await expect(page).toHaveURL(/\/projects\/default\/playtest/);

  await page.getByRole("button", { name: "Load" }).click();
  await expect(page.locator("#load_slot_modal")).toBeVisible();

  await page
    .locator("#load-slots-list")
    .getByRole("button", { name: "Load" })
    .first()
    .click({ timeout: 10_000 });

  await expect(page).toHaveURL(/\/projects\/default\/playtest\?.*sessionId=/, { timeout: 15_000 });
  await expect(page.locator("#game-canvas-wrapper")).toBeVisible();
});
