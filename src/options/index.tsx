import { render } from "solid-js/web";
import { createSignal, createResource, createEffect, For, onMount, onCleanup, Show } from "solid-js";
import "./index.css";
import { css } from "../../styled-system/css";
import type {
  Settings,
  PopupSize,
  ThumbnailQuality,
  ThemePreference,
  Keybinding,
} from "../shared/types.ts";
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  keybindingToString,
  applyTheme,
  setupThemeListener,
} from "../shared/settings.ts";

const styles = {
  container: css({
    maxWidth: "600px",
    margin: "0 auto",
  }),
  h1: css({
    fontSize: "xxl",
    margin: "0 0 24px",
  }),
  savedIndicator: css({
    position: "fixed",
    top: "xl",
    right: "xl",
    background: "success",
    color: "white",
    padding: "sm lg",
    borderRadius: "md",
    fontSize: "lg",
    opacity: 0,
    transition: "opacity 0.3s",
  }),
  savedIndicatorVisible: css({
    opacity: 1,
  }),
  section: css({
    background: "background",
    borderRadius: "xl",
    padding: "lg",
    marginBottom: "lg",
    boxShadow: "sm",
  }),
  sectionTitle: css({
    fontSize: "lg",
    fontWeight: 600,
    color: "text.secondary",
    margin: "0 0 12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }),
  settingRow: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "md 0",
    borderBottom: "1px solid token(colors.borderLighter)",
    _last: {
      borderBottom: "none",
    },
  }),
  settingRowSubSetting: css({
    paddingLeft: "xl",
    background: "surfaceAlt",
  }),
  settingLabel: css({
    fontSize: "lg",
  }),
  settingDescription: css({
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "xs",
  }),
  radioGroup: css({
    display: "flex",
    gap: "sm",
  }),
  radioOption: css({
    display: "flex",
    alignItems: "center",
    gap: "xs",
    cursor: "pointer",
  }),
  checkboxLabel: css({
    display: "flex",
    alignItems: "center",
    gap: "sm",
    cursor: "pointer",
    "& input": {
      width: "16px",
      height: "16px",
      cursor: "pointer",
    },
  }),
  keybindingInput: css({
    display: "flex",
    alignItems: "center",
    gap: "sm",
  }),
  keybindingDisplay: css({
    fontFamily: "monospace",
    background: "surfaceHover",
    padding: "6px 12px",
    borderRadius: "md",
    fontSize: "12px",
    minWidth: "80px",
    textAlign: "center",
  }),
  keybindingDisplayRecording: css({
    background: "primary",
    color: "white",
  }),
  recordBtn: css({
    padding: "xs sm",
    fontSize: "12px",
    background: "borderLight",
    border: "1px solid token(colors.border)",
    borderRadius: "md",
    cursor: "pointer",
    _hover: {
      background: "surfaceHover",
    },
  }),
  shortcutList: css({
    display: "flex",
    flexDirection: "column",
    gap: "md",
  }),
  shortcutItem: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "sm 0",
    borderBottom: "1px solid token(colors.borderLighter)",
    _last: {
      borderBottom: "none",
    },
  }),
  shortcutName: css({
    fontSize: "lg",
  }),
  shortcutKey: css({
    fontFamily: "monospace",
    background: "surfaceHover",
    padding: "xs sm",
    borderRadius: "md",
    fontSize: "12px",
  }),
  linkButton: css({
    display: "inline-block",
    marginTop: "md",
    padding: "sm lg",
    background: "primary",
    color: "white",
    textDecoration: "none",
    borderRadius: "md",
    fontSize: "lg",
    cursor: "pointer",
    border: "none",
    _hover: {
      background: "primaryHover",
    },
  }),
  note: css({
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "sm",
  }),
};

interface ShortcutInfo {
  name: string;
  description: string;
  shortcut: string;
}

async function getShortcuts(): Promise<ShortcutInfo[]> {
  const commands = await chrome.commands.getAll();
  return commands.map((cmd) => ({
    name: cmd.name ?? "",
    description: cmd.description ?? "",
    shortcut: cmd.shortcut ?? "Not set",
  }));
}

