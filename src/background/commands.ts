import { getPreviousTabInWindow, switchToTab, getMRUTabs } from "./mru-tracker.ts";
import type { LaunchModeOverride } from "../shared/types.ts";

// Store launch mode override for when popup opens
let launchModeOverride: LaunchModeOverride = null;

export function getLaunchModeOverride(): LaunchModeOverride {
  return launchModeOverride;
}

export function clearLaunchModeOverride(): void {
  launchModeOverride = null;
}

async function handleToggleRecent(): Promise<void> {
  const tabs = await getMRUTabs(false);
  if (tabs.length >= 2 && tabs[1]) {
    await switchToTab(tabs[1].id);
  }
}

async function handleToggleRecentSameWindow(): Promise<void> {
  const currentWindow = await chrome.windows.getCurrent();
  if (currentWindow.id === undefined) return;

  const previousTabId = await getPreviousTabInWindow(currentWindow.id);
  if (previousTabId !== null) {
    await switchToTab(previousTabId);
  }
}

async function handleOpenPopupAllWindows(): Promise<void> {
  launchModeOverride = "all";
  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup may fail in older Chrome versions, clear the override
    launchModeOverride = null;
  }
}

async function handleOpenPopupCurrentWindow(): Promise<void> {
  launchModeOverride = "currentWindow";
  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup may fail in older Chrome versions, clear the override
    launchModeOverride = null;
  }
}

export function initializeCommands(): void {
  chrome.commands.onCommand.addListener(async (command) => {
    switch (command) {
      case "toggle-recent":
        await handleToggleRecent();
        break;
      case "toggle-recent-same-window":
        await handleToggleRecentSameWindow();
        break;
      case "open-popup-all-windows":
        await handleOpenPopupAllWindows();
        break;
      case "open-popup-current-window":
        await handleOpenPopupCurrentWindow();
        break;
    }
  });
}
