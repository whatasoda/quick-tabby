import type { ThemePreference } from "../core/settings/settings-types.ts";

function getEffectiveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return preference;
}

function applyTheme(preference: ThemePreference): void {
  const theme = getEffectiveTheme(preference);
  document.documentElement.setAttribute("data-theme", theme);
}

function setupThemeListener(preference: ThemePreference, onThemeChange: () => void): () => void {
  if (preference !== "auto") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onThemeChange();
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}

export function createThemeControl() {
  let cleanupThemeListener: (() => void) | undefined;

  return {
    applyTheme: (preference: ThemePreference) => {
      applyTheme(preference);
      cleanupThemeListener?.();
      cleanupThemeListener = setupThemeListener(preference, () => applyTheme(preference));
    },
    cleanup: () => {
      cleanupThemeListener?.();
      cleanupThemeListener = undefined;
    },
  };
}
