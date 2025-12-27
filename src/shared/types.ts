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

export type MessageType =
  | { type: "GET_MRU_TABS"; windowOnly?: boolean; windowId?: number }
  | { type: "SWITCH_TO_TAB"; tabId: number }
  | { type: "PREVIEW_TAB"; tabId: number }
  | { type: "CAPTURE_CURRENT_TAB"; windowId?: number };

export type MessageResponse =
  | { type: "MRU_TABS"; tabs: TabInfo[] }
  | { type: "SUCCESS" }
  | { type: "ERROR"; message: string };

// Settings types
export type PopupSize = "small" | "medium" | "large";

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
  enableModeToggle: boolean;
  keybindings: {
    moveDown: Keybinding;
    moveUp: Keybinding;
    confirm: Keybinding;
    cancel: Keybinding;
    toggleMode: Keybinding;
  };
}
