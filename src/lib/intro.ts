// ── Kinetic intro ────────────────────────────────────────────────────────────
// Six black-and-white cuts on one beat, then the overlay lifts and the red
// field is already underneath — no fade, no loading spinner.
//
// The sequence is driven by CSS animations so it keeps running even if this
// module loads late; script only exists to remove the overlay, to skip on
// repeat visits, and to honour reduced motion.

const REPEAT_KEY = "baobg:intro-seen";

const WORDS: { text: string; inverse?: boolean }[] = [
  { text: "CPU" },
  { text: "FIRST", inverse: true },
  { text: "NO GPU" },
  { text: "NO CLUSTER", inverse: true },
  { text: "JUST CODE" },
  { text: "BAOBG" },
];

const META = [
  { text: "AI / COMPILERS / SYSTEMS / TOOLS", pos: "top" },
  { text: "36 PUBLIC REPOS", pos: "bottom" },
];

export function initIntro(): void {
  const overlay = document.getElementById("page-overlay") as HTMLElement | null;
  if (!overlay) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const teardown = (): void => {
    overlay.classList.add("is-gone");
    overlay.remove();
    document.documentElement.classList.remove("intro-lock");
  };

  // Repeat visit in the same tab: no intro at all.
  let seen = false;
  try {
    seen = sessionStorage.getItem(REPEAT_KEY) === "1";
  } catch {
    // Private mode blocks storage; treat it as a first visit.
  }
  if (seen || reduce.matches) {
    teardown();
    return;
  }

  document.documentElement.classList.add("intro-lock");

  // Two lines + six words, one beat each at 300ms.
  const step = 300;
  const total = WORDS.length * step + 260;

  WORDS.forEach((w, i) => {
    const el = document.createElement("span");
    el.className = `intro-word${w.inverse ? " inverse" : ""}`;
    el.textContent = w.text;
    el.style.animationDelay = `${i * step}ms`;
    overlay.appendChild(el);
  });

  META.forEach((m, i) => {
    const el = document.createElement("span");
    el.className = "intro-meta";
    el.textContent = m.text;
    el.style[i === 0 ? "top" : "bottom"] = "22px";
    el.style[i === 0 ? "left" : "left"] = "22px";
    el.style.animationDelay = `${60 + i * 40}ms`;
    overlay.appendChild(el);
  });

  // A rule that snaps across on each pair of words — the visual metronome.
  for (let i = 0; i < 3; i++) {
    const rule = document.createElement("div");
    rule.className = "intro-rule";
    rule.style.top = `${38 + i * 12}%`;
    rule.style.animationDelay = `${i * step * 2}ms`;
    rule.style.animationDuration = "260ms";
    overlay.appendChild(rule);
  }

  try {
    sessionStorage.setItem(REPEAT_KEY, "1");
  } catch {
    // Nothing to persist to; the intro still runs once.
  }

  window.setTimeout(() => {
    overlay.classList.add("is-done");
    document.documentElement.classList.remove("intro-lock");
    // Remove after the clip-path transition so the node cannot trap focus.
    window.setTimeout(teardown, 700);
  }, total);

  // Any deliberate key or wheel skips the rest immediately.
  const skip = (): void => {
    window.removeEventListener("keydown", skip);
    window.removeEventListener("wheel", skip);
    window.removeEventListener("touchstart", skip);
    overlay.classList.add("is-done");
    document.documentElement.classList.remove("intro-lock");
    window.setTimeout(teardown, 700);
  };
  window.addEventListener("keydown", skip, { once: true });
  window.addEventListener("wheel", skip, { once: true, passive: true });
  window.addEventListener("touchstart", skip, { once: true, passive: true });
}
