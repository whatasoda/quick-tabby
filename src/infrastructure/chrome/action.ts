import type { ChromeActionAPI } from "./types.ts";

export function createChromeAction(): ChromeActionAPI {
  return {
    async openPopup(): Promise<void> {
      await chrome.action.openPopup();
    },
    async setPopup(options: { popup: string }): Promise<void> {
      await chrome.action.setPopup(options);
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
