import { type Accessor, onCleanup, onMount, type Resource } from "solid-js";
import { matchesAnyKeybinding } from "../../core/keybindings/keybinding-matcher.ts";
import type { Settings } from "../../core/settings/settings-types.ts";

interface UsePopupKeyboardOptions {
  settings: Accessor<Settings | null> | Resource<Settings | null>;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onToggleMode: () => void;
  // Search integration
  hasSearchQuery?: Accessor<boolean>;
  onClearSearch?: () => void;
  onCharacterInput?: (char: string) => void;
}

export function usePopupKeyboard(options: UsePopupKeyboardOptions) {
  const {
    settings,
    onMoveDown,
    onMoveUp,
    onConfirm,
    onCancel,
    onToggleMode,
    hasSearchQuery,
    onClearSearch,
    onCharacterInput,
  } = options;

  function handleKeyDown(e: KeyboardEvent) {
    const currentSettings = settings();
    if (!currentSettings) return;

    const { keybindings } = currentSettings;

    // When typing in search input, only handle navigation keys
    if (e.target instanceof HTMLInputElement) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onMoveDown();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onMoveUp();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        // If there's a query, clear it first
        if (hasSearchQuery?.() && onClearSearch) {
          onClearSearch();
        } else {
          onCancel();
        }
        return;
      }
      // Let input handle other keys
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.moveDown) || e.key === "ArrowDown") {
      e.preventDefault();
      onMoveDown();
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.moveUp) || e.key === "ArrowUp") {
      e.preventDefault();
      onMoveUp();
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.confirm)) {
      e.preventDefault();
      onConfirm();
      return;
    }

    // Handle Escape specially for search
    if (matchesAnyKeybinding(e, keybindings.cancel)) {
      e.preventDefault();
      if (hasSearchQuery?.() && onClearSearch) {
        onClearSearch();
      } else {
        onCancel();
      }
      return;
    }

    if (matchesAnyKeybinding(e, keybindings.toggleMode)) {
      e.preventDefault();
      onToggleMode();
      return;
    }

    // For onType mode: trigger search on character input
    if (onCharacterInput && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      onCharacterInput(e.key);
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
