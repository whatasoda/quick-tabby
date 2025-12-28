import { createSignal, onCleanup, Show, type JSX } from "solid-js";
import { css } from "../../../styled-system/css";
import type { Settings } from "../../core/settings/settings-types.ts";
import {
  POPUP_SIZES,
  getPreviewWidth,
  getTabListWidth,
  getMaxPopupWidth,
} from "../../core/settings/settings-defaults.ts";

const styles = {
  loading: css({
    padding: "xl",
    textAlign: "center",
    color: "text.secondary",
  }),
};

function applyPopupSize(settings: Settings) {
  const size = POPUP_SIZES[settings.popupSize];
  const tabListWidth = getTabListWidth();
  const previewWidth = getPreviewWidth();
  const totalWidth = settings.previewModeEnabled
    ? getMaxPopupWidth()
    : tabListWidth;

  document.documentElement.style.setProperty(
    "--popup-width",
    `${totalWidth}px`
  );
  document.documentElement.style.setProperty(
    "--popup-height",
    `${size.height}px`
  );
  document.documentElement.style.setProperty(
    "--preview-width",
    `${previewWidth}px`
  );
  document.documentElement.style.setProperty(
    "--tab-list-width",
    `${tabListWidth}px`
  );
}

interface PopupWindowProps {
  settings: Settings | null;
  children: JSX.Element;
}

export function PopupWindow(props: PopupWindowProps) {
  const [showFallback, setShowFallback] = createSignal(false);

  const timer = setTimeout(() => setShowFallback(true), 200);
  onCleanup(() => clearTimeout(timer));

  // Apply size when settings become available
  const settingsReady = () => {
    const s = props.settings;
    if (s) {
      applyPopupSize(s);
      return true;
    }
    return false;
  };

  return (
    <Show
      when={settingsReady()}
      fallback={
        <Show when={showFallback()}>
          <div class={styles.loading}>Loading...</div>
        </Show>
      }
    >
      {props.children}
    </Show>
  );
}
