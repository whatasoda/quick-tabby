/**
 * Mode persistence utility
 *
 * Handles saving and loading the window-only mode preference
 * for the "lastUsed" default mode setting.
 */

import type { DisplayMode } from "../../shared/types";

const MODE_STORAGE_KEY = "displayMode";

/**
 * Load the persisted window-only mode preference
 */
export async function loadDisplayMode(): Promise<DisplayMode | null> {
  const result = await chrome.storage.local.get(MODE_STORAGE_KEY);
  return (result[MODE_STORAGE_KEY] ?? null) as DisplayMode | null;
}

/**
 * Save the window-only mode preference
 */
export async function saveDisplayMode(displayMode: DisplayMode): Promise<void> {
  await chrome.storage.local.set({ [MODE_STORAGE_KEY]: displayMode });
}
