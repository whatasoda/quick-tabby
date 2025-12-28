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
import { Footer } from "./components/Footer.tsx";
import { PopupWindow } from "./components/PopupWindow.tsx";
import { usePopupKeyboard } from "./hooks/usePopupKeyboard.ts";
import { loadSettings } from "../shared/settings.ts";
import { THUMBNAIL_QUALITIES } from "../core/settings/settings-defaults.ts";
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
  empty: css({
    padding: "xl",
    textAlign: "center",
    color: "text.secondary",
  }),
};

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

  // Keyboard handling via hook
  usePopupKeyboard({
    settings,
    onMoveDown: () => {
      const tabList = tabs();
      if (tabList) {
        setSelectedIndex((i) => Math.min(i + 1, tabList.length - 1));
      }
    },
    onMoveUp: () => {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    },
    onConfirm: () => {
      const tabList = tabs();
      const tab = tabList?.[selectedIndex()];
      if (tab) {
        switchToTab(tab.id);
      }
    },
    onCancel: () => {
      window.close();
    },
    onToggleMode: toggleMode,
  });

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
    themeControl().applyTheme(loadedSettings.themePreference);

    if (currentWindow.id !== undefined) {
      setCurrentWindowId(currentWindow.id);
    }

    // Capture current tab and refresh to get updated thumbnail
    const thumbnailConfig =
      THUMBNAIL_QUALITIES[loadedSettings.thumbnailQuality];
    captureCurrentTab(currentWindow.id, thumbnailConfig).then(() => {
      refetch();
    });
  });

  onCleanup(() => {
    port?.disconnect();
    themeControl().cleanup();
  });

  const isPreviewEnabled = () => settings()?.previewModeEnabled ?? false;

  return (
    <PopupWindow settings={settings()}>
      <div
        class={`${styles.popupContainer} ${isPreviewEnabled() ? styles.popupContainerPreviewEnabled : ""}`}
      >
        <Show when={isPreviewEnabled()}>
          <PreviewPanel selectedTab={selectedTab()} />
        </Show>

        <div class={styles.mainContent}>
          <Show
            when={tabs()}
            fallback={<div class={styles.empty}>Loading tabs...</div>}
          >
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

          <Footer
            windowOnly={windowOnly()}
            onToggleMode={toggleMode}
            onOpenKeybindings={() => setShowKeybindingsModal(true)}
            onOpenSettings={handleOpenSettings}
          />
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
    </PopupWindow>
  );
}
