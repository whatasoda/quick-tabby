/**
 * Settings Service Tests
 */

import { beforeEach, describe, expect, test } from "vitest";
import { DEFAULT_SETTINGS } from "../core/settings/settings-defaults.ts";
import { createMockStorage } from "../infrastructure/test-doubles/chrome-api.mock.ts";
import { createSettingsService, type SettingsServiceDependencies } from "./settings.service.ts";

describe("SettingsService", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let deps: SettingsServiceDependencies;

  beforeEach(() => {
    mockStorage = createMockStorage();
    deps = { storage: mockStorage };
  });

  describe("load", () => {
    test("should return default settings when storage is empty", async () => {
      const service = createSettingsService(deps);

      const result = await service.load();

      expect(result).toEqual(DEFAULT_SETTINGS);
    });

    test("should return stored settings when available", async () => {
      const storedSettings = {
        ...DEFAULT_SETTINGS,
        popupSize: "large" as const,
      };
      await mockStorage.local.set({ "quicktabby:settings": storedSettings });
      const service = createSettingsService(deps);

      const result = await service.load();

      expect(result.popupSize).toBe("large");
    });

    test("should migrate and persist legacy settings", async () => {
      const legacySettings = {
        enableModeToggle: true,
      };
      await mockStorage.local.set({ "quicktabby:settings": legacySettings });
      const service = createSettingsService(deps);

      const result = await service.load();

      expect(result.defaultMode).toBe("lastUsed");
      // Verify persisted
      const stored = await mockStorage.local.get("quicktabby:settings");
      expect(stored["quicktabby:settings"]).toBeDefined();
    });

    test("should migrate single keybinding to array format", async () => {
      const legacySettings = {
        keybindings: {
          moveDown: { key: "j" },
          moveUp: { key: "k" },
        },
      };
      await mockStorage.local.set({ "quicktabby:settings": legacySettings });
      const service = createSettingsService(deps);

      const result = await service.load();

      expect(result.keybindings.moveDown).toEqual([{ key: "j" }]);
      expect(result.keybindings.moveUp).toEqual([{ key: "k" }]);
    });
  });

  describe("save", () => {
    test("should persist settings to storage", async () => {
      const service = createSettingsService(deps);
      const newSettings = {
        ...DEFAULT_SETTINGS,
        popupSize: "small" as const,
      };

      await service.save(newSettings);

      const stored = await mockStorage.local.get("quicktabby:settings");
      expect(stored["quicktabby:settings"]).toEqual(newSettings);
    });

    test("should overwrite existing settings", async () => {
      await mockStorage.local.set({
        "quicktabby:settings": { ...DEFAULT_SETTINGS, popupSize: "medium" as const },
      });
      const service = createSettingsService(deps);
      const newSettings = {
        ...DEFAULT_SETTINGS,
        popupSize: "large" as const,
      };

      await service.save(newSettings);

      const stored = await mockStorage.local.get("quicktabby:settings");
      const storedSettings = stored["quicktabby:settings"] as typeof newSettings;
      expect(storedSettings.popupSize).toBe("large");
    });
  });
});
