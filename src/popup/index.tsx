import { createEffect, createMemo, createResource, createSignal, Show } from "solid-js";
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
import { SearchBar } from "./components/SearchBar";
import { TabList } from "./components/TabList";
import { useCaptureScreenshot } from "./hooks/useCaptureScreenShot";
import { useDisplayModeControl } from "./hooks/useDisplayModeControl";
import { usePopupKeyboard } from "./hooks/usePopupKeyboard";
import { usePopupPort } from "./hooks/usePopupPort";
import { useSearch } from "./hooks/useSearch";
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

  const { displayMode, toggleMode, searchBarMode } = useDisplayModeControl({
    settings: settings,
    onToggleMode: () => {
      setSelectedIndex(1);
    },
  });

  const { tabs, refetchTabs } = useTabs({ windowInstance, displayMode });

  // Search integration
  const {
    query,
    setQuery,
    clearQuery,
    filteredTabs,
    isSearchVisible,
    showSearch,
    inputRef,
    setInputRef,
  } = useSearch({
    tabs,
    searchBarMode,
  });

  // Reset selected index when search results change
  createEffect(() => {
    const results = filteredTabs();
    if (results.length > 0 && selectedIndex() >= results.length) {
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  });

  // Get selected tab for preview display
  const selectedTab = createMemo(() => {
    const results = filteredTabs();
    const index = selectedIndex();
    return results[index]?.tab ?? null;
  });

  function handleSelect(index: number) {
    const results = filteredTabs();
    const result = results[index];
    if (result) {
      void switchToTab(result.tab.id).catch((error) => {
        console.error("Failed to switch tab:", error);
      });
    }
  }

  function handleOpenSettings() {
    openOptionsPage();
  }

  // Focus search input on "always" mode mount
  createEffect(() => {
    if (searchBarMode() === "always" && inputRef()) {
      inputRef()?.focus();
    }
  });

  // Keyboard handling via hook
  usePopupKeyboard({
    settings: settings,
    onMoveDown: () => {
      const results = filteredTabs();
      if (results.length > 0) {
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
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
    hasSearchQuery: () => query().length > 0,
    onClearSearch: () => {
      clearQuery();
      setSelectedIndex(1);
    },
    onCharacterInput: (char) => {
      // For onType mode: show search and input character
      if (searchBarMode() === "onType") {
        showSearch();
        setQuery(char);
        setTimeout(() => inputRef()?.focus(), 0);
      }
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
              <Show when={isSearchVisible()}>
                <SearchBar
                  value={query()}
                  onInput={setQuery}
                  onClear={clearQuery}
                  onRef={setInputRef}
                />
              </Show>

              <TabList
                tabs={filteredTabs()}
                selectedIndex={selectedIndex()}
                onSelect={handleSelect}
                showTabIndex={displayMode() === "currentWindow"}
                hasSearchQuery={query().length > 0}
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
