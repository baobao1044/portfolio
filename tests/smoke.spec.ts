import { expect, test } from "@playwright/test";

// The site is built with `base: "/portfolio/"`, so every test navigates to
// that sub-path explicitly rather than relying on origin-relative resolution.
const PAGE = "/portfolio/";

const sections = ["#hero", "#about", "#work", "#rules", "#evidence", "#contact"];

test.setTimeout(90_000);

test("all sections render", async ({ page }) => {
  await page.goto(PAGE, { waitUntil: "domcontentloaded" });

  for (const id of sections) {
    await expect(page.locator(id)).toBeVisible();
  }

  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Work", exact: true })).toBeVisible();
});

test("all ten project rows are present and link to real repos", async ({ page }) => {
  await page.goto(PAGE, { waitUntil: "domcontentloaded" });

  const rows = page.locator("#work details.work-row");
  await expect(rows).toHaveCount(10);

  const hrefs = await page
    .locator("#work details.work-row a[href^='https://github.com/']")
    .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href));

  expect(hrefs.length).toBe(10);
  for (const href of hrefs) {
    expect(href).toMatch(/^https:\/\/github\.com\/baobao1044\//);
  }
});

test("expanding a project reveals its description", async ({ page }) => {
  await page.goto(PAGE, { waitUntil: "domcontentloaded" });

  const first = page.locator("#work details.work-row").first();
  const body = first.locator("div").first();

  await expect(body).toBeHidden();
  await first.locator("summary").click();
  await expect(body).toBeVisible();
});

test.describe("cursor web", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("canvas is present and draws after the intro", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "domcontentloaded" });

    const canvas = page.locator("#cursor-web");
    await expect(canvas).toHaveCount(1);

    // The intro overlay removes itself; scrolling then arms the web.
    await expect.poll(async () => page.locator("#page-overlay").count(), { timeout: 10_000 }).toBe(0);

    await page.evaluate(() => window.scrollTo(0, window.innerHeight));

    // The pen is eased and velocity-limited, so it arrives well after the
    // scroll event. Poll rather than sleeping a fixed frame count.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const c = document.getElementById("cursor-web") as HTMLCanvasElement | null;
            if (!c) return -1;
            const ctx = c.getContext("2d");
            if (!ctx) return -1;
            const { data } = ctx.getImageData(0, 0, c.width, c.height);
            let nonEmpty = 0;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] !== 0) {
                nonEmpty++;
                if (nonEmpty > 500) break;
              }
            }
            return nonEmpty;
          }),
        { timeout: 6_000 },
      )
      .toBeGreaterThan(500);
  });
});


test("reduced motion disables the decorative web", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PAGE, { waitUntil: "domcontentloaded" });

  await expect.poll(async () => page.locator("#page-overlay").count(), { timeout: 8_000 }).toBe(0);

  // `initCursorWeb` disables the canvas once fonts settle, so poll instead of
  // reading a single frame that may precede that callback.
  await expect
    .poll(
      async () =>
        page.evaluate(
          () =>
            document.body.classList.contains("web-off") ||
            getComputedStyle(document.getElementById("cursor-web") as HTMLElement).display === "none",
        ),
      { timeout: 8_000 },
    )
    .toBe(true);
});

test("hero text clears WCAG AA against the red field", async ({ page }) => {
  await page.goto(PAGE, { waitUntil: "domcontentloaded" });

  const ratio = await page.evaluate(() => {
    const parse = (v: string) => (v.match(/\d+(\.\d+)?/g) ?? [0, 0, 0]).slice(0, 3).map((n) => Number(n) / 255);
    const lum = (rgb: number[]) => {
      const ch = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * ch(rgb[0]) + 0.7152 * ch(rgb[1]) + 0.0722 * ch(rgb[2]);
    };
    const body = parse(getComputedStyle(document.body).backgroundColor);
    const h1 = parse(getComputedStyle(document.querySelector("#hero h1")!).color);
    const a = lum(body);
    const b = lum(h1);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });

  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("nav toggle opens the panel and no horizontal overflow", async ({ page }) => {
    await page.goto(PAGE, { waitUntil: "domcontentloaded" });

    const toggle = page.locator("#mobile-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-panel")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
