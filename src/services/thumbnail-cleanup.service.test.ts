/**
 * Thumbnail Cleanup Service Tests
 */

import { beforeEach, describe, expect, test } from "vitest";
import { DEFAULT_SETTINGS, THUMBNAIL_TTL_MS } from "../core/settings/index.ts";
import type { Settings } from "../core/settings/settings-types.ts";
import { createMockAlarms } from "../infrastructure/test-doubles/chrome-api.mock.ts";
import { createMockThumbnailStore } from "../infrastructure/test-doubles/indexed-db.mock.ts";
import type { SettingsService } from "./settings.service.ts";
import {
  createThumbnailCleanupService,
  type ThumbnailCleanupDependencies,
} from "./thumbnail-cleanup.service.ts";

function createMockSettingsService(settings: Settings = DEFAULT_SETTINGS): SettingsService {
  return {
    async load() {
      return settings;
    },
    async save() {},
  };
}

describe("ThumbnailCleanupService", () => {
  let mockAlarms: ReturnType<typeof createMockAlarms>;
  let mockThumbnailStore: ReturnType<typeof createMockThumbnailStore>;
  let mockSettingsService: SettingsService;
  let deps: ThumbnailCleanupDependencies;

  beforeEach(() => {
    mockAlarms = createMockAlarms();
    mockThumbnailStore = createMockThumbnailStore();
    mockSettingsService = createMockSettingsService();
    deps = {
      alarms: mockAlarms,
      thumbnailStore: mockThumbnailStore,
      settingsService: mockSettingsService,
    };

    // Initialize the store
    mockThumbnailStore._initialized = true;
  });

  describe("initialize", () => {
    test("should register a periodic alarm", () => {
      const service = createThumbnailCleanupService(deps);

      service.initialize();

      const alarm = mockAlarms._alarms.get("thumbnail-cleanup");
      expect(alarm).toBeDefined();
      expect(alarm?.periodInMinutes).toBe(60);
    });
  });

  describe("runCleanup", () => {
    test("should delete expired thumbnails based on TTL setting", async () => {
      const now = Date.now();

      // Create thumbnails: one expired (older than 24h), one recent
      mockThumbnailStore._thumbnails.set(1, {
        tabId: 1,
        dataUrl: "data:image/jpeg;base64,old",
        capturedAt: now - THUMBNAIL_TTL_MS["24h"] - 1000, // Expired
      });
      mockThumbnailStore._thumbnails.set(2, {
        tabId: 2,
        dataUrl: "data:image/jpeg;base64,recent",
        capturedAt: now - 1000, // Recent
      });

      const service = createThumbnailCleanupService(deps);

      const deleted = await service.runCleanup();

      expect(deleted).toBe(1);
      expect(mockThumbnailStore._thumbnails.has(1)).toBe(false);
      expect(mockThumbnailStore._thumbnails.has(2)).toBe(true);
    });

    test("should respect custom TTL setting", async () => {
      const now = Date.now();

      // Use 1 hour TTL
      mockSettingsService = createMockSettingsService({
        ...DEFAULT_SETTINGS,
        thumbnailTTL: "1h",
      });
      deps.settingsService = mockSettingsService;

      // Create thumbnail older than 1 hour
      mockThumbnailStore._thumbnails.set(1, {
        tabId: 1,
        dataUrl: "data:image/jpeg;base64,old",
        capturedAt: now - THUMBNAIL_TTL_MS["1h"] - 1000,
      });

      const service = createThumbnailCleanupService(deps);

      const deleted = await service.runCleanup();

      expect(deleted).toBe(1);
    });

    test("should return 0 when no thumbnails are expired", async () => {
      const now = Date.now();

      mockThumbnailStore._thumbnails.set(1, {
        tabId: 1,
        dataUrl: "data:image/jpeg;base64,recent",
        capturedAt: now - 1000,
      });

      const service = createThumbnailCleanupService(deps);

      const deleted = await service.runCleanup();

      expect(deleted).toBe(0);
      expect(mockThumbnailStore._thumbnails.has(1)).toBe(true);
    });

    test("should delete all expired thumbnails", async () => {
      const now = Date.now();

      // Create 3 expired thumbnails
      for (let i = 1; i <= 3; i++) {
        mockThumbnailStore._thumbnails.set(i, {
          tabId: i,
          dataUrl: `data:image/jpeg;base64,old${i}`,
          capturedAt: now - THUMBNAIL_TTL_MS["24h"] - i * 1000,
        });
      }

      const service = createThumbnailCleanupService(deps);

      const deleted = await service.runCleanup();

      expect(deleted).toBe(3);
      expect(mockThumbnailStore._thumbnails.size).toBe(0);
    });
  });
});
