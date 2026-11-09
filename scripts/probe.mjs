// Throwaway probe: does the web build text units, and do they ink in?
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`PAGEERROR: ${e.message}`));

await page.goto("http://127.0.0.1:4321/portfolio/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const c = document.getElementById("cursor-web");
  return {
    canvas: !!c,
    w: c?.width,
    h: c?.height,
    lexicon: document.getElementById("web-lexicon")?.textContent?.slice(0, 80),
    webOff: document.body.classList.contains("web-off"),
  };
});

// Scroll through the page and count non-transparent pixels at each stop.
const samples = [];
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 700) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(160);
  const px = await page.evaluate(() => {
    const c = document.getElementById("cursor-web");
    const ctx = c.getContext("2d");
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) n++;
    return n;
  });
  samples.push({ y, px });
}

// Look for a text unit directly: sample the canvas where a word should be.
console.log(JSON.stringify({ info, samples, logs: logs.slice(0, 10) }, null, 2));
await browser.close();
