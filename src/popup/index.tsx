import { render } from "solid-js/web";
import {
  createSignal,
  createResource,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import type {
  TabInfo,
  MessageType,
  MessageResponse,
  Settings,
} from "../shared/types.ts";
import { TabList } from "./components/TabList.tsx";
import { loadSettings, POPUP_SIZES } from "../shared/settings.ts";

async function fetchMRUTabs(
  windowOnly: boolean,
  windowId: number
): Promise<TabInfo[]> {
  const message: MessageType = { type: "GET_MRU_TABS", windowOnly, windowId };
  const response = (await chrome.runtime.sendMessage(
    message
  )) as MessageResponse;
  if (response.type === "MRU_TABS") {
    return response.tabs;
  }
  return [];
}

async function switchToTab(tabId: number): Promise<void> {
  const message: MessageType = { type: "SWITCH_TO_TAB", tabId };
  await chrome.runtime.sendMessage(message);
  window.close();
}

const MODE_STORAGE_KEY = "windowOnlyMode";

async function loadMode(): Promise<boolean> {
  const result = await chrome.storage.local.get(MODE_STORAGE_KEY);
  return result[MODE_STORAGE_KEY] ?? false;
}

async function saveMode(windowOnly: boolean): Promise<void> {
  await chrome.storage.local.set({ [MODE_STORAGE_KEY]: windowOnly });
}

function applyPopupSize(settings: Settings) {
  const size = POPUP_SIZES[settings.popupSize];
  document.documentElement.style.setProperty("--popup-width", `${size.width}px`);
  document.documentElement.style.setProperty(
    "--popup-height",
    `${size.height}px`
  );
}

function App() {
  const [windowOnly, setWindowOnly] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(1);
  const [settings, setSettings] = createSignal<Settings | null>(null);
  const [currentWindowId, setCurrentWindowId] = createSignal<number | null>(
    null
  );
  const [tabs, { refetch }] = createResource(
    () => {
      const wid = currentWindowId();
      return wid !== null ? { windowOnly: windowOnly(), windowId: wid } : null;
    },
    (params) =>
      params !== null
        ? fetchMRUTabs(params.windowOnly, params.windowId)
        : Promise.resolve([])
  );

  function toggleMode() {
    const newMode = !windowOnly();
    setWindowOnly(newMode);
    setSelectedIndex(1);
    saveMode(newMode);
  }

  function handleKeyDown(e: KeyboardEvent) {
    const tabList = tabs();
    if (!tabList || tabList.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
      case "j":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, tabList.length - 1));
        break;
      case "ArrowUp":
      case "k":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        const tab = tabList[selectedIndex()];
        if (tab) {
          switchToTab(tab.id);
        }
        break;
      case "Tab":
        e.preventDefault();
        toggleMode();
        break;
    }
  }

  function handleSelect(index: number) {
    const tabList = tabs();
    if (tabList && tabList[index]) {
      switchToTab(tabList[index].id);
    }
  }

  onMount(async () => {
    const [savedMode, currentWindow, loadedSettings] = await Promise.all([
      loadMode(),
      chrome.windows.getCurrent(),
      loadSettings(),
    ]);
    setWindowOnly(savedMode);
    setSettings(loadedSettings);
    applyPopupSize(loadedSettings);

    if (currentWindow.id !== undefined) {
      setCurrentWindowId(currentWindow.id);
    }
    document.addEventListener("keydown", handleKeyDown);

    // Capture current tab and refresh to get updated thumbnail
    const captureMessage: MessageType = {
      type: "CAPTURE_CURRENT_TAB",
      windowId: currentWindow.id,
    };
    chrome.runtime.sendMessage(captureMessage).then(() => {
      refetch();
    });
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div class="popup-container">
      <div class="header">
        <h1>QuickTabby</h1>
        <button
          class={`mode-toggle ${windowOnly() ? "active" : ""}`}
          onClick={toggleMode}
          title="Toggle window-only mode (Tab)"
        >
          {windowOnly() ? "Window" : "All"}
        </button>
      </div>

      <Show when={tabs.loading}>
        <div class="loading">Loading...</div>
      </Show>

      <Show when={!tabs.loading && tabs()}>
        {(tabList) => (
          <Show
            when={tabList().length > 0}
            fallback={<div class="empty">No recent tabs</div>}
          >
            <TabList
              tabs={tabList()}
              selectedIndex={selectedIndex()}
              onSelect={handleSelect}
            />
          </Show>
        )}
      </Show>

      <div class="footer">
        <span class="hint">
          <kbd>j</kbd>/<kbd>k</kbd> navigate
        </span>
        <span class="hint">
          <kbd>Enter</kbd> switch
        </span>
        <span class="hint">
          <kbd>Tab</kbd> toggle mode
        </span>
      </div>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}
