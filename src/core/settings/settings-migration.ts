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
 * Load settings with defaults
 *
 * @param stored - Raw stored settings
 * @returns Settings merged with defaults
 */
export function migrateSettings(stored: unknown): MigrationResult {
  if (!stored || typeof stored !== "object") {
    return { settings: DEFAULT_SETTINGS, needsPersist: false };
  }

  const partial = stored as Partial<Settings>;

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...partial,
      commandSettings: {
        ...DEFAULT_SETTINGS.commandSettings,
        ...partial.commandSettings,
      },
      keybindings: {
        ...DEFAULT_SETTINGS.keybindings,
        ...partial.keybindings,
      },
    },
    needsPersist: false,
  };
}
