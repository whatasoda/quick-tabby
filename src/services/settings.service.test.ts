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

    test("should merge partial settings with defaults", async () => {
      const partialSettings = {
        popupSize: "small" as const,
      };
      await mockStorage.local.set({ "quicktabby:settings": partialSettings });
      const service = createSettingsService(deps);

      const result = await service.load();

      expect(result.popupSize).toBe("small");
      expect(result.keybindings).toEqual(DEFAULT_SETTINGS.keybindings);
      expect(result.commandSettings).toEqual(DEFAULT_SETTINGS.commandSettings);
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
