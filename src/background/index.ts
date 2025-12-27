import {
  initializeMRUTracker,
  getMRUTabs,
  switchToTab,
} from "./mru-tracker.ts";
import {
  initializeCommands,
  getLaunchInfo,
  clearLaunchInfo,
  setPopupPort,
} from "./commands.ts";
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

// Handle popup port connection
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    setPopupPort(port);
    port.onDisconnect.addListener(() => {
      setPopupPort(null);
    });
  }
});

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

async function handleMessage(
  message: MessageType
): Promise<MessageResponse> {
  switch (message.type) {
    case "GET_MRU_TABS": {
      const tabs = await getMRUTabs(message.windowOnly, message.windowId);
      return { type: "MRU_TABS", tabs };
    }
    case "SWITCH_TO_TAB": {
      await switchToTab(message.tabId);
      return { type: "SUCCESS" };
    }
    case "CAPTURE_CURRENT_TAB": {
      const [tab] = await chrome.tabs.query({
        active: true,
        windowId: message.windowId,
      });
      if (tab?.id && tab.windowId) {
        await captureAndStoreThumbnail(
          tab.id,
          tab.windowId,
          message.thumbnailConfig
        );
      }
      return { type: "SUCCESS" };
    }
    case "GET_LAUNCH_INFO": {
      return { type: "LAUNCH_INFO", info: getLaunchInfo() };
    }
    case "CLEAR_LAUNCH_INFO": {
      clearLaunchInfo();
      return { type: "SUCCESS" };
    }
    case "POPUP_OPENED":
    case "POPUP_CLOSING":
    case "CLOSE_POPUP": {
      // These are handled via port connection, not message passing
      return { type: "SUCCESS" };
    }
    default: {
      const _exhaustive: never = message;
      return { type: "ERROR", message: `Unknown message type: ${(_exhaustive as MessageType).type}` };
    }
  }
}
