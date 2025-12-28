/**
 * Mode persistence utility
 *
 * Handles saving and loading the window-only mode preference
 * for the "lastUsed" default mode setting.
 */

const MODE_STORAGE_KEY = "windowOnlyMode";

/**
 * Load the persisted window-only mode preference
 */
export async function loadWindowOnlyMode(): Promise<boolean> {
  const result = await chrome.storage.local.get(MODE_STORAGE_KEY);
  return result[MODE_STORAGE_KEY] ?? false;
}

/**
 * Save the window-only mode preference
 */
export async function saveWindowOnlyMode(windowOnly: boolean): Promise<void> {
  await chrome.storage.local.set({ [MODE_STORAGE_KEY]: windowOnly });
}
