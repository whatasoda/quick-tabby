import type { Settings, Keybinding, PopupSize } from "./types.ts";

const SETTINGS_KEY = "quicktabby:settings";

export const DEFAULT_SETTINGS: Settings = {
  popupSize: "medium",
  previewModeEnabled: false,
  thumbnailQuality: "standard",
  enableModeToggle: true,
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

export async function loadSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  const stored = result[SETTINGS_KEY] as Partial<Settings> | undefined;

  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  // Merge with defaults to handle missing fields
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
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

export const POPUP_SIZES = {
  small: { width: 300, height: 400 },
  medium: { width: 350, height: 500 },
  large: { width: 450, height: 600 },
} as const;

// Calculate preview panel width based on popup height and 14:9 aspect ratio
export function getPreviewWidth(popupSize: PopupSize): number {
  const height = POPUP_SIZES[popupSize].height;
  const thumbnailHeight = height - 80; // padding (24px) + info section (~56px)
  const thumbnailWidth = Math.round(thumbnailHeight * (14 / 9));
  return thumbnailWidth + 24; // left + right padding
}
