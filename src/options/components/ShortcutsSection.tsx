import { createResource, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { Settings, CommandName } from "../../core/settings/settings-types";
import { getCommands, openShortcutsPage } from "../../infrastructure/chrome/messaging";
import { sectionStyles, formStyles } from "./styles";

const styles = {
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

function isValidCommandName(name: string): name is CommandName {
  return [
    "_execute_action",
    "open-popup-all-windows",
    "open-popup-current-window",
  ].includes(name);
}

interface ShortcutsSectionProps {
  settings: Settings;
  onUpdateCommandSetting: (
    command: CommandName,
    key: keyof Settings["commandSettings"][CommandName],
    value: boolean
  ) => void;
}

export function ShortcutsSection(props: ShortcutsSectionProps) {
  const [shortcuts] = createResource(getCommands);

  return (
    <div class={sectionStyles.section}>
      <h2 class={sectionStyles.sectionTitle}>Global Shortcuts</h2>

      <div class={styles.shortcutList}>
        <For each={shortcuts()}>
          {(shortcut) => (
            <div class={styles.shortcutItem}>
              <div class={styles.shortcutHeader}>
                <span class={styles.shortcutName}>{shortcut.description}</span>
                <span class={styles.shortcutKey}>{shortcut.shortcut}</span>
              </div>
              <Show when={isValidCommandName(shortcut.name)}>
                <div class={styles.shortcutSettings}>
                  <label class={formStyles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={
                        props.settings.commandSettings[
                          shortcut.name as CommandName
                        ]?.selectOnClose ?? true
                      }
                      onChange={(e) =>
                        props.onUpdateCommandSetting(
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
        to the selected tab when pressing the shortcut again to close the popup.
      </p>
    </div>
  );
}
