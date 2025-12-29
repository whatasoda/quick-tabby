/**
 * Settings type definitions
 */

// =============================================================================
// Size & Quality Types
// =============================================================================

export type PopupSize = "small" | "medium" | "large";
export type ThumbnailQuality = "standard" | "high" | "ultra";
export type ThumbnailTTL = "1h" | "24h" | "7d" | "30d";
export type ThemePreference = "light" | "dark" | "auto";
export type DefaultMode = "all" | "currentWindow" | "lastUsed";

// =============================================================================
// Keybinding Types
// =============================================================================

export interface Keybinding {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export type KeybindingList = Keybinding[];

export interface KeybindingsConfig {
  moveDown: KeybindingList;
  moveUp: KeybindingList;
  confirm: KeybindingList;
  cancel: KeybindingList;
  toggleMode: KeybindingList;
}

// =============================================================================
// Command Types
// =============================================================================

export type CommandName =
  | "_execute_action"
  | "open-popup-all-windows"
  | "open-popup-current-window";

export interface CommandSettings {
  selectOnClose: boolean;
}

// =============================================================================
// Thumbnail Configuration
// =============================================================================

export interface ThumbnailConfig {
  size: number;
  captureQuality: number;
  resizeQuality: number;
  blur?: boolean;
}

// =============================================================================
// Settings Interface
// =============================================================================

export interface Settings {
  popupSize: PopupSize;
  previewModeEnabled: boolean;
  thumbnailQuality: ThumbnailQuality;
  thumbnailTTL: ThumbnailTTL;
  thumbnailBlurEnabled: boolean;
  defaultMode: DefaultMode;
  themePreference: ThemePreference;
  keybindings: KeybindingsConfig;
  commandSettings: Record<CommandName, CommandSettings>;
  screenshotSkipPatterns: string[];
  screenshotBlurPatterns: string[];
}

// =============================================================================
// Legacy Settings (for migration)
// =============================================================================

/**
 * Legacy keybindings format (single keybinding per action)
 * Used in settings versions before array-based keybindings
 */
export interface LegacyKeybindings {
  moveDown?: Keybinding;
  moveUp?: Keybinding;
  confirm?: Keybinding;
  cancel?: Keybinding;
  toggleMode?: Keybinding;
}

/**
 * Legacy settings format for migration purposes
 */
export interface LegacySettings extends Partial<Omit<Settings, "keybindings">> {
  /** Legacy field: replaced by defaultMode */
  enableModeToggle?: boolean;
  /** May be legacy or current format */
  keybindings?: LegacyKeybindings | Settings["keybindings"];
}
