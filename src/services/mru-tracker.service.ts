/**
 * MRU Tracker Service
 *
 * Manages tab MRU (Most Recently Used) tracking with persistence.
 * Uses dependency injection for testability.
 */

import {
  addTabToMRU,
  DEFAULT_MRU_CONFIG,
  EMPTY_MRU_STATE,
  getMRUList,
  getPreviousTabId,
  removeTabFromMRU,
  removeWindowFromMRU,
} from "../core/mru/index.ts";
import type { MRUConfig, MRUState } from "../core/mru/mru-state.ts";
import type {
  ChromeStorageAPI,
  ChromeTabsAPI,
  ChromeWindowsAPI,
  TabActiveInfo,
} from "../infrastructure/chrome/types.ts";
import type { ThumbnailCacheService } from "./thumbnail-cache.service.ts";

const STORAGE_KEY = "mruState";
const THUMBNAIL_CAPTURE_DELAY = 200;

/**
 * Tab info with optional thumbnail URL
 */
export interface MRUTabInfo {
  id: number;
  windowId: number;
  index: number;
  title: string;
  url: string;
  favIconUrl?: string;
  thumbnailUrl?: string;
}

/**
 * MRU Tracker service interface
 */
export interface MRUTrackerService {
  /**
   * Initialize the tracker and set up event listeners
   */
  initialize(): Promise<void>;

  /**
   * Get MRU tabs list
   */
  getMRUTabs(windowOnly: boolean, senderWindowId?: number): Promise<MRUTabInfo[]>;

  /**
   * Switch to a specific tab
   */
  switchToTab(tabId: number): Promise<void>;

  /**
   * Get the previous tab ID (second in MRU list)
   */
  getPreviousTab(windowOnly: boolean): number | null;

  /**
   * Get the previous tab ID for a specific window
   */
  getPreviousTabInWindow(windowId: number): number | null;

  /**
   * Get current MRU state (for testing/debugging)
   */
  getState(): MRUState;
}

/**
 * Dependencies for MRU tracker service
 */
export interface MRUTrackerDependencies {
  storage: ChromeStorageAPI;
  tabs: ChromeTabsAPI;
  windows: ChromeWindowsAPI;
  thumbnailCache: ThumbnailCacheService;
  config?: MRUConfig;
}

/**
 * Create an MRU tracker service instance
 *
 * @param deps - Service dependencies
 * @returns MRU tracker service instance
 */
export function createMRUTrackerService(deps: MRUTrackerDependencies): MRUTrackerService {
  const config = deps.config ?? DEFAULT_MRU_CONFIG;
  let state: MRUState = EMPTY_MRU_STATE;

  async function saveState(): Promise<void> {
    await deps.storage.session.set({ [STORAGE_KEY]: state });
  }

  async function loadState(): Promise<void> {
    const result = await deps.storage.session.get<MRUState>(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    if (stored) {
      state = stored;
    }
  }

  function handleTabActivated(activeInfo: TabActiveInfo): void {
    const { tabId, windowId } = activeInfo;
    state = addTabToMRU(state, tabId, windowId, config);
    saveState();

    // Capture thumbnail with delay to ensure page is rendered
    setTimeout(() => {
      deps.thumbnailCache.captureAndStore(tabId, windowId);
    }, THUMBNAIL_CAPTURE_DELAY);
  }

  function handleTabRemoved(tabId: number): void {
    state = removeTabFromMRU(state, tabId);
    saveState();
    deps.thumbnailCache.delete(tabId);
  }

  function handleWindowRemoved(windowId: number): void {
    state = removeWindowFromMRU(state, windowId);
    saveState();
  }

  async function initializeExistingTabs(): Promise<void> {
    const windows = await deps.windows.getAll({ populate: true });

    for (const window of windows) {
      if (window.id === undefined || !window.tabs) continue;

      // Sort tabs: inactive tabs by index first, then active tab last
      // This ensures active tab ends up at the front of MRU (added last)
      const sortedTabs = [...window.tabs].sort((a, b) => {
        if (a.active) return 1;
        if (b.active) return -1;
        return (a.index ?? 0) - (b.index ?? 0);
      });

      for (const tab of sortedTabs) {
        if (tab.id === undefined) continue;
        state = addTabToMRU(state, tab.id, window.id, config);
      }
    }

    await saveState();
  }

  return {
    async initialize(): Promise<void> {
      await loadState();

      if (state.global.length === 0) {
        await initializeExistingTabs();
      }

      deps.tabs.onActivated.addListener(handleTabActivated);
      deps.tabs.onRemoved.addListener(handleTabRemoved);
      deps.windows.onRemoved.addListener(handleWindowRemoved);
    },

    async getMRUTabs(windowOnly: boolean, senderWindowId?: number): Promise<MRUTabInfo[]> {
      // Get window ID if not provided
      const windowId = senderWindowId ?? (await deps.windows.getCurrent()).id;

      const mruList = getMRUList(state, windowOnly, windowId);
      const tabs: MRUTabInfo[] = [];

      // Fetch tab info for each tab in MRU list
      for (const tabId of mruList) {
        try {
          const tab = await deps.tabs.get(tabId);
          if (tab && tab.id !== undefined) {
            tabs.push({
              id: tab.id,
              windowId: tab.windowId,
              index: tab.index,
              title: tab.title ?? "",
              url: tab.url ?? "",
              favIconUrl: tab.favIconUrl,
            });
          }
        } catch {
          // Tab no longer exists, remove from MRU
          state = removeTabFromMRU(state, tabId);
          saveState();
        }
      }

      // Fetch thumbnails for all tabs
      const tabIds = tabs.map((t) => t.id);
      const thumbnails = await deps.thumbnailCache.getThumbnailsForTabs(tabIds);

      return tabs.map((tab) => ({
        ...tab,
        thumbnailUrl: thumbnails.get(tab.id),
      }));
    },

    async switchToTab(tabId: number): Promise<void> {
      const tab = await deps.tabs.get(tabId);
      if (tab.windowId !== undefined) {
        await deps.windows.update(tab.windowId, { focused: true });
      }
      await deps.tabs.update(tabId, { active: true });
    },

    getPreviousTab(windowOnly: boolean): number | null {
      return getPreviousTabId(state, windowOnly);
    },

    getPreviousTabInWindow(windowId: number): number | null {
      return getPreviousTabId(state, true, windowId);
    },

    getState(): MRUState {
      return state;
    },
  };
}
