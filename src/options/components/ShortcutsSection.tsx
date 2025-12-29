import { createResource, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { CommandName, Settings } from "../../core/settings/settings-types";
import { getCommands, openShortcutsPage } from "../../infrastructure/chrome/messaging";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import { Button, Checkbox, Section } from "../../shared/ui";

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
  note: css({
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "sm",
  }),
};

function isValidCommandName(name: string): name is CommandName {
  return ["_execute_action", "open-popup-all-windows", "open-popup-current-window"].includes(name);
}

interface ShortcutsSectionProps {
  settings: Settings;
  onUpdateCommandSetting: (
    command: CommandName,
    key: keyof Settings["commandSettings"][CommandName],
    value: boolean,
  ) => void;
}

export function ShortcutsSection(props: ShortcutsSectionProps) {
  const [shortcuts] = createResource(getCommands);

  return (
    <Section title={t(MSG.OPTIONS_GLOBAL_SHORTCUTS)}>
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
                  <Checkbox
                    checked={
                      props.settings.commandSettings[shortcut.name as CommandName]?.selectOnClose ??
                      true
                    }
                    onChange={(checked) =>
                      props.onUpdateCommandSetting(
                        shortcut.name as CommandName,
                        "selectOnClose",
                        checked,
                      )
                    }
                  >
                    {t(MSG.OPTIONS_SELECT_ON_REPRESS)}
                  </Checkbox>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>

      <Button variant="primary" size="lg" onClick={openShortcutsPage}>
        {t(MSG.OPTIONS_CHANGE_SHORTCUTS)}
      </Button>

      <p class={styles.note}>{t(MSG.OPTIONS_SHORTCUTS_NOTE)}</p>
    </Section>
  );
}
