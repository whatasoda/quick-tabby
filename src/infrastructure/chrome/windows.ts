import type {
  ChromeWindowsAPI,
  WindowInfo,
  WindowUpdateInfo,
  WindowGetInfo,
  TabInfo,
} from "./types.ts";

function mapTab(tab: chrome.tabs.Tab): TabInfo {
  return {
    id: tab.id ?? -1,
    windowId: tab.windowId ?? -1,
    index: tab.index,
    title: tab.title ?? "",
    url: tab.url ?? "",
    active: tab.active,
    favIconUrl: tab.favIconUrl,
  };
}

function mapWindow(window: chrome.windows.Window): WindowInfo {
  return {
    id: window.id ?? -1,
    focused: window.focused,
    tabs: window.tabs?.map(mapTab),
  };
}

export function createChromeWindows(): ChromeWindowsAPI {
  return {
    async getCurrent(): Promise<WindowInfo> {
      const window = await chrome.windows.getCurrent();
      return mapWindow(window);
    },

    async update(
      windowId: number,
      updateInfo: WindowUpdateInfo
    ): Promise<WindowInfo> {
      const window = await chrome.windows.update(windowId, updateInfo);
      return mapWindow(window);
    },

    async getAll(getInfo?: WindowGetInfo): Promise<WindowInfo[]> {
      const windows = await chrome.windows.getAll(getInfo);
      return windows.map(mapWindow);
    },

    onRemoved: {
      addListener(callback: (windowId: number) => void) {
        chrome.windows.onRemoved.addListener(callback);
      },
      removeListener(callback: (windowId: number) => void) {
        chrome.windows.onRemoved.removeListener(callback);
      },
    },
  };
}
