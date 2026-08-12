import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
// Deployed to GitHub Pages at https://baobao1044.github.io/portfolio/
// `base` must match the repo name so all asset/sitemap URLs resolve correctly.
export default defineConfig({
  site: "https://baobao1044.github.io",
  base: "/portfolio/",
  compressHTML: true,
  integrations: [tailwind(), sitemap()],
});
