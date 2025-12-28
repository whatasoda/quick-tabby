import { createSignal, createResource } from "solid-js";
import type {
  Settings,
  KeybindingList,
  CommandName,
} from "../../core/settings/settings-types";
import { loadSettings, saveSettings } from "../../shared/settings";

export function useSettings() {
  const [settings, { mutate }] = createResource(loadSettings);
  const [saved, setSaved] = createSignal(false);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    const current = settings();
    if (!current) return;

    const newSettings = { ...current, [key]: value };
    mutate(newSettings);
    await saveSettings(newSettings);
    showSaved();
  }

  async function updateKeybindings(
    key: keyof Settings["keybindings"],
    bindings: KeybindingList
  ) {
    const current = settings();
    if (!current) return;

    const newSettings = {
      ...current,
      keybindings: { ...current.keybindings, [key]: bindings },
    };
    mutate(newSettings);
    await saveSettings(newSettings);
    showSaved();
  }

  async function updateCommandSetting(
    command: CommandName,
    key: keyof Settings["commandSettings"][CommandName],
    value: boolean
  ) {
    const current = settings();
    if (!current) return;

    const newSettings = {
      ...current,
      commandSettings: {
        ...current.commandSettings,
        [command]: { ...current.commandSettings[command], [key]: value },
      },
    };
    mutate(newSettings);
    await saveSettings(newSettings);
    showSaved();
  }

  return {
    settings,
    saved,
    updateSetting,
    updateKeybindings,
    updateCommandSetting,
  };
}
