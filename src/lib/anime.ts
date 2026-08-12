// ── Anime.js v4 helpers for the portfolio ──
// Centralizes easing presets, split-text, SVG draw, spring, magnetic, and
// scroll-triggered reveals. Vanilla IntersectionObserver/scroll-math drive the
// *when*; anime.js drives the *how* (eased tweens, stagger, spring).

import {
  animate,
  createTimeline,
  stagger,
  spring,
  splitText,
  createDrawable,
  utils,
  type AnimationParams,
} from "animejs";

// ── Easing presets (GSAP-equivalent feel, premium) ──
export const ease = {
  outExpo: "outExpo",
  outQuart: "outQuart",
  inOut3: "inOut(3)",
  outBack: "outBack(2)",
  outElastic: "outElastic(1, 0.5)",
  spring: spring({ mass: 1, stiffness: 120, damping: 14, velocity: 0 }),
  springSoft: spring({ mass: 1, stiffness: 80, damping: 18, velocity: 0 }),
} as const;

// ── Split an element's text into char/word spans for stagger reveals ──
export function splitChars(target: HTMLElement): HTMLElement[] {
  const splitter = splitText(target, {
    chars: true,
    words: false,
    lines: false,
    accessible: true,
  });
  return splitter.chars as unknown as HTMLElement[];
}

export function splitWords(target: HTMLElement): HTMLElement[] {
  const splitter = splitText(target, {
    chars: false,
    words: true,
    lines: false,
    accessible: true,
  });
  return splitter.words as unknown as HTMLElement[];
}

// ── Prepare SVG paths for a draw-on-scroll animation ──
export function prepareDrawable(selector: string) {
  try {
    return createDrawable(selector);
  } catch {
    return [];
  }
}

// ── Number counter (0 → value) on a target element's textContent ──
export function countUp(
  target: HTMLElement,
  to: number,
  opts: { duration?: number; delay?: number; suffix?: string } = {},
) {
  const { duration = 1400, delay = 0, suffix = "" } = opts;
  const obj = { v: 0 };
  const anim = animate(obj, {
    v: to,
    duration,
    delay,
    ease: ease.outQuart,
    onUpdate: () => {
      target.textContent = `${Math.round(obj.v)}${suffix}`;
    },
    onComplete: () => {
      target.textContent = `${to}${suffix}`;
    },
  });
  // Safety net: in some throttled/embedded contexts the engine's rAF callbacks
  // may not fire even though the tween is scheduled. Guarantee the final value
  // is shown regardless, so counters never stay stuck at 0.
  setTimeout(() => {
    target.textContent = `${to}${suffix}`;
  }, duration + delay + 400);
  return anim;
}

// ── Magnetic pull on an element (mouse-follow with spring reset) ──
// Throttled to rAF to avoid spawning an animation per mousemove pixel.
export function magnetic(el: HTMLElement, strength = 0.35) {
  if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch
  let pending: { x: number; y: number } | null = null;
  let scheduled = false;
  const move = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    pending = { x, y };
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (!pending) return;
      animate(el, { x: pending.x, y: pending.y, duration: 280, ease: ease.outQuart });
      pending = null;
    });
  };
  const leave = () => {
    animate(el, { x: 0, y: 0, duration: 600, ease: ease.spring });
  };
  el.addEventListener("mousemove", move);
  el.addEventListener("mouseleave", leave);
  return () => {
    el.removeEventListener("mousemove", move);
    el.removeEventListener("mouseleave", leave);
  };
}

// ── Scroll-triggered one-shot reveal (IntersectionObserver + anime) ──
// Plays `anim` when `target` enters the viewport. `anim` receives the element.
export function revealOnScroll(
  target: HTMLElement,
  anim: (el: HTMLElement) => ReturnType<typeof animate> | void,
  opts: { threshold?: number; once?: boolean; rootMargin?: string } = {},
) {
  const { threshold = 0.15, once = true, rootMargin = "0px 0px -10% 0px" } = opts;
  if (typeof IntersectionObserver === "undefined") {
    anim(target); // SSR/no-IO fallback: just run it
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          anim(target);
          if (once) io.unobserve(target);
        }
      }
    },
    { threshold, rootMargin },
  );
  io.observe(target);
  return () => io.disconnect();
}

// ── Global single rAF scroll controller ──
// One loop drives all scroll-driven effects (parallax, progress, h-scroll).
// This avoids multiple scroll listeners + getBoundingClientRect calls per frame.
type ScrollFn = (progress: number, viewportH: number) => void;
const scrollSubs = new Set<ScrollFn>();
let scrollScheduled = false;

