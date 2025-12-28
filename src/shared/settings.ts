import type { Settings, Keybinding, KeybindingList } from "./types.ts";

const SETTINGS_KEY = "quicktabby:settings";

export const DEFAULT_SETTINGS: Settings = {
  popupSize: "medium",
  previewModeEnabled: false,
  thumbnailQuality: "standard",
  defaultMode: "lastUsed",
  themePreference: "auto",
  keybindings: {
    moveDown: [{ key: "j" }],
    moveUp: [{ key: "k" }],
    confirm: [{ key: "Enter" }],
    cancel: [{ key: "Escape" }],
    toggleMode: [{ key: "Tab" }],
  },
  commandSettings: {
    _execute_action: { selectOnClose: true },
    "open-popup-all-windows": { selectOnClose: true },
    "open-popup-current-window": { selectOnClose: true },
  },
};

export const THUMBNAIL_QUALITIES = {
  standard: { size: 200, captureQuality: 70, resizeQuality: 0.8 },
  high: { size: 400, captureQuality: 85, resizeQuality: 0.9 },
  ultra: { size: 800, captureQuality: 95, resizeQuality: 0.95 },
} as const;

// Legacy keybindings format (single keybinding per action)
interface LegacyKeybindings {
  moveDown?: Keybinding;
  moveUp?: Keybinding;
  confirm?: Keybinding;
  cancel?: Keybinding;
  toggleMode?: Keybinding;
}

interface LegacySettings extends Partial<Omit<Settings, "keybindings">> {
  enableModeToggle?: boolean;
  keybindings?: LegacyKeybindings | Settings["keybindings"];
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

  // Migration: convert single keybindings to arrays
  let migratedKeybindings: Settings["keybindings"] = {
    ...DEFAULT_SETTINGS.keybindings,
  };
  if (stored.keybindings) {
    const keys = [
      "moveDown",
      "moveUp",
      "confirm",
      "cancel",
      "toggleMode",
    ] as const;
    for (const key of keys) {
      const binding = stored.keybindings[key];
      if (binding) {
        if (Array.isArray(binding)) {
          // Already migrated - use as is
          migratedKeybindings[key] = binding;
        } else if (typeof binding === "object" && "key" in binding) {
          // Legacy single keybinding - wrap in array
          migratedKeybindings[key] = [binding];
        }
      }
    }
  }

  // Merge with defaults to handle missing fields
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    defaultMode: defaultMode ?? DEFAULT_SETTINGS.defaultMode,
    keybindings: migratedKeybindings,
    commandSettings: {
      ...DEFAULT_SETTINGS.commandSettings,
      ...stored.commandSettings,
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
  // For single character keys, use event.code to handle Alt/Option key combinations
  // (on Mac, Alt+Q produces "œ" in event.key, but event.code is still "KeyQ")
  let keyMatches: boolean;
  if (binding.key.length === 1) {
    const expectedCode = `Key${binding.key.toUpperCase()}`;
    keyMatches = event.code === expectedCode;
  } else {
    keyMatches =
      event.key === binding.key || event.key.toLowerCase() === binding.key;
  }

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

export function matchesAnyKeybinding(
  event: KeyboardEvent,
  bindings: KeybindingList
): boolean {
  return bindings.some((binding) => matchesKeybinding(event, binding));
}

export function keybindingsToString(bindings: KeybindingList): string {
  return bindings.map(keybindingToString).join(" / ");
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

// Parse Chrome shortcut string (e.g., "Alt+Shift+Q") into Keybinding
export function parseShortcut(shortcut: string): Keybinding {
  const parts = shortcut.split("+");
  const key = parts[parts.length - 1] ?? "";
  return {
    key: key.length === 1 ? key.toLowerCase() : key,
    ctrl: parts.includes("Ctrl"),
    alt: parts.includes("Alt"),
    shift: parts.includes("Shift"),
    meta: parts.includes("Command") || parts.includes("Meta"),
  };
}
