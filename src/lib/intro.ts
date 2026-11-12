// ── Kinetic intro ────────────────────────────────────────────────────────────
// Six high-impact cuts across Obsidian, Bone and Scarlet on a 290ms beat,
// framed by precision telemetry reticles, then a sharp shutter wipe directly
// into the living red field.

const REPEAT_KEY = "baobg:intro-seen";

const WORDS: { text: string; tone?: "inverse" | "scarlet" }[] = [
  { text: "CPU", tone: "scarlet" },
  { text: "FIRST", tone: "inverse" },
  { text: "NO GPU" },
  { text: "NO CLUSTER", tone: "inverse" },
  { text: "JUST CODE" },
  { text: "BAOBG", tone: "scarlet" },
];

export function initIntro(): void {
  const overlay = document.getElementById("page-overlay") as HTMLElement | null;
  if (!overlay) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let cleaned = false;
  const timers: number[] = [];

  const teardown = (): void => {
    if (cleaned) return;
    cleaned = true;
    for (const id of timers) window.clearTimeout(id);
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

  const step = 290;
  const total = WORDS.length * step + 240;

  WORDS.forEach((w, i) => {
    const el = document.createElement("span");
    el.className = `intro-word${w.tone ? ` ${w.tone}` : ""}`;
    el.textContent = w.text;
    el.style.animationDelay = `${i * step}ms`;
    overlay.appendChild(el);
  });

  // Corner telemetry HUD
  const corners: { text: string; style: Partial<CSSStyleDeclaration>; accent?: boolean }[] = [
    { text: "AI // COMPILERS // SYSTEMS // TOOLS", style: { top: "22px", left: "24px" } },
    { text: " EDITION 2026 · RED FIELD", style: { top: "22px", right: "24px" }, accent: true },
    { text: "36 PUBLIC REPOS · CPU-FIRST", style: { bottom: "22px", left: "24px" } },
  ];

  corners.forEach((c, i) => {
    const el = document.createElement("span");
    el.className = `intro-meta${c.accent ? " intro-meta--accent" : ""}`;
    el.textContent = c.text;
    Object.assign(el.style, c.style);
    el.style.animationDelay = `${40 + i * 35}ms`;
    overlay.appendChild(el);
  });

  // Live beat counter in the bottom-right corner
  const counter = document.createElement("span");
  counter.className = "intro-meta intro-meta--accent";
  counter.style.bottom = "22px";
  counter.style.right = "24px";
  counter.textContent = "CUT 01 // 06";
  overlay.appendChild(counter);

  WORDS.forEach((_, i) => {
    timers.push(
      window.setTimeout(() => {
        counter.textContent = `CUT 0${i + 1} // 0${WORDS.length}`;
      }, i * step),
    );
  });

  // Scarlet laser rules that snap across on alternate beats
  for (let i = 0; i < 3; i++) {
    const rule = document.createElement("div");
    rule.className = "intro-rule";
    rule.style.top = `${34 + i * 16}%`;
    rule.style.animationDelay = `${i * step * 2}ms`;
    rule.style.animationDuration = "250ms";
    overlay.appendChild(rule);
  }

  try {
    sessionStorage.setItem(REPEAT_KEY, "1");
  } catch {
    // Nothing to persist to; the intro still runs once.
  }

  const finish = (): void => {
    window.removeEventListener("keydown", finish);
    window.removeEventListener("wheel", finish);
    window.removeEventListener("touchstart", finish);
    overlay.classList.add("is-done");
    document.documentElement.classList.remove("intro-lock");
    timers.push(window.setTimeout(teardown, 680));
  };

  timers.push(window.setTimeout(finish, total));

  window.addEventListener("keydown", finish, { once: true });
  window.addEventListener("wheel", finish, { once: true, passive: true });
  window.addEventListener("touchstart", finish, { once: true, passive: true });
}
