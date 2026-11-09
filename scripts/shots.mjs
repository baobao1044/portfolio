// Visual check harness. Not part of the site build.
// Usage: node scripts/shots.mjs <baseUrl> <outDir>
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:4321/portfolio/";
const out = process.argv[3] ?? "./shots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

async function shot(name, width, height, fn) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  if (fn) await fn(page);
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
  console.log("wrote", `${out}/${name}.png`);
}

const wait = (p, ms) => p.waitForTimeout(ms);

// Intro, mid-sequence and at the last cut.
await shot("intro-02", 1440, 900, (p) => wait(p, 700));
await shot("intro-05", 1440, 900, (p) => wait(p, 1550));

// Hero after the overlay is gone.
await shot("hero", 1440, 900, async (p) => {
  await wait(p, 3600);
});

// One viewport down: the web should be writing into the first band.
await shot("web-1", 1440, 900, async (p) => {
  await wait(p, 3600);
  await p.evaluate(() => window.scrollTo(0, window.innerHeight * 0.9));
  await wait(p, 400);
});

// Work section with a row expanded.
await shot("work", 1440, 900, async (p) => {
  await wait(p, 3600);
  await p.evaluate(() => document.getElementById("work").scrollIntoView());
  await wait(p, 300);
  await p.locator("#work details.work-row summary").first().click();
  await wait(p, 400);
});

// Deep in the page: several cursors should be mid-stroke.
await shot("web-2", 1440, 900, async (p) => {
  await wait(p, 3600);
  await p.evaluate(() => document.getElementById("evidence").scrollIntoView());
  await wait(p, 400);
});

// Mobile.
await shot("mobile", 390, 844, async (p) => {
  await wait(p, 3600);
});

await browser.close();
