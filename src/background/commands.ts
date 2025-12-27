import type { LaunchInfo } from "../shared/types.ts";

// Store launch info for when popup opens (which command triggered it)
let launchInfo: LaunchInfo = { mode: null, command: null };

export function getLaunchInfo(): LaunchInfo {
  return launchInfo;
}

export function clearLaunchInfo(): void {
  launchInfo = { mode: null, command: null };
}

async function handleOpenPopupAllWindows(): Promise<void> {
  launchInfo = { mode: "all", command: "open-popup-all-windows" };
  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup may fail in older Chrome versions, clear the info
    clearLaunchInfo();
  }
}

async function handleOpenPopupCurrentWindow(): Promise<void> {
  launchInfo = { mode: "currentWindow", command: "open-popup-current-window" };
  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup may fail in older Chrome versions, clear the info
    clearLaunchInfo();
  }
}

export function initializeCommands(): void {
  chrome.commands.onCommand.addListener(async (command) => {
    switch (command) {
      case "open-popup-all-windows":
        await handleOpenPopupAllWindows();
        break;
      case "open-popup-current-window":
        await handleOpenPopupCurrentWindow();
        break;
    }
  });
}
