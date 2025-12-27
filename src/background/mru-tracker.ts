import type { MRUState, TabInfo } from "../shared/types.ts";

const MIN_DWELL_TIME = 750;
const MAX_MRU_SIZE = 50;

let state: MRUState = {
  global: [],
  byWindow: {},
};

let lastActivatedTabId: number | null = null;
let lastActivatedTime = 0;
let pendingAddTimeout: ReturnType<typeof setTimeout> | null = null;

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
}

function removeFromMRU(tabId: number): void {
  state.global = state.global.filter((id) => id !== tabId);

  for (const windowId in state.byWindow) {
    state.byWindow[windowId] = state.byWindow[windowId].filter(
      (id) => id !== tabId
    );
  }
}

function scheduleAddTab(tabId: number, windowId: number): void {
  if (pendingAddTimeout) {
    clearTimeout(pendingAddTimeout);
  }

  pendingAddTimeout = setTimeout(() => {
    addToMRU(tabId, windowId);
    pendingAddTimeout = null;
  }, MIN_DWELL_TIME);
}

export function handleTabActivated(
  activeInfo: chrome.tabs.TabActiveInfo
): void {
  const now = Date.now();
  const { tabId, windowId } = activeInfo;

  if (lastActivatedTabId !== null && now - lastActivatedTime >= MIN_DWELL_TIME) {
    if (pendingAddTimeout) {
      clearTimeout(pendingAddTimeout);
      pendingAddTimeout = null;
    }
    addToMRU(lastActivatedTabId, windowId);
  }

  lastActivatedTabId = tabId;
  lastActivatedTime = now;
  scheduleAddTab(tabId, windowId);
}

export function handleTabRemoved(tabId: number): void {
  removeFromMRU(tabId);

  if (lastActivatedTabId === tabId) {
    lastActivatedTabId = null;
    if (pendingAddTimeout) {
      clearTimeout(pendingAddTimeout);
      pendingAddTimeout = null;
    }
  }
}

export function handleWindowRemoved(windowId: number): void {
  delete state.byWindow[windowId];
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

  return tabs;
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

export function initializeMRUTracker(): void {
  chrome.tabs.onActivated.addListener(handleTabActivated);
  chrome.tabs.onRemoved.addListener(handleTabRemoved);
  chrome.windows.onRemoved.addListener(handleWindowRemoved);
}
