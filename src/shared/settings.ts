/**
 * Settings persistence
 *
 * Thin wrapper around chrome.storage.local for settings load/save.
 * Migration logic is delegated to core/settings/settings-migration.ts.
 */

import type { Settings } from "../core/settings/settings-types.ts";
import { migrateSettings } from "../core/settings/settings-migration.ts";

const SETTINGS_KEY = "quicktabby:settings";

/**
 * Load settings from chrome.storage, applying migrations if needed
 */
export async function loadSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  const { settings, needsPersist } = migrateSettings(result[SETTINGS_KEY]);

  if (needsPersist) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  }

  return settings;
}

/**
 * Save settings to chrome.storage
 */
export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}
