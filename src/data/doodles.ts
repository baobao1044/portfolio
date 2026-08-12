// ── Hand-drawn / tech doodle SVG definitions ──
// Each doodle is a self-contained SVG fragment + placement hint.
// Rendered by DoodleLayer.astro and animated (draw/float) in BaseLayout.

export type DoodleKind =
  | "tech" // circuit, gear, atom, chip
  | "accent" // hand-drawn underline, squiggle, asterisk, arrow
  | "geo" // circle, triangle, dot grid
  | "pattern"; // repeating texture block

export interface Doodle {
  id: string;
  kind: DoodleKind;
  // placement: which section, anchor corner, and offsets (vw/vh-ish units via CSS)
  section: "hero" | "about" | "projects" | "philosophy" | "proof" | "contact" | "global";
  position: "tl" | "tr" | "bl" | "br" | "center" | "side";
  // inline SVG markup (no outer svg tag — wrapped by component). viewBox implied.
  svg: string;
  // optional draw animation: animate stroke-dashoffset on enter
  draw?: boolean;
  // optional float amplitude (px) — gentle bob
  float?: number;
}

// Reusable path snippets (hand-drawn feel via slight irregularity)
const SQUIGGLE = (w = 120) =>
  `M2 8 Q ${w * 0.25} 2, ${w * 0.5} 8 T ${w - 2} 8`;

const ARROW = `M2 14 L 40 14 M 30 6 L 40 14 L 30 22`;

const CIRCUIT = `
  <path d="M4 40 H 30 V 12 H 56" />
  <path d="M56 12 H 80 V 40 H 100" />
  <circle cx="4" cy="40" r="3" /><circle cx="56" cy="12" r="3" />
  <circle cx="100" cy="40" r="3" />
  <path d="M30 40 V 64 H 70" />
`;

const GEAR = `
  <circle cx="32" cy="32" r="14" />
  <circle cx="32" cy="32" r="5" />
  <path d="M32 4 V 14 M32 50 V 60 M4 32 H 14 M50 32 H 60
           M12 12 L 19 19 M45 45 L 52 52 M52 12 L 45 19 M19 45 L 12 52" />
`;

const ATOM = `
  <circle cx="40" cy="40" r="4" />
  <ellipse cx="40" cy="40" rx="34" ry="14" />
  <ellipse cx="40" cy="40" rx="34" ry="14" transform="rotate(60 40 40)" />
  <ellipse cx="40" cy="40" rx="34" ry="14" transform="rotate(120 40 40)" />
`;

const CHIP = `
  <rect x="18" y="18" width="44" height="44" rx="3" />
  <rect x="30" y="30" width="20" height="20" rx="1" />
  <path d="M18 28 H 8 M18 38 H 8 M18 48 H 8
           M62 28 H 72 M62 38 H 72 M62 48 H 72
           M28 18 V 8 M38 18 V 8 M48 18 V 8
           M28 62 V 72 M38 62 V 72 M48 62 V 72" />
`;

const ASTERISK = `
  <path d="M20 4 V 36 M4 20 H 36 M8 8 L 32 32 M32 8 L 8 32" />
`;

const UNDERLINE = (w = 140) => `
  <path d="M2 10 Q ${w * 0.3} 4, ${w * 0.5} 12 T ${w - 4} 6" />
  <path d="M${w * 0.4} 14 Q ${w * 0.6} 10, ${w - 6} 14" />
`;

const TRIANGLE = `M4 56 L 32 8 L 60 56 Z`;

const DOTGRID = (cols = 6, rows = 4, gap = 14) =>
  Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => `<circle cx="${4 + c * gap}" cy="${4 + r * gap}" r="1.4" />`).join(""),
  ).join("");

const TOPO = `
  <path d="M2 20 Q 20 8, 40 20 T 78 18" />
  <path d="M2 38 Q 22 28, 42 38 T 80 36" />
  <path d="M2 56 Q 24 48, 44 56 T 82 54" />
`;

const CIRCUIT_GRID = `
  <path d="M2 2 H 78 V 78 H 2 Z" />
  <path d="M2 20 H 78 M2 40 H 78 M2 60 H 78
           M20 2 V 78 M40 2 V 78 M60 2 V 78" />
`;

