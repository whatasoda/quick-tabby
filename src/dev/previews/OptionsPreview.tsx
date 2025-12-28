import { createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import { DEFAULT_SETTINGS } from "../../core/settings/settings-defaults.ts";
import type { Settings, ThemePreference } from "../../core/settings/settings-types.ts";
import { App as OptionsApp } from "../../options/index.tsx";
import { createThemeControl } from "../../shared/theme.ts";
import { updateMockSettings } from "../mocks/chrome-api.ts";

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
  frame: css({
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    overflow: "hidden",
    minHeight: "600px",
  }),
  frameInner: css({
    padding: "24px",
    minHeight: "600px",
    background: "var(--colors-surface)",
    color: "var(--colors-text-primary)",
  }),
};

export function OptionsPreview() {
  const [settings, setSettings] = createSignal<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = createSignal(false);

  const themeControl = createMemo(createThemeControl);

  onMount(() => {
    themeControl().applyTheme(settings().themePreference);
    setMounted(true);
  });

  onCleanup(() => {
    themeControl().cleanup();
  });

  function updateSettings(partial: Partial<Settings>) {
    setMounted(false);
    const newSettings = { ...settings(), ...partial };
    setSettings(newSettings);
    updateMockSettings(newSettings);
    themeControl().applyTheme(newSettings.themePreference);
    setTimeout(() => setMounted(true), 0);
  }

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Options Preview</h2>

      <div class={styles.controlPanel}>
        <div class={styles.controlGroup}>
          <span class={styles.label}>Theme:</span>
          <select
            class={styles.select}
            value={settings().themePreference}
            onChange={(e) =>
              updateSettings({
                themePreference: e.target.value as ThemePreference,
              })
            }
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div class={styles.frame}>
        <div class={styles.frameInner}>
          <Show when={mounted()}>
            <OptionsApp />
          </Show>
        </div>
      </div>
    </div>
  );
}
