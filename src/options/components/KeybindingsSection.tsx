import { For, Show, type Accessor } from "solid-js";
import { css } from "../../../styled-system/css";
import type { Settings, KeybindingList } from "../../core/settings/settings-types";
import { keybindingToString } from "../../core/keybindings/keybinding-matcher";

const styles = {
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
  settingLabel: css({
    fontSize: "lg",
  }),
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
    <div class={styles.section}>
      <h2 class={styles.sectionTitle}>Popup Keybindings</h2>

      <For each={KEYBINDING_LABELS}>
        {([key, label]) => (
          <div class={styles.settingRow}>
            <div class={styles.settingLabel}>{label}</div>
            <div class={styles.keybindingChipGroup}>
              <For each={props.settings.keybindings[key]}>
                {(binding, index) => (
                  <div class={styles.keybindingChip}>
                    <span>{keybindingToString(binding)}</span>
                    <Show when={props.settings.keybindings[key].length > 1}>
                      <button
                        class={styles.keybindingRemoveBtn}
                        onClick={() => props.onRemoveKeybinding(key, index())}
                        title="Remove keybinding"
                      >
                        ×
                      </button>
                    </Show>
                  </div>
                )}
              </For>
              <Show
                when={props.recordingKey() === key}
                fallback={
                  <button
                    class={styles.addKeybindingBtn}
                    onClick={() => props.onStartRecording(key)}
                  >
                    + Add
                  </button>
                }
              >
                <div
                  class={`${styles.keybindingChip} ${styles.keybindingChipRecording}`}
                  tabIndex={0}
                  onKeyDown={(e) => props.onKeyDown(e, key)}
                  onBlur={() => props.onStopRecording()}
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
  );
}
