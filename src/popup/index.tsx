import { createSignal, createResource, createMemo, Show } from "solid-js";
import "./index.css";
import { css } from "../../styled-system/css";
import { TabList } from "./components/TabList";
import { KeybindingsModal } from "./components/KeybindingsModal";
import { PreviewPanel } from "./components/PreviewPanel";
import { Footer } from "./components/Footer";
import { PopupWindow } from "./components/PopupWindow";
import { usePopupKeyboard } from "./hooks/usePopupKeyboard";
import { usePopupPort } from "./hooks/usePopupPort";
import { loadSettings } from "../shared/settings";
import {
  switchToTab,
  openOptionsPage,
  getWindowInstance,
} from "../infrastructure/chrome/messaging";
import { useCaptureScreenshot } from "./hooks/useCaptureScreenShot";
import { useDisplayModeControl } from "./hooks/useDisplayModeControl";
import { useTabs } from "./hooks/useTabs";

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
  const [getSelectedIndex, setSelectedIndex] = createSignal(1);
  const [getShouldShowKeybindingsModal, setShouldShowKeybindingsModal] =
    createSignal(false);

  const [settings] = createResource(loadSettings);
  const [windowInstance] = createResource(getWindowInstance);

  const { displayMode, toggleMode } = useDisplayModeControl({
    settings: settings,
    onToggleMode: () => {
      setSelectedIndex(1);
    },
  });

  const { tabs, refetchTabs } = useTabs({ windowInstance, displayMode });

  // Get selected tab for preview display
  const selectedTab = createMemo(() => {
    const tabList = tabs();
    const index = getSelectedIndex();
    return tabList?.[index] ?? null;
  });

  function handleSelect(index: number) {
    const tabList = tabs();
    const tab = tabList?.[index];
    if (tab) {
      switchToTab(tab.id);
    }
  }

  function handleOpenSettings() {
    openOptionsPage();
  }

  // Keyboard handling via hook
  usePopupKeyboard({
    settings: settings,
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
      handleSelect(getSelectedIndex());
    },
    onCancel: () => {
      window.close();
    },
    onToggleMode: () => {
      toggleMode();
    },
  });

  // Port communication via hook
  usePopupPort({
    onClosePopup: (selectFocused) => {
      if (selectFocused) {
        handleSelect(getSelectedIndex());
      }
      window.close();
    },
  });

  useCaptureScreenshot({ windowInstance, settings, refetchTabs });

  const isPreviewEnabled = settings()?.previewModeEnabled ?? false;

  return (
    <PopupWindow settings={settings}>
      <div
        class={`${styles.popupContainer} ${isPreviewEnabled ? styles.popupContainerPreviewEnabled : ""}`}
      >
        <Show when={isPreviewEnabled}>
          <PreviewPanel selectedTab={selectedTab()} />
        </Show>

        <Show when={displayMode()}>
          {(displayMode) => (
            <div class={styles.mainContent}>
              <TabList
                tabs={tabs() ?? []}
                selectedIndex={getSelectedIndex()}
                onSelect={handleSelect}
                showTabIndex={displayMode() === "currentWindow"}
              />

              <Footer
                windowOnly={displayMode() === "currentWindow"}
                onToggleMode={toggleMode}
                onOpenKeybindings={() => setShouldShowKeybindingsModal(true)}
                onOpenSettings={handleOpenSettings}
              />
            </div>
          )}
        </Show>

        <Show when={getShouldShowKeybindingsModal() && settings()}>
          {(currentSettings) => (
            <KeybindingsModal
              settings={currentSettings()}
              onClose={() => setShouldShowKeybindingsModal(false)}
              onOpenSettings={handleOpenSettings}
            />
          )}
        </Show>
      </div>
    </PopupWindow>
  );
}
