# BaoBG — Portfolio

Personal portfolio of **Gia Bảo (BaoBG)**, AI Engineer & Systems Programmer.

Black and red, high contrast, built around one idea: a page made out of a web
that writes itself as you scroll.

> Live: **https://baobao1044.github.io/portfolio/**

---

## What it does

1. **Kinetic intro.** Six black-and-white cuts on a 300 ms beat (`CPU` → `FIRST`
   → `NO GPU` → `NO CLUSTER` → `JUST CODE` → `BAOBG`), then a hard clip-path
   wipe. Runs on CSS animations only, so it survives a slow script load; any
   wheel, key or touch skips it. Once per session, and never under
   `prefers-reduced-motion`.
2. **Red field.** After the wipe the page is already bright red (`#ff2400`) with
   near-black type — black on red measures 5.5:1, above WCAG AA.
3. **The web.** Ten virtual cursors (five on touch) each own a vertical band.
   Scrolling advances progress through that band, so the page is drawn just
   ahead of the reader: lines, 45° hatch blocks, arc fans, dot fields and
   lattice ticks, with a named pointer (`vagi`, `nse`, `re`, `pse`, …) at the
   live end of each stroke. Every third cursor also writes — one large outlined
   word per section (`CPU`, `SYSTEMS`, `COMPILER`, …) is struck left to right
   behind the copy.

## Stack

- **Astro 4** — static output, no framework islands
- **Tailwind 3** — two-colour token set, Anton + Archivo + JetBrains Mono
- **No runtime dependencies.** `animejs` and `lenis` were removed with the
  previous design; everything is vanilla TS in `src/lib/`

## The cursor web

`src/lib/cursorWeb.ts` builds the graph once from real DOM anchors marked
`data-web` plus a jittered lattice inside each `data-section`, joins every node
to its three nearest neighbours, adds one boundary thread per section, and adds
one ornament per section from a four-mark vocabulary (hatch block, arc fan, dot
field, lattice ticks) so neighbouring sections never repeat a mark. The words
`webLexicon` names are measured in Anton and laid out at the foot of each
section. The unit list is then split into contiguous vertical bands, one per
cursor.

Rendering is a fixed `<canvas>` behind the content, drawn on scroll only:

- one rAF per scroll frame, no idle repaint
- all measurement happens in `build()` — `draw()` reads no layout
- units are culled against a viewport band before reaching the path; a culled
  unit still consumes its length from the progress budget, so the drawing never
  runs ahead of the reader
- letters are struck through a clip rect that grows with progress, with a short
  trailing rule and the cursor at the pen position
- DPR capped at 2
- rebuilt on resize (debounced), `fonts.ready`, and any `<details>` open that
  changes document height
- disabled entirely under `prefers-reduced-motion`

With the web visible, the whole thing is a background thread of hairlines rather
than a hero illustration — it never covers text and never takes a pointer event.

## Content

All copy is typed data in `src/data/portfolio.ts`. Each project's description,
stack and facts are quoted from that repository's own README, read on
**2026-11-09**:

| Project | Domain | Status |
|---|---|---|
| vAGI-2 | AI | research |
| NSE | AI | research |
| constant-state-attention | AI | research |
| AOT-Compiler | Compilers | active |
| rust-windows-compat | Systems | research |
| pse-engine | Systems | active |
| RE-super-agent | Tools | active |
| bedrock-obfuscator | Tools | complete |
| GameLagReducer | Tools | active |
| down-faster | Tools | alpha |

Repo stats come from the GitHub API (36 public repos, 15 stars, 10 featured).
Where a README calls its own project research or alpha, the work list says the
same thing — the Evidence section links every number back to its source.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321/portfolio/
```

The site is configured with `base: "/portfolio/"`, so every local URL is
**under `/portfolio/`**, not at the origin root.

## Build & test

```bash
npm run build        # static output → dist/
npm run preview      # serve the build
npm run test:smoke   # Playwright: sections, 10 rows, <details>, canvas paint,
                     # reduced motion, WCAG contrast, mobile overflow + nav
```

`scripts/shots.mjs`, `scripts/a11y.mjs` and `scripts/overflow.mjs` are
throwaway development harnesses (screenshots, axe sweep, overflow hunt). They are
not part of the build and are safe to delete.

## Deploy

`.github/workflows/deploy.yml` builds with `npm ci` and publishes `dist/` to
GitHub Pages on every push to `main`. Repo settings must have
**Settings → Pages → Source = GitHub Actions**.

## Structure

```
src/
  components/        six sections + ui/ (IntroOverlay, CursorWeb)
  data/              portfolio.ts — every claim, typed
  layouts/           BaseLayout.astro (SEO, JSON-LD, nav, footer)
  lib/               intro.ts, cursorWeb.ts
  pages/             index.astro
  styles/            global.css (tokens, display type, intro, web)
public/              favicon.svg
tests/               smoke.spec.ts
```

## Notes

- Motion respects `prefers-reduced-motion`: no intro, no web, no hover
  transitions.
- Only black and red are used; no other hue appears on the page.
- `overflow-x: clip` rather than `hidden` on `body` so `sticky` keeps working.
- The page is fully readable with JavaScript disabled: the intro is gated on a
  `.js` class set before first paint, and the sections are static HTML.
