import { createSignal } from "solid-js";
import type { Keybinding, Settings } from "../../core/settings/settings-types";

interface UseKeybindingRecorderOptions {
  onAddKeybinding: (key: keyof Settings["keybindings"], binding: Keybinding) => void;
}

export function useKeybindingRecorder(options: UseKeybindingRecorderOptions) {
  const { onAddKeybinding } = options;
  const [recordingKey, setRecordingKey] = createSignal<string | null>(null);

  function startRecording(key: string) {
    setRecordingKey(key);
  }

  function stopRecording() {
    setRecordingKey(null);
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

    onAddKeybinding(key, binding);
    setRecordingKey(null);
  }

  return {
    recordingKey,
    startRecording,
    stopRecording,
    handleKeyDown,
  };
}
