import type { ChromeActionAPI } from "./types.ts";

export function createChromeAction(): ChromeActionAPI {
  return {
    async openPopup(): Promise<void> {
      await chrome.action.openPopup();
    },
    onClicked: {
      addListener(callback: (tab: chrome.tabs.Tab) => void): void {
        chrome.action.onClicked.addListener(callback);
      },
      removeListener(callback: (tab: chrome.tabs.Tab) => void): void {
        chrome.action.onClicked.removeListener(callback);
      },
    },
  };
}
