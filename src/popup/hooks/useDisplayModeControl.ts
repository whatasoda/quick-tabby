import { type Accessor, createEffect, createSignal } from "solid-js";
import type { Settings } from "../../core/settings";
import { clearLaunchInfo, getLaunchInfo } from "../../infrastructure/chrome";
import { loadDisplayMode, saveDisplayMode } from "../../infrastructure/chrome/mode-storage";
import type { DisplayMode } from "../../shared/types";

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
      const launchInfo = await getLaunchInfo().catch(() => null);

      if (launchInfo?.mode !== null && launchInfo?.mode !== undefined) {
        void clearLaunchInfo().catch(() => {
          // Ignore errors when clearing launch info
        });

        return launchInfo.mode;
      }

      // Determine initial mode based on defaultMode setting
      switch (currentSettings.defaultMode) {
        case "all":
          return "all";
        case "currentWindow":
          return "currentWindow";
        case "lastUsed":
          return await loadDisplayMode();
      }
    })()
      .then((initialDisplayMode) => {
        setDisplayMode(initialDisplayMode);
      })
      .catch((error) => {
        console.warn("Failed to determine display mode:", error);
        // Fall back to showing all tabs
        setDisplayMode("all");
      });

    return true;
  }, false);

  return { displayMode, toggleMode };
}
