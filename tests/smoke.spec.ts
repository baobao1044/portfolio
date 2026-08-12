import { expect, test } from "@playwright/test";

const requiredSections = ["#hero", "#about", "#projects", "#philosophy", "#proof", "#contact"];
test.setTimeout(90_000);

test("required sections and links are visible", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const id of requiredSections) {
    await expect(page.locator(id)).toBeVisible();
  }

  // Contact section exposes a GitHub link
  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
  // Desktop nav exposes the Work link
  await expect(page.getByRole("link", { name: "Work", exact: true })).toBeVisible();
});

test("project cards display correctly", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const cards = page.locator("#projects .project-h-card");
  await expect(cards).toHaveCount(6);

  // Each card links to the real GitHub repo
  const firstHref = await cards.first().getAttribute("href");
  expect(firstHref).toContain("https://github.com/baobao1044/");
});

test.describe("animation behavior", () => {
  test.use({ reducedMotion: "no-preference" });

  test("intro overlay is removed after load and hero becomes visible", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // The cinematic intro overlay should be removed after the intro animation runs
    await expect
      .poll(async () => page.locator("#page-overlay").count(), { timeout: 8_000 })
      .toBe(0);

    // The hero headline should be present and eventually visible
    const heroTitle = page.locator('[data-hero="title"]');
    await expect(heroTitle).toContainText(/Reason without/i);
  });

  test("scroll reveals project cards when visible", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Reveal animations use [data-animate]; project title block has it.
    const titleBlock = page.locator("#projects [data-animate]").first();
    await titleBlock.scrollIntoViewIfNeeded();

    await expect
      .poll(
        async () => titleBlock.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity)),
        { timeout: 8_000 },
      )
      .toBeGreaterThan(0.5);
  });
});

test("grid background does not block link interaction", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // The decorative grid background is present and non-interactive
  const grid = page.locator(".grid-bg");
  await expect(grid).toHaveCount(1);

  // Clicking the About nav link scrolls to the section (Lenis smooth scroll)
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect.poll(
    async () => page.evaluate(() => (document.getElementById("about")?.getBoundingClientRect().top ?? 1) < 100),
    { timeout: 6_000 },
  ).toBe(true);
});

test("hero contrast sanity", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const contrast = await page.evaluate(() => {
    const hero = document.querySelector("#hero");
    const heading = document.querySelector("#hero h1");
    if (!hero || !heading) return 0;

    const parseRgb = (value: string) => {
      const parts = value.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0, 0, 0];
      return parts.slice(0, 3).map((n) => n / 255);
    };

    const luminance = (rgb: number[]) => {
      const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    };

    const heroBg = parseRgb(getComputedStyle(hero).backgroundColor);
    const headingColor = parseRgb(getComputedStyle(heading).color);
    const l1 = luminance(heroBg);
    const l2 = luminance(headingColor);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  });

  expect(contrast).toBeGreaterThan(4.5);
});

test.describe("mobile layout sanity", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile nav toggle is available and no horizontal overflow", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Mobile hamburger toggle is visible on small viewports
    await expect(page.locator("#mobile-toggle")).toBeVisible();

    // No horizontal overflow
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const doc = document.documentElement;
          return doc.scrollWidth - window.innerWidth;
        }),
      )
      .toBeLessThanOrEqual(1);
  });
});
