import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  jsxFramework: "solid",
  outdir: "styled-system",

  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: "#4285f4" },
          primaryHover: { value: "#3367d6" },
          background: { value: "#fff" },
          surface: { value: "#f5f5f5" },
          surfaceAlt: { value: "#fafafa" },
          surfaceHover: { value: "#e8e8e8" },
          border: { value: "#e0e0e0" },
          borderLight: { value: "#f0f0f0" },
          borderLighter: { value: "#eee" },
          selected: { value: "#e8f0fe" },
          text: {
            primary: { value: "#333" },
            secondary: { value: "#666" },
            muted: { value: "#999" },
          },
          success: { value: "#4caf50" },
        },
        spacing: {
          xs: { value: "4px" },
          sm: { value: "8px" },
          md: { value: "12px" },
          lg: { value: "16px" },
          xl: { value: "24px" },
        },
        radii: {
          sm: { value: "3px" },
          md: { value: "4px" },
          lg: { value: "6px" },
          xl: { value: "8px" },
          full: { value: "12px" },
        },
        fontSizes: {
          xs: { value: "10px" },
          sm: { value: "11px" },
          md: { value: "13px" },
          lg: { value: "14px" },
          xl: { value: "16px" },
          xxl: { value: "24px" },
        },
        shadows: {
          sm: { value: "0 1px 3px rgba(0, 0, 0, 0.1)" },
        },
      },
    },
  },
});
