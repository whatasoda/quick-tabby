/**
 * Default settings values
 */

import type { Settings, ThumbnailConfig, ThumbnailTTL } from "./settings-types.ts";

/**
 * Default URL patterns to exclude from screenshot capture
 */
export const DEFAULT_EXCLUSION_PATTERNS = [
  "chrome://*",
  "chrome-extension://*",
  "edge://*",
  "about:*",
] as const;

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS: Settings = {
  popupSize: "medium",
  previewModeEnabled: false,
  thumbnailQuality: "standard",
  thumbnailTTL: "24h",
  thumbnailBlurEnabled: false,
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
    _execute_action: { selectOnClose: true, mode: "all", searchBarMode: "onType" },
    "open-popup": { selectOnClose: true, mode: "currentWindow", searchBarMode: "onType" },
    "move-tab-left": { selectOnClose: false },
    "move-tab-right": { selectOnClose: false },
  },
  screenshotSkipPatterns: [...DEFAULT_EXCLUSION_PATTERNS],
  screenshotBlurPatterns: [],
};

/**
 * Thumbnail quality presets
 */
export const THUMBNAIL_QUALITIES = {
  standard: { size: 400, captureQuality: 70, resizeQuality: 0.8 },
  high: { size: 800, captureQuality: 85, resizeQuality: 0.9 },
  ultra: { size: 1240, captureQuality: 95, resizeQuality: 0.95 },
} as const satisfies Record<string, ThumbnailConfig>;

/**
 * Thumbnail TTL values in milliseconds
 */
export const THUMBNAIL_TTL_MS = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const satisfies Record<ThumbnailTTL, number>;

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
