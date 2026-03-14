import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page has no critical or serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\//);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(criticalOrSerious).toEqual([]);
});

test("game page has no critical or serious accessibility violations", async ({ page }) => {
  await page.goto("/game?lang=en-US");
  await expect(page).toHaveURL(/\/game/);

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("#game-canvas-wrapper")
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(criticalOrSerious).toEqual([]);
});

test("builder dashboard has no critical or serious accessibility violations", async ({ page }) => {
  await page.goto("/builder?lang=en-US&projectId=default");
  await expect(page).toHaveURL(/\/builder/);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(criticalOrSerious).toEqual([]);
});

test("builder scenes page has no critical or serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/builder/scenes?lang=en-US&projectId=default");
  await expect(page).toHaveURL(/\/builder\/scenes/);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(criticalOrSerious).toEqual([]);
});

test("game page Key Bindings modal has no critical or serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/game?lang=en-US");
  await expect(page).toHaveURL(/\/game/);

  await page.waitForSelector("#game-canvas-wrapper", { timeout: 15_000 });
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: /key bindings/i }).click();
  await page.waitForSelector("#key_bindings_modal[open]", { timeout: 5000 });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .include("#key_bindings_modal")
    .analyze();

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(criticalOrSerious).toEqual([]);

  await page.keyboard.press("Escape");
});
