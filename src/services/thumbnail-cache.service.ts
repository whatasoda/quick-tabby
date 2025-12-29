/**
 * Thumbnail Cache Service
 *
 * Manages tab thumbnail capturing and caching with IndexedDB.
 * Uses dependency injection for testability.
 */

import { stackBlur } from "../core/image/index.ts";
import type { ChromeTabsAPI } from "../infrastructure/chrome/types.ts";
import type {
  StoredThumbnail,
  ThumbnailConfig,
  ThumbnailStore,
} from "../infrastructure/indexed-db/types.ts";

/** Blur radius for privacy blur feature */
const BLUR_RADIUS = 12;

const DEFAULT_THUMBNAIL_CONFIG: ThumbnailConfig = {
  size: 200,
  captureQuality: 70,
  resizeQuality: 0.8,
};

const MAX_THUMBNAILS = 100;

/**
 * Thumbnail cache service interface
 */
export interface ThumbnailCacheService {
  /**
   * Initialize the thumbnail cache
   */
  initialize(): Promise<void>;

  /**
   * Capture and store a thumbnail for a tab
   */
  captureAndStore(tabId: number, windowId: number, config?: ThumbnailConfig): Promise<void>;

  /**
   * Get a thumbnail URL for a tab
   */
  getThumbnail(tabId: number): Promise<string | null>;

  /**
   * Get thumbnails for multiple tabs
   */
  getThumbnailsForTabs(tabIds: number[]): Promise<Map<number, string>>;

  /**
   * Delete a thumbnail
   */
  delete(tabId: number): Promise<void>;
}

/**
 * Dependencies for thumbnail cache service
 */
export interface ThumbnailCacheDependencies {
  tabs: ChromeTabsAPI;
  thumbnailStore: ThumbnailStore;
}

/**
 * Create a thumbnail cache service instance
 *
 * @param deps - Service dependencies
 * @returns Thumbnail cache service instance
 */
export function createThumbnailCacheService(
  deps: ThumbnailCacheDependencies,
): ThumbnailCacheService {
  return {
    async initialize(): Promise<void> {
      await deps.thumbnailStore.init();
    },

    async captureAndStore(
      tabId: number,
      windowId: number,
      config?: ThumbnailConfig,
    ): Promise<void> {
      if (!deps.thumbnailStore.isInitialized()) return;

      const { size, captureQuality, resizeQuality, blur } = config ?? DEFAULT_THUMBNAIL_CONFIG;

      try {
        const dataUrl = await deps.tabs.captureVisibleTab(windowId, {
          format: "jpeg",
          quality: captureQuality,
        });

        const resized = await resizeImage(dataUrl, size, resizeQuality, blur);

        const thumbnail: StoredThumbnail = {
          tabId,
          dataUrl: resized,
          capturedAt: Date.now(),
        };

        await deps.thumbnailStore.put(thumbnail);
        await deps.thumbnailStore.prune(MAX_THUMBNAILS);
      } catch {
        // Silently fail - some pages cannot be captured (chrome://, etc.)
      }
    },

    async getThumbnail(tabId: number): Promise<string | null> {
      const thumbnail = await deps.thumbnailStore.get(tabId);
      return thumbnail?.dataUrl ?? null;
    },

    async getThumbnailsForTabs(tabIds: number[]): Promise<Map<number, string>> {
      const thumbnails = await deps.thumbnailStore.getMany(tabIds);
      const result = new Map<number, string>();
      for (const [tabId, thumbnail] of thumbnails) {
        result.set(tabId, thumbnail.dataUrl);
      }
      return result;
    },

    async delete(tabId: number): Promise<void> {
      await deps.thumbnailStore.delete(tabId);
    },
  };
}

// =============================================================================
// Image Processing Utilities
// =============================================================================

/**
 * Resize an image to specified dimensions and optionally apply blur
 */
async function resizeImage(
  dataUrl: string,
  size: number,
  quality: number,
  blur?: boolean,
): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const aspectRatio = bitmap.width / bitmap.height;
  const width = aspectRatio > 1 ? size : Math.round(size * aspectRatio);
  const height = aspectRatio > 1 ? Math.round(size / aspectRatio) : size;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Apply blur if enabled
  if (blur) {
    const imageData = ctx.getImageData(0, 0, width, height);
    stackBlur(imageData.data, width, height, BLUR_RADIUS);
    ctx.putImageData(imageData, 0, 0);
  }

  const resizedBlob = await canvas.convertToBlob({
    type: "image/jpeg",
    quality,
  });
  return blobToDataUrl(resizedBlob);
}

/**
 * Convert a Blob to a data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
