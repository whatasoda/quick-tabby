/**
 * Settings loading logic
 *
 * Pure function for loading settings with defaults.
 */

import { DEFAULT_SETTINGS } from "./settings-defaults.ts";
import type { Settings } from "./settings-types.ts";

/**
 * Result of settings loading
 */
export interface MigrationResult {
  /** Loaded settings */
  settings: Settings;
  /** Whether persistence is needed (always false, no migration) */
  needsPersist: boolean;
}

/**
 * Legacy command settings type for migration
 */
interface LegacyCommandSettings {
  _execute_action?: { selectOnClose?: boolean; mode?: "all" | "currentWindow" };
  "open-popup"?: { selectOnClose?: boolean; mode?: "all" | "currentWindow" };
  "move-tab-left"?: { selectOnClose?: boolean };
  "move-tab-right"?: { selectOnClose?: boolean };
}

/**
 * Load settings with defaults
 *
 * @param stored - Raw stored settings
 * @returns Settings merged with defaults
 */
export function migrateSettings(stored: unknown): MigrationResult {
  if (!stored || typeof stored !== "object") {
    return { settings: DEFAULT_SETTINGS, needsPersist: false };
  }

  const partial = stored as Partial<Settings> & { commandSettings?: LegacyCommandSettings };
  let needsPersist = false;

  // Migrate _execute_action settings to open-popup
  let migratedCommandSettings = { ...DEFAULT_SETTINGS.commandSettings };
  if (partial.commandSettings) {
    const { _execute_action, ...rest } = partial.commandSettings as LegacyCommandSettings;

    // Apply existing open-popup settings first
    if (rest["open-popup"]) {
      migratedCommandSettings["open-popup"] = {
        ...migratedCommandSettings["open-popup"],
        ...rest["open-popup"],
      };
    }

    // Migrate _execute_action settings if present (takes precedence)
    if (_execute_action) {
      migratedCommandSettings["open-popup"] = {
        ...migratedCommandSettings["open-popup"],
        ..._execute_action,
      };
      needsPersist = true;
    }

    // Apply move-tab settings
    if (rest["move-tab-left"]) {
      migratedCommandSettings["move-tab-left"] = {
        ...migratedCommandSettings["move-tab-left"],
        ...rest["move-tab-left"],
      };
    }
    if (rest["move-tab-right"]) {
      migratedCommandSettings["move-tab-right"] = {
        ...migratedCommandSettings["move-tab-right"],
        ...rest["move-tab-right"],
      };
    }
  }

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...partial,
      commandSettings: migratedCommandSettings,
      keybindings: {
        ...DEFAULT_SETTINGS.keybindings,
        ...partial.keybindings,
      },
    },
    needsPersist,
  };
}
