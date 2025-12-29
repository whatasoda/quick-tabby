/**
 * Settings Loading Tests
 */

import { describe, expect, test } from "vitest";
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

  describe("needsPersist flag", () => {
    test("should always return needsPersist false (no migration)", () => {
      const stored = { popupSize: "large" as const };

      const result = migrateSettings(stored);

      expect(result.needsPersist).toBe(false);
    });
  });

  describe("settings merging", () => {
    test("should merge partial settings with defaults", () => {
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

  describe("keybindings merging", () => {
    test("should merge keybindings with defaults", () => {
      const stored = {
        keybindings: {
          moveDown: [{ key: "ArrowDown" }],
        },
      };

      const result = migrateSettings(stored);

      expect(result.settings.keybindings.moveDown).toEqual([{ key: "ArrowDown" }]);
      expect(result.settings.keybindings.moveUp).toEqual(DEFAULT_SETTINGS.keybindings.moveUp);
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
    });
  });
});
