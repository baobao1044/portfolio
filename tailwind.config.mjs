import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07070a",
        inkSoft: "#0e0e12",
        inkLine: "#1c1c22",
        accent: "#f59e0b",
        accentSoft: "#fbbf24",
        ash: "#e4e4e7",
        /* Raised from #71717a / #3f3f46: against the #07070a ink those measured
           ~4.2:1 and ~1.7:1, below WCAG AA for body and small text. */
        smoke: "#9a9aa4",
        mute: "#6b6b75",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
