// ── Portfolio data ───────────────────────────────────────────────────────────
// Every claim here is taken from the repo's own README or GitHub stats, read on
// 2026-11-09. Numbers are quoted as the READMEs state them; nothing is rounded
// up and no project is described as more finished than its README claims.

export interface NavItem {
  label: string;
  href: string;
}

export interface Site {
  title: string;
  description: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

export interface Hero {
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  summary: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  stats: Stat[];
}

export interface About {
  title: string;
  lead: string;
  paragraphs: string[];
  facts: { key: string; value: string }[];
}

export type Domain = "AI" | "COMPILERS" | "SYSTEMS" | "TOOLS";

export interface Project {
  id: string;
  index: string;
  title: string;
  domain: Domain;
  oneLiner: string;
  description: string;
  stack: string[];
  facts: string[];
  repo: string;
  status: "active" | "alpha" | "research" | "complete";
  featured?: boolean;
}

export interface Principle {
  number: string;
  title: string;
  description: string;
}

export interface EvidenceLine {
  left: string;
  right: string;
  basis: string;
  href: string;
}

export interface Contact {
  title: string;
  intro: string;
  email: string;
  links: { label: string; href: string }[];
}

// Words the cursor web draws behind each section, in section order. Kept short:
// they are rendered at display size and are meant to read as texture, not copy.
export const webLexicon: string[] = [
  "CPU",
  "SYSTEMS",
  "COMPILER",
  "EVIDENCE",
  "VERIFY",
  "CONTACT",
];

// ── Site ─────────────────────────────────────────────────────────────────────

export const site: Site = {
  title: "BaoBG — AI Engineer & Systems Programmer",
  description:
    "CPU-first AI research, compilers, Windows compatibility layers, and reverse-engineering tooling. The work of Gia Bảo (BaoBG).",
  author: "Gia Bảo (BaoBG)",
  role: "AI Engineer & Systems Programmer",
  company: "@Vietrix",
  avatar: "https://avatars.githubusercontent.com/u/225434242?v=4",
};

export const navItems: NavItem[] = [
  { label: "Index", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Rules", href: "#rules" },
  { label: "Evidence", href: "#evidence" },
  { label: "Contact", href: "#contact" },
];

// ── Hero ─────────────────────────────────────────────────────────────────────

export const hero: Hero = {
  eyebrow: "AI / COMPILERS / SYSTEMS / TOOLS",
  headlineTop: "Build it on",
  headlineBottom: "the CPU.",
  summary:
    "I write systems that have to be correct before they are impressive: ternary-weight model code, an AOT Python compiler, a from-scratch Windows compatibility layer, and reverse-engineering tooling that runs real binaries.",
  ctaPrimary: { label: "See the work", href: "#work" },
  ctaSecondary: { label: "Get in touch", href: "#contact" },
  stats: [
    { value: 36, label: "Public repos" },
    { value: 10, label: "Featured builds" },
    { value: 15, label: "Stars total" },
  ],
};

// ── About ────────────────────────────────────────────────────────────────────

export const about: About = {
  title: "About",
  lead:
    "AI engineer and systems programmer. I build deterministic systems on commodity hardware and publish the measurements alongside them.",
  paragraphs: [
    "The through-line is hardware cost. The AI work asks whether a model can run and train on a CPU instead of a GPU cluster; the compiler work asks how much of Python can be lowered to LLVM IR without leaving a runtime behind; the systems work rebuilds a Windows compatibility layer in Rust rather than linking Wine.",
    "Projects span Rust (vAGI-2, NSE, pse-engine, rust-windows-compat), Python (AOT-Compiler, RE-super-agent, constant-state-attention), C++ and .NET (GameLagReducer), and TypeScript for the browser extension. Several of them are research scaffolds, and their READMEs say so.",
    "I would rather publish a negative result with a clean artifact than a positive one with a hand-wave. The constant-state-attention repo exists because the original notebook could not run at all, and the finding that the dimensionality buys nothing is the point.",
  ],
  facts: [
    { key: "Focus", value: "CPU-first inference, compilers, compatibility layers" },
    { key: "Languages", value: "Rust · Python · C++ · TypeScript · Go" },
    { key: "Org", value: "@Vietrix" },
    { key: "Repos", value: "36 public, 10 featured here" },
  ],
};

// ── Projects ─────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: "vagi-2",
    index: "01",
    title: "vAGI-2",
    domain: "AI",
    oneLiner:
      "Rust workspace exploring ternary {-1,0,+1} weights and CPU-oriented training paths.",
    description:
      "Eleven crates covering the core engine, a transformer language model with BPE tokenization on Vietnamese corpora, streaming memory, symbolic algebra, a causal-DAG world model, and an agent runtime. AVX2 kernels are selected at runtime for the packed ternary matrix-vector path.",
    stack: ["Rust", "AVX2", "BitNet-style ternary", "BPE"],
    facts: [
      "11 crates",
      "~150 sequences/second on a tiny config",
      "MIT",
      "Research codebase, not a validated model stack",
    ],
    repo: "https://github.com/baobao1044/vAGI-2",
    status: "research",
    featured: true,
  },
  {
    id: "nse",
    index: "02",
    title: "NSE",
    domain: "AI",
    oneLiner:
      "Sparse, quantized LLM inference on CPU and edge hardware — no GPU cluster.",
    description:
      "An eight-crate Cargo workspace running the full path from dense training to sparse inference. ZSTM transmutes a dense model into a quantized sparse graph without retraining; HNSW routing activates only a subset of micro-experts per token; AVX2 kernels execute the sparse product with a scalar fallback.",
    stack: ["Rust", "AVX2", "HNSW", "Ternary / PQ-8"],
    facts: [
      "8 crates",
      "56 tests passing",
      "Forward-Forward, Hopfield, and LSH-sparse training paths",
      "MIT",
    ],
    repo: "https://github.com/baobao1044/NSE",
    status: "research",
    featured: true,
  },
  {
    id: "constant-state-attention",
    index: "03",
    title: "constant-state-attention",
    domain: "AI",
    oneLiner:
      "Audit and fix of a hyperdimensional-attention notebook — then a measurement of its limits.",
    description:
      "The original design could not run: its memory was a vector, and a vector has rank 1. Replacing it with a matrix state made the model causal and O(S) in time at constant memory, but the fixed-size additive state scores 0.168 ± 0.002 on MQAR against 0.834 ± 0.020 for softmax. A 3-of-4 hybrid matches all-attention within seed noise at 25% less KV memory.",
    stack: ["Python", "PyTorch", "MQAR", "CI-checked tables"],
    facts: [
      "Every README table regenerated from results/*.csv in CI",
      "66 KB fixed state at 1M-token simulated cache",
      "1,062 tok/s flat at batch 1",
      "Explicitly an analysis, not a new architecture",
    ],
    repo: "https://github.com/baobao1044/constant-state-attention",
    status: "research",
    featured: true,
  },
  {
    id: "aot-compiler",
    index: "04",
    title: "AOT-Compiler",
    domain: "COMPILERS",
    oneLiner:
      "Ahead-of-time compiler lowering a typed subset of Python to optimized LLVM IR.",
    description:
      "The pipeline runs Python AST to a custom SSA-based IR, through constant folding, dead-code elimination and inlining, then out as LLVM IR. The v0.3 data bridge lets @native functions operate on NumPy arrays and other buffer-protocol objects in place, with automatic buffer pinning during native execution.",
    stack: ["Python", "LLVM IR", "SSA IR", "Buffer protocol"],
    facts: [
      "@native_struct maps dataclasses to deterministic LLVM structs",
      "@parallel / parallel_for multi-threaded runtime",
      "Compile-time bounds checks on constant indices",
      "GPL",
    ],
    repo: "https://github.com/baobao1044/AOT-Compiler",
    status: "active",
    featured: true,
  },
  {
    id: "rust-windows-compat",
    index: "05",
    title: "rust-windows-compat",
    domain: "SYSTEMS",
    oneLiner:
      "Pure-Rust Windows compatibility layer for Linux — no Wine, no VM.",
    description:
      "A from-scratch rebuild of the PE loader, the NT and Win32 API surface, DXGI/D3D11/D3D12-to-Vulkan translation, and an HLSL-to-SPIR-V compiler. Progress is tracked against a ten-step milestone ladder from running a console hello.exe to running a modern D3D11/12 game.",
    stack: ["Rust", "PE/PE32+", "NT/Win32", "Vulkan", "SPIR-V"],
    facts: [
      "M0–M9 milestone ladder",
      "No Wine, DXVK, VKD3D or DXC code reused",
      "Kernel-mode drivers out of scope by design",
      "Research project",
    ],
    repo: "https://github.com/baobao1044/rust-windows-compat",
    status: "research",
    featured: true,
  },
  {
    id: "pse-engine",
    index: "06",
    title: "pse-engine",
    domain: "SYSTEMS",
    oneLiner:
      "Rust-to-WASM physics and shader engine targeting both WebGPU and WebGL2.",
    description:
      "One codebase, two backends through wgpu. A GPU compute broad-phase and a CPU sweep-and-prune fallback feed a CPU narrow-phase and sequential-impulse solver, all writing into a single SoA storage buffer that the instanced render pipeline reads directly. WGSL is hot-reloadable with an #include preprocessor and naga validation.",
    stack: ["Rust", "WASM", "wgpu", "WGSL", "hecs ECS"],
    facts: [
      "All 8 roadmap phases complete",
      "Hybrid GPU + CPU physics",
      "MIT / Apache-2.0",
      "Library, not a game engine — no editor or scripting language",
    ],
    repo: "https://github.com/baobao1044/pse-engine",
    status: "active",
    featured: true,
  },
  {
    id: "re-super-agent",
    index: "07",
    title: "RE-super-agent",
    domain: "TOOLS",
    oneLiner:
      "Reverse-engineering agent: five domain MCP servers plus multi-specialist orchestration.",
    description:
      "Targets Windows PE and Linux ELF, including Python-protector-obfuscated binaries. Forty-four tools across static, dynamic, symbolic, deobfuscation and malware domains wrap Ghidra, radare2, angr, Frida and Qiling. A dynamic workflow engine adapts the analysis plan, and all execution is routed through an isolated sandbox rather than the host.",
    stack: ["Python", "MCP", "Ghidra", "radare2", "angr", "Frida"],
    facts: [
      "44 tools",
      "298 tests green",
      "Provider-agnostic via LiteLLM",
      "MIT",
    ],
    repo: "https://github.com/baobao1044/RE-super-agent",
    status: "active",
    featured: true,
  },
  {
    id: "bedrock-obfuscator",
    index: "08",
    title: "bedrock-obfuscator",
    domain: "TOOLS",
    oneLiner:
      "Python source obfuscator for CPython 3.10–3.12 with a native C bytecode VM.",
    description:
      "A monolithic engine that emits obfuscated .py that resists both human reading and decompilers, with an optional native C-interpreted bytecode VM and a FastAPI playground. Released source-available after shipping as a paid product; the license carries express anti-misuse provisions.",
    stack: ["Python", "C", "CPython bytecode", "FastAPI"],
    facts: [
      "14,498-line engine",
      "87 CLI flags",
      "31 anti-debug checks",
      "94 of 93 BedrockVM opcodes implemented",
    ],
    repo: "https://github.com/baobao1044/bedrock-obfuscator",
    status: "complete",
    featured: true,
  },
  {
    id: "gamelagreducer",
    index: "09",
    title: "GameLagReducer",
    domain: "TOOLS",
    oneLiner:
      "Launcher that hooks a game's graphics API and flattens shaders at runtime.",
    description:
      "A WPF .NET 8 launcher injects a native C++ DLL that vtable-hooks DXGI/D3D11, IAT-hooks OpenGL, and intercepts Vulkan pipeline creation. It then applies render scale, FPS cap, MSAA off, tessellation and geometry-stage removal, and a flat-grey pixel shader while keeping the vertex shader so silhouettes stay correct.",
    stack: ["C++", "C# / .NET 8", "D3D11", "OpenGL", "Vulkan"],
    facts: [
      "Three APIs hooked from one DLL",
      "Per-game profiles",
      "Anti-cheat detection with a pre-launch warning",
      "Mesh decimation explicitly impossible at the API-hook layer",
    ],
    repo: "https://github.com/baobao1044/GameLagReducer",
    status: "active",
    featured: true,
  },
  {
    id: "down-faster",
    index: "10",
    title: "down-faster",
    domain: "TOOLS",
    oneLiner:
      "Browser extension that downloads files over parallel HTTP range requests.",
    description:
      "Splits a download into pieces fetched concurrently and written straight to OPFS from an offscreen document, with no external binary and no companion app. One Manifest V3 codebase ships to Chromium and Firefox. Verified end-to-end in a real browser on a 100 MB ranged endpoint; the README separates what CI proves from what a browser proved.",
    stack: ["TypeScript", "MV3", "OPFS", "Chromium + Firefox"],
    facts: [
      "457 tests passing in CI",
      "8 parallel connections, 32 pieces, byte-exact",
      "Falls back to a single connection without range support",
      "Alpha",
    ],
    repo: "https://github.com/baobao1044/down-faster",
    status: "alpha",
    featured: true,
  },
];

