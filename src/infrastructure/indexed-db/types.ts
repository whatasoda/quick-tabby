/**
 * IndexedDB abstraction types for thumbnail storage
 */

export interface StoredThumbnail {
  tabId: number;
  dataUrl: string;
  capturedAt: number;
}

export interface ThumbnailConfig {
  size: number;
  captureQuality: number;
  resizeQuality: number;
  blur?: boolean;
}

export interface ThumbnailStore {
  /**
   * Initialize the database connection
   */
  init(): Promise<void>;

  /**
   * Get a thumbnail by tab ID
   */
  get(tabId: number): Promise<StoredThumbnail | undefined>;

  /**
   * Get thumbnails for multiple tabs
   */
  getMany(tabIds: number[]): Promise<Map<number, StoredThumbnail>>;

  /**
   * Store or update a thumbnail
   */
  put(thumbnail: StoredThumbnail): Promise<void>;

  /**
   * Delete a thumbnail by tab ID
   */
  delete(tabId: number): Promise<void>;

  /**
   * Remove oldest thumbnails exceeding maxCount
   */
  prune(maxCount: number): Promise<void>;

  /**
   * Delete thumbnails older than maxAge milliseconds
   * @param maxAge - Maximum age in milliseconds
   * @returns Number of deleted thumbnails
   */
  deleteExpired(maxAge: number): Promise<number>;

  /**
   * Check if the database is initialized
   */
  isInitialized(): boolean;
}
