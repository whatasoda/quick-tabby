/**
 * Messaging utilities for popup-to-background communication
 *
 * Provides type-safe wrappers around Chrome runtime messaging API.
 */

import type {
  MessageType,
  MessageResponse,
  TabInfo,
  LaunchInfo,
} from "../../shared/types.ts";
import type { ThumbnailConfig } from "../../core/settings/settings-types.ts";

/**
 * Send a message to the background script and return the response
 */
export async function sendMessage(
  message: MessageType
): Promise<MessageResponse | null> {
  const response = await chrome.runtime.sendMessage(message);
  return response as MessageResponse | null;
}

/**
 * Fetch MRU tabs from the background script
 */
export async function getMRUTabs(
  windowOnly: boolean,
  windowId: number
): Promise<TabInfo[]> {
  const response = await sendMessage({
    type: "GET_MRU_TABS",
    windowOnly,
    windowId,
  });
  return response?.type === "MRU_TABS" ? response.tabs : [];
}

/**
 * Switch to a tab and close the popup
 */
export async function switchToTab(tabId: number): Promise<void> {
  await sendMessage({ type: "SWITCH_TO_TAB", tabId });
  window.close();
}

/**
 * Capture the current tab's thumbnail
 */
export async function captureCurrentTab(
  windowId: number | undefined,
  thumbnailConfig: ThumbnailConfig
): Promise<void> {
  await sendMessage({
    type: "CAPTURE_CURRENT_TAB",
    windowId,
    thumbnailConfig,
  });
}

/**
 * Get launch info (mode override from shortcut)
 */
export async function getLaunchInfo(): Promise<LaunchInfo | null> {
  const response = await sendMessage({ type: "GET_LAUNCH_INFO" });
  return response?.type === "LAUNCH_INFO" ? response.info : null;
}

/**
 * Clear launch info after use
 */
export async function clearLaunchInfo(): Promise<void> {
  await sendMessage({ type: "CLEAR_LAUNCH_INFO" });
}

/**
 * Connect to the background script for persistent communication
 */
export function connectPopup(): chrome.runtime.Port {
  return chrome.runtime.connect({ name: "popup" });
}

/**
 * Open the extension options page
 */
export function openOptionsPage(): void {
  chrome.runtime.openOptionsPage();
}

/**
 * Get the current window
 */
export async function getWindowInstance(): Promise<chrome.windows.Window> {
  return chrome.windows.getCurrent();
}

/**
 * Shortcut information from Chrome commands
 */
export interface ShortcutInfo {
  name: string;
  description: string;
  shortcut: string;
}

/**
 * Get all registered keyboard shortcuts for this extension
 */
export async function getCommands(): Promise<ShortcutInfo[]> {
  const commands = await chrome.commands.getAll();
  return commands.map((cmd) => ({
    name: cmd.name ?? "",
    description: cmd.description ?? "",
    shortcut: cmd.shortcut ?? "Not set",
  }));
}

/**
 * Open Chrome's extension shortcuts settings page
 */
export function openShortcutsPage(): void {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
}
