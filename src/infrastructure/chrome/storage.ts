import type { ChromeStorageAPI, ChromeStorageArea } from "./types.ts";

function createStorageArea(area: chrome.storage.StorageArea): ChromeStorageArea {
  return {
    async get<K extends string>(key: K) {
      const result = await area.get(key);
      return result as { [P in K]: unknown | undefined };
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
