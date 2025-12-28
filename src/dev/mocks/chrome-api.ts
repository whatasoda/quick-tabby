import { DEFAULT_SETTINGS } from "../../core/settings/settings-defaults.ts";
import type { Settings } from "../../core/settings/settings-types.ts";
import type { MessageResponse, MessageType } from "../../shared/types.ts";
import { getMockTabs } from "./tab-data.ts";

const mockStorage: Record<string, unknown> = {
  "quicktabby:settings": DEFAULT_SETTINGS,
};

const chromeStorageMock = {
  local: {
    get: async (
      keys: string | string[] | Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      if (typeof keys === "string") {
        return { [keys]: mockStorage[keys] };
      }
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {};
        for (const key of keys) {
          result[key] = mockStorage[key];
        }
        return result;
      }
      // Object with defaults
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(keys)) {
        result[key] = mockStorage[key] ?? keys[key];
      }
      return result;
    },
    set: async (items: Record<string, unknown>): Promise<void> => {
      Object.assign(mockStorage, items);
      console.log("[Mock] Storage updated:", items);
    },
  },
};

const chromeRuntimeMock = {
  sendMessage: async (message: MessageType): Promise<MessageResponse> => {
    switch (message.type) {
      case "GET_MRU_TABS":
        return {
          type: "MRU_TABS",
          tabs: getMockTabs(message.windowOnly, message.windowId),
        };
      case "SWITCH_TO_TAB":
        console.log("[Mock] Switch to tab:", message.tabId);
        return { type: "SUCCESS" };
      case "CAPTURE_CURRENT_TAB":
        console.log("[Mock] Capture current tab");
        return { type: "SUCCESS" };
      case "GET_LAUNCH_INFO":
        return { type: "LAUNCH_INFO", info: { mode: null } };
      case "CLEAR_LAUNCH_INFO":
        return { type: "SUCCESS" };
      default:
        console.log("[Mock] Unknown message type:", message);
        return { type: "ERROR", message: "Unknown message type" };
    }
  },
  connect: (options: { name: string }) => {
    console.log("[Mock] Runtime connect:", options.name);
    return {
      onMessage: {
        addListener: (_callback: (msg: unknown) => void) => {
          console.log("[Mock] Port onMessage listener added");
        },
      },
      disconnect: () => {
        console.log("[Mock] Port disconnected");
      },
    };
  },
  openOptionsPage: () => {
    console.log("[Mock] Open options page");
  },
};

const chromeWindowsMock = {
  getCurrent: async (): Promise<{ id: number }> => {
    return { id: 1 };
  },
};

const chromeCommandsMock = {
  getAll: async () => [
    {
      name: "_execute_action",
      description: "Open QuickTabby popup",
      shortcut: "Alt+Q",
    },
    {
      name: "toggle-recent",
      description: "Switch to most recent tab",
      shortcut: "Alt+Shift+Q",
    },
    {
      name: "toggle-recent-same-window",
      description: "Switch to most recent tab in same window",
      shortcut: "Alt+Shift+W",
    },
  ],
};

const chromeTabsMock = {
  create: async (options: { url: string }) => {
    console.log("[Mock] Would open:", options.url);
    window.open(options.url, "_blank");
  },
};

export function setupChromeMock() {
  (window as unknown as { chrome: typeof chrome }).chrome = {
    storage: chromeStorageMock,
    runtime: chromeRuntimeMock,
    windows: chromeWindowsMock,
    commands: chromeCommandsMock,
    tabs: chromeTabsMock,
  } as unknown as typeof chrome;

  console.log("[Mock] Chrome API mock initialized");
}

export function updateMockSettings(settings: Partial<Settings>) {
  const current = mockStorage["quicktabby:settings"] as Settings;
  mockStorage["quicktabby:settings"] = { ...current, ...settings };
}
