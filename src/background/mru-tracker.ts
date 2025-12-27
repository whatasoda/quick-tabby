import type { MRUState, TabInfo } from "../shared/types.ts";
import {
  captureAndStoreThumbnail,
  deleteThumbnail,
  getThumbnailsForTabs,
} from "./thumbnail-cache.ts";

const MAX_MRU_SIZE = 50;
const STORAGE_KEY = "mruState";

let state: MRUState = {
  global: [],
  byWindow: {},
};

async function saveState(): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEY]: state });
}

async function loadState(): Promise<void> {
  const result = await chrome.storage.session.get(STORAGE_KEY);
  if (result[STORAGE_KEY]) {
    state = result[STORAGE_KEY] as MRUState;
  }
}

function addToMRU(tabId: number, windowId: number): void {
  state.global = [tabId, ...state.global.filter((id) => id !== tabId)].slice(
    0,
    MAX_MRU_SIZE
  );

  if (!state.byWindow[windowId]) {
    state.byWindow[windowId] = [];
  }
  state.byWindow[windowId] = [
    tabId,
    ...state.byWindow[windowId].filter((id) => id !== tabId),
  ].slice(0, MAX_MRU_SIZE);

  saveState();
}

function removeFromMRU(tabId: number): void {
  state.global = state.global.filter((id) => id !== tabId);

  for (const windowId in state.byWindow) {
    state.byWindow[windowId] = state.byWindow[windowId].filter(
      (id) => id !== tabId
    );
  }

  saveState();
}

export function handleTabActivated(
  activeInfo: chrome.tabs.TabActiveInfo
): void {
  const { tabId, windowId } = activeInfo;
  addToMRU(tabId, windowId);

  // Capture thumbnail with delay to ensure page is rendered
  setTimeout(() => {
    captureAndStoreThumbnail(tabId, windowId);
  }, 500);
}

export function handleTabRemoved(tabId: number): void {
  removeFromMRU(tabId);
  deleteThumbnail(tabId);
}

export function handleWindowRemoved(windowId: number): void {
  delete state.byWindow[windowId];
  saveState();
}

export async function getMRUTabs(windowOnly?: boolean): Promise<TabInfo[]> {
  const currentWindow = await chrome.windows.getCurrent();
  const windowId = currentWindow.id;

  const mruList =
    windowOnly && windowId !== undefined
      ? state.byWindow[windowId] ?? []
      : state.global;

  const tabs: TabInfo[] = [];

  for (const tabId of mruList) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab && tab.id !== undefined) {
        tabs.push({
          id: tab.id,
          windowId: tab.windowId,
          title: tab.title ?? "",
          url: tab.url ?? "",
          favIconUrl: tab.favIconUrl,
        });
      }
    } catch {
      removeFromMRU(tabId);
    }
  }

  // Fetch thumbnails for all tabs
  const tabIds = tabs.map((t) => t.id);
  const thumbnails = await getThumbnailsForTabs(tabIds);

  return tabs.map((tab) => ({
    ...tab,
    thumbnailUrl: thumbnails.get(tab.id),
  }));
}

export function getPreviousTab(windowOnly?: boolean): number | null {
  const list = windowOnly
    ? Object.values(state.byWindow).flat()
    : state.global;

  return list[1] ?? null;
}

export async function getPreviousTabInWindow(
  windowId: number
): Promise<number | null> {
  const windowMRU = state.byWindow[windowId];
  if (!windowMRU || windowMRU.length < 2) {
    return null;
  }
  return windowMRU[1] ?? null;
}

export async function switchToTab(tabId: number): Promise<void> {
  const tab = await chrome.tabs.get(tabId);
  if (tab.windowId !== undefined) {
    await chrome.windows.update(tab.windowId, { focused: true });
  }
  await chrome.tabs.update(tabId, { active: true });
}

async function initializeExistingTabs(): Promise<void> {
  const windows = await chrome.windows.getAll({ populate: true });

  for (const window of windows) {
    if (window.id === undefined || !window.tabs) continue;

    for (const tab of window.tabs) {
      if (tab.id === undefined) continue;

      if (tab.active) {
        addToMRU(tab.id, window.id);
      }
    }
  }
}

export async function initializeMRUTracker(): Promise<void> {
  await loadState();

  if (state.global.length === 0) {
    await initializeExistingTabs();
  }

  chrome.tabs.onActivated.addListener(handleTabActivated);
  chrome.tabs.onRemoved.addListener(handleTabRemoved);
  chrome.windows.onRemoved.addListener(handleWindowRemoved);
}
