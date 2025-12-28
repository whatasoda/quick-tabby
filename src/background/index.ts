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
  createThumbnailCleanupService,
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

const thumbnailCleanup = createThumbnailCleanupService({
  alarms: chromeAPI.alarms,
  thumbnailStore,
  settingsService,
});

// =============================================================================
// Icon Theme Handling
// =============================================================================

function updateIcon(isDark: boolean) {
  const theme = isDark ? "dark" : "light";
  chrome.action.setIcon({
    path: {
      16: `icons/icon-${theme}-16.png`,
      32: `icons/icon-${theme}-32.png`,
      48: `icons/icon-${theme}-48.png`,
      128: `icons/icon-${theme}-128.png`,
    },
  });
}

// Create offscreen document to detect color scheme changes
// (Service workers don't have access to matchMedia)
async function setupColorSchemeDetection() {
  const offscreenUrl = "src/background/offscreen.html";

  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [chrome.runtime.getURL(offscreenUrl)],
  });

  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: [chrome.offscreen.Reason.MATCH_MEDIA],
      justification: "Detect system color scheme for icon theming",
    });
  }
}

// =============================================================================
// Initialization
// =============================================================================

(async () => {
  await thumbnailCache.initialize();
  await mruTracker.initialize();
  commandHandler.initialize();
  thumbnailCleanup.initialize();
  await setupColorSchemeDetection();
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
  }
);

async function handleMessage(message: MessageType): Promise<MessageResponse> {
  switch (message.type) {
    case "GET_MRU_TABS": {
      const tabs = await mruTracker.getMRUTabs(
        message.windowOnly ?? false,
        message.windowId
      );
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
        await thumbnailCache.captureAndStore(
          tab.id,
          tab.windowId,
          message.thumbnailConfig
        );
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

    case "COLOR_SCHEME_CHANGED": {
      updateIcon(message.isDark);
      return { type: "SUCCESS" };
    }

    default: {
      // Exhaustive check: this should never be reached if all cases are handled
      const _exhaustive: never = message;
      throw new Error(`Unhandled message type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
