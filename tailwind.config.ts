import type { Config } from "tailwindcss";

// Reads a "R G B" CSS variable and produces a Tailwind color function that
// still supports opacity modifiers (e.g. bg-void/40) while letting the
// underlying value flip between the light and dark theme definitions in
// globals.css.
function withOpacity(variableName: string): string {
  const colorFn = ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
  // Tailwind's Config type only models string colors, but at runtime it
  // happily accepts (and calls) a function here to support opacity
  // modifiers like bg-panel/60 against a CSS-variable-backed color.
  return colorFn as unknown as string;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: withOpacity("--color-void"),
        panel: withOpacity("--color-panel"),
        "panel-raised": withOpacity("--color-panel-raised"),
        "panel-hover": withOpacity("--color-panel-hover"),
        line: withOpacity("--color-line"),
        "line-bright": withOpacity("--color-line-bright"),
        primary: withOpacity("--color-primary"),
        muted: withOpacity("--color-muted"),
        faint: withOpacity("--color-faint"),
        // Fixed dark scrim used to overlay arbitrary photo content
        // (upload thumbnails, the lightbox backdrop) — stays the same
        // in both themes so images stay legible either way.
        scrim: withOpacity("--color-scrim"),
        scan: {
          DEFAULT: "#4CF3FF",
          dim: "#1D6E78",
          glow: "#4CF3FF33",
        },
        amber: {
          DEFAULT: "#FFB020",
          dim: "#7A5716",
          glow: "#FFB02033",
        },
        alert: {
          DEFAULT: "#FF3B5C",
          dim: "#7A1D2C",
          glow: "#FF3B5C33",
        },
        ok: {
          DEFAULT: "#3CE68B",
          dim: "#1A6B42",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(76,243,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(76,243,255,0.045) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-4%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(104%)", opacity: "0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,59,92,0.45)" },
          "70%": { boxShadow: "0 0 0 10px rgba(255,59,92,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,59,92,0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.72" },
        },
        "count-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scanline: "scanline 1.8s cubic-bezier(0.4,0,0.2,1) infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        flicker: "flicker 2.4s ease-in-out infinite",
        "count-in": "count-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
