/**
 * Default settings values
 */

import type { Settings, ThumbnailConfig } from "./settings-types.ts";

/**
 * Default application settings
 */
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
    "_execute_action": { selectOnClose: true },
    "open-popup-all-windows": { selectOnClose: true },
    "open-popup-current-window": { selectOnClose: true },
  },
};

/**
 * Thumbnail quality presets
 */
export const THUMBNAIL_QUALITIES: Record<string, ThumbnailConfig> = {
  standard: { size: 200, captureQuality: 70, resizeQuality: 0.8 },
  high: { size: 400, captureQuality: 85, resizeQuality: 0.9 },
  ultra: { size: 800, captureQuality: 95, resizeQuality: 0.95 },
} as const;

/**
 * Popup size presets (height in pixels)
 */
export const POPUP_SIZES = {
  small: { height: 400 },
  medium: { height: 500 },
  large: { height: 600 },
} as const;

/**
 * Layout constants for popup dimensions
 */
export const POPUP_LAYOUT = {
  /** Chrome popup max width */
  maxWidth: 800,
  /** Border width */
  borderWidth: 1,
  /** Ratio for tab list portion */
  ratioTabList: 1,
  /** Ratio for preview portion */
  ratioPreview: 1.75,
} as const;

/**
 * Calculate tab list width based on layout constants
 */
export function getTabListWidth(): number {
  const { maxWidth, borderWidth, ratioTabList, ratioPreview } = POPUP_LAYOUT;
  const available = maxWidth - borderWidth;
  return Math.round((available * ratioTabList) / (ratioTabList + ratioPreview));
}

/**
 * Calculate preview width based on layout constants
 */
export function getPreviewWidth(): number {
  const { maxWidth, borderWidth } = POPUP_LAYOUT;
  return maxWidth - borderWidth - getTabListWidth();
}

/**
 * Get maximum popup width
 */
export function getMaxPopupWidth(): number {
  return POPUP_LAYOUT.maxWidth;
}
