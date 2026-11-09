// Throwaway a11y sweep with the axe-core already present in node_modules.
import { chromium } from "@playwright/test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

const browser = await chromium.launch();

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto("http://127.0.0.1:4321/portfolio/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // Remove the intro so the scan sees the actual page, not the overlay.
  await page.evaluate(() => document.getElementById("page-overlay")?.remove());

  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async () => {
    // @ts-expect-error injected global
    return await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "best-practice"] },
    });
  });

  console.log(`\n=== ${vp.name} === violations: ${results.violations.length}`);
  for (const v of results.violations) {
    console.log(`- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
    for (const n of v.nodes.slice(0, 3)) {
      console.log(`    ${n.target.join(" ")} :: ${(n.failureSummary || "").split("\n")[1]?.trim().slice(0, 120)}`);
    }
  }
  await page.close();
}

await browser.close();
