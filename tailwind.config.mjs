import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        blood: "#8b0000",
        bloodBright: "#b91c1c",
        ink: "#0a0a0a",
        ash: "#d4d4d4",
        smoke: "#737373",
      },
      fontFamily: {
        bebas: ["Bebas Neue", ...defaultTheme.fontFamily.sans],
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
