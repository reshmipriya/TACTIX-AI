import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        panel: "#131A24",
        "panel-alt": "#1A2330",
        border: "#2A3441",
        "tactical-green": "#00D9A3",
        "tactical-amber": "#FFB020",
        "tactical-red": "#FF3B5C",
        "tactical-blue": "#3B82F6",
        "tactical-earth": "#8B6F47",
        "tactical-forest": "#4A7856",
        "tactical-muted": "#93A1B4",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        panel: "12px",
        btn: "6px",
        badge: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
