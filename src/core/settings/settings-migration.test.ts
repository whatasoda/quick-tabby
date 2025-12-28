/**
 * Settings Migration Tests
 */

import { describe, expect, test } from "bun:test";
import { DEFAULT_SETTINGS } from "./settings-defaults.ts";
import { migrateSettings } from "./settings-migration.ts";

describe("migrateSettings", () => {
  describe("null/undefined/non-object input", () => {
    test("should return defaults for null input", () => {
      const result = migrateSettings(null);

      expect(result.settings).toEqual(DEFAULT_SETTINGS);
      expect(result.needsPersist).toBe(false);
    });

    test("should return defaults for undefined input", () => {
      const result = migrateSettings(undefined);

      expect(result.settings).toEqual(DEFAULT_SETTINGS);
      expect(result.needsPersist).toBe(false);
    });

    test("should return defaults for non-object input", () => {
      expect(migrateSettings("string").settings).toEqual(DEFAULT_SETTINGS);
      expect(migrateSettings(123).settings).toEqual(DEFAULT_SETTINGS);
      expect(migrateSettings(true).settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("enableModeToggle migration", () => {
    test("should migrate enableModeToggle true to defaultMode lastUsed", () => {
      const stored = { enableModeToggle: true };

      const result = migrateSettings(stored);

      expect(result.settings.defaultMode).toBe("lastUsed");
      expect(result.needsPersist).toBe(true);
    });

    test("should migrate enableModeToggle false to defaultMode all", () => {
      const stored = { enableModeToggle: false };

      const result = migrateSettings(stored);

      expect(result.settings.defaultMode).toBe("all");
      expect(result.needsPersist).toBe(true);
    });

    test("should preserve existing defaultMode (no double migration)", () => {
      const stored = {
        enableModeToggle: true,
        defaultMode: "currentWindow" as const,
      };

      const result = migrateSettings(stored);

      expect(result.settings.defaultMode).toBe("currentWindow");
      expect(result.needsPersist).toBe(false);
    });
  });

  describe("needsPersist flag", () => {
    test("should set needsPersist true when migration occurs", () => {
      const stored = { enableModeToggle: true };

      const result = migrateSettings(stored);

      expect(result.needsPersist).toBe(true);
    });

    test("should set needsPersist false when no migration needed", () => {
      const stored = {
        defaultMode: "all" as const,
        keybindings: DEFAULT_SETTINGS.keybindings,
      };

      const result = migrateSettings(stored);

      expect(result.needsPersist).toBe(false);
    });
  });

  describe("keybindings migration", () => {
    test("should migrate single keybinding to array format", () => {
      const stored = {
        keybindings: {
          moveDown: { key: "ArrowDown" },
          moveUp: { key: "ArrowUp" },
        },
      };

      const result = migrateSettings(stored);

      expect(result.settings.keybindings.moveDown).toEqual([{ key: "ArrowDown" }]);
      expect(result.settings.keybindings.moveUp).toEqual([{ key: "ArrowUp" }]);
      expect(result.needsPersist).toBe(true);
    });

    test("should preserve already-migrated keybindings array", () => {
      const stored = {
        keybindings: {
          moveDown: [{ key: "j" }, { key: "ArrowDown" }],
          moveUp: [{ key: "k" }],
          confirm: [{ key: "Enter" }],
          cancel: [{ key: "Escape" }],
          toggleMode: [{ key: "Tab" }],
        },
      };

      const result = migrateSettings(stored);

      expect(result.settings.keybindings.moveDown).toEqual([{ key: "j" }, { key: "ArrowDown" }]);
      expect(result.needsPersist).toBe(false);
    });

    test("should use default keybindings when not provided", () => {
      const stored = {};

      const result = migrateSettings(stored);

      expect(result.settings.keybindings).toEqual(DEFAULT_SETTINGS.keybindings);
    });
  });

  describe("commandSettings merging", () => {
    test("should merge custom commandSettings with defaults", () => {
      const stored = {
        commandSettings: {
          _execute_action: { selectOnClose: false },
        },
      };

      const result = migrateSettings(stored);

      expect(result.settings.commandSettings._execute_action.selectOnClose).toBe(false);
      expect(result.settings.commandSettings["open-popup-all-windows"].selectOnClose).toBe(true);
    });
  });

  describe("complete settings with defaults", () => {
    test("should return complete Settings with all defaults filled", () => {
      const stored = {
        popupSize: "large" as const,
      };

      const result = migrateSettings(stored);

      expect(result.settings.popupSize).toBe("large");
      expect(result.settings.previewModeEnabled).toBe(DEFAULT_SETTINGS.previewModeEnabled);
      expect(result.settings.thumbnailQuality).toBe(DEFAULT_SETTINGS.thumbnailQuality);
      expect(result.settings.themePreference).toBe(DEFAULT_SETTINGS.themePreference);
      expect(result.settings.keybindings).toEqual(DEFAULT_SETTINGS.keybindings);
      expect(result.settings.commandSettings).toEqual(DEFAULT_SETTINGS.commandSettings);
    });

    test("should preserve all custom settings while filling defaults", () => {
      const stored = {
        popupSize: "small" as const,
        previewModeEnabled: true,
        thumbnailQuality: "high" as const,
        defaultMode: "currentWindow" as const,
        themePreference: "dark" as const,
      };

      const result = migrateSettings(stored);

      expect(result.settings.popupSize).toBe("small");
      expect(result.settings.previewModeEnabled).toBe(true);
      expect(result.settings.thumbnailQuality).toBe("high");
      expect(result.settings.defaultMode).toBe("currentWindow");
      expect(result.settings.themePreference).toBe("dark");
    });
  });
});
