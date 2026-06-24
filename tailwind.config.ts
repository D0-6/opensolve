import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        foreground: "var(--foreground)",
        "text-secondary": "var(--text-secondary)",
        primary: "var(--primary)",
        "primary-light": "var(--primary-light)",
        "primary-lighter": "var(--primary-lighter)",
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        border: "var(--border)",
        "card-bg": "var(--card-bg)",
        "card-border": "var(--card-border)",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
