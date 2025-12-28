import { Show } from "solid-js";
import "./index.css";
import { css } from "../../styled-system/css";
import type { Settings, Keybinding } from "../core/settings/settings-types";
import { useSettings } from "./hooks/useSettings";
import { useKeybindingRecorder } from "./hooks/useKeybindingRecorder";
import { OptionsWindow } from "./components/OptionsWindow";
import { SavedIndicator } from "./components/SavedIndicator";
import { AppearanceSection } from "./components/AppearanceSection";
import { BehaviorSection } from "./components/BehaviorSection";
import { KeybindingsSection } from "./components/KeybindingsSection";
import { ShortcutsSection } from "./components/ShortcutsSection";

const styles = {
  h1: css({
    fontSize: "xxl",
    margin: "0 0 24px",
  }),
};

export function App() {
  const {
    settings,
    saved,
    updateSetting,
    updateKeybindings,
    updateCommandSetting,
  } = useSettings();

  function addKeybinding(
    key: keyof Settings["keybindings"],
    binding: Keybinding
  ) {
    const current = settings()?.keybindings[key];
    if (current) {
      updateKeybindings(key, [...current, binding]);
    }
  }

  function removeKeybinding(
    key: keyof Settings["keybindings"],
    index: number
  ) {
    const current = settings()?.keybindings[key];
    if (current && current.length > 1) {
      updateKeybindings(
        key,
        current.filter((_, i) => i !== index)
      );
    }
  }

  const {
    recordingKey,
    startRecording,
    stopRecording,
    handleKeyDown,
  } = useKeybindingRecorder({
    onAddKeybinding: addKeybinding,
  });

  return (
    <OptionsWindow settings={settings}>
      <h1 class={styles.h1}>QuickTabby Settings</h1>
      <SavedIndicator visible={saved()} />

      <Show when={settings()}>
        {(currentSettings) => (
          <>
            <AppearanceSection
              settings={currentSettings()}
              onUpdateSetting={updateSetting}
            />

            <BehaviorSection
              settings={currentSettings()}
              onUpdateSetting={updateSetting}
            />

            <KeybindingsSection
              settings={currentSettings()}
              recordingKey={recordingKey}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onRemoveKeybinding={removeKeybinding}
              onKeyDown={handleKeyDown}
            />

            <ShortcutsSection
              settings={currentSettings()}
              onUpdateCommandSetting={updateCommandSetting}
            />
          </>
        )}
      </Show>
    </OptionsWindow>
  );
}
