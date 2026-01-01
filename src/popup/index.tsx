import { createMemo, createResource, createSignal, Show } from "solid-js";
import "./index.css";
import { css } from "../../styled-system/css";
import {
  getWindowInstance,
  openOptionsPage,
  switchToTab,
} from "../infrastructure/chrome/messaging";
import { loadSettings } from "../shared/settings";
import { Footer } from "./components/Footer";
import { KeybindingsModal } from "./components/KeybindingsModal";
import { PopupWindow } from "./components/PopupWindow";
import { PreviewPanel } from "./components/PreviewPanel";
import { TabList } from "./components/TabList";
import { useCaptureScreenshot } from "./hooks/useCaptureScreenShot";
import { useDisplayModeControl } from "./hooks/useDisplayModeControl";
import { usePopupKeyboard } from "./hooks/usePopupKeyboard";
import { usePopupPort } from "./hooks/usePopupPort";
import { useTabs } from "./hooks/useTabs";

const styles = {
  popupContainer: css({
    display: "flex",
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
  }),
  mainContent: css({
    width: "var(--tab-list-width)",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  }),
};

export function App() {
  const [selectedIndex, setSelectedIndex] = createSignal(1);
  const [shouldShowKeybindingsModal, setShouldShowKeybindingsModal] = createSignal(false);

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
    const index = selectedIndex();
    return tabList?.[index] ?? null;
  });

  function handleSelect(index: number) {
    const tabList = tabs();
    const tab = tabList?.[index];
    if (tab) {
      void switchToTab(tab.id).catch((error) => {
        console.error("Failed to switch tab:", error);
      });
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
      handleSelect(selectedIndex());
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
        handleSelect(selectedIndex());
      }
      window.close();
    },
  });

  useCaptureScreenshot({ windowInstance, settings, refetchTabs });

  return (
    <PopupWindow settings={settings}>
      <div class={styles.popupContainer}>
        <Show when={settings()?.previewModeEnabled ?? false}>
          <PreviewPanel selectedTab={selectedTab()} />
        </Show>

        <Show when={displayMode()}>
          {(displayMode) => (
            <div class={styles.mainContent}>
              <TabList
                tabs={tabs() ?? []}
                selectedIndex={selectedIndex()}
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

        <Show when={shouldShowKeybindingsModal() && settings()}>
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