function scheduleScroll() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    scrollScheduled = false;
    const vh = window.innerHeight;
    for (const fn of scrollSubs) {
      try {
        fn(0, vh);
      } catch {
        /* ignore individual sub errors */
      }
    }
  });
}

export function onGlobalScroll(fn: ScrollFn): () => void {
  scrollSubs.add(fn);
  if (scrollSubs.size === 1) {
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
    scheduleScroll();
  } else {
    scheduleScroll();
  }
  return () => {
    scrollSubs.delete(fn);
    if (scrollSubs.size === 0) {
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
    }
  };
}

// ── Scrub parallax: register into the single global scroll loop ──
export function scrubParallax(el: HTMLElement, speed = 0.25) {
  const section = el.closest("section") || el;
  const update = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
    el.style.transform = `translate3d(0, ${(-progress * speed * 100).toFixed(2)}px, 0)`;
  };
  return onGlobalScroll(update);
}

// ── Toggle a class when an element enters/leaves the viewport ──
export function toggleOnScroll(
  target: HTMLElement,
  cls: string,
  opts: { threshold?: number; once?: boolean } = {},
) {
  const { threshold = 0.5, once = false } = opts;
  if (typeof IntersectionObserver === "undefined") {
    target.classList.add(cls);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          target.classList.add(cls);
          if (once) io.unobserve(target);
        } else if (!once) {
          target.classList.remove(cls);
        }
      }
    },
    { threshold },
  );
  io.observe(target);
  return () => io.disconnect();
}

// ── Tween the body background color on section enter ──
export function bgMorphOnScroll(
  section: HTMLElement,
  color: string,
) {
  if (typeof IntersectionObserver === "undefined") return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate("body", {
            backgroundColor: color,
            duration: 800,
            ease: ease.inOut3,
          });
        }
      }
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
  );
  io.observe(section);
  return () => io.disconnect();
}

// Re-export commonly used primitives for inline use.
export { animate, createTimeline, stagger, utils };
export type { AnimationParams };

// ── Live text: continuous float (sin) + per-char mouse reaction ──
// Gives hero headline "life" after the reveal: each char bobs on a phase-offset
// sin wave and is nudged by cursor proximity. Single rAF loop for all chars.
export function liveText(
  container: HTMLElement,
  opts: { amp?: number; speed?: number; mouseRadius?: number; mouseStrength?: number } = {},
) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(pointer: coarse)").matches) {
    // touch: no mouse reaction, just gentle float
  }
  const { amp = 4, speed = 1.2, mouseRadius = 160, mouseStrength = 14 } = opts;

  const chars = Array.from(container.querySelectorAll<HTMLElement>(".split-char"));
  if (chars.length === 0) return;

  // Precompute each char's center offset relative to container
  let centers: { x: number; y: number }[] = [];
  let mx = -9999;
  let my = -9999;
  let raf = 0;
  let running = false;

  const measure = () => {
    const cr = container.getBoundingClientRect();
    centers = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top };
    });
  };

  const onMove = (e: MouseEvent) => {
    const cr = container.getBoundingClientRect();
    mx = e.clientX - cr.left;
    my = e.clientY - cr.top;
  };
  const onLeave = () => {
    mx = -9999;
    my = -9999;
  };
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseout", onLeave, { passive: true });

  const start = performance.now();
  const loop = (now: number) => {
    if (!running) return;
    const t = (now - start) / 1000;
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      // float: phase-offset sin
      const phase = i * 0.18;
      let dy = Math.sin(t * speed + phase) * amp;
      let dx = Math.cos(t * speed * 0.7 + phase) * amp * 0.4;

      // mouse reaction: nudge away from cursor within radius
      if (mx > -9000) {
        const cx = centers[i]?.x ?? 0;
        const cy = centers[i]?.y ?? 0;
        const ddx = cx - mx;
        const ddy = cy - my;
        const dist = Math.hypot(ddx, ddy);
        if (dist < mouseRadius) {
          const f = (1 - dist / mouseRadius) * mouseStrength;
          dx += (ddx / (dist || 1)) * f;
          dy += (ddy / (dist || 1)) * f;
        }
      }
      c.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    }
    raf = requestAnimationFrame(loop);
  };

  // Start once container is in viewport (IntersectionObserver)
  if (typeof IntersectionObserver === "undefined") {
    measure();
    running = true;
    raf = requestAnimationFrame(loop);
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            measure();
            if (!running) {
              running = true;
              raf = requestAnimationFrame(loop);
            }
          } else if (!e.isIntersecting && running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(container);
  }

  // Re-measure on resize
  window.addEventListener("resize", measure, { passive: true });

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseout", onLeave);
    window.removeEventListener("resize", measure);
  };
}

