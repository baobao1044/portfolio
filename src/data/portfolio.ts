// ── Portfolio data — sourced from github.com/baobao1044 (verified 2026-08-12) ──

export interface NavItem {
  label: string;
  href: string;
}

export interface Site {
  title: string;
  description: string;
  url: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

export interface CTA {
  label: string;
  href: string;
}

export interface Stat {
  value: number;
  label: string;
}

export interface Hero {
  eyebrow: string;
  headlineLineOne: string;
  headlineLineTwo: string;
  summary: string;
  ctaPrimary: CTA;
  ctaSecondary: CTA;
  stats: Stat[];
}

export interface About {
  title: string;
  lead: string;
  paragraphs: string[];
  highlights: string[];
}

export interface Project {
  title: string;
  oneLiner: string;
  description: string;
  repo: string;
  languages: string[];
  tags: string[];
  stats?: Stat[];
  status?: "archived" | "active";
  featured?: boolean;
}

export interface ProjectsSection {
  title: string;
  intro: string;
}

export interface Principle {
  title: string;
  description: string;
}

export interface Philosophy {
  title: string;
  intro: string;
  principles: Principle[];
}

export interface ProofLine {
  left: string;
  right: string;
  href: string;
}

export interface Proof {
  title: string;
  intro: string;
  lines: ProofLine[];
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface Contact {
  title: string;
  intro: string;
  email: string;
  links: SocialLink[];
}

// ── Data ──

export const site: Site = {
  title: "BaoBG — AI Engineer & Systems Programmer",
  description:
    "AI frameworks that reason without LLMs, learn without backpropagation, and run on commodity hardware. Portfolio of Gia Bảo (BaoBG).",
  url: "https://baobg.spcfy.eu",
  author: "Gia Bảo (BaoBG)",
  role: "AI Engineer | Systems Programmer | Cloud Architect",
  company: "@Vietrix",
  avatar: "https://avatars.githubusercontent.com/u/225434242?v=4",
};

export const navItems: NavItem[] = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Principles", href: "#philosophy" },
  { label: "Evidence", href: "#proof" },
  { label: "Contact", href: "#contact" },
];

export const hero: Hero = {
  eyebrow: "AI // SYSTEMS // EDGE",
  headlineLineOne: "Reason without",
  headlineLineTwo: "language.",
  summary:
    "I build AI frameworks that reason without LLMs, learn without backpropagation, and run on commodity hardware.",
  ctaPrimary: { label: "View Work", href: "#projects" },
  ctaSecondary: { label: "Get in touch", href: "#contact" },
  stats: [
    { value: 29, label: "Public repos" },
    { value: 6, label: "Stars earned" },
    { value: 13, label: "Original projects" },
  ],
};

export const about: About = {
  title: "About",
  lead: "AI Engineer and systems programmer building deterministic systems on commodity hardware.",
  paragraphs: [
    "I build AI frameworks that reason without LLMs and learn without backpropagation — designed to run on commodity CPUs and edge devices instead of GPU clusters.",
    "My work spans Rust (vAGI-2, NSE, pse-engine), Python (AOT-Compiler, RE-super-agent, bedrock-obfuscator), Go agents, and C++ graphics hooking — with LLVM IR compilation and WebGPU along the way.",
    "Core thesis: correctness over confidence, efficiency over scale, verification over guessing.",
  ],
  highlights: [
    "CPU-first AI (no GPU clusters)",
    "Compilers & LLVM IR",
    "Reverse engineering & security",
  ],
};

export const projectsSection: ProjectsSection = {
  title: "Work",
  intro: "Selected systems, compilers, and AI frameworks — all open source.",
};

export const projects: Project[] = [
  {
    title: "vAGI-2",
    oneLiner:
      "CPU-first cognitive architecture — BitNet ternary weights + Hamiltonian dynamics + symbolic reasoning.",
    description:
      "Experimental Rust workspace for CPU-friendly language modeling. Ternary weights {-1,0,+1}, SIMD kernels, and supporting crates for simulation, symbolic math, memory, and reasoning.",
    repo: "https://github.com/baobao1044/vAGI-2",
    languages: ["Rust"],
    tags: ["AI", "Rust", "BitNet", "CPU-first"],
    stats: [
      { value: 4, label: "stars" },
      { value: 52, label: "commits" },
    ],
    featured: true,
  },
  {
    title: "bedrock-obfuscator",
    oneLiner: "Python source obfuscator with a native C-interpreted bytecode VM.",
    description:
      "Monolithic obfuscator for CPython 3.10–3.12. Emits obfuscated .py extremely hard for humans and decompilers to read, with an optional native C bytecode VM and FastAPI playground.",
    repo: "https://github.com/baobao1044/bedrock-obfuscator",
    languages: ["Python"],
    tags: ["Security", "Obfuscation", "Anti-RE"],
    stats: [
      { value: 6, label: "stars" },
      { value: 1, label: "forks" },
    ],
    status: "archived",
    featured: true,
  },
  {
    title: "RE-super-agent",
    oneLiner:
      "Super agent for reverse engineering — 5-domain MCP + multi-specialist orchestration.",
    description:
      "Hybrid RE agent: 5 domain MCP servers, Python multi-specialist core, dynamic workflow engine, safety/isolation layer. 44 tools across static/dynamic/symbolic/deobfuscation/malware domains wrapping Ghidra, radare2, angr, Frida, Qiling.",
    repo: "https://github.com/baobao1044/RE-super-agent",
    languages: ["Python"],
    tags: ["Agent", "Reverse Eng", "MCP", "Security"],
    stats: [
      { value: 44, label: "tools" },
      { value: 298, label: "tests" },
    ],
  },
  {
    title: "AOT-Compiler",
    oneLiner:
      "AOT compiler pipeline compiling a typed subset of Python to optimized LLVM IR.",
    description:
      "AOTC compiles Python directly to optimized LLVM IR with a Zero-Copy Data Bridge letting native functions operate directly on external buffers without copying.",
    repo: "https://github.com/baobao1044/AOT-Compiler",
    languages: ["Python"],
    tags: ["Compiler", "LLVM", "AOT"],
    stats: [
      { value: 1, label: "stars" },
      { value: 1, label: "forks" },
    ],
  },
  {
    title: "NSE",
    oneLiner: "Neuro-Sparse Engine — run sparse LLMs on CPU/Edge without GPU clusters.",
    description:
      "Rust research framework running models in sparse + quantized form. ZSTM transmutation, RIE/HNSW routing, LLER AVX2 kernels. End-to-end pipeline from training to sparse inference and evaluation.",
    repo: "https://github.com/baobao1044/NSE",
    languages: ["Rust"],
    tags: ["AI", "Sparse", "Edge", "AVX2"],
  },
  {
    title: "pse-engine",
    oneLiner: "Physical & shader engine for the web — Rust → WASM, WebGPU + WebGL2.",
    description:
      "Reusable Rust + WebAssembly physics and shader engine supporting modern (WebGPU) and legacy (WebGL2) browsers via wgpu. GPU compute broad-phase + CPU narrow-phase + Rust solver, single shared GPU storage buffer for instanced rendering.",
    repo: "https://github.com/baobao1044/pse-engine",
    languages: ["Rust"],
    tags: ["Graphics", "WebGPU", "WASM", "Physics"],
  },
];

export const philosophy: Philosophy = {
  title: "Principles",
  intro: "The rules I build by.",
  principles: [
    {
      title: "Correctness > Confidence",
      description:
        "If the code is wrong, it fails. Confidence is a proxy, not a metric.",
    },
    {
      title: "Efficiency > Scale",
      description:
        "Run on commodity hardware. Scale is a side effect, not a goal.",
    },
    {
      title: "Verification > Guessing",
      description: "Never trust a promise. Only trust a checksum.",
    },
  ],
};

export const proof: Proof = {
  title: "Evidence",
  intro: "Public artifacts and what they prove.",
  lines: [
    {
      left: "vAGI-2",
      right: "52 commits · 4 stars · CPU-first",
      href: "https://github.com/baobao1044/vAGI-2",
    },
    {
      left: "bedrock-obfuscator",
      right: "6 stars · 1 fork · archived (complete)",
      href: "https://github.com/baobao1044/bedrock-obfuscator",
    },
    {
      left: "RE-super-agent",
      right: "44 tools · 298 tests · MIT",
      href: "https://github.com/baobao1044/RE-super-agent",
    },
    {
      left: "AOT-Compiler",
      right: "Python → LLVM IR · zero-copy bridge",
      href: "https://github.com/baobao1044/AOT-Compiler",
    },
    {
      left: "NSE",
      right: "Sparse + quantized · AVX2 kernels",
      href: "https://github.com/baobao1044/NSE",
    },
    {
      left: "pse-engine",
      right: "Rust → WASM · WebGPU + WebGL2",
      href: "https://github.com/baobao1044/pse-engine",
    },
  ],
};

export const contact: Contact = {
  title: "Contact",
  intro: "Open to systems work, AI research, and hard engineering problems.",
  email: "baobgg1@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/baobao1044" },
    { label: "Website", href: "https://baobg.spcfy.eu/" },
    { label: "@Vietrix", href: "https://github.com/Vietrix" },
  ],
};
