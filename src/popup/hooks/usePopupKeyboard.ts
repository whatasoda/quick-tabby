import { onMount, onCleanup, type Accessor } from "solid-js";
import type { Settings } from "../../core/settings/settings-types.ts";
import { matchesAnyKeybinding } from "../../core/keybindings/keybinding-matcher.ts";

interface UsePopupKeyboardOptions {
  settings: Accessor<Settings | null>;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onToggleMode: () => void;
}

export function usePopupKeyboard(options: UsePopupKeyboardOptions) {
  const { settings, onMoveDown, onMoveUp, onConfirm, onCancel, onToggleMode } =
    options;

  function handleKeyDown(e: KeyboardEvent) {
    const currentSettings = settings();
    if (!currentSettings) return;

    const { keybindings } = currentSettings;

    if (
      matchesAnyKeybinding(e, keybindings.moveDown) ||
      e.key === "ArrowDown"
    ) {
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

    if (matchesAnyKeybinding(e, keybindings.cancel)) {
      e.preventDefault();
      onCancel();
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
