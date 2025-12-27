import { createSignal, onMount } from "solid-js";
import { css } from "../../../styled-system/css";
import type { Settings, PopupSize } from "../../shared/types.ts";
import {
  DEFAULT_SETTINGS,
  POPUP_SIZES,
  getPreviewWidth,
  getTabListWidth,
  getMaxPopupWidth,
} from "../../shared/settings.ts";
import { updateMockSettings } from "../mocks/chrome-api.ts";
import { App as PopupApp } from "../../popup/index.tsx";

const styles = {
  container: css({
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
    maxWidth: "900px",
  }),
  title: css({
    fontSize: "20px",
    fontWeight: 600,
    color: "#333",
    margin: 0,
  }),
  controlPanel: css({
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    padding: "16px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }),
  controlGroup: css({
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }),
  label: css({
    fontSize: "14px",
    color: "#666",
  }),
  select: css({
    padding: "6px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    background: "#fff",
  }),
  checkbox: css({
    width: "16px",
    height: "16px",
    cursor: "pointer",
  }),
  popupFrame: css({
    border: "1px solid #ccc",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    background: "#fff",
  }),
};

export function PopupPreview() {
  const [settings, setSettings] = createSignal<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    applySize(settings());
    setMounted(true);
  });

  function applySize(s: Settings) {
    const size = POPUP_SIZES[s.popupSize];
    const tabListWidth = getTabListWidth();
    const previewWidth = getPreviewWidth();
    const totalWidth = s.previewModeEnabled ? getMaxPopupWidth() : tabListWidth;

    document.documentElement.style.setProperty("--popup-width", `${totalWidth}px`);
    document.documentElement.style.setProperty("--popup-height", `${size.height}px`);
    document.documentElement.style.setProperty("--preview-width", `${previewWidth}px`);
    document.documentElement.style.setProperty("--tab-list-width", `${tabListWidth}px`);
  }

  function updateSettings(partial: Partial<Settings>) {
    const newSettings = { ...settings(), ...partial };
    setSettings(newSettings);
    updateMockSettings(newSettings);
    applySize(newSettings);
  }

  const frameWidth = () => {
    const s = settings();
    return s.previewModeEnabled ? getMaxPopupWidth() : getTabListWidth();
  };

  const frameHeight = () => POPUP_SIZES[settings().popupSize].height;

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Popup Preview</h2>

      <div class={styles.controlPanel}>
        <div class={styles.controlGroup}>
          <span class={styles.label}>Size:</span>
          <select
            class={styles.select}
            value={settings().popupSize}
            onChange={(e) =>
              updateSettings({ popupSize: e.target.value as PopupSize })
            }
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div class={styles.controlGroup}>
          <input
            type="checkbox"
            id="previewMode"
            class={styles.checkbox}
            checked={settings().previewModeEnabled}
            onChange={(e) =>
              updateSettings({ previewModeEnabled: e.target.checked })
            }
          />
          <label for="previewMode" class={styles.label}>
            Preview Mode
          </label>
        </div>

        <div class={styles.controlGroup}>
          <input
            type="checkbox"
            id="modeToggle"
            class={styles.checkbox}
            checked={settings().enableModeToggle}
            onChange={(e) =>
              updateSettings({ enableModeToggle: e.target.checked })
            }
          />
          <label for="modeToggle" class={styles.label}>
            Mode Toggle
          </label>
        </div>
      </div>

      <div
        class={styles.popupFrame}
        style={{
          width: `${frameWidth()}px`,
          height: `${frameHeight()}px`,
        }}
      >
        {mounted() && <PopupApp />}
      </div>
    </div>
  );
}
