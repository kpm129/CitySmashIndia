import { test, expect } from "@playwright/test";
test("paused audio stays paused through power selection and preference changes", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-city="mumbai"]').click();
  await page.locator("#pause").click();
  await page.locator('[data-power="alien"]').click();
  await page.locator("#music").click();
  await page.waitForTimeout(100);
  const audio = await page.evaluate(() =>
    (
      window as unknown as { citysmash: { audio: () => { state: string } } }
    ).citysmash.audio(),
  );
  expect(audio.state).toBe("suspended");
});
