import {
  initializeMRUTracker,
  getMRUTabs,
  switchToTab,
} from "./mru-tracker.ts";
import type { MessageType, MessageResponse } from "../shared/types.ts";

initializeMRUTracker();

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
  }
}

console.log("QuickTabby background service worker loaded");
