import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        cormorant: ["var(--font-cormorant)", "serif"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
      },
      keyframes: {
        lineDraw: {
          "0%": { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
      },
      animation: {
        "line-draw": "lineDraw 1.2s cubic-bezier(0.76, 0, 0.24, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
