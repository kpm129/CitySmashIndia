import { test, expect } from "@playwright/test";
interface Diagnostics {
  snapshot: () => { time: number; effects: number; destruction: number };
  audio: () => { state: string; musicGain: number; voices: number };
}
const info = () => (window as unknown as { citysmash: Diagnostics }).citysmash;
test("corrupt storage, audio duck mute, hidden tabs and menu audio", async ({
  page,
  context,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("citysmash.preferences", "{bad"),
  );
  await page.goto("/");
  await page.locator('[data-city="mumbai"]').click();
  await expect(page.locator("#strength-value")).toHaveText("100%");
  const canvas = page.locator("canvas");
  const box = (await canvas.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.435, box.y + box.height * 0.68);
  await page.locator("#music").click();
  await page.waitForTimeout(1200);
  const audio = await page.evaluate(() =>
    (window as unknown as { citysmash: Diagnostics }).citysmash.audio(),
  );
  expect(audio.musicGain).toBe(0);
  expect(audio.voices).toBeLessThanOrEqual(16);
  const other = await context.newPage();
  await other.goto("about:blank");
  await page.evaluate(() =>
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    }),
  );
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  const a = await page.evaluate(() =>
    (window as unknown as { citysmash: Diagnostics }).citysmash.snapshot(),
  );
  await page.waitForTimeout(200);
  const b = await page.evaluate(() =>
    (window as unknown as { citysmash: Diagnostics }).citysmash.snapshot(),
  );
  expect(b.time).toBe(a.time);
  await page.evaluate(() =>
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    }),
  );
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await other.close();
  await page.locator("#change").click();
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await page.waitForTimeout(100);
  expect(
    (
      await page.evaluate(() =>
        (window as unknown as { citysmash: Diagnostics }).citysmash.audio(),
      )
    ).state,
  ).toBe("suspended");
});
// A compile-time check keeps the read-only diagnostics contract narrow.
void info;