const ANNOTATION_ARROW = `
  <path d="M4 30 Q 30 10, 60 26" />
  <path d="M60 26 L 50 18 M60 26 L 48 30" />
`;

export const doodles: Doodle[] = [
  // ── HERO ──
  {
    id: "hero-atom",
    kind: "tech",
    section: "hero",
    position: "tr",
    svg: `<g>${ATOM}</g>`,
    draw: true,
    float: 6,
  },
  {
    id: "hero-squiggle-bl",
    kind: "accent",
    section: "hero",
    position: "bl",
    svg: `<path d="${SQUIGGLE(140)}" /><path d="${SQUIGGLE(120)}" transform="translate(0 10)" opacity="0.6"/>`,
    draw: true,
    float: 4,
  },
  {
    id: "hero-circuit-tl",
    kind: "tech",
    section: "hero",
    position: "tl",
    svg: `<g>${CIRCUIT}</g>`,
    draw: true,
    float: 5,
  },

  // ── ABOUT ──
  {
    id: "about-gear-bl",
    kind: "tech",
    section: "about",
    position: "bl",
    svg: `<g>${GEAR}</g>`,
    draw: true,
    float: 8,
  },
  {
    id: "about-underline",
    kind: "accent",
    section: "about",
    position: "side",
    svg: `<g>${UNDERLINE(150)}</g>`,
    draw: true,
  },
  {
    id: "about-dotgrid-tr",
    kind: "pattern",
    section: "about",
    position: "tr",
    svg: `<g>${DOTGRID(7, 5, 16)}</g>`,
    float: 3,
  },

  // ── PROJECTS ──
  {
    id: "projects-chip-tr",
    kind: "tech",
    section: "projects",
    position: "tr",
    svg: `<g>${CHIP}</g>`,
    draw: true,
    float: 6,
  },
  {
    id: "projects-circuit-bl",
    kind: "tech",
    section: "projects",
    position: "bl",
    svg: `<g>${CIRCUIT}</g>`,
    draw: true,
    float: 5,
  },
  {
    id: "projects-arrow-br",
    kind: "accent",
    section: "projects",
    position: "br",
    svg: `<g>${ARROW}</g>`,
    draw: true,
    float: 4,
  },

  // ── PHILOSOPHY ──
  {
    id: "philo-triangle-tl",
    kind: "geo",
    section: "philosophy",
    position: "tl",
    svg: `<g>${TRIANGLE}</g>`,
    draw: true,
    float: 7,
  },
  {
    id: "philo-asterisk-tr",
    kind: "accent",
    section: "philosophy",
    position: "tr",
    svg: `<g>${ASTERISK}</g>`,
    draw: true,
    float: 5,
  },
  {
    id: "philo-circuitgrid-bl",
    kind: "pattern",
    section: "philosophy",
    position: "bl",
    svg: `<g>${CIRCUIT_GRID}</g>`,
    float: 2,
  },

  // ── PROOF ──
  {
    id: "proof-topo-bl",
    kind: "pattern",
    section: "proof",
    position: "bl",
    svg: `<g>${TOPO}</g>`,
    draw: true,
    float: 3,
  },
  {
    id: "proof-circuit-tr",
    kind: "tech",
    section: "proof",
    position: "tr",
    svg: `<g>${CIRCUIT}</g>`,
    draw: true,
    float: 6,
  },
  {
    id: "proof-annotation-br",
    kind: "accent",
    section: "proof",
    position: "br",
    svg: `<g>${ANNOTATION_ARROW}</g>`,
    draw: true,
    float: 4,
  },

  // ── CONTACT ──
  {
    id: "contact-atom-bl",
    kind: "tech",
    section: "contact",
    position: "bl",
    svg: `<g>${ATOM}</g>`,
    draw: true,
    float: 7,
  },
  {
    id: "contact-asterisk-tr",
    kind: "accent",
    section: "contact",
    position: "tr",
    svg: `<g>${ASTERISK}</g>`,
    draw: true,
    float: 5,
  },
  {
    id: "contact-dotgrid-tl",
    kind: "pattern",
    section: "contact",
    position: "tl",
    svg: `<g>${DOTGRID(6, 4, 16)}</g>`,
    float: 3,
  },
];
