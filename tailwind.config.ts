import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          fg: "var(--primary-fg)",
        },
        accent: "var(--accent)",
        focus: "var(--focus)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
        serif: ["'Fraunces'", "serif"],
        mono: ["'Courier Prime'", "monospace"],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(18, 17, 15, 0.05)",
        md: "0 8px 24px rgba(18, 17, 15, 0.09)",
        film: "0 12px 36px rgba(18, 17, 15, 0.14)",
      },
      borderRadius: {
        btn: "6px",
        input: "6px",
        card: "10px",
        dialog: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;