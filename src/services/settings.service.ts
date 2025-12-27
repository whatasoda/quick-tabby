/**
 * Settings Service
 *
 * Manages application settings with persistence via Chrome Storage API.
 * Uses dependency injection for testability.
 */

import type { ChromeStorageAPI } from "../infrastructure/chrome/types.ts";
import type { Settings, ThemePreference } from "../core/settings/settings-types.ts";
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

// =============================================================================
// Theme Utilities (pure functions, can be used without service)
// =============================================================================

/**
 * Get effective theme based on preference and system settings
 *
 * @param preference - User's theme preference
 * @returns Resolved theme ("light" or "dark")
 */
export function getEffectiveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

/**
 * Apply theme to document
 *
 * @param preference - User's theme preference
 */
export function applyTheme(preference: ThemePreference): void {
  const theme = getEffectiveTheme(preference);
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Set up system theme change listener
 *
 * @param preference - User's theme preference
 * @param onThemeChange - Callback when system theme changes
 * @returns Cleanup function to remove listener
 */
export function setupThemeListener(
  preference: ThemePreference,
  onThemeChange: () => void
): () => void {
  if (preference !== "auto") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onThemeChange();
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}
