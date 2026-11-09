// ── Scroll-drawn cursor web ──────────────────────────────────────────────────
// Ten virtual cursors work the page. Each owns one contiguous vertical band of
// *units* — a unit is a polyline, a hatch block, a dot cluster, or a string of
// letters. Scroll position decides how much of the band has been drawn, so the
// page is written just ahead of the reader rather than played back as a
// timeline. A unit is either fully ahead of the viewport (nothing), inside it
// (drawn up to the current progress), or behind it (complete).
//
// Cost model: one rAF per scroll frame, no idle repaint, no layout reads during
// draw (every measurement is cached in build()), DPR capped at 2, and units are
// culled against a viewport band with a single box test before any path work.

type Pt = { x: number; y: number };
type Seg = { x1: number; y1: number; x2: number; y2: number; len: number };
type Dot = { x: number; y: number; r: number };

type TextRun = {
  text: string;
  x: number;
  baseline: number;
  size: number;
  alpha: number;
  total: number;
};

type Unit = {
  segs: Seg[];
  text?: TextRun;
  dots?: Dot[];
  len: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

type Cursor = {
  name: string;
  units: Unit[];
  total: number;
  y0: number;
  y1: number;
  alpha: number;
  width: number;
  writes: boolean;
};

type State = { cursors: Cursor[]; vw: number; vh: number };

const NAMES = ["vagi", "nse", "aotc", "re", "pse", "bedrock", "lag", "down", "attn", "win"];

// ── Deterministic noise ──────────────────────────────────────────────────────
// Stable across rebuilds so a resize never reshuffles the drawing under the
// reader, and random enough that the hatch does not read as a CSS pattern.
function hash(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ── Geometry helpers ─────────────────────────────────────────────────────────

function seg(x1: number, y1: number, x2: number, y2: number): Seg {
  return { x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1) };
}

function polyline(pts: Pt[]): Seg[] {
  const out: Seg[] = [];
  for (let i = 1; i < pts.length; i++) out.push(seg(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y));
  return out;
}

// Liang–Barsky. Hatching is generated against an oversized line and clipped to
// the block, which keeps the block's silhouette crisp without a canvas clip().
function clipSeg(
  s: Seg,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Seg | null {
  let t0 = 0;
  let t1 = 1;
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;

  const clip = (p: number, q: number): boolean => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };

  if (!clip(-dx, s.x1 - x0)) return null;
  if (!clip(dx, x1 - s.x1)) return null;
  if (!clip(-dy, s.y1 - y0)) return null;
  if (!clip(dy, y1 - s.y1)) return null;
  if (t1 <= t0) return null;

  const ax = s.x1 + dx * t0;
  const ay = s.y1 + dy * t0;
  const bx = s.x1 + dx * t1;
  const by = s.y1 + dy * t1;
  return seg(ax, ay, bx, by);
}

function unitFromSegs(segs: Seg[]): Unit | null {
  if (!segs.length) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  let len = 0;
  for (const s of segs) {
    len += s.len;
    x0 = Math.min(x0, s.x1, s.x2);
    x1 = Math.max(x1, s.x1, s.x2);
    y0 = Math.min(y0, s.y1, s.y2);
    y1 = Math.max(y1, s.y1, s.y2);
  }
  return { segs, len, x0, y0, x1, y1 };
}

// ── Ornaments ────────────────────────────────────────────────────────────────

// 45° hatch across a block. `count` lines, jittered so the spacing breathes.
function hatch(x0: number, y0: number, x1: number, y1: number, count: number, seed: number): Seg[] {
  const out: Seg[] = [];
  const w = x1 - x0;
  const h = y1 - y0;
  const span = w + h;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.35 + hash(seed + i) * 0.3) / count;
    const c = -h + t * span;
    const clipped = clipSeg(seg(x0 + c - h, y0 + h, x0 + c + h, y0 - h), x0, y0, x1, y1);
    if (clipped) out.push(clipped);
  }
  return out;
}

// Concentric arc fan, flattened to polylines (the unit list is line-only).
function arcFan(cx: number, cy: number, r0: number, r1: number, rings: number, from: number, to: number): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < rings; i++) {
    const r = r0 + ((r1 - r0) * i) / Math.max(1, rings - 1);
    const steps = 18;
    const pts: Pt[] = [];
    for (let s = 0; s <= steps; s++) {
      const a = from + ((to - from) * s) / steps;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    out.push(...polyline(pts));
  }
  return out;
}

