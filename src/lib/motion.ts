// ── UI Motion & Interactive Telemetry ────────────────────────────────────────
// Zero-dependency client choreography:
// - Scroll progress laser + active section navigation spy
// - Pointer-tracked crimson spotlight + bento card radial tracking
// - IntersectionObserver kinetic reveals + tabular stat count-up
// - Interactive Hero execution-pipeline selector + one-click email copy

export function initMotion(): void {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // 1. Scroll progress bar & active section spy
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"));
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
  let scrollRaf = 0;

  const updateScroll = (): void => {
    scrollRaf = 0;
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    root.style.setProperty("--scroll-p", progress.toFixed(4));

    const probeY = window.scrollY + window.innerHeight * 0.32;
    let activeId = sections[0]?.id ?? "hero";
    for (const sec of sections) {
      if (sec.offsetTop <= probeY) activeId = sec.id;
    }
    for (const link of navLinks) {
      const target = link.getAttribute("href")?.replace(/^#/, "");
      link.dataset.active = target === activeId ? "true" : "false";
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );
  updateScroll();

  // 2. Pointer spotlight for the crimson field & bento cards
  if (!reduce.matches && window.matchMedia("(pointer: fine)").matches) {
    let ptrRaf = 0;
    let px = window.innerWidth * 0.5;
    let py = window.innerHeight * 0.35;

    window.addEventListener(
      "pointermove",
      (e) => {
        px = e.clientX;
        py = e.clientY;
        if (!ptrRaf) {
          ptrRaf = requestAnimationFrame(() => {
            ptrRaf = 0;
            root.style.setProperty("--mx", `${px}px`);
            root.style.setProperty("--my", `${py}px`);
          });
        }
      },
      { passive: true },
    );

    document.querySelectorAll<HTMLElement>(".rule-card").forEach((card) => {
      card.addEventListener(
        "pointermove",
        (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--cx", `${e.clientX - r.left}px`);
          card.style.setProperty("--cy", `${e.clientY - r.top}px`);
        },
        { passive: true },
      );
    });
  }

  // 3. Kinetic reveals & stat counters
  const riseEls = Array.from(document.querySelectorAll<HTMLElement>(".kinetic-rise"));
  if (reduce.matches || !("IntersectionObserver" in window)) {
    riseEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    riseEls.forEach((el) => io.observe(el));
  }

  if (!reduce.matches && "IntersectionObserver" in window) {
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const countIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          countIo.unobserve(el);
          const target = Number(el.dataset.count ?? "0");
          if (!target) continue;
          const start = performance.now();
          const duration = 900;
          const step = (now: number): void => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = String(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    counters.forEach((el) => countIo.observe(el));
  }

  // 4. Interactive Hero Architecture Deck
  const laneBtns = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-lane-btn]"));
  const laneReadout = document.getElementById("lane-readout");
  const laneMetric = document.getElementById("lane-metric");
  const laneRepo = document.getElementById("lane-repo");

  laneBtns.forEach((btn) => {
    const activate = (): void => {
      laneBtns.forEach((b) => {
        const on = b === btn;
        b.dataset.selected = on ? "true" : "false";
        b.setAttribute("aria-pressed", String(on));
      });
      if (laneReadout && btn.dataset.detail) laneReadout.textContent = btn.dataset.detail;
      if (laneMetric && btn.dataset.metric) laneMetric.textContent = btn.dataset.metric;
      if (laneRepo && btn.dataset.repoName) laneRepo.textContent = btn.dataset.repoName;
    };
    btn.addEventListener("click", activate);
    btn.addEventListener("mouseenter", activate);
  });

  // 5. One-click copy email button
  const copyBtn = document.getElementById("copy-email-btn") as HTMLButtonElement | null;
  if (copyBtn) {
    const email = copyBtn.dataset.email ?? "";
    const labelEl = copyBtn.querySelector<HTMLElement>("[data-copy-label]");
    let resetTimer = 0;
    copyBtn.addEventListener("click", async () => {
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        if (labelEl) labelEl.textContent = "Copied to clipboard ✓";
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          if (labelEl) labelEl.textContent = "Copy address";
        }, 2200);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  }
}