// ── Principles ───────────────────────────────────────────────────────────────

export const principles: Principle[] = [
  {
    number: "01",
    title: "Correctness over confidence",
    description:
      "A model that cannot run is not a promising model. The constant-state repo begins by proving the original design could never execute, then measures what replaces it.",
  },
  {
    number: "02",
    title: "Publish the negative result",
    description:
      "The hyperdimensional dimension buys nothing measurable, and the README says so on line four. A flat benchmark with a clean artifact is worth more than a curve with a story.",
  },
  {
    number: "03",
    title: "Commodity hardware or it does not count",
    description:
      "CPU-first inference, AVX2 kernels, optional fallbacks. Designs that only work on a cluster get replaced by designs that work on the machine you already own.",
  },
  {
    number: "04",
    title: "Say what it does not do",
    description:
      "No kernel drivers, no mesh decimation at the hook layer, no browser paths proven by a headless CI run. The limits are written down next to the capabilities.",
  },
];

// ── Evidence ─────────────────────────────────────────────────────────────────

export const evidence: EvidenceLine[] = [
  {
    left: "constant-state-attention",
    right: "0.168 vs 0.834 MQAR · 25% less KV memory in hybrid",
    basis: "tables regenerated from results/*.csv in CI",
    href: "https://github.com/baobao1044/constant-state-attention",
  },
  {
    left: "RE-super-agent",
    right: "44 tools · 298 tests green",
    basis: "test badge and repository test suite",
    href: "https://github.com/baobao1044/RE-super-agent",
  },
  {
    left: "down-faster",
    right: "457 tests · 8 connections · byte-exact 100 MB",
    basis: "CI badge plus a documented real-browser run",
    href: "https://github.com/baobao1044/down-faster",
  },
  {
    left: "bedrock-obfuscator",
    right: "14,498 lines · 87 flags · 31 anti-debug checks",
    basis: "engine metrics listed in the README",
    href: "https://github.com/baobao1044/bedrock-obfuscator",
  },
  {
    left: "NSE",
    right: "8 crates · 56 tests · end-to-end PPL comparison",
    basis: "workspace layout and test badge",
    href: "https://github.com/baobao1044/NSE",
  },
  {
    left: "vAGI-2",
    right: "11 crates · ~150 seq/s on a tiny config",
    basis: "README highlights, local measurements only",
    href: "https://github.com/baobao1044/vAGI-2",
  },
  {
    left: "rust-windows-compat",
    right: "M0–M9 ladder · no Wine code reused",
    basis: "scope statement and milestone table",
    href: "https://github.com/baobao1044/rust-windows-compat",
  },
  {
    left: "pse-engine",
    right: "8 of 8 phases · WebGPU + WebGL2 from one source",
    basis: "roadmap table in the README",
    href: "https://github.com/baobao1044/pse-engine",
  },
  {
    left: "AOT-Compiler",
    right: "AST → SSA IR → LLVM IR · zero-copy bridge",
    basis: "architecture section and v0.3 feature list",
    href: "https://github.com/baobao1044/AOT-Compiler",
  },
  {
    left: "GameLagReducer",
    right: "D3D11 + OpenGL + Vulkan hooked from one DLL",
    basis: "hook table in the README",
    href: "https://github.com/baobao1044/GameLagReducer",
  },
];

// ── Contact ──────────────────────────────────────────────────────────────────

export const contact: Contact = {
  title: "Contact",
  intro:
    "Open to systems work, compiler and runtime problems, and AI research that has to run on hardware you own.",
  email: "baobgg1@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/baobao1044" },
    { label: "@Vietrix", href: "https://github.com/Vietrix" },
  ],
};
