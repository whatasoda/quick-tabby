export interface TabInfo {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl?: string;
  thumbnailUrl?: string;
}

export interface MRUState {
  global: number[];
  byWindow: Record<number, number[]>;
}

export interface ThumbnailConfig {
  size: number;
  captureQuality: number;
  resizeQuality: number;
}

export type LaunchModeOverride = "all" | "currentWindow" | null;

// Which command opened the popup
export type CommandName = "_execute_action" | "open-popup-all-windows" | "open-popup-current-window";

// Launch info tracking which command opened the popup
export interface LaunchInfo {
  mode: LaunchModeOverride;
  command: CommandName | null;
}

// Per-command settings
export interface CommandSettings {
  selectOnClose: boolean; // Whether to select focused tab when closing via shortcut re-press
}

export type MessageType =
  | { type: "GET_MRU_TABS"; windowOnly?: boolean; windowId?: number }
  | { type: "SWITCH_TO_TAB"; tabId: number }
  | { type: "CAPTURE_CURRENT_TAB"; windowId?: number; thumbnailConfig?: ThumbnailConfig }
  | { type: "GET_LAUNCH_INFO" }
  | { type: "CLEAR_LAUNCH_INFO" };

export type MessageResponse =
  | { type: "MRU_TABS"; tabs: TabInfo[] }
  | { type: "SUCCESS" }
  | { type: "ERROR"; message: string }
  | { type: "LAUNCH_INFO"; info: LaunchInfo };

// Settings types
export type PopupSize = "small" | "medium" | "large";
export type ThumbnailQuality = "standard" | "high" | "ultra";
export type ThemePreference = "light" | "dark" | "auto";
export type DefaultMode = "all" | "currentWindow" | "lastUsed";

export interface Keybinding {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export interface Settings {
  popupSize: PopupSize;
  previewModeEnabled: boolean;
  thumbnailQuality: ThumbnailQuality;
  defaultMode: DefaultMode;
  themePreference: ThemePreference;
  keybindings: {
    moveDown: Keybinding;
    moveUp: Keybinding;
    confirm: Keybinding;
    cancel: Keybinding;
    toggleMode: Keybinding;
  };
  commandSettings: Record<CommandName, CommandSettings>;
}
