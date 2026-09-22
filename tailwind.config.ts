import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        card: "var(--bg-card)",
        "card-hover": "var(--bg-card-hover)",
        terminal: "var(--bg-terminal)",
        input: "var(--bg-input)",
        border: {
          default: "var(--border-default)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        brand: {
          primary: "var(--brand-primary)",
          hover: "var(--brand-hover)",
          glow: "var(--brand-glow)",
        },
        term: {
          green: "var(--terminal-green)",
          bg: "var(--terminal-bg)",
          text: "var(--terminal-text)",
          prompt: "var(--terminal-prompt)",
          dim: "var(--terminal-dim)",
        }
      },
    },
  },
  plugins: [],
};
export default config;