function App() {
  const [shortcuts] = createResource(getShortcuts);
  const [settings, setSettings] = createSignal<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = createSignal(false);
  const [recordingKey, setRecordingKey] = createSignal<string | null>(null);

  let cleanupThemeListener: (() => void) | undefined;

  onMount(async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
    applyTheme(loaded.themePreference);
    cleanupThemeListener = setupThemeListener(
      loaded.themePreference,
      () => applyTheme(loaded.themePreference)
    );
  });

  onCleanup(() => {
    cleanupThemeListener?.();
  });

  // Re-apply theme when settings change
  createEffect(() => {
    const currentSettings = settings();
    applyTheme(currentSettings.themePreference);
    cleanupThemeListener?.();
    cleanupThemeListener = setupThemeListener(
      currentSettings.themePreference,
      () => applyTheme(currentSettings.themePreference)
    );
  });

  async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    const newSettings = { ...settings(), [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
    showSaved();
  }

  async function updateKeybinding(
    key: keyof Settings["keybindings"],
    binding: Keybinding
  ) {
    const newSettings = {
      ...settings(),
      keybindings: { ...settings().keybindings, [key]: binding },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
    showSaved();
  }

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function startRecording(key: string) {
    setRecordingKey(key);
  }

  function handleKeyDown(e: KeyboardEvent, key: keyof Settings["keybindings"]) {
    if (recordingKey() !== key) return;

    e.preventDefault();
    e.stopPropagation();

    // Ignore modifier-only keys
    if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;

    const binding: Keybinding = {
      key: e.key,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
    };

    updateKeybinding(key, binding);
    setRecordingKey(null);
  }

  function openShortcutsPage() {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  }

  return (
    <div class={styles.container}>
      <h1 class={styles.h1}>QuickTabby Settings</h1>

      <div class={`${styles.savedIndicator} ${saved() ? styles.savedIndicatorVisible : ""}`}>Saved!</div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Appearance</h2>
        <div class={styles.settingRow}>
          <div>
            <div class={styles.settingLabel}>Theme</div>
          </div>
          <div class={styles.radioGroup}>
            <For each={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ] as { value: ThemePreference; label: string }[]}>
              {(option) => (
                <label class={styles.radioOption}>
                  <input
                    type="radio"
                    name="themePreference"
                    checked={settings().themePreference === option.value}
                    onChange={() => updateSetting("themePreference", option.value)}
                  />
                  {option.label}
                </label>
              )}
            </For>
          </div>
        </div>
        <div class={styles.settingRow}>
          <div>
            <div class={styles.settingLabel}>Popup Size</div>
          </div>
          <div class={styles.radioGroup}>
            <For each={["small", "medium", "large"] as PopupSize[]}>
              {(size) => (
                <label class={styles.radioOption}>
                  <input
                    type="radio"
                    name="popupSize"
                    checked={settings().popupSize === size}
                    onChange={() => updateSetting("popupSize", size)}
                  />
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </label>
              )}
            </For>
          </div>
        </div>
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Behavior</h2>
        <div class={styles.settingRow}>
          <div>
            <div class={styles.settingLabel}>Preview Mode</div>
            <div class={styles.settingDescription}>
              Show enlarged thumbnail of selected tab
            </div>
          </div>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings().previewModeEnabled}
              onChange={(e) =>
                updateSetting("previewModeEnabled", e.target.checked)
              }
            />
          </label>
        </div>
        <Show when={settings().previewModeEnabled}>
          <div class={`${styles.settingRow} ${styles.settingRowSubSetting}`}>
            <div>
              <div class={styles.settingLabel}>Thumbnail Quality</div>
              <div class={styles.settingDescription}>
                Higher quality uses more storage
              </div>
            </div>
            <div class={styles.radioGroup}>
              <For each={["standard", "high", "ultra"] as ThumbnailQuality[]}>
                {(quality) => (
                  <label class={styles.radioOption}>
                    <input
                      type="radio"
                      name="thumbnailQuality"
                      checked={settings().thumbnailQuality === quality}
                      onChange={() => updateSetting("thumbnailQuality", quality)}
                    />
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </label>
                )}
              </For>
            </div>
          </div>
        </Show>
        <div class={styles.settingRow}>
          <div>
            <div class={styles.settingLabel}>Enable Mode Toggle</div>
            <div class={styles.settingDescription}>
              Allow switching between All/Window mode
            </div>
          </div>
          <label class={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings().enableModeToggle}
              onChange={(e) =>
                updateSetting("enableModeToggle", e.target.checked)
              }
            />
          </label>
        </div>
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Popup Keybindings</h2>
        <For
          each={
            [
              ["moveDown", "Move Down"],
              ["moveUp", "Move Up"],
              ["confirm", "Confirm Selection"],
              ["cancel", "Cancel"],
              ["toggleMode", "Toggle Mode"],
            ] as [keyof Settings["keybindings"], string][]
          }
        >
          {([key, label]) => (
            <div class={styles.settingRow}>
              <div class={styles.settingLabel}>{label}</div>
              <div class={styles.keybindingInput}>
                <div
                  class={`${styles.keybindingDisplay} ${recordingKey() === key ? styles.keybindingDisplayRecording : ""}`}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  onBlur={() => setRecordingKey(null)}
                >
                  {recordingKey() === key
                    ? "Press key..."
                    : keybindingToString(settings().keybindings[key])}
                </div>
                <button class={styles.recordBtn} onClick={() => startRecording(key)}>
                  Edit
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Global Shortcuts</h2>
        <div class={styles.shortcutList}>
          <For each={shortcuts()}>
            {(shortcut) => (
              <div class={styles.shortcutItem}>
                <span class={styles.shortcutName}>{shortcut.description}</span>
                <span class={styles.shortcutKey}>{shortcut.shortcut}</span>
              </div>
            )}
          </For>
        </div>
        <button class={styles.linkButton} onClick={openShortcutsPage}>
          Change Shortcuts
        </button>
        <p class={styles.note}>
          Opens Chrome's extension shortcuts page where you can customize
          keyboard shortcuts.
        </p>
      </div>
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  render(() => <App />, root);
}
