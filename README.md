# BaoBG — Portfolio

Personal portfolio of **Gia Bảo (BaoBG)** — AI Engineer & Systems Programmer.
A single-page, static Astro site with a cinematic WebGL shader background,
SVG doodles + a hand-drawn guide path, and motion built on **Anime.js v4**.

> Live: **https://baobao1044.github.io/portfolio/**

---

## Stack

- **Astro 4** (static output) + **TypeScript** (strict)
- **Tailwind CSS 3** — design tokens: deep ink + amber accent, Inter + JetBrains Mono
- **Anime.js v4** — split-text, SVG draw, scrub parallax, number counters, magnetic, spring cursor
- **WebGL** fragment-shader plasma background (1 draw call, DPR-capped, pauses when hidden)
- **Canvas 2D** matrix code-rain (throttled to 24fps)
- **Lenis** smooth scroll
- Single consolidated `requestAnimationFrame` scroll loop for all scroll-driven effects

## Content

All copy is data-driven from `src/data/portfolio.ts` (typed), sourced from
[github.com/baobao1044](https://github.com/baobao1044):

- **Hero** — split-text headline + live text (float + mouse-react) + stat counters
- **About** — lead + paragraphs + highlights
- **Projects** — top 6 repos (vAGI-2, bedrock-obfuscator, RE-super-agent, AOT-Compiler, NSE, pse-engine) on a pinned horizontal scroll
- **Principles** — Correctness > Confidence · Efficiency > Scale · Verification > Guessing
- **Evidence** — public artifacts and what they prove
- **Contact** — email + GitHub / Website / @Vietrix

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build & preview

```bash
npm run build    # static output → dist/
npm run preview  # serve the build locally
```

## Deploy (GitHub Pages)

Deployment is automatic via the GitHub Actions workflow in
`.github/workflows/deploy.yml`:

1. Push to `main` triggers the workflow.
2. It installs with `npm ci`, runs `npm run build`, and uploads `dist/`.
3. The `deploy-pages` action publishes to GitHub Pages.

The site is configured as a **project page**, so `astro.config.mjs` sets
`site: "https://baobao1044.github.io"` and `base: "/portfolio/"` — all asset,
sitemap, canonical, and OG URLs are built relative to that base.

In the repo settings: **Settings → Pages → Build and deployment → Source =
GitHub Actions**.

## Structure

```
src/
  components/        section components + ui/ (cursor, shader, matrix, doodles, guide)
  data/             portfolio.ts (typed content), doodles.ts
  layouts/          BaseLayout.astro (SEO, fonts, intro, motion script)
  lib/              anime.ts (Anime.js v4 helpers)
  pages/            index.astro
  styles/           global.css
public/             favicon.svg
.github/workflows/  deploy.yml
```

## Notes

- Motion respects `prefers-reduced-motion` (live-text and shader stay calm).
- Touch devices skip magnetic effects and mouse-react text.
- Custom cursor is disabled on coarse pointers.
