import { type Accessor, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import { keybindingToString } from "../../core/keybindings/keybinding-matcher";
import type { Settings } from "../../core/settings/settings-types";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
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

function getKeybindingLabels(): [keyof Settings["keybindings"], string][] {
  return [
    ["moveDown", t(MSG.KEYBINDING_MOVE_DOWN)],
    ["moveUp", t(MSG.KEYBINDING_MOVE_UP)],
    ["confirm", t(MSG.KEYBINDING_CONFIRM)],
    ["cancel", t(MSG.KEYBINDING_CANCEL)],
    ["toggleMode", t(MSG.KEYBINDING_TOGGLE_MODE)],
  ];
}

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
    <Section title={t(MSG.OPTIONS_POPUP_KEYBINDINGS)}>
      <For each={getKeybindingLabels()}>
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
                        title={t(MSG.KEYBINDING_REMOVE)}
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
                    + {t(MSG.COMMON_ADD)}
                  </Button>
                }
              >
                <div
                  class={`${styles.keybindingChip} ${styles.keybindingChipRecording}`}
                  onKeyDown={(e) => props.onKeyDown(e, key)}
                  onBlur={() => props.onStopRecording()}
                  ref={(el) => {
                    if (el) {
                      queueMicrotask(() => el.focus());
                    }
                  }}
                  tabindex={0}
                >
                  {t(MSG.KEYBINDING_PRESS_KEY)}
                </div>
              </Show>
            </div>
          </FormField>
        )}
      </For>
    </Section>
  );
}
