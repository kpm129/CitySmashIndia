import { test, expect } from "@playwright/test";
test("Mumbai physical destruction, meteor, earthquake and rebuild", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore Mumbai", exact: true })
    .click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.locator("canvas").click({ position: { x: 500, y: 365 } });
  await page.waitForTimeout(2200);
  await expect(page.locator("#destruction")).not.toHaveText("0%");
  await page.getByRole("button", { name: "Earthquake", exact: false }).click();
  await page.locator("canvas").click({ position: { x: 400, y: 420 } });
  await page.waitForTimeout(2500);
  await page
    .getByRole("button", { name: "Rebuild", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Rebuild city", exact: true }).click();
  await expect(page.locator("#destruction")).toHaveText("0%");
});
