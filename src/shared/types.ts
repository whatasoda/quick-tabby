/**
 * Shared types for messaging and tab information
 *
 * Settings types are defined in core/settings/settings-types.ts
 */

import type {
  CommandName,
  CommandSettings,
  ThumbnailConfig,
} from "../core/settings/settings-types.ts";

export interface TabInfo {
  id: number;
  windowId: number;
  index: number; // Tab position in window (0-based, left to right)
  title: string;
  url: string;
  favIconUrl?: string;
  thumbnailUrl?: string;
}

export interface MRUState {
  global: number[];
  byWindow: Record<number, number[]>;
}

export type LaunchModeOverride = "all" | "currentWindow" | null;

// Launch info tracking which command opened the popup
export interface LaunchInfo {
  mode: LaunchModeOverride;
  command: CommandName | null;
}

export type MessageType =
  | { type: "GET_MRU_TABS"; windowOnly?: boolean; windowId?: number }
  | { type: "SWITCH_TO_TAB"; tabId: number }
  | { type: "CAPTURE_CURRENT_TAB"; windowId?: number; thumbnailConfig?: ThumbnailConfig }
  | { type: "GET_LAUNCH_INFO" }
  | { type: "CLEAR_LAUNCH_INFO" }
  | { type: "POPUP_OPENED" }
  | { type: "POPUP_CLOSING" }
  | { type: "CLOSE_POPUP"; selectFocused: boolean };

export type MessageResponse =
  | { type: "MRU_TABS"; tabs: TabInfo[] }
  | { type: "SUCCESS" }
  | { type: "ERROR"; message: string }
  | { type: "LAUNCH_INFO"; info: LaunchInfo };
