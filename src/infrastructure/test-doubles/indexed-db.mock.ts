/**
 * IndexedDB Test Doubles
 *
 * Mock implementations of ThumbnailStore for unit testing.
 */

import type { StoredThumbnail, ThumbnailStore } from "../indexed-db/types.ts";

/**
 * Create a mock thumbnail store for testing
 */
export function createMockThumbnailStore(): ThumbnailStore & {
  _thumbnails: Map<number, StoredThumbnail>;
  _initialized: boolean;
  _clear: () => void;
} {
  const thumbnails = new Map<number, StoredThumbnail>();
  let initialized = false;

  return {
    _thumbnails: thumbnails,
    _initialized: initialized,
    _clear: () => {
      thumbnails.clear();
      initialized = false;
    },

    isInitialized(): boolean {
      return initialized;
    },

    async init(): Promise<void> {
      initialized = true;
    },

    async get(tabId: number): Promise<StoredThumbnail | undefined> {
      return thumbnails.get(tabId);
    },

    async getMany(tabIds: number[]): Promise<Map<number, StoredThumbnail>> {
      const result = new Map<number, StoredThumbnail>();
      for (const tabId of tabIds) {
        const thumbnail = thumbnails.get(tabId);
        if (thumbnail) {
          result.set(tabId, thumbnail);
        }
      }
      return result;
    },

    async put(thumbnail: StoredThumbnail): Promise<void> {
      thumbnails.set(thumbnail.tabId, thumbnail);
    },

    async delete(tabId: number): Promise<void> {
      thumbnails.delete(tabId);
    },

    async prune(maxCount: number): Promise<void> {
      if (thumbnails.size <= maxCount) return;

      // Sort by capturedAt and keep newest
      const sorted = [...thumbnails.entries()].sort((a, b) => b[1].capturedAt - a[1].capturedAt);

      thumbnails.clear();
      for (const [tabId, thumbnail] of sorted.slice(0, maxCount)) {
        thumbnails.set(tabId, thumbnail);
      }
    },
  };
}
