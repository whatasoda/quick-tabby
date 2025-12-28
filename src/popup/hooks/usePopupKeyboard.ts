import { onMount, onCleanup, type Accessor } from "solid-js";
import type { Settings } from "../../core/settings/settings-types.ts";
import type { TabInfo } from "../../shared/types.ts";
import { matchesAnyKeybinding } from "../../core/keybindings/keybinding-matcher.ts";
import { switchToTab } from "../../infrastructure/chrome/messaging.ts";

interface UsePopupKeyboardOptions {
  tabs: Accessor<TabInfo[] | undefined>;
  settings: Accessor<Settings | null>;
  selectedIndex: Accessor<number>;
  setSelectedIndex: (fn: (i: number) => number) => void;
  onToggleMode: () => void;
}

export function usePopupKeyboard(options: UsePopupKeyboardOptions) {
  const { tabs, settings, selectedIndex, setSelectedIndex, onToggleMode } =
    options;

  function handleKeyDown(e: KeyboardEvent) {
    const tabList = tabs();
    const currentSettings = settings();
    if (!currentSettings || !tabList || tabList.length === 0) return;

    const { keybindings } = currentSettings;

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
      onToggleMode();
      return;
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
}
