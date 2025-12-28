/**
 * MRU (Most Recently Used) operations
 *
 * Pure functions for manipulating MRU state.
 * These functions are side-effect free and return new state objects.
 */

import type { MRUState, MRUConfig } from "./mru-state.ts";
import { DEFAULT_MRU_CONFIG } from "./mru-state.ts";

/**
 * Add a tab to the MRU list
 *
 * @param state - Current MRU state
 * @param tabId - Tab ID to add
 * @param windowId - Window ID the tab belongs to
 * @param config - Optional MRU configuration
 * @returns New MRU state with the tab at the front
 */
export function addTabToMRU(
  state: MRUState,
  tabId: number,
  windowId: number,
  config: MRUConfig = DEFAULT_MRU_CONFIG
): MRUState {
  const { maxSize } = config;

  // Add to global list: remove existing entry, add to front, trim to max size
  const newGlobal = [
    tabId,
    ...state.global.filter((id) => id !== tabId),
  ].slice(0, maxSize);

  // Add to window-specific list
  const windowMRU = state.byWindow[windowId] ?? [];
  const newWindowMRU = [
    tabId,
    ...windowMRU.filter((id) => id !== tabId),
  ].slice(0, maxSize);

  return {
    global: newGlobal,
    byWindow: {
      ...state.byWindow,
      [windowId]: newWindowMRU,
    },
  };
}

/**
 * Remove a tab from all MRU lists
 *
 * @param state - Current MRU state
 * @param tabId - Tab ID to remove
 * @returns New MRU state with the tab removed
 */
export function removeTabFromMRU(state: MRUState, tabId: number): MRUState {
  const newGlobal = state.global.filter((id) => id !== tabId);

  const newByWindow: Record<number, number[]> = {};
  for (const [windowIdStr, tabs] of Object.entries(state.byWindow)) {
    const windowId = Number(windowIdStr);
    newByWindow[windowId] = tabs.filter((id) => id !== tabId);
  }

  return {
    global: newGlobal,
    byWindow: newByWindow,
  };
}

/**
 * Remove a window's MRU list
 *
 * @param state - Current MRU state
 * @param windowId - Window ID to remove
 * @returns New MRU state with the window removed
 */
export function removeWindowFromMRU(
  state: MRUState,
  windowId: number
): MRUState {
  const { [windowId]: _removed, ...rest } = state.byWindow;
  return {
    global: state.global,
    byWindow: rest,
  };
}

/**
 * Get the MRU list based on mode
 *
 * @param state - Current MRU state
 * @param windowOnly - If true, return window-specific list
 * @param windowId - Window ID (required if windowOnly is true)
 * @returns Array of tab IDs in MRU order
 */
export function getMRUList(
  state: MRUState,
  windowOnly: boolean,
  windowId?: number
): readonly number[] {
  if (windowOnly && windowId !== undefined) {
    return state.byWindow[windowId] ?? [];
  }
  return state.global;
}

/**
 * Get the previous tab ID (second item in MRU list)
 *
 * @param state - Current MRU state
 * @param windowOnly - If true, use window-specific list
 * @param windowId - Window ID (required if windowOnly is true)
 * @returns Previous tab ID or null if not available
 */
export function getPreviousTabId(
  state: MRUState,
  windowOnly: boolean,
  windowId?: number
): number | null {
  const list = getMRUList(state, windowOnly, windowId);
  return list[1] ?? null;
}

/**
 * Check if a tab is in the MRU list
 *
 * @param state - Current MRU state
 * @param tabId - Tab ID to check
 * @returns True if the tab is tracked in global MRU
 */
export function isTabInMRU(state: MRUState, tabId: number): boolean {
  return state.global.includes(tabId);
}

/**
 * Get the position of a tab in the MRU list
 *
 * @param state - Current MRU state
 * @param tabId - Tab ID to find
 * @param windowOnly - If true, use window-specific list
 * @param windowId - Window ID (required if windowOnly is true)
 * @returns Position (0-indexed) or -1 if not found
 */
export function getTabPosition(
  state: MRUState,
  tabId: number,
  windowOnly: boolean,
  windowId?: number
): number {
  const list = getMRUList(state, windowOnly, windowId);
  return list.indexOf(tabId);
}
