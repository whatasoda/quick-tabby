/**
 * Thumbnail Cache Service Tests
 */

import { beforeEach, describe, expect, test } from "vitest";
import { createMockTabs } from "../infrastructure/test-doubles/chrome-api.mock.ts";
import { createMockThumbnailStore } from "../infrastructure/test-doubles/indexed-db.mock.ts";
import {
  createThumbnailCacheService,
  type ThumbnailCacheDependencies,
} from "./thumbnail-cache.service.ts";

describe("ThumbnailCacheService", () => {
  let mockTabs: ReturnType<typeof createMockTabs>;
  let mockThumbnailStore: ReturnType<typeof createMockThumbnailStore>;
  let deps: ThumbnailCacheDependencies;

  beforeEach(() => {
    mockTabs = createMockTabs();
    mockThumbnailStore = createMockThumbnailStore();
    deps = {
      tabs: mockTabs,
      thumbnailStore: mockThumbnailStore,
    };
  });

  describe("initialize", () => {
    test("should initialize the thumbnail store", async () => {
      const service = createThumbnailCacheService(deps);

      await service.initialize();

      expect(mockThumbnailStore.isInitialized()).toBe(true);
    });
  });

  describe("getThumbnail", () => {
    test("should return null when thumbnail does not exist", async () => {
      const service = createThumbnailCacheService(deps);
      await service.initialize();

      const result = await service.getThumbnail(999);

      expect(result).toBeNull();
    });

    test("should return data URL when thumbnail exists", async () => {
      const service = createThumbnailCacheService(deps);
      await service.initialize();

      // Store a thumbnail directly in the mock
      mockThumbnailStore._thumbnails.set(1, {
        tabId: 1,
        dataUrl: "data:image/jpeg;base64,test",
        capturedAt: Date.now(),
      });

      const result = await service.getThumbnail(1);

      expect(result).toBe("data:image/jpeg;base64,test");
    });
  });

  describe("getThumbnailsForTabs", () => {
    test("should return empty map when no thumbnails exist", async () => {
      const service = createThumbnailCacheService(deps);
      await service.initialize();

      const result = await service.getThumbnailsForTabs([1, 2, 3]);

      expect(result.size).toBe(0);
    });

    test("should return thumbnails for existing tabs", async () => {
      const service = createThumbnailCacheService(deps);
      await service.initialize();

      mockThumbnailStore._thumbnails.set(1, {
        tabId: 1,
        dataUrl: "data:image/jpeg;base64,tab1",
        capturedAt: Date.now(),
      });
      mockThumbnailStore._thumbnails.set(2, {
        tabId: 2,
        dataUrl: "data:image/jpeg;base64,tab2",
        capturedAt: Date.now(),
      });

      const result = await service.getThumbnailsForTabs([1, 2, 3]);

      expect(result.size).toBe(2);
      expect(result.get(1)).toBe("data:image/jpeg;base64,tab1");
      expect(result.get(2)).toBe("data:image/jpeg;base64,tab2");
      expect(result.has(3)).toBe(false);
    });
  });

  describe("delete", () => {
    test("should remove thumbnail from store", async () => {
      const service = createThumbnailCacheService(deps);
      await service.initialize();

      mockThumbnailStore._thumbnails.set(1, {
        tabId: 1,
        dataUrl: "data:image/jpeg;base64,test",
        capturedAt: Date.now(),
      });

      await service.delete(1);

      expect(mockThumbnailStore._thumbnails.has(1)).toBe(false);
    });
  });

  describe("captureAndStore", () => {
    test("should not capture when store is not initialized", async () => {
      const service = createThumbnailCacheService(deps);
      // Do not initialize

      await service.captureAndStore(1, 100);

      expect(mockThumbnailStore._thumbnails.size).toBe(0);
    });

    // Note: Full captureAndStore testing requires browser APIs (fetch, createImageBitmap, OffscreenCanvas)
    // that are not available in Node.js. The integration test should cover this.
  });
});
