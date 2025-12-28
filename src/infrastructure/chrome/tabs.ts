import type {
  CaptureVisibleTabOptions,
  ChromeTabsAPI,
  TabActiveInfo,
  TabInfo,
  TabQueryInfo,
  TabRemoveInfo,
  TabUpdateProperties,
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

export function createChromeTabs(): ChromeTabsAPI {
  return {
    async query(queryInfo: TabQueryInfo): Promise<TabInfo[]> {
      const tabs = await chrome.tabs.query(queryInfo);
      return tabs.map(mapTab);
    },

    async get(tabId: number): Promise<TabInfo> {
      const tab = await chrome.tabs.get(tabId);
      return mapTab(tab);
    },

    async update(
      tabId: number,
      updateProperties: TabUpdateProperties,
    ): Promise<TabInfo | undefined> {
      const tab = await chrome.tabs.update(tabId, updateProperties);
      return tab ? mapTab(tab) : undefined;
    },

    async create(createProperties: { url: string }): Promise<TabInfo> {
      const tab = await chrome.tabs.create(createProperties);
      return mapTab(tab);
    },

    async captureVisibleTab(windowId: number, options: CaptureVisibleTabOptions): Promise<string> {
      return chrome.tabs.captureVisibleTab(windowId, options);
    },

    onActivated: {
      addListener(callback: (activeInfo: TabActiveInfo) => void) {
        chrome.tabs.onActivated.addListener(callback);
      },
      removeListener(callback: (activeInfo: TabActiveInfo) => void) {
        chrome.tabs.onActivated.removeListener(callback);
      },
    },

    onRemoved: {
      addListener(callback: (tabId: number, removeInfo: TabRemoveInfo) => void) {
        chrome.tabs.onRemoved.addListener(callback);
      },
      removeListener(callback: (tabId: number, removeInfo: TabRemoveInfo) => void) {
        chrome.tabs.onRemoved.removeListener(callback);
      },
    },
  };
}
