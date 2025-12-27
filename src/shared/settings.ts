import type { Settings, Keybinding, PopupSize, ThemePreference, DefaultMode } from "./types.ts";

const SETTINGS_KEY = "quicktabby:settings";

export const DEFAULT_SETTINGS: Settings = {
  popupSize: "medium",
  previewModeEnabled: false,
  thumbnailQuality: "standard",
  defaultMode: "lastUsed",
  themePreference: "auto",
  keybindings: {
    moveDown: { key: "j" },
    moveUp: { key: "k" },
    confirm: { key: "Enter" },
    cancel: { key: "Escape" },
    toggleMode: { key: "Tab" },
  },
};

export const THUMBNAIL_QUALITIES = {
  standard: { size: 200, captureQuality: 70, resizeQuality: 0.8 },
  high: { size: 400, captureQuality: 85, resizeQuality: 0.9 },
  ultra: { size: 800, captureQuality: 95, resizeQuality: 0.95 },
} as const;

interface LegacySettings extends Partial<Settings> {
  enableModeToggle?: boolean;
}

export async function loadSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  const stored = result[SETTINGS_KEY] as LegacySettings | undefined;

  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  // Migration: convert enableModeToggle to defaultMode
  let defaultMode = stored.defaultMode;
  if (defaultMode === undefined && stored.enableModeToggle !== undefined) {
    // If enableModeToggle was true, use lastUsed; if false, use "all" (fixed mode)
    defaultMode = stored.enableModeToggle ? "lastUsed" : "all";
    // Clean up legacy setting
    const { enableModeToggle, ...cleanedStored } = stored;
    const migratedSettings = { ...cleanedStored, defaultMode };
    await chrome.storage.local.set({ [SETTINGS_KEY]: migratedSettings });
  }

  // Merge with defaults to handle missing fields
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    defaultMode: defaultMode ?? DEFAULT_SETTINGS.defaultMode,
    keybindings: {
      ...DEFAULT_SETTINGS.keybindings,
      ...stored.keybindings,
    },
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export function matchesKeybinding(
  event: KeyboardEvent,
  binding: Keybinding
): boolean {
  const keyMatches =
    event.key === binding.key || event.key.toLowerCase() === binding.key;
  const ctrlMatches = !!binding.ctrl === event.ctrlKey;
  const altMatches = !!binding.alt === event.altKey;
  const shiftMatches = !!binding.shift === event.shiftKey;
  const metaMatches = !!binding.meta === event.metaKey;

  return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
}

export function keybindingToString(binding: Keybinding): string {
  const parts: string[] = [];
  if (binding.ctrl) parts.push("Ctrl");
  if (binding.alt) parts.push("Alt");
  if (binding.shift) parts.push("Shift");
  if (binding.meta) parts.push("Cmd");

  // Format key for display
  let keyDisplay = binding.key;
  if (binding.key === " ") keyDisplay = "Space";
  else if (binding.key === "ArrowUp") keyDisplay = "↑";
  else if (binding.key === "ArrowDown") keyDisplay = "↓";
  else if (binding.key === "ArrowLeft") keyDisplay = "←";
  else if (binding.key === "ArrowRight") keyDisplay = "→";
  else if (binding.key.length === 1) keyDisplay = binding.key.toUpperCase();

  parts.push(keyDisplay);
  return parts.join("+");
}

// Chrome popup max width is 800px
// Fixed 1:1.75 ratio for tab list:preview
const MAX_POPUP_WIDTH = 800;
const BORDER_WIDTH = 1;
const RATIO_TAB_LIST = 1;
const RATIO_PREVIEW = 1.75;
const AVAILABLE_WIDTH = MAX_POPUP_WIDTH - BORDER_WIDTH;
const TAB_LIST_WIDTH = Math.round(
  (AVAILABLE_WIDTH * RATIO_TAB_LIST) / (RATIO_TAB_LIST + RATIO_PREVIEW)
); // 290px
const PREVIEW_WIDTH = AVAILABLE_WIDTH - TAB_LIST_WIDTH; // 509px

export const POPUP_SIZES = {
  small: { height: 400 },
  medium: { height: 500 },
  large: { height: 600 },
} as const;

export function getPreviewWidth(): number {
  return PREVIEW_WIDTH;
}

export function getTabListWidth(): number {
  return TAB_LIST_WIDTH;
}

export function getMaxPopupWidth(): number {
  return MAX_POPUP_WIDTH;
}

export function getEffectiveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

export function applyTheme(preference: ThemePreference): void {
  const theme = getEffectiveTheme(preference);
  document.documentElement.setAttribute("data-theme", theme);
}

export function setupThemeListener(
  preference: ThemePreference,
  onThemeChange: () => void
): () => void {
  if (preference !== "auto") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onThemeChange();
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}
