/**
 * Settings Service
 *
 * Manages application settings with persistence via Chrome Storage API.
 * Uses dependency injection for testability.
 */

import type { ChromeStorageAPI } from "../infrastructure/chrome/types.ts";
import type { Settings } from "../core/settings/settings-types.ts";
import { migrateSettings } from "../core/settings/settings-migration.ts";

const SETTINGS_KEY = "quicktabby:settings";

/**
 * Settings service interface
 */
export interface SettingsService {
  /**
   * Load settings from storage, applying migrations if needed
   */
  load(): Promise<Settings>;

  /**
   * Save settings to storage
   */
  save(settings: Settings): Promise<void>;
}

/**
 * Dependencies for settings service
 */
export interface SettingsServiceDependencies {
  storage: ChromeStorageAPI;
}

/**
 * Create a settings service instance
 *
 * @param deps - Service dependencies
 * @returns Settings service instance
 */
export function createSettingsService(
  deps: SettingsServiceDependencies
): SettingsService {
  return {
    async load(): Promise<Settings> {
      const result = await deps.storage.local.get<unknown>(SETTINGS_KEY);
      const stored = result[SETTINGS_KEY];
      const { settings, needsPersist } = migrateSettings(stored);

      if (needsPersist) {
        await deps.storage.local.set({ [SETTINGS_KEY]: settings });
      }

      return settings;
    },

    async save(settings: Settings): Promise<void> {
      await deps.storage.local.set({ [SETTINGS_KEY]: settings });
    },
  };
}
