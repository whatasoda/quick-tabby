import type { Settings, Keybinding } from "../core/settings/settings-types.ts";
import { DEFAULT_SETTINGS } from "../core/settings/settings-defaults.ts";

const SETTINGS_KEY = "quicktabby:settings";

// Legacy keybindings format (single keybinding per action)
interface LegacyKeybindings {
  moveDown?: Keybinding;
  moveUp?: Keybinding;
  confirm?: Keybinding;
  cancel?: Keybinding;
  toggleMode?: Keybinding;
}

interface LegacySettings extends Partial<Omit<Settings, "keybindings">> {
  enableModeToggle?: boolean;
  keybindings?: LegacyKeybindings | Settings["keybindings"];
}

export async function loadSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  const stored = result[SETTINGS_KEY] as LegacySettings | undefined;

  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  // Migration: convert enableModeToggle to defaultMode
  let defaultMode = stored.defaultMode;
  if (defaultMode === undefined && stored.enableModeToggle !== undefined) {
    // If enableModeToggle was true, use lastUsed; if false, use "all" (fixed mode)
    defaultMode = stored.enableModeToggle ? "lastUsed" : "all";
    // Clean up legacy setting
    const { enableModeToggle, ...cleanedStored } = stored;
    const migratedSettings = { ...cleanedStored, defaultMode };
    await chrome.storage.local.set({ [SETTINGS_KEY]: migratedSettings });
  }

  // Migration: convert single keybindings to arrays
  let migratedKeybindings: Settings["keybindings"] = {
    ...DEFAULT_SETTINGS.keybindings,
  };
  if (stored.keybindings) {
    const keys = [
      "moveDown",
      "moveUp",
      "confirm",
      "cancel",
      "toggleMode",
    ] as const;
    for (const key of keys) {
      const binding = stored.keybindings[key];
      if (binding) {
        if (Array.isArray(binding)) {
          // Already migrated - use as is
          migratedKeybindings[key] = binding;
        } else if (typeof binding === "object" && "key" in binding) {
          // Legacy single keybinding - wrap in array
          migratedKeybindings[key] = [binding];
        }
      }
    }
  }

  // Merge with defaults to handle missing fields
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    defaultMode: defaultMode ?? DEFAULT_SETTINGS.defaultMode,
    keybindings: migratedKeybindings,
    commandSettings: {
      ...DEFAULT_SETTINGS.commandSettings,
      ...stored.commandSettings,
    },
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}
