import {
  initializeMRUTracker,
  getMRUTabs,
  switchToTab,
} from "./mru-tracker.ts";
import { initializeCommands } from "./commands.ts";
import {
  initThumbnailCache,
  captureAndStoreThumbnail,
} from "./thumbnail-cache.ts";
import type { MessageType, MessageResponse } from "../shared/types.ts";

(async () => {
  await initializeMRUTracker();
  await initThumbnailCache();
  initializeCommands();
  console.log("QuickTabby background service worker initialized");
})();

chrome.runtime.onMessage.addListener(
  (
    message: MessageType,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          type: "ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return true;
  }
);

async function handleMessage(message: MessageType): Promise<MessageResponse> {
  switch (message.type) {
    case "GET_MRU_TABS": {
      const tabs = await getMRUTabs(message.windowOnly);
      return { type: "MRU_TABS", tabs };
    }
    case "SWITCH_TO_TAB": {
      await switchToTab(message.tabId);
      return { type: "SUCCESS" };
    }
    case "CAPTURE_CURRENT_TAB": {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id && tab.windowId) {
        await captureAndStoreThumbnail(tab.id, tab.windowId);
      }
      return { type: "SUCCESS" };
    }
  }
}
