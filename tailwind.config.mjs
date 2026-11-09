import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        // Two-colour system: near-black ink and one scarlet field.
        // Black on scarlet measures 5.5:1 — WCAG AA for body copy.
        ink: "#0a0a0a",
        inkSoft: "#141414",
        inkLine: "#262626",
        red: "#ff2400",
        redDeep: "#d81c00",
        bone: "#f5f2ec",
        smoke: "#8a8a8a",
        mute: "#5c5c5c",
      },
      fontFamily: {
        // Condensed grotesque for the display voice, mono for data.
        sans: ["Archivo", ...defaultTheme.fontFamily.sans],
        display: ["Anton", "Archivo", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      letterSpacing: {
        tightest: "-0.05em",
      },
    },
  },
  plugins: [],
};
