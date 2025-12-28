/**
 * QuickTabby Background Service Worker
 *
 * Entry point for the background script using the new service architecture.
 */

import { createChromeAPI } from "../infrastructure/chrome/index.ts";
import { createThumbnailStore } from "../infrastructure/indexed-db/index.ts";
import {
  createCommandHandlerService,
  createMRUTrackerService,
  createSettingsService,
  createThumbnailCacheService,
} from "../services/index.ts";
import type { MessageResponse, MessageType } from "../shared/types.ts";

// =============================================================================
// Service Setup with Dependency Injection
// =============================================================================

const chromeAPI = createChromeAPI();
const thumbnailStore = createThumbnailStore();

const settingsService = createSettingsService({
  storage: chromeAPI.storage,
});

const thumbnailCache = createThumbnailCacheService({
  tabs: chromeAPI.tabs,
  thumbnailStore,
});

const mruTracker = createMRUTrackerService({
  storage: chromeAPI.storage,
  tabs: chromeAPI.tabs,
  windows: chromeAPI.windows,
  thumbnailCache,
});

const commandHandler = createCommandHandlerService({
  action: chromeAPI.action,
  commands: chromeAPI.commands,
  settingsService,
});

// =============================================================================
// Initialization
// =============================================================================

(async () => {
  await thumbnailCache.initialize();
  await mruTracker.initialize();
  commandHandler.initialize();
  console.log("QuickTabby background service worker initialized");
})();

// =============================================================================
// Port Connection Handling
// =============================================================================

chromeAPI.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    commandHandler.setPopupPort(port);
    port.onDisconnect.addListener(() => {
      commandHandler.setPopupPort(null);
    });
  }
});

// =============================================================================
// Message Handling
// =============================================================================

chromeAPI.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse: (response: unknown) => void) => {
    handleMessage(message as MessageType)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          type: "ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return true;
  },
);

async function handleMessage(message: MessageType): Promise<MessageResponse> {
  switch (message.type) {
    case "GET_MRU_TABS": {
      const tabs = await mruTracker.getMRUTabs(message.windowOnly ?? false, message.windowId);
      return { type: "MRU_TABS", tabs };
    }

    case "SWITCH_TO_TAB": {
      await mruTracker.switchToTab(message.tabId);
      return { type: "SUCCESS" };
    }

    case "CAPTURE_CURRENT_TAB": {
      const [tab] = await chromeAPI.tabs.query({
        active: true,
        windowId: message.windowId,
      });
      if (tab?.id && tab.windowId) {
        await thumbnailCache.captureAndStore(tab.id, tab.windowId, message.thumbnailConfig);
      }
      return { type: "SUCCESS" };
    }

    case "GET_LAUNCH_INFO": {
      return { type: "LAUNCH_INFO", info: commandHandler.getLaunchInfo() };
    }

    case "CLEAR_LAUNCH_INFO": {
      commandHandler.clearLaunchInfo();
      return { type: "SUCCESS" };
    }

    case "POPUP_OPENED":
    case "POPUP_CLOSING":
    case "CLOSE_POPUP": {
      // These are handled via port connection, not message passing
      return { type: "SUCCESS" };
    }

    default: {
      // Exhaustive check: this should never be reached if all cases are handled
      const _exhaustive: never = message;
      throw new Error(`Unhandled message type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
