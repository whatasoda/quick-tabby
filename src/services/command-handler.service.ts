/**
 * Command Handler Service
 *
 * Manages keyboard command handling and popup lifecycle.
 * Uses dependency injection for testability.
 */

import type { CommandName } from "../core/settings/settings-types.ts";
import type {
  ChromeActionAPI,
  ChromeCommandsAPI,
  ChromeTabsAPI,
  Port,
} from "../infrastructure/chrome/types.ts";
import type { LaunchInfo } from "../shared/types.ts";
import type { SettingsService } from "./settings.service.ts";

/**
 * Command handler service interface
 */
export interface CommandHandlerService {
  /**
   * Initialize command listeners
   */
  initialize(): void;

  /**
   * Get current launch info
   */
  getLaunchInfo(): LaunchInfo;

  /**
   * Clear launch info
   */
  clearLaunchInfo(): void;

  /**
   * Set popup port connection
   */
  setPopupPort(port: Port | null): void;

  /**
   * Get popup port connection
   */
  getPopupPort(): Port | null;

  /**
   * Check if popup is currently open
   */
  isPopupOpen(): boolean;
}

/**
 * Dependencies for command handler service
 */
export interface CommandHandlerDependencies {
  action: ChromeActionAPI;
  commands: ChromeCommandsAPI;
  tabs: ChromeTabsAPI;
  settingsService: SettingsService;
}

/**
 * Create a command handler service instance
 *
 * @param deps - Service dependencies
 * @returns Command handler service instance
 */
export function createCommandHandlerService(
  deps: CommandHandlerDependencies,
): CommandHandlerService {
  let launchInfo: LaunchInfo = { mode: null, command: null };
  let popupPort: Port | null = null;

  async function sendCloseMessage(command: CommandName): Promise<boolean> {
    if (!popupPort) return false;

    const settings = await deps.settingsService.load();
    const selectFocused = settings.commandSettings[command]?.selectOnClose ?? true;

    try {
      popupPort.postMessage({ type: "CLOSE_POPUP", selectFocused });
      return true;
    } catch {
      // Popup might have already closed
      popupPort = null;
      return false;
    }
  }

  async function handleCommand(command: CommandName, mode: "all" | "currentWindow"): Promise<void> {
    if (popupPort !== null) {
      // Popup is open, send close message
      await sendCloseMessage(command);
      return;
    }

    // Get searchBarMode from command settings
    const settings = await deps.settingsService.load();
    const searchBarMode = settings.commandSettings[command]?.searchBarMode;

    // Open popup with specified mode and searchBarMode
    launchInfo = { mode, command, searchBarMode };
    try {
      await deps.action.openPopup();
    } catch {
      // openPopup may fail in older Chrome versions, clear the info
      launchInfo = { mode: null, command: null };
    }
  }

  return {
    initialize(): void {
      deps.commands.onCommand.addListener(async (command) => {
        switch (command) {
          case "open-popup": {
            const settings = await deps.settingsService.load();
            const mode = settings.commandSettings["open-popup"]?.mode ?? "all";
            handleCommand("open-popup", mode);
            break;
          }
          case "move-tab-left":
            await deps.tabs.activateAdjacentTab("left");
            break;
          case "move-tab-right":
            await deps.tabs.activateAdjacentTab("right");
            break;
        }
      });
    },

    getLaunchInfo(): LaunchInfo {
      return launchInfo;
    },

    clearLaunchInfo(): void {
      launchInfo = { mode: null, command: null };
    },

    setPopupPort(port: Port | null): void {
      popupPort = port;
    },

    getPopupPort(): Port | null {
      return popupPort;
    },

    isPopupOpen(): boolean {
      return popupPort !== null;
    },
  };
}
