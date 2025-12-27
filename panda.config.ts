import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  jsxFramework: "solid",
  outdir: "styled-system",

  conditions: {
    extend: {
      dark: '[data-theme="dark"] &',
    },
  },

  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: "#4285f4" },
          primaryHover: { value: "#3367d6" },
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
      semanticTokens: {
        colors: {
          background: {
            value: { base: "#fff", _dark: "#1a1a1a" },
          },
          surface: {
            value: { base: "#f5f5f5", _dark: "#2a2a2a" },
          },
          surfaceAlt: {
            value: { base: "#fafafa", _dark: "#252525" },
          },
          surfaceHover: {
            value: { base: "#e8e8e8", _dark: "#3a3a3a" },
          },
          border: {
            value: { base: "#e0e0e0", _dark: "#404040" },
          },
          borderLight: {
            value: { base: "#f0f0f0", _dark: "#353535" },
          },
          borderLighter: {
            value: { base: "#eee", _dark: "#303030" },
          },
          selected: {
            value: { base: "#e8f0fe", _dark: "#1e3a5f" },
          },
          text: {
            primary: {
              value: { base: "#333", _dark: "#e8e8e8" },
            },
            secondary: {
              value: { base: "#666", _dark: "#a0a0a0" },
            },
            muted: {
              value: { base: "#999", _dark: "#707070" },
            },
          },
          overlay: {
            value: { base: "rgba(0, 0, 0, 0.4)", _dark: "rgba(0, 0, 0, 0.6)" },
          },
        },
      },
    },
  },
});
