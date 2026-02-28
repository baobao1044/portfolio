import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://baobao1044.github.io",
  base: "/portfolio",
  integrations: [tailwind()],
});
