import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#101318",
        surface: "#191F27",
        elevated: "#222B36",
        primary: {
          DEFAULT: "#7C8CFF",
          hover: "#6A7BF0",
          light: "#9CA8FF",
        },
        accent: {
          DEFAULT: "#4ED6B8",
          hover: "#3DC4A6",
        },
        foreground: "#F2F4F8",
        muted: "#9AA5B4",
        border: "#2A3441",
        error: "#FF6B75",
        success: "#4ED6B8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        khmer: ["var(--font-khmer)", "Noto Sans Khmer", "Kantumruy Pro", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
