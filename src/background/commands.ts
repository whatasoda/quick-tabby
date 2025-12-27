import type { LaunchInfo, CommandName } from "../shared/types.ts";
import { loadSettings } from "../shared/settings.ts";

// Store launch info for when popup opens (which command triggered it)
let launchInfo: LaunchInfo = { mode: null, command: null };

// Track popup connection
let popupPort: chrome.runtime.Port | null = null;

export function getLaunchInfo(): LaunchInfo {
  return launchInfo;
}

export function clearLaunchInfo(): void {
  launchInfo = { mode: null, command: null };
}

export function setPopupPort(port: chrome.runtime.Port | null): void {
  popupPort = port;
}

export function getPopupPort(): chrome.runtime.Port | null {
  return popupPort;
}

export function isPopupOpen(): boolean {
  return popupPort !== null;
}

async function sendCloseMessage(command: CommandName): Promise<boolean> {
  if (!popupPort) return false;

  const settings = await loadSettings();
  const selectFocused = settings.commandSettings[command]?.selectOnClose ?? true;

  try {
    popupPort.postMessage({ type: "CLOSE_POPUP", selectFocused });
    return true;
  } catch {
    // Popup might have already closed
    popupPort = null;
    return false;
  }
}

async function handleCommand(command: CommandName, mode: "all" | "currentWindow"): Promise<void> {
  if (isPopupOpen()) {
    // Popup is open, send close message
    await sendCloseMessage(command);
    return;
  }

  // Open popup with specified mode
  launchInfo = { mode, command };
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
        await handleCommand("open-popup-all-windows", "all");
        break;
      case "open-popup-current-window":
        await handleCommand("open-popup-current-window", "currentWindow");
        break;
    }
  });
}