function dotCluster(x0: number, y0: number, x1: number, y1: number, cols: number, rows: number, seed: number): Dot[] {
  const dots: Dot[] = [];
  const cw = (x1 - x0) / cols;
  const ch = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = seed + r * cols + c;
      dots.push({
        x: x0 + cw * (c + 0.5) + (hash(k) - 0.5) * cw * 0.5,
        y: y0 + ch * (r + 0.5) + (hash(k + 99) - 0.5) * ch * 0.5,
        r: 1 + hash(k + 7) * 1.4,
      });
    }
  }
  return dots;
}

// ── Build ────────────────────────────────────────────────────────────────────

function build(ctx: CanvasRenderingContext2D, lexicon: string[]): State {
  const vw = document.documentElement.clientWidth;
  const nodes: Pt[] = [];
  const units: Unit[] = [];

  const anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-web]"));
  anchors.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.height === 0) return;
    const y = r.top + window.scrollY + Math.min(r.height, 260) * 0.5;
    const x = i % 2 === 0 ? r.right + 30 : r.left - 30;
    nodes.push({ x: Math.min(Math.max(x, 22), vw - 22), y });
  });

  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
  sections.forEach((el, si) => {
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const h = r.height;
    if (h < 80) return;

    const count = h > 1500 ? 6 : 4;
    for (let j = 0; j < count; j++) {
      const t = (j + 0.5) / count;
      const jx = (hash(si * 17 + j * 5) - 0.5) * 0.18;
      const jy = (hash(si * 31 + j * 11) - 0.5) * 0.09;
      nodes.push({
        x: Math.min(Math.max((0.14 + t * 0.72 + jx) * vw, 14), vw - 14),
        y: top + Math.min(Math.max(t + jy, 0.03), 0.97) * h,
      });
    }

    // ── Ornaments, one vocabulary per section, cycling so neighbouring
    //    sections never repeat the same mark.
    const right = vw - 24;
    const kind = si % 4;

    if (kind === 0) {
      // Hatch block in the lower-right corner.
      const bw = Math.min(360, vw * 0.34);
      const bh = Math.min(190, h * 0.22);
      const u = unitFromSegs(
        hatch(right - bw, top + h - bh - 28, right, top + h - 28, 15, si * 41),
      );
      if (u && vw > 700) units.push(u);
    } else if (kind === 1) {
      // Arc fan anchored off the right edge.
      const r0 = Math.min(120, vw * 0.12);
      const segs = arcFan(vw + r0 * 0.4, top + h * 0.62, r0, r0 + 190, 6, Math.PI * 0.62, Math.PI * 1.34);
      const u = unitFromSegs(segs);
      if (u && vw > 700) units.push(u);
    } else if (kind === 2) {
      // Dot field in the left margin.
      const dw = Math.min(240, vw * 0.24);
      const dh = Math.min(150, h * 0.18);
      const dots = dotCluster(20, top + h * 0.55, 20 + dw, top + h * 0.55 + dh, 9, 6, si * 13);
      units.push({
        segs: [],
        dots,
        len: dots.length * 2.2,
        x0: 20,
        y0: top + h * 0.55,
        x1: 20 + dw,
        y1: top + h * 0.55 + dh,
      });
    } else {
      // Lattice rule: short vertical ticks along the section seam.
      const segs: Seg[] = [];
      for (let i = 0; i < 26; i++) {
        const x = 30 + i * ((vw - 60) / 25);
        const len = 6 + hash(si * 7 + i) * 22;
        segs.push(seg(30 + i * ((vw - 60) / 25), top + h - 26 - len, x, top + h - 26));
      }
      const u = unitFromSegs(segs);
      if (u) units.push(u);
    }
  });

  // ── Web edges: three nearest neighbours, one boundary thread per seam.
  const seen = new Set<string>();
  const maxD = vw < 768 ? 460 : 640;
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
      .filter((o) => o.j !== i && o.d > 8 && o.d <= maxD)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const o of near) {
      const key = i < o.j ? `${i}:${o.j}` : `${o.j}:${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const m = nodes[o.j];
      const u = unitFromSegs([seg(n.x, n.y, m.x, m.y)]);
      if (u) units.push(u);
    }
  });

  sections.forEach((el, si) => {
    const next = sections[si + 1];
    if (!next) return;
    const r = el.getBoundingClientRect();
    const rn = next.getBoundingClientRect();
    const yA = r.top + window.scrollY + r.height - 12;
    const yB = rn.top + window.scrollY + 12;
    const x = si % 2 === 0 ? vw * 0.82 : vw * 0.18;
    const u = unitFromSegs([seg(x, yA, vw - x, yB)]);
    if (u) units.push(u);
  });

  // ── Letters. One word per section, drawn large and outlined behind the copy,
  //    then typed left-to-right by whichever cursor owns that band.
  const wordSections = sections.slice(0, Math.min(sections.length, lexicon.length));
  wordSections.forEach((el, si) => {
    const word = lexicon[si];
    if (!word) return;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const h = r.height;

    // Size the glyphs so the word spans about half the width, within bounds.
    let size = Math.round(Math.min(vw * 0.2, 230));
    size = Math.max(64, size);

    ctx.font = `${size}px Anton, Impact, sans-serif`;
    let total = 0;
    for (const ch of word) total += ctx.measureText(ch).width;
    if (total > vw * 0.72) {
      size = Math.max(48, Math.round((size * vw * 0.72) / total));
      ctx.font = `${size}px Anton, Impact, sans-serif`;
      total = 0;
      for (const ch of word) total += ctx.measureText(ch).width;
    }

    // Sit the word on the section's floor, where the copy has already ended; a
    // word behind a display heading reads as clutter, one below it as texture.
    const x = si % 2 === 0 ? vw * 0.38 : vw * 0.06;
    const baseline = top + h - Math.min(48, h * 0.06);

    const u: Unit = {
      segs: [],
      text: {
        text: word,
        x,
        baseline,
        size,
        // Outline only, faint enough to sit under body copy as a watermark.
        // A filled word this large would turn into a grey slab.
        alpha: si % 3 === 1 ? 0.14 : 0.18,
        total,
      },
      len: total,
      x0: x,
      y0: baseline - size,
      x1: x + total,
      y1: baseline + size * 0.14,
    };
    units.push(u);
  });

  // ── Split into contiguous vertical bands.
  units.sort((a, b) => (a.y0 + a.y1) / 2 - (b.y0 + b.y1) / 2);

  const count = vw < 768 ? 5 : 10;
  const cursors: Cursor[] = NAMES.slice(0, count).map((name, k) => ({
    name,
    units: [],
    total: 0,
    y0: 0,
    y1: 0,
    alpha: 0.3 + hash(k * 7 + 3) * 0.16,
    width: 1,
    // Roughly every third cursor also writes letters, so the page reads as
    // drawn *and* written without every band fighting the copy.
    writes: k % 3 === 0,
  }));

  const M = units.length || 1;
  units.forEach((u, i) => {
    const k = Math.min(cursors.length - 1, Math.floor((i / M) * cursors.length));
    cursors[k].units.push(u);
  });

  for (const c of cursors) {
    c.total = c.units.reduce((sum, u) => sum + u.len, 0);
    if (!c.units.length) continue;
    c.y0 = Math.min(...c.units.map((u) => u.y0));
    c.y1 = Math.max(...c.units.map((u) => u.y1));
  }

  return { cursors, vw, vh: window.innerHeight };
}

// Starts a little before the band reaches the fold and finishes as it leaves
// the top, so the line is being written while the reader arrives.
function progressFor(c: Cursor, scrollY: number, vh: number): number {
  const start = c.y0 - vh * 0.9;
  const end = c.y1 + vh * 0.15;
  const p = (scrollY + vh - start) / Math.max(1, end - start);
  return Math.min(1, Math.max(0, p));
}

// ── Draw ─────────────────────────────────────────────────────────────────────

const INK = "#0a0a0a";
const BONE = "rgba(245,242,236,0.92)";

export function initCursorWeb(canvas: HTMLCanvasElement, lexicon: string[] = []): void {
  const c2d = canvas.getContext("2d");
  if (!c2d) return;
  const ctx: CanvasRenderingContext2D = c2d;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let state: State | null = null;
  let dpr = 1;
  let queued = false;
  let live = false;

  function size(): void {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    // clientWidth excludes the scrollbar; innerWidth would shift every x.
    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(): void {
    if (!state || !live) return;
    const { cursors, vw, vh } = state;
    const sy = window.scrollY;

    ctx.clearRect(0, 0, vw, vh);
    ctx.save();
    ctx.translate(0, -sy);

    const top = sy - 240;
    const bottom = sy + vh + 240;

    for (const c of cursors) {
      if (!c.total) continue;
      const p = progressFor(c, sy, vh);
      if (p <= 0) continue;

      let budget = p * c.total;
      let head: Pt | null = null;

      for (const u of c.units) {
        if (budget <= 0) break;

        // Culled units still consume budget, otherwise a unit scrolled past
        // would hand its length to the next one and the drawing would run ahead
        // of the reader.
        if (u.y1 < top || u.y0 > bottom) {
          budget -= u.len;
          continue;
        }

        if (u.text) {
          const t = u.text;
          const shown = Math.min(t.total, budget);
          budget -= shown;

          // Clip to the written span: the glyphs appear as if struck by a pen
          // moving left to right, not faded in as a block.
          ctx.save();
          ctx.beginPath();
          // The unit's own bounds, not the run's: a TextRun carries no y.
          ctx.rect(t.x - 2, u.y0 - t.size * 0.4, shown + 4, t.size * 1.8);
          ctx.clip();
          ctx.font = `${t.size}px Anton, Impact, sans-serif`;
          ctx.textBaseline = "alphabetic";
          ctx.globalAlpha = t.alpha;
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1.5, t.size * 0.022);
          ctx.strokeText(t.text, t.x, t.baseline);
          ctx.restore();

          if (shown > 0 && shown < t.total) {
            // Still being written: a short rule trails the pen so the letters
            // read as struck rather than faded in.
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = INK;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(t.x + Math.max(0, shown - 46), t.baseline - t.size * 0.3);
            ctx.lineTo(t.x + shown, t.baseline - t.size * 0.3);
            ctx.stroke();
            head = { x: t.x + shown, y: t.baseline - t.size * 0.32 };
            budget = 0;
          } else if (shown >= t.total) {
            head = { x: t.x + t.total, y: t.baseline - t.size * 0.32 };
          }
          continue;
        }

        if (u.dots) {
          const remaining = budget;
          const perDot = u.len / Math.max(1, u.dots.length);
          const n = Math.min(u.dots.length, Math.floor(remaining / perDot));
          ctx.globalAlpha = c.alpha;
          ctx.fillStyle = INK;
          for (let i = 0; i < n; i++) {
            const d = u.dots[i];
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
            head = { x: d.x, y: d.y };
          }
          budget -= n * perDot;
          continue;
        }

        // Polyline: stroke as many segments as the budget allows, partially on
        // the last one, and remember where the pen stopped.
        ctx.beginPath();
        let drew = false;
        for (const s of u.segs) {
          if (budget <= 0) break;
          const take = Math.min(budget, s.len);
          const t = s.len === 0 ? 1 : take / s.len;
          const ex = s.x1 + (s.x2 - s.x1) * t;
          const ey = s.y1 + (s.y2 - s.y1) * t;
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(ex, ey);
          drew = true;
          head = { x: ex, y: ey };
          budget -= take;
          if (t < 1) break;
        }
        if (drew) {
          ctx.globalAlpha = c.alpha;
          ctx.strokeStyle = INK;
          ctx.lineWidth = c.width;
          ctx.stroke();
        }
      }

      // The pen: a node where the ink stops, plus a pointer and the cursor's
      // name once that cursor has started writing letters.
      if (head && head.y > top && head.y < bottom) {
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = INK;
        ctx.fillRect(head.x - 1.5, head.y - 1.5, 3, 3);

        if (p < 1) {
          ctx.save();
          ctx.translate(head.x, head.y);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 14);
          ctx.lineTo(3.6, 10.6);
          ctx.lineTo(6.4, 16);
          ctx.lineTo(9.2, 14.6);
          ctx.lineTo(6.4, 9.4);
          ctx.lineTo(11.4, 9.4);
          ctx.closePath();
          ctx.fillStyle = INK;
          ctx.strokeStyle = BONE;
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();

          if (c.writes) {
            ctx.font = '9px "JetBrains Mono", ui-monospace, monospace';
            ctx.textBaseline = "top";
            ctx.lineJoin = "round";
            ctx.strokeStyle = BONE;
            ctx.lineWidth = 3;
            ctx.strokeText(c.name, 14, 13);
            ctx.fillStyle = INK;
            ctx.fillText(c.name, 14, 13);
          }
          ctx.restore();
        }
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function schedule(): void {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      draw();
    });
  }

  function rebuild(): void {
    if (reduce.matches) {
      live = false;
      document.body.classList.add("web-off");
      return;
    }
    document.body.classList.remove("web-off");
    live = true;
    size();
    state = build(ctx, lexicon);
    draw();
  }

  let resizeTimer = 0;
  function onResize(): void {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuild, 180);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  // Opening a <details> row changes document height and moves every anchor
  // below it, so the geometry has to be rebuilt rather than reused.
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => onResize());
    ro.observe(document.body);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) schedule();
  });

  reduce.addEventListener("change", rebuild);

  // Glyph widths are measured against the real font, so the letters cannot be
  // laid out before Anton has loaded.
  const settle = (): void => rebuild();
  document.fonts?.ready.then(settle) ?? settle();
  if (document.readyState === "complete") settle();
  else window.addEventListener("load", settle, { once: true });
}
