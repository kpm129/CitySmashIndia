import { test, expect, type Page } from "@playwright/test";
interface Snapshot {
  city: string;
  destruction: number;
  chunks: number;
  bodies: number;
  constraints: number;
  loose: number;
  effects: number;
  particles: number;
  time: number;
  timeScale: number;
  night: boolean;
  positions: { x: number; y: number }[];
}
const snapshot = (page: Page) =>
  page.evaluate(() =>
    (
      window as unknown as { citysmash: { snapshot: () => Snapshot } }
    ).citysmash.snapshot(),
  );
async function target(page: Page, x = 0.435, y = 0.68) {
  const box = (await page.locator("canvas").boundingBox())!;
  await page
    .locator("canvas")
    .click({ position: { x: box.width * x, y: box.height * y } });
}
async function rebuild(page: Page) {
  await page.locator("#rebuild").click();
  await page.locator("#confirm-reset").click();
  await expect(page.locator("#destruction")).toHaveText("0%");
}
test("six cities, all powers, physical falling, collisions, state and cleanup", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("requestfailed", (r) => errors.push(r.url()));
  await page.goto("/");
  await expect(page).toHaveTitle(/CitySmashIndia/);
  await expect(page.locator("[data-city]")).toHaveCount(6);
  await page.screenshot({
    path: "/tmp/citysmash-selection.png",
    fullPage: true,
  });
  for (const city of [
    "mumbai",
    "delhi",
    "chennai",
    "bengaluru",
    "kochi",
    "kolkata",
  ]) {
    await page.locator(`[data-city="${city}"]`).click();
    await page.waitForTimeout(150);
    const initial = await snapshot(page);
    expect(initial.city).toBe(city);
    expect(initial.chunks).toBeLessThanOrEqual(160);
    expect(initial.bodies).toBe(initial.chunks + 5);
    await page.locator("#pause").click();
    await page.screenshot({ path: `/tmp/citysmash-${city}-day.png` });
    await page.locator("#night").click();
    expect((await snapshot(page)).night).toBe(true);
    await page.screenshot({ path: `/tmp/citysmash-${city}-night.png` });
    await page.locator("#change").click();
  }
  await page.locator('[data-city="mumbai"]').click();
  await page.waitForTimeout(100);
  const initial = await snapshot(page);
  for (const power of [
    "alien",
    "earthquake",
    "meteor",
    "tornado",
    "volcano",
    "lightning",
  ]) {
    await page.locator(`[data-power="${power}"]`).click();
    await target(page);
    await expect
      .poll(async () => (await snapshot(page)).loose, { timeout: 15000 })
      .toBeGreaterThan(0);
    const damaged = await snapshot(page);
    expect(damaged.destruction, `${power} damages the target`).toBeGreaterThan(
      0,
    );
    expect(damaged.loose, `${power} detaches physical chunks`).toBeGreaterThan(
      0,
    );
    expect(damaged.particles).toBeLessThanOrEqual(260);
    expect(damaged.bodies).toBeLessThanOrEqual(177);
    expect(
      damaged.positions.every(
        (p) => Number.isFinite(p.x) && Number.isFinite(p.y),
      ),
    ).toBe(true);
    await rebuild(page);
    expect((await snapshot(page)).bodies).toBe(initial.bodies);
    expect((await snapshot(page)).constraints).toBe(initial.constraints);
    expect((await snapshot(page)).effects).toBe(0);
  }
  await page.keyboard.press("3");
  await target(page);
  await page.waitForTimeout(900);
  const moving = await snapshot(page);
  await page.waitForTimeout(200);
  expect((await snapshot(page)).positions).not.toEqual(moving.positions);
  await page.locator("#pause").click();
  const frozen = await snapshot(page);
  await page.waitForTimeout(400);
  expect((await snapshot(page)).positions).toEqual(frozen.positions);
  expect((await snapshot(page)).time).toBe(frozen.time);
  await page.locator("#night").click();
  expect((await snapshot(page)).destruction).toBe(frozen.destruction);
  await page.screenshot({ path: "/tmp/citysmash-damaged.png" });
  await page.locator("#pause").click();
  await page.locator("#slow").click();
  const a = (await snapshot(page)).time;
  await page.waitForTimeout(400);
  const b = (await snapshot(page)).time;
  expect(b - a).toBeGreaterThan(25);
  expect(b - a).toBeLessThan(180);
  expect((await snapshot(page)).timeScale).toBe(0.25);
  await rebuild(page);
  expect((await snapshot(page)).timeScale).toBe(1);
  expect((await snapshot(page)).night).toBe(false);
  const controlBefore = await snapshot(page);
  await page.locator("#night").click();
  await page.locator("#slow").click();
  await page.waitForTimeout(250);
  expect((await snapshot(page)).destruction).toBe(controlBefore.destruction);
  expect((await snapshot(page)).effects).toBe(0);
  await page.locator("#strength").fill("200");
  await expect(page.locator("#strength-value")).toHaveText("200%");
  for (const id of ["music", "sfx", "master"])
    await page.locator("#" + id).click();
  await page.locator("#help").click();
  await page.locator("#motion").check();
  await page.locator("#flash").check();
  await page.locator("#close-help").click();
  await page.reload();
  await page.locator('[data-city="mumbai"]').click();
  for (const id of ["music", "sfx", "master"])
    await expect(page.locator("#" + id)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  await expect(page.locator("#strength-value")).toHaveText("200%");
  await page.locator("#help").click();
  await expect(page.locator("#motion")).toBeChecked();
  await expect(page.locator("#flash")).toBeChecked();
  await page.locator("#close-help").click();
  for (let i = 0; i < 12; i++) {
    await target(page, 0.3 + (i % 5) * 0.08, 0.68);
    await page.waitForTimeout(105);
  }
  await page.waitForTimeout(3500);
  expect((await snapshot(page)).effects).toBeLessThanOrEqual(8);
  expect((await snapshot(page)).bodies).toBeLessThanOrEqual(177);
  for (let i = 0; i < 6; i++) {
    await rebuild(page);
    expect((await snapshot(page)).bodies).toBe(initial.bodies);
  }
  expect(errors).toEqual([]);
});
test("mobile touch mapping, responsive layouts and keyboard help", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.locator('[data-city="mumbai"]').tap();
  const box = (await page.locator("canvas").boundingBox())!;
  await page.touchscreen.tap(
    box.x + box.width * 0.5,
    box.y + box.height * 0.68,
  );
  await expect
    .poll(async () => (await snapshot(page)).destruction, { timeout: 15000 })
    .toBeGreaterThan(0);

  expect((await snapshot(page)).destruction).toBeGreaterThan(0);
  await page.screenshot({ path: "/tmp/citysmash-mobile.png" });
  for (const id of [
    "pause",
    "slow",
    "night",
    "strength",
    "music",
    "sfx",
    "master",
    "rebuild",
  ])
    await expect(page.locator("#" + id)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/citysmash-portrait.png" });
  await context.close();
});
