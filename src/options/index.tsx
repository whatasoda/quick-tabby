import {
  createSignal,
  createResource,
  createEffect,
  For,
  onMount,
  onCleanup,
  Show,
  createMemo,
} from "solid-js";
import "./index.css";
import { css } from "../../styled-system/css";
import type {
  Settings,
  PopupSize,
  ThumbnailQuality,
  ThemePreference,
  DefaultMode,
  Keybinding,
  KeybindingList,
  CommandName,
} from "../core/settings/settings-types.ts";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "../shared/settings.ts";
import { keybindingToString } from "../core/keybindings/keybinding-matcher.ts";
import { createThemeControl } from "../shared/theme.ts";

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
    padding: "8px 16px",
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
    padding: "12px 0",
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
  keybindingDisplay: css({
    fontFamily: "monospace",
    background: "surfaceHover",
    padding: "6px 12px",
    borderRadius: "md",
    fontSize: "12px",
    minWidth: "80px",
    textAlign: "center",
    cursor: "pointer",
    _hover: {
      background: "borderLight",
    },
  }),
  keybindingDisplayRecording: css({
    background: "primary",
    color: "white",
    _hover: {
      background: "primary",
    },
  }),
  keybindingChip: css({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontFamily: "monospace",
    background: "surfaceHover",
    padding: "4px 8px",
    borderRadius: "md",
    fontSize: "12px",
  }),
  keybindingRemoveBtn: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "14px",
    height: "14px",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "text.secondary",
    borderRadius: "full",
    _hover: {
      background: "borderLight",
      color: "text.primary",
    },
  }),
  keybindingChipGroup: css({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
  }),
  addKeybindingBtn: css({
    padding: "4px 10px",
    fontSize: "12px",
    background: "transparent",
    border: "1px dashed token(colors.border)",
    borderRadius: "md",
    cursor: "pointer",
    color: "text.secondary",
    _hover: {
      background: "surfaceHover",
      borderStyle: "solid",
    },
  }),
  shortcutList: css({
    display: "flex",
    flexDirection: "column",
    gap: "md",
  }),
  shortcutItem: css({
    display: "flex",
    flexDirection: "column",
    gap: "xs",
    padding: "12px 0",
    borderBottom: "1px solid token(colors.borderLighter)",
    _last: {
      borderBottom: "none",
    },
  }),
  shortcutHeader: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),
  shortcutName: css({
    fontSize: "lg",
  }),
  shortcutKey: css({
    fontFamily: "monospace",
    background: "surfaceHover",
    padding: "6px 12px",
    borderRadius: "md",
    fontSize: "12px",
    minWidth: "80px",
    textAlign: "center",
  }),
  shortcutSettings: css({
    display: "flex",
    alignItems: "center",
    gap: "md",
    paddingLeft: "sm",
  }),
  linkButton: css({
    display: "inline-block",
    marginTop: "md",
    padding: "12px 16px",
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

export function App() {
  const [shortcuts] = createResource(getShortcuts);
  const [settings, setSettings] = createSignal<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = createSignal(false);
  const [recordingKey, setRecordingKey] = createSignal<string | null>(null);
  const themeControl = createMemo(createThemeControl);

  onMount(async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
    themeControl().applyTheme(loaded.themePreference);
  });

  onCleanup(() => {
    themeControl().cleanup();
  });

  // Re-apply theme when settings change
  createEffect(() => {
    const currentSettings = settings();
    themeControl().applyTheme(currentSettings.themePreference);
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

  async function updateKeybindings(
    key: keyof Settings["keybindings"],
    bindings: KeybindingList
  ) {
    const newSettings = {
      ...settings(),
      keybindings: { ...settings().keybindings, [key]: bindings },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
    showSaved();
  }

  function addKeybinding(
    key: keyof Settings["keybindings"],
    binding: Keybinding
  ) {
    const current = settings().keybindings[key];
    updateKeybindings(key, [...current, binding]);
  }

  function removeKeybinding(key: keyof Settings["keybindings"], index: number) {
    const current = settings().keybindings[key];
    if (current.length <= 1) return; // Don't allow removing the last keybinding
    updateKeybindings(
      key,
      current.filter((_, i) => i !== index)
    );
  }

  async function updateCommandSetting(
    command: CommandName,
    key: keyof Settings["commandSettings"][CommandName],
    value: boolean
  ) {
    const newSettings = {
      ...settings(),
      commandSettings: {
        ...settings().commandSettings,
        [command]: { ...settings().commandSettings[command], [key]: value },
      },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
    showSaved();
  }

  function isValidCommandName(name: string): name is CommandName {
    return [
      "_execute_action",
      "open-popup-all-windows",
      "open-popup-current-window",
    ].includes(name);
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

    addKeybinding(key, binding);
    setRecordingKey(null);
  }

  function openShortcutsPage() {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  }

  return (
    <div class={styles.container}>
      <h1 class={styles.h1}>QuickTabby Settings</h1>

      <div
        class={`${styles.savedIndicator} ${saved() ? styles.savedIndicatorVisible : ""}`}
      >
        Saved!
      </div>

      <div class={styles.section}>
        <h2 class={styles.sectionTitle}>Appearance</h2>
        <div class={styles.settingRow}>
          <div>
            <div class={styles.settingLabel}>Theme</div>
          </div>
          <div class={styles.radioGroup}>
            <For
              each={
                [
                  { value: "auto", label: "Auto" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ] as { value: ThemePreference; label: string }[]
              }
            >
              {(option) => (
                <label class={styles.radioOption}>
                  <input
                    type="radio"
                    name="themePreference"
                    checked={settings().themePreference === option.value}
                    onChange={() =>
                      updateSetting("themePreference", option.value)
                    }
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
                      onChange={() =>
                        updateSetting("thumbnailQuality", quality)
                      }
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
            <div class={styles.settingLabel}>Default Mode</div>
            <div class={styles.settingDescription}>
              Initial mode when opening the popup
            </div>
          </div>
          <div class={styles.radioGroup}>
            <For
              each={
                [
                  { value: "lastUsed", label: "Last Used" },
                  { value: "all", label: "All Windows" },
                  { value: "currentWindow", label: "Current Window" },
                ] as { value: DefaultMode; label: string }[]
              }
            >
              {(option) => (
                <label class={styles.radioOption}>
                  <input
                    type="radio"
                    name="defaultMode"
                    checked={settings().defaultMode === option.value}
                    onChange={() => updateSetting("defaultMode", option.value)}
                  />
                  {option.label}
                </label>
              )}
            </For>
          </div>
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
              <div class={styles.keybindingChipGroup}>
                <For each={settings().keybindings[key]}>
                  {(binding, index) => (
                    <div class={styles.keybindingChip}>
                      <span>{keybindingToString(binding)}</span>
                      <Show when={settings().keybindings[key].length > 1}>
                        <button
                          class={styles.keybindingRemoveBtn}
                          onClick={() => removeKeybinding(key, index())}
                          title="Remove keybinding"
                        >
                          ×
                        </button>
                      </Show>
                    </div>
                  )}
                </For>
                <Show
                  when={recordingKey() === key}
                  fallback={
                    <button
                      class={styles.addKeybindingBtn}
                      onClick={() => startRecording(key)}
                    >
                      + Add
                    </button>
                  }
                >
                  <div
                    class={`${styles.keybindingChip} ${styles.keybindingDisplayRecording}`}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    onBlur={() => setRecordingKey(null)}
                    ref={(el) => el?.focus()}
                  >
                    Press key...
                  </div>
                </Show>
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
                <div class={styles.shortcutHeader}>
                  <span class={styles.shortcutName}>
                    {shortcut.description}
                  </span>
                  <span class={styles.shortcutKey}>{shortcut.shortcut}</span>
                </div>
                <Show when={isValidCommandName(shortcut.name)}>
                  <div class={styles.shortcutSettings}>
                    <label class={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={
                          settings().commandSettings[
                            shortcut.name as CommandName
                          ]?.selectOnClose ?? true
                        }
                        onChange={(e) =>
                          updateCommandSetting(
                            shortcut.name as CommandName,
                            "selectOnClose",
                            e.target.checked
                          )
                        }
                      />
                      <span>Select on re-press</span>
                    </label>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
        <button class={styles.linkButton} onClick={openShortcutsPage}>
          Change Shortcuts
        </button>
        <p class={styles.note}>
          Opens Chrome's extension shortcuts page. "Select on re-press" switches
          to the selected tab when pressing the shortcut again to close the
          popup.
        </p>
      </div>
    </div>
  );
}
