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
  CommandName,
  Keybinding,
} from "../shared/types.ts";
import { TabList } from "./components/TabList.tsx";
import { KeybindingsModal } from "./components/KeybindingsModal.tsx";
import { FiHelpCircle, FiSettings } from "solid-icons/fi";
import {
  loadSettings,
  POPUP_SIZES,
  getPreviewWidth,
  getTabListWidth,
  getMaxPopupWidth,
  THUMBNAIL_QUALITIES,
  matchesKeybinding,
  applyTheme,
  setupThemeListener,
  parseShortcut,
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
    background: "linear-gradient(135deg, token(colors.surface) 0%, token(colors.surfaceHover) 100%)",
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: "xs sm",
    borderTop: "1px solid token(colors.border)",
    background: "surfaceAlt",
  }),
  footerLeft: css({
    display: "flex",
    alignItems: "center",
  }),
  footerRight: css({
    display: "flex",
    alignItems: "center",
    gap: "xs",
  }),
  modeIndicator: css({
    fontSize: "sm",
    color: "text.secondary",
    cursor: "pointer",
    padding: "xs sm",
    borderRadius: "sm",
    transition: "all 0.15s",
    userSelect: "none",
    _hover: {
      background: "surfaceHover",
      color: "text.primary",
    },
  }),
  iconButton: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    padding: 0,
    border: "none",
    background: "transparent",
    borderRadius: "sm",
    cursor: "pointer",
    color: "text.secondary",
    transition: "all 0.15s",
    _hover: {
      background: "surfaceHover",
      color: "text.primary",
    },
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
  const [showKeybindingsModal, setShowKeybindingsModal] = createSignal(false);
  const [currentWindowId, setCurrentWindowId] = createSignal<number | null>(
    null
  );
  const [launchCommand, setLaunchCommand] = createSignal<CommandName>("_execute_action");
  const [launchShortcut, setLaunchShortcut] = createSignal<Keybinding | null>(null);
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
    if (!currentSettings) return;

    // Check for shortcut re-press (close popup)
    const shortcut = launchShortcut();
    if (shortcut && matchesKeybinding(e, shortcut)) {
      e.preventDefault();
      const cmd = launchCommand();
      const cmdSettings = currentSettings.commandSettings[cmd];
      if (cmdSettings?.selectOnClose && tabList && tabList.length > 0) {
        // Select focused tab before closing
        const tab = tabList[selectedIndex()];
        if (tab) {
          switchToTab(tab.id); // switchToTab closes the window
          return;
        }
      }
      window.close();
      return;
    }

    if (!tabList || tabList.length === 0) return;

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

    if (matchesKeybinding(e, keybindings.toggleMode)) {
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

  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  let cleanupThemeListener: (() => void) | undefined;

  onMount(async () => {
    const [currentWindow, loadedSettings, commands] = await Promise.all([
      chrome.windows.getCurrent(),
      loadSettings(),
      chrome.commands.getAll(),
    ]);

    // Check for launch info (from mode-fixed shortcuts)
    const launchInfoResponse = await chrome.runtime.sendMessage({
      type: "GET_LAUNCH_INFO",
    }) as MessageResponse;

    let initialWindowOnly = false;
    let command: CommandName = "_execute_action";

    if (
      launchInfoResponse.type === "LAUNCH_INFO" &&
      launchInfoResponse.info.command !== null
    ) {
      // Use the command from launch info
      command = launchInfoResponse.info.command;
      // Use the override mode
      if (launchInfoResponse.info.mode !== null) {
        initialWindowOnly = launchInfoResponse.info.mode === "currentWindow";
      }
      // Clear the info after use
      await chrome.runtime.sendMessage({ type: "CLEAR_LAUNCH_INFO" });
    } else {
      // Opened via _execute_action (direct popup open)
      // Determine initial mode based on defaultMode setting
      switch (loadedSettings.defaultMode) {
        case "all":
          initialWindowOnly = false;
          break;
        case "currentWindow":
          initialWindowOnly = true;
          break;
        case "lastUsed":
          initialWindowOnly = await loadMode();
          break;
      }
    }

    setLaunchCommand(command);

    // Get the shortcut for the launch command
    const cmd = commands.find(c => c.name === command);
    if (cmd?.shortcut) {
      setLaunchShortcut(parseShortcut(cmd.shortcut));
    }

    setWindowOnly(initialWindowOnly);
    setSettings(loadedSettings);
    applyPopupSize(loadedSettings);
    applyTheme(loadedSettings.themePreference);
    cleanupThemeListener = setupThemeListener(
      loadedSettings.themePreference,
      () => applyTheme(loadedSettings.themePreference)
    );

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
    cleanupThemeListener?.();
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
                showTabIndex={windowOnly()}
              />
            </Show>
          )}
        </Show>

        <div class={styles.footer}>
          <div class={styles.footerLeft}>
            <span
              class={styles.modeIndicator}
              onClick={toggleMode}
              title="Click to toggle mode"
            >
              {windowOnly() ? "Current Window" : "All Windows"}
            </span>
          </div>
          <div class={styles.footerRight}>
            <button
              class={styles.iconButton}
              onClick={() => setShowKeybindingsModal(true)}
              title="キーボードショートカット"
            >
              <FiHelpCircle size={16} />
            </button>
            <button
              class={styles.iconButton}
              onClick={openSettings}
              title="設定"
            >
              <FiSettings size={16} />
            </button>
          </div>
        </div>
      </div>

      <Show when={showKeybindingsModal() && settings()}>
        {(currentSettings) => (
          <KeybindingsModal
            settings={currentSettings()}
            onClose={() => setShowKeybindingsModal(false)}
            onOpenSettings={openSettings}
          />
        )}
      </Show>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}
