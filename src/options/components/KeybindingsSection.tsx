import { type Accessor, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import { keybindingToString } from "../../core/keybindings/keybinding-matcher";
import type { Settings } from "../../core/settings/settings-types";
import { Button, FormField, Section } from "../../shared/ui";

const styles = {
  keybindingChipGroup: css({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
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
  keybindingChipRecording: css({
    background: "primary",
    color: "white",
  }),
};

const KEYBINDING_LABELS: [keyof Settings["keybindings"], string][] = [
  ["moveDown", "Move Down"],
  ["moveUp", "Move Up"],
  ["confirm", "Confirm Selection"],
  ["cancel", "Cancel"],
  ["toggleMode", "Toggle Mode"],
];

interface KeybindingsSectionProps {
  settings: Settings;
  recordingKey: Accessor<string | null>;
  onStartRecording: (key: string) => void;
  onStopRecording: () => void;
  onRemoveKeybinding: (key: keyof Settings["keybindings"], index: number) => void;
  onKeyDown: (e: KeyboardEvent, key: keyof Settings["keybindings"]) => void;
}

export function KeybindingsSection(props: KeybindingsSectionProps) {
  return (
    <Section title="Popup Keybindings">
      <For each={KEYBINDING_LABELS}>
        {([key, label]) => (
          <FormField label={label}>
            <div class={styles.keybindingChipGroup}>
              <For each={props.settings.keybindings[key]}>
                {(binding, index) => (
                  <div class={styles.keybindingChip}>
                    <span>{keybindingToString(binding)}</span>
                    <Show when={props.settings.keybindings[key].length > 1}>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => props.onRemoveKeybinding(key, index())}
                        title="Remove keybinding"
                      >
                        ×
                      </Button>
                    </Show>
                  </div>
                )}
              </For>
              <Show
                when={props.recordingKey() === key}
                fallback={
                  <Button variant="outline" size="sm" onClick={() => props.onStartRecording(key)}>
                    + Add
                  </Button>
                }
              >
                <div
                  class={`${styles.keybindingChip} ${styles.keybindingChipRecording}`}
                  onKeyDown={(e) => props.onKeyDown(e, key)}
                  onBlur={() => props.onStopRecording()}
                  ref={(el) => el?.focus()}
                  tabIndex={0}
                >
                  Press key...
                </div>
              </Show>
            </div>
          </FormField>
        )}
      </For>
    </Section>
  );
}
