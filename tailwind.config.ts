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
        primary: {
          DEFAULT: "#0e6b17",
          container: "#30852f",
          fixed: "#9ef892",
          "fixed-dim": "#83db79",
        },
        secondary: {
          DEFAULT: "#a63b00",
          container: "#fc6c29",
          fixed: "#ffdbce",
          "fixed-dim": "#ffb599",
        },
        tertiary: {
          DEFAULT: "#bb0014",
          container: "#e41f25",
          fixed: "#ffdad6",
          "fixed-dim": "#ffb4ab",
        },
        "tertiary-fixed": "#ffdad6",
        "on-tertiary-fixed": "#410002",
        "on-tertiary-fixed-variant": "#93000d",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f4ef",
        "surface-container": "#efeee9",
        "surface-container-high": "#e9e8e3",
        "surface-container-highest": "#e3e3de",
        "on-surface": "#1b1c19",
        "on-surface-variant": "#40493c",
        "outline-variant": "#bfcab9",
        background: "#faf9f4",
        error: "#ba1a1a",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-inter)", "sans-serif"],
        "label-sm": ["Inter"],
        "headline-md": ["Inter"],
        "body-md": ["Inter"],
        "title-lg": ["Inter"],
        "display-lg": ["Inter"],
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "title-lg": ["22px", { lineHeight: "1.4", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
      },
      spacing: {
        xl: "64px",
        md: "24px",
        lg: "40px",
        sm: "12px",
        xs: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
