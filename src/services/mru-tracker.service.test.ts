/**
 * MRU Tracker Service Tests
 */

import { beforeEach, describe, expect, test } from "vitest";
import {
  createMockStorage,
  createMockTabs,
  createMockWindows,
} from "../infrastructure/test-doubles/chrome-api.mock.ts";
import { createMRUTrackerService, type MRUTrackerDependencies } from "./mru-tracker.service.ts";
import type { ThumbnailCacheService } from "./thumbnail-cache.service.ts";

function createMockThumbnailCacheService(): ThumbnailCacheService {
  return {
    async initialize() {},
    async captureAndStore() {},
    async getThumbnail() {
      return null;
    },
    async getThumbnailsForTabs() {
      return new Map();
    },
    async delete() {},
  };
}

describe("MRUTrackerService", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let mockTabs: ReturnType<typeof createMockTabs>;
  let mockWindows: ReturnType<typeof createMockWindows>;
  let mockThumbnailCache: ThumbnailCacheService;
  let deps: MRUTrackerDependencies;

  beforeEach(() => {
    mockStorage = createMockStorage();
    mockTabs = createMockTabs({
      tabs: [
        {
          id: 1,
          windowId: 100,
          index: 0,
          title: "Tab 1",
          url: "https://example.com/1",
          active: true,
        },
        {
          id: 2,
          windowId: 100,
          index: 1,
          title: "Tab 2",
          url: "https://example.com/2",
          active: false,
        },
        {
          id: 3,
          windowId: 100,
          index: 2,
          title: "Tab 3",
          url: "https://example.com/3",
          active: false,
        },
      ],
    });
    mockWindows = createMockWindows({
      windows: [
        {
          id: 100,
          focused: true,
          tabs: [
            {
              id: 1,
              windowId: 100,
              index: 0,
              title: "Tab 1",
              url: "https://example.com/1",
              active: true,
            },
            {
              id: 2,
              windowId: 100,
              index: 1,
              title: "Tab 2",
              url: "https://example.com/2",
              active: false,
            },
          ],
        },
      ],
    });
    mockWindows._setCurrentWindowId(100);
    mockThumbnailCache = createMockThumbnailCacheService();

    deps = {
      storage: mockStorage,
      tabs: mockTabs,
      windows: mockWindows,
      thumbnailCache: mockThumbnailCache,
    };
  });

  describe("initialize", () => {
    test("should register event listeners", async () => {
      const service = createMRUTrackerService(deps);

      await service.initialize();

      // Trigger tab activation to verify listeners are set up
      mockTabs._triggerActivated(2, 100);
      const state = service.getState();
      expect(state.global).toContain(2);
    });

    test("should initialize with all tabs when state is empty", async () => {
      const service = createMRUTrackerService(deps);

      await service.initialize();

      const state = service.getState();
      // All tabs should be in MRU (mockWindows has tabs 1 and 2)
      expect(state.global).toContain(1);
      expect(state.global).toContain(2);
      // Active tab (1) should be at the front
      expect(state.global[0]).toBe(1);
    });

    test("should load existing state from storage", async () => {
      const existingState = {
        global: [3, 2, 1],
        byWindow: { 100: [3, 2, 1] },
      };
      await mockStorage.session.set({ mruState: existingState });
      const service = createMRUTrackerService(deps);

      await service.initialize();

      const state = service.getState();
      expect(state.global).toEqual([3, 2, 1]);
    });
  });

  describe("getMRUTabs", () => {
    test("should return tabs in MRU order", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      // Simulate tab activations
      mockTabs._triggerActivated(1, 100);
      mockTabs._triggerActivated(2, 100);
      mockTabs._triggerActivated(3, 100);

      const tabs = await service.getMRUTabs(false);

      expect(tabs[0]?.id).toBe(3);
      expect(tabs[1]?.id).toBe(2);
      expect(tabs[2]?.id).toBe(1);
    });

    test("should filter by window when windowOnly is true", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      mockTabs._triggerActivated(1, 100);
      mockTabs._triggerActivated(2, 100);

      const tabs = await service.getMRUTabs(true, 100);

      expect(tabs.every((t) => t.windowId === 100)).toBe(true);
    });

    test("should remove stale tabs from MRU when tab no longer exists", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      mockTabs._triggerActivated(1, 100);
      mockTabs._triggerActivated(999, 100); // Non-existent tab

      const tabs = await service.getMRUTabs(false);

      expect(tabs.find((t) => t.id === 999)).toBeUndefined();
    });
  });

  describe("switchToTab", () => {
    test("should activate tab and focus window", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      await service.switchToTab(2);

      const tab = await mockTabs.get(2);
      expect(tab.active).toBe(true);
    });
  });

  describe("getPreviousTab", () => {
    test("should return second tab in MRU list", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      mockTabs._triggerActivated(1, 100);
      mockTabs._triggerActivated(2, 100);
      mockTabs._triggerActivated(3, 100);

      const previousTab = service.getPreviousTab(false);

      expect(previousTab).toBe(2);
    });

    test("should return null when MRU has fewer than 2 items", async () => {
      // Create a single-tab scenario
      const singleTabMockWindows = createMockWindows({
        windows: [
          {
            id: 100,
            focused: true,
            tabs: [
              {
                id: 1,
                windowId: 100,
                index: 0,
                title: "Tab 1",
                url: "https://example.com/1",
                active: true,
              },
            ],
          },
        ],
      });
      singleTabMockWindows._setCurrentWindowId(100);

      const service = createMRUTrackerService({
        ...deps,
        windows: singleTabMockWindows,
      });
      await service.initialize();

      const previousTab = service.getPreviousTab(false);

      expect(previousTab).toBeNull();
    });
  });

  describe("event handling", () => {
    test("should update MRU when tab is activated", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      mockTabs._triggerActivated(2, 100);

      const state = service.getState();
      expect(state.global[0]).toBe(2);
    });

    test("should remove tab from MRU when tab is closed", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      mockTabs._triggerActivated(1, 100);
      mockTabs._triggerActivated(2, 100);
      mockTabs._triggerRemoved(2, 100);

      const state = service.getState();
      expect(state.global).not.toContain(2);
    });

    test("should remove window MRU list when window is closed", async () => {
      const service = createMRUTrackerService(deps);
      await service.initialize();

      mockTabs._triggerActivated(1, 100);
      mockWindows._triggerRemoved(100);

      const state = service.getState();
      expect(state.byWindow[100]).toBeUndefined();
    });
  });
});
