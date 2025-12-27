import type { ChromeActionAPI } from "./types.ts";

export function createChromeAction(): ChromeActionAPI {
  return {
    async openPopup(): Promise<void> {
      await chrome.action.openPopup();
    },
  };
}
