// ── Scroll-drawn & interactive blueprint cursor web ──────────────────────────
// Ten virtual cursors work the page. Each owns one contiguous vertical band of
// *units* — polylines, 45° hatch blocks, concentric radar arcs, dot matrices,
// precision reticles, and display-scale outlined words.
//
// Upgraded with:
// 1. Live opening choreography on the top band so the Hero draws itself on load
// 2. Pointer-reactive rangefinder connections & illuminated CAD nodes
// 3. Subtle bone+ink dual-stroke schematic accents tailored for the #ff2400 field

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

type State = { cursors: Cursor[]; nodes: Pt[]; vw: number; vh: number };

const NAMES = ["vagi", "nse", "aotc", "re", "pse", "bedrock", "lag", "down", "attn", "win"];

function hash(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function seg(x1: number, y1: number, x2: number, y2: number): Seg {
  return { x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1) };
}

function polyline(pts: Pt[]): Seg[] {
  const out: Seg[] = [];
  for (let i = 1; i < pts.length; i++) {
    out.push(seg(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y));
  }
  return out;
}

function clipSeg(s: Seg, x0: number, y0: number, x1: number, y1: number): Seg | null {
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

  return seg(s.x1 + dx * t0, s.y1 + dy * t0, s.x1 + dx * t1, s.y1 + dy * t1);
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

function arcFan(cx: number, cy: number, r0: number, r1: number, rings: number, from: number, to: number): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i < rings; i++) {
    const r = r0 + ((r1 - r0) * i) / Math.max(1, rings - 1);
    const steps = 22;
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
        r: 1.2 + hash(k + 7) * 1.6,
      });
    }
  }
  return dots;
}

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

    const count = h > 1500 ? 7 : 5;
    for (let j = 0; j < count; j++) {
      const t = (j + 0.5) / count;
      const jx = (hash(si * 17 + j * 5) - 0.5) * 0.22;
      const jy = (hash(si * 31 + j * 11) - 0.5) * 0.1;
      nodes.push({
        x: Math.min(Math.max((0.12 + t * 0.76 + jx) * vw, 16), vw - 16),
        y: top + Math.min(Math.max(t + jy, 0.04), 0.96) * h,
      });
    }

    const right = vw - 24;
    const kind = si % 4;

    if (kind === 0) {
      const bw = Math.min(380, vw * 0.35);
      const bh = Math.min(200, h * 0.24);
      const u = unitFromSegs(
        hatch(right - bw, top + h - bh - 28, right, top + h - 28, 18, si * 41),
      );
      if (u && vw > 700) units.push(u);

      // Hero radar arcs in upper-right empty space on desktop
      if (si === 0 && vw > 900) {
        const heroArc = unitFromSegs(
          arcFan(vw * 0.74, top + h * 0.34, 68, 228, 5, Math.PI * 0.15, Math.PI * 0.92),
        );
        if (heroArc) units.push(heroArc);
      }
    } else if (kind === 1) {
      const r0 = Math.min(130, vw * 0.13);
      const segs = arcFan(vw + r0 * 0.35, top + h * 0.58, r0, r0 + 210, 7, Math.PI * 0.62, Math.PI * 1.34);
      const u = unitFromSegs(segs);
      if (u && vw > 700) units.push(u);
    } else if (kind === 2) {
      const dw = Math.min(260, vw * 0.25);
      const dh = Math.min(160, h * 0.19);
      const dots = dotCluster(20, top + h * 0.52, 20 + dw, top + h * 0.52 + dh, 10, 6, si * 13);
      units.push({
        segs: [],
        dots,
        len: dots.length * 2.2,
        x0: 20,
        y0: top + h * 0.52,
        x1: 20 + dw,
        y1: top + h * 0.52 + dh,
      });
    } else {
      const segs: Seg[] = [];
      for (let i = 0; i < 30; i++) {
        const x = 30 + i * ((vw - 60) / 29);
        const len = 8 + hash(si * 7 + i) * 26;
        segs.push(seg(x, top + h - 24 - len, x, top + h - 24));
      }
      const u = unitFromSegs(segs);
      if (u) units.push(u);
    }
  });

  // Web edges + precision crosshairs at nodes
  const seen = new Set<string>();
  const maxD = vw < 768 ? 460 : 680;
  nodes.forEach((n, i) => {
    if (i % 3 === 0) {
      const ch = unitFromSegs([seg(n.x - 5, n.y, n.x + 5, n.y), seg(n.x, n.y - 5, n.x, n.y + 5)]);
      if (ch) units.push(ch);
    }
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

  //Monumental outlined watermark words per section
  const wordSections = sections.slice(0, Math.min(sections.length, lexicon.length));
  wordSections.forEach((el, si) => {
    const word = lexicon[si];
    if (!word) return;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const h = r.height;

    let size = Math.round(Math.min(vw * 0.22, 250));
    size = Math.max(68, size);

    ctx.font = `${size}px Anton, Impact, sans-serif`;
    let total = 0;
    for (const ch of word) total += ctx.measureText(ch).width;
    if (total > vw * 0.74) {
      size = Math.max(48, Math.round((size * vw * 0.74) / total));
      ctx.font = `${size}px Anton, Impact, sans-serif`;
      total = 0;
      for (const ch of word) total += ctx.measureText(ch).width;
    }

    const x = si % 2 === 0 ? vw * 0.36 : vw * 0.05;
    const baseline = top + h - Math.min(44, h * 0.05);

    units.push({
      segs: [],
      text: {
        text: word,
        x,
        baseline,
        size,
        alpha: si % 3 === 1 ? 0.16 : 0.21,
        total,
      },
      len: total,
      x0: x,
      y0: baseline - size,
      x1: x + total,
      y1: baseline + size * 0.14,
    });
  });

  units.sort((a, b) => (a.y0 + a.y1) / 2 - (b.y0 + b.y1) / 2);

  const count = vw < 768 ? 5 : 10;
  const cursors: Cursor[] = NAMES.slice(0, count).map((name, k) => ({
    name,
    units: [],
    total: 0,
    y0: 0,
    y1: 0,
    alpha: 0.34 + hash(k * 7 + 3) * 0.18,
    width: k % 4 === 0 ? 1.25 : 1,
    writes: k % 2 === 0,
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

  return { cursors, nodes, vw, vh: window.innerHeight };
}

function progressFor(c: Cursor, scrollY: number, vh: number): number {
  const start = c.y0 - vh * 0.92;
  const end = c.y1 + vh * 0.14;
  const p = (scrollY + vh - start) / Math.max(1, end - start);
  return Math.min(1, Math.max(0, p));
}

type Lead = { disp: number; target: number };

const INK = "#0a0a0a";
const BONE = "rgba(245,242,236,0.92)";
const BONE_FAINT = "rgba(245,242,236,0.28)";

export function initCursorWeb(canvas: HTMLCanvasElement, lexicon: string[] = []): void {
  const c2d = canvas.getContext("2d");
  if (!c2d) return;
  const ctx: CanvasRenderingContext2D = c2d;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  let state: State | null = null;
  let dpr = 1;
  let live = false;
  let bootedOnce = false;
  let leads: Lead[] = [];
  let raf = 0;

  // Pointer coordinates in viewport space for CAD rangefinder interaction
  let pointer: { x: number; y: number; active: boolean } = { x: -999, y: -999, active: false };

  function size(): void {
    dpr = Math.min(2, window.devicePixelRatio || 1);
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
    const { cursors, nodes, vw, vh } = state;
    const sy = window.scrollY;

    ctx.clearRect(0, 0, vw, vh);
    ctx.save();
    ctx.translate(0, -sy);

    const top = sy - 240;
    const bottom = sy + vh + 240;

    for (let k = 0; k < cursors.length; k++) {
      const c = cursors[k];
      if (!c.total) continue;
      const p = leads[k]?.disp ?? 0;
      if (p <= 0) continue;

      let budget = p * c.total;
      let head: Pt | null = null;

      for (const u of c.units) {
        if (budget <= 0) break;

        if (u.y1 < top || u.y0 > bottom) {
          budget -= u.len;
          continue;
        }

        if (u.text) {
          const t = u.text;
          const shown = Math.min(t.total, budget);
          budget -= shown;

          ctx.save();
          ctx.beginPath();
          ctx.rect(t.x - 2, u.y0 - t.size * 0.4, shown + 4, t.size * 1.8);
          ctx.clip();
          ctx.font = `${t.size}px Anton, Impact, sans-serif`;
          ctx.textBaseline = "alphabetic";

          // Subtle Bone offset echo + crisp Obsidian primary outline
          ctx.globalAlpha = t.alpha * 0.55;
          ctx.strokeStyle = BONE;
          ctx.lineWidth = Math.max(1, t.size * 0.016);
          ctx.strokeText(t.text, t.x + 2, t.baseline + 2);

          ctx.globalAlpha = t.alpha;
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1.6, t.size * 0.022);
          ctx.strokeText(t.text, t.x, t.baseline);
          ctx.restore();

          if (shown > 0 && shown < t.total) {
            ctx.globalAlpha = 0.65;
            ctx.strokeStyle = BONE;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(t.x + Math.max(0, shown - 54), t.baseline - t.size * 0.3);
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

      if (head && head.y > top && head.y < bottom) {
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = BONE;
        ctx.fillRect(head.x - 3, head.y - 3, 6, 6);
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
          ctx.lineWidth = 1.2;
          ctx.fill();
          ctx.stroke();

          if (c.writes) {
            const label = c.name.toUpperCase();
            ctx.font = 'bold 9px "JetBrains Mono", ui-monospace, monospace';
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = INK;
            ctx.fillRect(13, 11, tw + 8, 13);
            ctx.fillStyle = BONE;
            ctx.textBaseline = "top";
            ctx.fillText(label, 17, 13);
          }
          ctx.restore();
        }
      }
    }

    // Interactive pointer CAD rangefinder: snaps faint bone hairlines to the
    // three closest schematic nodes around the reader's cursor.
    if (pointer.active && finePointer.matches) {
      const px = pointer.x;
      const py = pointer.y + sy;
      const near = nodes
        .map((n) => ({ n, d: Math.hypot(n.x - px, n.y - py) }))
        .filter((o) => o.d < 290)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);

      for (const { n, d } of near) {
        const strength = 1 - d / 290;
        ctx.globalAlpha = strength * 0.48;
        ctx.strokeStyle = BONE;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.globalAlpha = strength * 0.85;
        ctx.strokeStyle = BONE;
        ctx.strokeRect(n.x - 4, n.y - 4, 8, 8);
      }

      // Subtle crosshair around pointer
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = BONE_FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  const EASE_PER_FRAME = 0.068;
  const EPSILON = 0.0004;
  const BAND_MIN_MS = 3600;

  function retarget(): void {
    if (!state) return;
    const sy = window.scrollY;
    for (let k = 0; k < state.cursors.length; k++) {
      const c = state.cursors[k];
      const lead = leads[k];
      if (!lead) continue;
      lead.target = c.total ? progressFor(c, sy, state.vh) : 0;
    }
  }

  function tick(prev: number): void {
    raf = 0;
    if (!state || !live) return;

    const now = performance.now();
    const dt = Math.min(64, now - prev);
    const k = 1 - Math.pow(1 - EASE_PER_FRAME, dt / 16.67);
    const maxStep = dt / BAND_MIN_MS;
    const recede = 1 - Math.pow(1 - 0.3, dt / 16.67);

    let moving = false;
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const d = lead.target - lead.disp;
      if (Math.abs(d) < EPSILON) {
        lead.disp = lead.target;
        continue;
      }
      if (d < 0) {
        lead.disp += d * recede;
      } else {
        lead.disp += Math.min(d * k, maxStep);
      }
      moving = true;
    }

    draw();
    if (moving) raf = requestAnimationFrame(() => tick(now));
  }

  function schedule(): void {
    retarget();
    if (raf) return;
    raf = requestAnimationFrame(() => tick(performance.now()));
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

    const prevDisp = leads.map((l) => l.disp);
    state = build(ctx, lexicon);
    const sy = window.scrollY;
    leads = state.cursors.map((c, k) => {
      const target = c.total ? progressFor(c, sy, state!.vh) : 0;
      const keep = prevDisp[k];
      // On first boot, start disp at 0.08 so the Hero band actively sketches
      // itself across the red field as soon as the page opens!
      if (!bootedOnce && keep === undefined) {
        return { disp: target > 0 ? 0.08 : 0, target };
      }
      return { disp: keep === undefined ? target : Math.min(1, keep), target };
    });
    bootedOnce = true;
    draw();
    schedule();
  }

  let resizeTimer = 0;
  function onResize(): void {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuild, 180);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  if (finePointer.matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
        if (!raf) raf = requestAnimationFrame(() => tick(performance.now()));
      },
      { passive: true },
    );
    window.addEventListener(
      "pointerleave",
      () => {
        pointer.active = false;
        draw();
      },
      { passive: true },
    );
  }

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => onResize());
    ro.observe(document.body);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) schedule();
  });

  reduce.addEventListener("change", rebuild);

  const settle = (): void => rebuild();
  document.fonts?.ready.then(settle) ?? settle();
  if (document.readyState === "complete") settle();
  else window.addEventListener("load", settle, { once: true });
}
