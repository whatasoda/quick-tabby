/**
 * Thumbnail Cleanup Service
 *
 * Periodically removes expired thumbnails based on TTL settings.
 * Uses Chrome alarms API for reliable background execution.
 */

import { THUMBNAIL_TTL_MS } from "../core/settings/index.ts";
import type { ChromeAlarmsAPI } from "../infrastructure/chrome/types.ts";
import type { ThumbnailStore } from "../infrastructure/indexed-db/types.ts";
import type { SettingsService } from "./settings.service.ts";

const CLEANUP_ALARM_NAME = "thumbnail-cleanup";
const CLEANUP_PERIOD_MINUTES = 60; // Run every hour

/**
 * Thumbnail cleanup service interface
 */
export interface ThumbnailCleanupService {
  /**
   * Initialize the cleanup service and register alarms
   */
  initialize(): void;

  /**
   * Run cleanup immediately
   * @returns Number of deleted thumbnails
   */
  runCleanup(): Promise<number>;
}

/**
 * Dependencies for thumbnail cleanup service
 */
export interface ThumbnailCleanupDependencies {
  alarms: ChromeAlarmsAPI;
  thumbnailStore: ThumbnailStore;
  settingsService: SettingsService;
}

/**
 * Create a thumbnail cleanup service instance
 *
 * @param deps - Service dependencies
 * @returns Thumbnail cleanup service instance
 */
export function createThumbnailCleanupService(
  deps: ThumbnailCleanupDependencies,
): ThumbnailCleanupService {
  async function runCleanup(): Promise<number> {
    const settings = await deps.settingsService.load();
    const maxAge = THUMBNAIL_TTL_MS[settings.thumbnailTTL];
    const deleted = await deps.thumbnailStore.deleteExpired(maxAge);

    if (deleted > 0) {
      console.log(`Thumbnail cleanup: deleted ${deleted} expired thumbnail(s)`);
    }

    return deleted;
  }

  return {
    initialize(): void {
      // Register periodic alarm
      deps.alarms.create(CLEANUP_ALARM_NAME, {
        delayInMinutes: 1, // First run after 1 minute
        periodInMinutes: CLEANUP_PERIOD_MINUTES,
      });

      // Listen for alarm events
      deps.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === CLEANUP_ALARM_NAME) {
          runCleanup();
        }
      });

      console.log("Thumbnail cleanup service initialized");
    },

    runCleanup,
  };
}
