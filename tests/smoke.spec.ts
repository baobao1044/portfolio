import { expect, test } from "@playwright/test";

const requiredSections = ["#hero", "#about", "#projects", "#philosophy", "#proof", "#contact"];
test.setTimeout(90_000);

test("required sections and links are visible", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const id of requiredSections) {
    await expect(page.locator(id)).toBeVisible();
  }

  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Code" }).first()).toBeVisible();
});

test("project cards display correctly", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const cards = page.locator("[data-testid='project-card']");
  await expect(cards).toHaveCount(6);
});

test.describe("animation behavior", () => {
  test.use({ reducedMotion: "no-preference" });

  test("hero animation marks completion once after load", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heroReveal = page.locator("[data-hero-reveal]");
    await expect(heroReveal).toHaveCount(1);

    await expect
      .poll(async () => heroReveal.getAttribute("data-hero-state"), {
        timeout: 6_000
      })
      .toBe("active");

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        })
    );
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.locator("#hero").scrollIntoViewIfNeeded();

    await expect
      .poll(async () => heroReveal.getAttribute("data-hero-state"), {
        timeout: 3_000
      })
      .toBe("active");
  });

  test("scroll animations reveal project cards only when visible", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const firstCard = page.locator("[data-testid='project-card']").first();
    await expect(firstCard).toBeAttached();

    const isInitiallyVisible = await firstCard.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    expect(isInitiallyVisible).toBeFalsy();

    await expect
      .poll(async () => firstCard.evaluate((element) => getComputedStyle(element).opacity), {
        timeout: 2_000
      })
      .toBe("0");

    await firstCard.scrollIntoViewIfNeeded();

    await expect
      .poll(
        async () =>
          firstCard.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)),
        {
          timeout: 6_000
        }
      )
      .toBeGreaterThan(0.9);
  });
});

test("grain overlay does not block link interaction", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const grainOverlay = page.locator(".cinematic-bg-grain");
  await expect(grainOverlay).toHaveCount(1);

  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/#about$/);

  await page.evaluate(() => {
    const firstProjectLink = document.querySelector("#projects a[href]");
    if (firstProjectLink instanceof HTMLAnchorElement) {
      firstProjectLink.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          document.body.dataset.projectLinkClicked = "true";
        },
        { once: true }
      );
    }
  });

  const firstProjectLink = page.locator("#projects a[href]").first();
  await firstProjectLink.scrollIntoViewIfNeeded();
  await firstProjectLink.click();

  await expect.poll(async () => page.locator("body").getAttribute("data-project-link-clicked")).toBe(
    "true"
  );
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

  test("no horizontal overflow on mobile", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const doc = document.documentElement;
          return doc.scrollWidth - window.innerWidth;
        })
      )
      .toBeLessThanOrEqual(1);
  });
});

