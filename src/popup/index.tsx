import { render } from "solid-js/web";
import {
  createSignal,
  createResource,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import type { TabInfo, MessageType, MessageResponse } from "../shared/types.ts";
import { TabList } from "./components/TabList.tsx";

async function fetchMRUTabs(windowOnly: boolean): Promise<TabInfo[]> {
  const message: MessageType = { type: "GET_MRU_TABS", windowOnly };
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

function App() {
  const [windowOnly, setWindowOnly] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [tabs, { refetch }] = createResource(windowOnly, fetchMRUTabs);

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
        setWindowOnly((w) => !w);
        setSelectedIndex(0);
        break;
    }
  }

  function handleSelect(index: number) {
    const tabList = tabs();
    if (tabList && tabList[index]) {
      switchToTab(tabList[index].id);
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
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
          onClick={() => {
            setWindowOnly((w) => !w);
            setSelectedIndex(0);
          }}
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
