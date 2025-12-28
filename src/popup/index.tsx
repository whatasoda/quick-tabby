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
import type { Settings } from "../core/settings/settings-types.ts";
import { TabList } from "./components/TabList.tsx";
import { KeybindingsModal } from "./components/KeybindingsModal.tsx";
import { PreviewPanel } from "./components/PreviewPanel.tsx";
import { FiHelpCircle, FiSettings } from "solid-icons/fi";
import { loadSettings } from "../shared/settings.ts";
import {
  POPUP_SIZES,
  getPreviewWidth,
  getTabListWidth,
  getMaxPopupWidth,
  THUMBNAIL_QUALITIES,
} from "../core/settings/settings-defaults.ts";
import { matchesAnyKeybinding } from "../core/keybindings/keybinding-matcher.ts";
import { createThemeControl } from "../shared/theme.ts";
import {
  getMRUTabs,
  switchToTab,
  captureCurrentTab,
  getLaunchInfo,
  clearLaunchInfo,
  connectPopup,
  openOptionsPage,
  getCurrentWindow,
} from "../infrastructure/chrome/messaging.ts";
import {
  loadWindowOnlyMode,
  saveWindowOnlyMode,
} from "../infrastructure/chrome/mode-storage.ts";

const styles = {
  popupContainer: css({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  }),
  popupContainerPreviewEnabled: css({
    flexDirection: "row",
  }),
  mainContent: css({
    width: "var(--tab-list-width)",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
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
    borderTop: "1px solid token(colors.border)",
    background: "surfaceAlt",
    marginTop: "auto",
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
    padding: "8px 12px",
    borderRadius: "md",
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
    width: "32px",
    height: "32px",
    padding: "8px",
    border: "none",
    background: "transparent",
    borderRadius: "md",
    cursor: "pointer",
    color: "text.secondary",
    transition: "all 0.15s",
    _hover: {
      background: "surfaceHover",
      color: "text.primary",
    },
  }),
};

function applyPopupSize(settings: Settings) {
  const size = POPUP_SIZES[settings.popupSize];
  const tabListWidth = getTabListWidth();
  const previewWidth = getPreviewWidth();

  const totalWidth = settings.previewModeEnabled
    ? getMaxPopupWidth()
    : tabListWidth;

  document.documentElement.style.setProperty(
    "--popup-width",
    `${totalWidth}px`
  );
  document.documentElement.style.setProperty(
    "--popup-height",
    `${size.height}px`
  );
  document.documentElement.style.setProperty(
    "--preview-width",
    `${previewWidth}px`
  );
  document.documentElement.style.setProperty(
    "--tab-list-width",
    `${tabListWidth}px`
  );
}

export function App() {
  const [windowOnly, setWindowOnly] = createSignal(false);
  const [selectedIndex, setSelectedIndex] = createSignal(1);
  const [settings, setSettings] = createSignal<Settings | null>(null);
  const [showKeybindingsModal, setShowKeybindingsModal] = createSignal(false);
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
        ? getMRUTabs(params.windowOnly, params.windowId)
        : Promise.resolve([])
  );
  const themeControl = createMemo(createThemeControl);

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
    saveWindowOnlyMode(newMode);
  }

  function handleKeyDown(e: KeyboardEvent) {
    const tabList = tabs();
    const currentSettings = settings();
    if (!currentSettings || !tabList || tabList.length === 0) return;

    const { keybindings } = currentSettings;

    // Also allow arrow keys as built-in navigation
    if (
      matchesAnyKeybinding(e, keybindings.moveDown) ||
      e.key === "ArrowDown"
    ) {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, tabList.length - 1));
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.moveUp) || e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.confirm)) {
      e.preventDefault();
      const tab = tabList[selectedIndex()];
      if (tab) {
        switchToTab(tab.id);
      }
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.cancel)) {
      e.preventDefault();
      window.close();
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.toggleMode)) {
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

  function handleOpenSettings() {
    openOptionsPage();
  }

  let port: chrome.runtime.Port | undefined;

  // Handle close popup message from background
  function handlePortMessage(message: {
    type: string;
    selectFocused?: boolean;
  }) {
    if (message.type === "CLOSE_POPUP") {
      if (message.selectFocused) {
        const tabList = tabs();
        const tab = tabList?.[selectedIndex()];
        if (tab) {
          switchToTab(tab.id);
          return;
        }
      }
      window.close();
    }
  }

  onMount(async () => {
    // Connect to background to track popup state
    port = connectPopup();
    port.onMessage.addListener(handlePortMessage);

    const [currentWindow, loadedSettings] = await Promise.all([
      getCurrentWindow(),
      loadSettings(),
    ]);

    // Check for launch info (from mode-fixed shortcuts)
    const launchInfo = await getLaunchInfo();

    let initialWindowOnly = false;

    if (launchInfo?.mode !== null && launchInfo?.mode !== undefined) {
      // Use the override mode from shortcut
      initialWindowOnly = launchInfo.mode === "currentWindow";
      // Clear the info after use
      await clearLaunchInfo();
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
          initialWindowOnly = await loadWindowOnlyMode();
          break;
      }
    }

    setWindowOnly(initialWindowOnly);
    setSettings(loadedSettings);
    applyPopupSize(loadedSettings);
    themeControl().applyTheme(loadedSettings.themePreference);

    if (currentWindow.id !== undefined) {
      setCurrentWindowId(currentWindow.id);
    }
    document.addEventListener("keydown", handleKeyDown);

    // Capture current tab and refresh to get updated thumbnail
    const thumbnailConfig =
      THUMBNAIL_QUALITIES[loadedSettings.thumbnailQuality];
    captureCurrentTab(currentWindow.id, thumbnailConfig).then(() => {
      refetch();
    });
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
    port?.disconnect();
    themeControl().cleanup();
  });

  const isPreviewEnabled = () => settings()?.previewModeEnabled ?? false;

  return (
    <div
      class={`${styles.popupContainer} ${isPreviewEnabled() ? styles.popupContainerPreviewEnabled : ""}`}
    >
      <Show when={isPreviewEnabled()}>
        <PreviewPanel selectedTab={selectedTab()} />
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
              onClick={handleOpenSettings}
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
            onOpenSettings={handleOpenSettings}
          />
        )}
      </Show>
    </div>
  );
}
