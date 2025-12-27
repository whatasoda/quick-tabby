import { render } from "solid-js/web";
import { createSignal, createResource, For, onMount, Show } from "solid-js";
import type {
  Settings,
  PopupSize,
  PreviewSize,
  Keybinding,
} from "../shared/types.ts";
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  keybindingToString,
} from "../shared/settings.ts";

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

  onMount(async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
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
    <div class="container">
      <h1>QuickTabby Settings</h1>

      <div class={`saved-indicator ${saved() ? "visible" : ""}`}>Saved!</div>

      <div class="section">
        <h2 class="section-title">Appearance</h2>
        <div class="setting-row">
          <div>
            <div class="setting-label">Popup Size</div>
          </div>
          <div class="radio-group">
            <For each={["small", "medium", "large"] as PopupSize[]}>
              {(size) => (
                <label class="radio-option">
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

      <div class="section">
        <h2 class="section-title">Behavior</h2>
        <div class="setting-row">
          <div>
            <div class="setting-label">Preview Mode</div>
            <div class="setting-description">
              Show enlarged thumbnail of selected tab
            </div>
          </div>
          <label class="checkbox-label">
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
          <div class="setting-row sub-setting">
            <div>
              <div class="setting-label">Preview Size</div>
            </div>
            <div class="radio-group">
              <For each={["small", "medium", "large"] as PreviewSize[]}>
                {(size) => (
                  <label class="radio-option">
                    <input
                      type="radio"
                      name="previewSize"
                      checked={settings().previewSize === size}
                      onChange={() => updateSetting("previewSize", size)}
                    />
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </label>
                )}
              </For>
            </div>
          </div>
        </Show>
        <div class="setting-row">
          <div>
            <div class="setting-label">Enable Mode Toggle</div>
            <div class="setting-description">
              Allow switching between All/Window mode
            </div>
          </div>
          <label class="checkbox-label">
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

      <div class="section">
        <h2 class="section-title">Popup Keybindings</h2>
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
            <div class="setting-row">
              <div class="setting-label">{label}</div>
              <div class="keybinding-input">
                <div
                  class={`keybinding-display ${recordingKey() === key ? "recording" : ""}`}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, key)}
                  onBlur={() => setRecordingKey(null)}
                >
                  {recordingKey() === key
                    ? "Press key..."
                    : keybindingToString(settings().keybindings[key])}
                </div>
                <button class="record-btn" onClick={() => startRecording(key)}>
                  Edit
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

      <div class="section">
        <h2 class="section-title">Global Shortcuts</h2>
        <div class="shortcut-list">
          <For each={shortcuts()}>
            {(shortcut) => (
              <div class="shortcut-item">
                <span class="shortcut-name">{shortcut.description}</span>
                <span class="shortcut-key">{shortcut.shortcut}</span>
              </div>
            )}
          </For>
        </div>
        <button class="link-button" onClick={openShortcutsPage}>
          Change Shortcuts
        </button>
        <p class="note">
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
