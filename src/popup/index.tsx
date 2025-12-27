import { render } from "solid-js/web";
import {
  createSignal,
  createResource,
  createMemo,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import "./index.css";
import { css } from "../../styled-system/css";
import type {
  TabInfo,
  MessageType,
  MessageResponse,
  Settings,
} from "../shared/types.ts";
import { TabList } from "./components/TabList.tsx";
import {
  loadSettings,
  POPUP_SIZES,
  getPreviewWidth,
  getTabListWidth,
  getMaxPopupWidth,
  THUMBNAIL_QUALITIES,
  matchesKeybinding,
} from "../shared/settings.ts";

const styles = {
  popupContainer: css({
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }),
  popupContainerPreviewEnabled: css({
    flexDirection: "row",
  }),
  mainContent: css({
    width: "var(--tab-list-width)",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  }),
  previewPanel: css({
    width: "var(--preview-width, 180px)",
    maxHeight: "var(--popup-height)",
    background: "surfaceAlt",
    padding: "md",
    flexShrink: 0,
    borderRight: "1px solid token(colors.border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  }),
  previewThumbnail: css({
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    maxHeight: "calc(var(--popup-height) - 80px)",
    objectFit: "contain",
    borderRadius: "lg",
    background: "background",
    boxShadow: "sm",
    filter: "blur(0.5px)",
  }),
  previewPlaceholder: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "14 / 9",
    background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
    borderRadius: "lg",
  }),
  previewFavicon: css({
    width: "32px",
    height: "32px",
    opacity: 0.5,
  }),
  previewNoThumbnail: css({
    marginTop: "sm",
    fontSize: "sm",
    color: "text.muted",
  }),
  previewInfo: css({
    marginTop: "sm",
    height: "56px",
    flexShrink: 0,
  }),
  previewTitle: css({
    fontWeight: 500,
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  }),
  previewUrl: css({
    fontSize: "sm",
    color: "text.secondary",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "2px",
  }),
  header: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "md lg",
    borderBottom: "1px solid token(colors.border)",
  }),
  modeToggle: css({
    padding: "4px 12px",
    border: "1px solid #ddd",
    borderRadius: "full",
    background: "surface",
    fontSize: "sm",
    cursor: "pointer",
    transition: "all 0.15s",
    _hover: {
      background: "surfaceHover",
    },
  }),
  modeToggleActive: css({
    background: "primary",
    borderColor: "primary",
    color: "white",
  }),
  loading: css({
    padding: "xl",
    textAlign: "center",
    color: "text.secondary",
  }),
  empty: css({
    padding: "xl",
    textAlign: "center",
    color: "text.secondary",
  }),
  footer: css({
    display: "flex",
    justifyContent: "center",
    gap: "lg",
    padding: "sm lg",
    borderTop: "1px solid token(colors.border)",
    background: "surfaceAlt",
  }),
  hint: css({
    fontSize: "sm",
    color: "text.secondary",
  }),
  kbd: css({
    display: "inline-block",
    padding: "2px 6px",
    fontFamily: "monospace",
    fontSize: "xs",
    background: "surfaceHover",
    borderRadius: "sm",
    margin: "0 2px",
  }),
};

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
  const tabListWidth = getTabListWidth();
  const previewWidth = getPreviewWidth();

  const totalWidth = settings.previewModeEnabled
    ? getMaxPopupWidth()
    : tabListWidth;

  document.documentElement.style.setProperty("--popup-width", `${totalWidth}px`);
  document.documentElement.style.setProperty("--popup-height", `${size.height}px`);
  document.documentElement.style.setProperty("--preview-width", `${previewWidth}px`);
  document.documentElement.style.setProperty("--tab-list-width", `${tabListWidth}px`);
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

  // Get selected tab for preview display
  const selectedTab = createMemo(() => {
    const tabList = tabs();
    const index = selectedIndex();
    return tabList?.[index] ?? null;
  });

  function toggleMode() {
    const newMode = !windowOnly();
    setWindowOnly(newMode);
    setSelectedIndex(1);
    saveMode(newMode);
  }

  function handleKeyDown(e: KeyboardEvent) {
    const tabList = tabs();
    const currentSettings = settings();
    if (!tabList || tabList.length === 0 || !currentSettings) return;

    const { keybindings } = currentSettings;

    // Also allow arrow keys as built-in navigation
    if (
      matchesKeybinding(e, keybindings.moveDown) ||
      e.key === "ArrowDown"
    ) {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, tabList.length - 1));
      return;
    }

    if (
      matchesKeybinding(e, keybindings.moveUp) ||
      e.key === "ArrowUp"
    ) {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (matchesKeybinding(e, keybindings.confirm)) {
      e.preventDefault();
      const tab = tabList[selectedIndex()];
      if (tab) {
        switchToTab(tab.id);
      }
      return;
    }

    if (matchesKeybinding(e, keybindings.cancel)) {
      e.preventDefault();
      window.close();
      return;
    }

    if (
      currentSettings.enableModeToggle &&
      matchesKeybinding(e, keybindings.toggleMode)
    ) {
      e.preventDefault();
      toggleMode();
      return;
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
    const thumbnailConfig = THUMBNAIL_QUALITIES[loadedSettings.thumbnailQuality];
    const captureMessage: MessageType = {
      type: "CAPTURE_CURRENT_TAB",
      windowId: currentWindow.id,
      thumbnailConfig,
    };
    chrome.runtime.sendMessage(captureMessage).then(() => {
      refetch();
    });
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  const isPreviewEnabled = () => settings()?.previewModeEnabled ?? false;

  return (
    <div class={`${styles.popupContainer} ${isPreviewEnabled() ? styles.popupContainerPreviewEnabled : ""}`}>
      <Show when={isPreviewEnabled()}>
        <div class={styles.previewPanel}>
          <Show
            when={selectedTab()}
            fallback={
              <div class={styles.previewPlaceholder}>
                <div class={styles.previewNoThumbnail}>Select a tab to preview</div>
              </div>
            }
          >
            {(tab) => (
              <>
                <Show
                  when={tab().thumbnailUrl}
                  fallback={
                    <div class={styles.previewPlaceholder}>
                      <img
                        class={styles.previewFavicon}
                        src={tab().favIconUrl || ""}
                        alt=""
                      />
                      <div class={styles.previewNoThumbnail}>No preview available</div>
                    </div>
                  }
                >
                  <img
                    class={styles.previewThumbnail}
                    src={tab().thumbnailUrl}
                    alt={tab().title}
                  />
                </Show>
                <div class={styles.previewInfo}>
                  <div class={styles.previewTitle}>{tab().title}</div>
                  <div class={styles.previewUrl}>{tab().url}</div>
                </div>
              </>
            )}
          </Show>
        </div>
      </Show>

      <div class={styles.mainContent}>
        <Show when={settings()?.enableModeToggle}>
          <div class={styles.header}>
            <button
              class={`${styles.modeToggle} ${windowOnly() ? styles.modeToggleActive : ""}`}
              onClick={toggleMode}
              title="Toggle window-only mode (Tab)"
            >
              {windowOnly() ? "Window" : "All"}
            </button>
          </div>
        </Show>

        <Show when={tabs.loading}>
          <div class={styles.loading}>Loading...</div>
        </Show>

        <Show when={!tabs.loading && tabs()}>
          {(tabList) => (
            <Show
              when={tabList().length > 0}
              fallback={<div class={styles.empty}>No recent tabs</div>}
            >
              <TabList
                tabs={tabList()}
                selectedIndex={selectedIndex()}
                onSelect={handleSelect}
              />
            </Show>
          )}
        </Show>

        <div class={styles.footer}>
          <span class={styles.hint}>
            <span class={styles.kbd}>j</span>/<span class={styles.kbd}>k</span> navigate
          </span>
          <span class={styles.hint}>
            <span class={styles.kbd}>Enter</span> switch
          </span>
          <span class={styles.hint}>
            <span class={styles.kbd}>Tab</span> toggle mode
          </span>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}
