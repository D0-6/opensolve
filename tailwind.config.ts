import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-variant": "#2e3447",
        "on-error-container": "#ffdad6",
        "secondary-fixed-dim": "#2fd9f4",
        "inverse-on-surface": "#2a3043",
        "on-primary-fixed": "#23005c",
        "on-secondary": "#00363e",
        "surface-container": "#191f31",
        "secondary": "#5de6ff",
        "on-primary-container": "#340080",
        "surface-tint": "#d0bcff",
        "on-tertiary-fixed-variant": "#3f465c",
        "tertiary-container": "#8990a8",
        "surface-container-high": "#23293c",
        "on-tertiary-container": "#22293d",
        "on-secondary-fixed": "#001f25",
        "tertiary": "#bec6e0",
        "on-background": "#dce1fb",
        "inverse-surface": "#dce1fb",
        "primary-fixed-dim": "#d0bcff",
        "primary": "#d0bcff",
        "secondary-container": "#00cbe6",
        "on-tertiary-fixed": "#131b2e",
        "surface-container-highest": "#2e3447",
        "on-secondary-container": "#00515d",
        "on-surface": "#dce1fb",
        "on-tertiary": "#283044",
        "on-surface-variant": "#cbc3d7",
        "outline-variant": "#494454",
        "on-error": "#690005",
        "surface-container-lowest": "#070d1f",
        "surface": "#0c1324",
        "tertiary-fixed": "#dae2fd",
        "on-secondary-fixed-variant": "#004e5a",
        "on-primary": "#3c0091",
        "error": "#ffb4ab",
        "primary-container": "#a078ff",
        "inverse-primary": "#6d3bd7",
        "outline": "#958ea0",
        "surface-container-low": "#151b2d",
        "secondary-fixed": "#a2eeff",
        "on-primary-fixed-variant": "#5516be",
        "background": "#0c1324",
        "surface-bright": "#33394c",
        "surface-dim": "#0c1324",
        "primary-fixed": "#e9ddff",
        "tertiary-fixed-dim": "#bec6e0",
        "error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "card-gap": "32px",
        "gutter": "24px",
        "base": "8px",
        "container-max": "1280px",
        "section-padding": "120px"
      },
      fontFamily: {
        "display-xl": ["var(--font-sora)", "sans-serif"],
        "body-md": ["var(--font-inter)", "sans-serif"],
        "body-lg": ["var(--font-inter)", "sans-serif"],
        "headline-md": ["var(--font-sora)", "sans-serif"],
        "display-lg": ["var(--font-sora)", "sans-serif"],
        "display-lg-mobile": ["var(--font-sora)", "sans-serif"],
        "label-mono": ["var(--font-jetbrains)", "monospace"]
      },
      fontSize: {
        "display-xl": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "800" }],
        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "display-lg-mobile": ["36px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-mono": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.05em", "fontWeight": "500" }]
      }
    },
  },
  plugins: [],
};
export default config;
