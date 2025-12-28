import { createEffect, createSignal, type Accessor } from "solid-js";
import type { DisplayMode } from "../../shared/types";
import {
  loadDisplayMode,
  saveDisplayMode,
} from "../../infrastructure/chrome/mode-storage";
import type { Settings } from "../../core/settings";
import { clearLaunchInfo, getLaunchInfo } from "../../infrastructure/chrome";

interface UseDisplayModeControlOptions {
  settings: Accessor<Settings | undefined>;
  onToggleMode: () => void;
}

export function useDisplayModeControl(options: UseDisplayModeControlOptions) {
  const { settings, onToggleMode } = options;
  const [displayMode, setDisplayMode] = createSignal<DisplayMode | null>(null);

  function toggleMode() {
    const newMode = displayMode() === "currentWindow" ? "all" : "currentWindow";

    setDisplayMode(newMode);
    void saveDisplayMode(newMode);
    onToggleMode();
  }

  createEffect((done: boolean) => {
    if (done) {
      return done;
    }

    const currentSettings = settings();
    if (currentSettings === undefined) {
      return false;
    }

    (async () => {
      // Check for launch info (from mode-fixed shortcuts)
      const launchInfo = await getLaunchInfo();

      if (launchInfo?.mode !== null && launchInfo?.mode !== undefined) {
        void clearLaunchInfo();

        return launchInfo.mode;
      }

      // Opened via _execute_action (direct popup open)
      // Determine initial mode based on defaultMode setting
      switch (currentSettings.defaultMode) {
        case "all":
          return "all";
        case "currentWindow":
          return "currentWindow";
        case "lastUsed":
          return await loadDisplayMode();
      }
    })().then((initialDisplayMode) => {
      setDisplayMode(initialDisplayMode);
    });

    return true;
  }, false);

  return { displayMode, toggleMode };
}
