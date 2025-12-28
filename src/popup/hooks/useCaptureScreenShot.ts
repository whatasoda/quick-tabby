import { type Accessor, createEffect } from "solid-js";
import { type Settings } from "../../core/settings/settings-types";
import { captureCurrentTab } from "../../infrastructure/chrome/messaging";
import { THUMBNAIL_QUALITIES } from "../../core/settings";

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
    const thumbnailConfig =
      THUMBNAIL_QUALITIES[currentSettings.thumbnailQuality];
    void captureCurrentTab(currentWindow.id, thumbnailConfig).then(() => {
      refetchTabs();
    });

    return true;
  }, false);
}
