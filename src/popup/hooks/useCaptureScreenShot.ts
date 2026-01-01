import { type Accessor, createEffect } from "solid-js";
import { THUMBNAIL_QUALITIES } from "../../core/settings";
import type { Settings } from "../../core/settings/settings-types";
import { captureCurrentTab } from "../../infrastructure/chrome/messaging";

interface UseCaptureScreenshotOptions {
  windowInstance: Accessor<chrome.windows.Window | undefined>;
  settings: Accessor<Settings | undefined>;
  refetchTabs: () => void;
}

export function useCaptureScreenshot({
  windowInstance,
  settings,
  refetchTabs,
}: UseCaptureScreenshotOptions) {
  createEffect((done: boolean) => {
    const currentWindow = windowInstance();
    const currentSettings = settings();

    if (done) {
      return done;
    }

    if (currentWindow === undefined || currentSettings === undefined) {
      return false;
    }

    // Capture current tab and refresh to get updated thumbnail
    const thumbnailConfig = {
      ...THUMBNAIL_QUALITIES[currentSettings.thumbnailQuality],
      blur: currentSettings.thumbnailBlurEnabled,
    };
    void captureCurrentTab(currentWindow.id, thumbnailConfig)
      .then(() => {
        refetchTabs();
      })
      .catch((error) => {
        console.warn("Failed to capture screenshot:", error);
      });

    return true;
  }, false);
}
