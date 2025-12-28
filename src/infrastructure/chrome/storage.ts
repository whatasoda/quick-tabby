import type { ChromeStorageAPI, ChromeStorageArea } from "./types.ts";

function createStorageArea(area: chrome.storage.StorageArea): ChromeStorageArea {
  return {
    async get<T = unknown>(key: string) {
      const result = await area.get(key);
      return result as Record<string, T | undefined>;
    },
    async set(items: Record<string, unknown>) {
      await area.set(items);
    },
  };
}

export function createChromeStorage(): ChromeStorageAPI {
  return {
    local: createStorageArea(chrome.storage.local),
    session: createStorageArea(chrome.storage.session),
  };
}
