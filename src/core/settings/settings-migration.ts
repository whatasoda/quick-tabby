/**
 * Settings migration logic
 *
 * Pure functions for migrating legacy settings formats to current format.
 */

import { DEFAULT_SETTINGS } from "./settings-defaults.ts";
import type {
  Keybinding,
  KeybindingsConfig,
  LegacyKeybindings,
  LegacySettings,
  Settings,
} from "./settings-types.ts";

/**
 * Result of settings migration
 */
export interface MigrationResult {
  /** Migrated settings */
  settings: Settings;
  /** Whether migration occurred and persistence is needed */
  needsPersist: boolean;
}

/**
 * Migrate legacy settings to current format
 *
 * @param stored - Raw stored settings (may be legacy format)
 * @returns Migrated settings and persistence flag
 */
export function migrateSettings(stored: unknown): MigrationResult {
  if (!stored || typeof stored !== "object") {
    return { settings: DEFAULT_SETTINGS, needsPersist: false };
  }

  const legacy = stored as LegacySettings;
  let needsPersist = false;

  // Migration 1: Convert enableModeToggle to defaultMode
  const { defaultMode, migrated: modeMigrated } = migrateDefaultMode(legacy);
  if (modeMigrated) {
    needsPersist = true;
  }

  // Migration 2: Convert single keybindings to arrays
  const { keybindings, migrated: keybindingsMigrated } = migrateKeybindings(legacy.keybindings);
  if (keybindingsMigrated) {
    needsPersist = true;
  }

  // Build final settings with defaults
  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...legacy,
      defaultMode,
      keybindings,
      commandSettings: {
        ...DEFAULT_SETTINGS.commandSettings,
        ...legacy.commandSettings,
      },
    },
    needsPersist,
  };
}

/**
 * Migrate enableModeToggle to defaultMode
 */
function migrateDefaultMode(legacy: LegacySettings): {
  defaultMode: Settings["defaultMode"];
  migrated: boolean;
} {
  // If defaultMode already exists, use it
  if (legacy.defaultMode !== undefined) {
    return { defaultMode: legacy.defaultMode, migrated: false };
  }

  // Migrate from legacy enableModeToggle
  if (legacy.enableModeToggle !== undefined) {
    const defaultMode = legacy.enableModeToggle ? "lastUsed" : "all";
    return { defaultMode, migrated: true };
  }

  // Use default
  return { defaultMode: DEFAULT_SETTINGS.defaultMode, migrated: false };
}

/**
 * Migrate single keybindings to array format
 */
function migrateKeybindings(keybindings: LegacyKeybindings | Settings["keybindings"] | undefined): {
  keybindings: KeybindingsConfig;
  migrated: boolean;
} {
  if (!keybindings) {
    return { keybindings: DEFAULT_SETTINGS.keybindings, migrated: false };
  }

  const keys = ["moveDown", "moveUp", "confirm", "cancel", "toggleMode"] as const;
  const result: KeybindingsConfig = { ...DEFAULT_SETTINGS.keybindings };
  let migrated = false;

  for (const key of keys) {
    const binding = keybindings[key];
    if (binding) {
      if (isKeybindingArray(binding)) {
        // Already migrated format
        result[key] = binding;
      } else if (isSingleKeybinding(binding)) {
        // Legacy single keybinding - wrap in array
        result[key] = [binding];
        migrated = true;
      }
    }
  }

  return { keybindings: result, migrated };
}

/**
 * Type guard: Check if value is a keybinding array
 */
function isKeybindingArray(value: unknown): value is Keybinding[] {
  return Array.isArray(value) && value.every(isSingleKeybinding);
}

/**
 * Type guard: Check if value is a single keybinding object
 */
function isSingleKeybinding(value: unknown): value is Keybinding {
  return (
    value !== null &&
    typeof value === "object" &&
    "key" in value &&
    typeof (value as Keybinding).key === "string"
  );
}
