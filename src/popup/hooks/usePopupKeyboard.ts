import { type Accessor, onCleanup, onMount, type Resource } from "solid-js";
import {
  matchesAnyKeybinding,
  matchesKeybinding,
  parseShortcut,
} from "../../core/keybindings/keybinding-matcher.ts";
import type { Keybinding, Settings } from "../../core/settings/settings-types.ts";
import { getCommands } from "../../infrastructure/chrome/messaging.ts";

interface UsePopupKeyboardOptions {
  settings: Accessor<Settings | null> | Resource<Settings | null>;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onToggleMode: () => void;
  /** Called when _execute_action shortcut is pressed while popup is open */
  onExecuteActionRepress?: () => void;
}

export function usePopupKeyboard(options: UsePopupKeyboardOptions) {
  const { settings, onMoveDown, onMoveUp, onConfirm, onCancel, onToggleMode, onExecuteActionRepress } =
    options;

  // Store the parsed _execute_action shortcut keybinding
  let executeActionBinding: Keybinding | null = null;

  function handleKeyDown(e: KeyboardEvent) {
    const currentSettings = settings();
    if (!currentSettings) return;

    const { keybindings } = currentSettings;

    // Check for _execute_action shortcut re-press (select-on-repress)
    if (executeActionBinding && onExecuteActionRepress && matchesKeybinding(e, executeActionBinding)) {
      e.preventDefault();
      onExecuteActionRepress();
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
    // Fetch the _execute_action shortcut and parse it
    getCommands()
      .then((commands) => {
        const executeAction = commands.find((c) => c.name === "_execute_action");
        if (executeAction?.shortcut && executeAction.shortcut !== "Not set") {
          executeActionBinding = parseShortcut(executeAction.shortcut);
        }
      })
      .catch(() => {
        // Ignore errors fetching commands
      });

    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
}
