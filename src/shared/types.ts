export interface TabInfo {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

export interface MRUState {
  global: number[];
  byWindow: Record<number, number[]>;
}

export type MessageType =
  | { type: "GET_MRU_TABS"; windowOnly?: boolean }
  | { type: "SWITCH_TO_TAB"; tabId: number };

export type MessageResponse =
  | { type: "MRU_TABS"; tabs: TabInfo[] }
  | { type: "SUCCESS" }
  | { type: "ERROR"; message: string };
