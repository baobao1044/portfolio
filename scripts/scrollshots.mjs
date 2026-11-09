// Throwaway: a strip of screenshots down the page so the drawn words can be
// inspected at each section.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = "./shots/strip";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:4321/portfolio/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const height = await page.evaluate(() => document.body.scrollHeight);
let i = 0;
for (let y = 0; y < height - 300; y += 820) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, "0")}-y${y}.png` });
  i++;
}
console.log("frames:", i, "height:", height);
await browser.close();
