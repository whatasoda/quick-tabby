import { createResource, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { CommandName, Settings } from "../../core/settings/settings-types";
import { getCommands, openShortcutsPage } from "../../infrastructure/chrome/messaging";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import { Button, Checkbox, RadioGroup, Section } from "../../shared/ui";

/**
 * Fixed display order for commands in the options page.
 */
const COMMAND_ORDER = [
  "_execute_action",
  "open-popup",
  "move-tab-left",
  "move-tab-right",
];

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
    flexDirection: "column",
    gap: "sm",
    paddingLeft: "sm",
  }),
  settingRow: css({
    display: "flex",
    alignItems: "center",
    gap: "md",
  }),
  note: css({
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "sm",
  }),
};

function isPopupCommand(name: string): boolean {
  return name === "_execute_action" || name === "open-popup";
}

interface ShortcutsSectionProps {
  settings: Settings;
  onUpdateCommandSetting: (
    command: CommandName,
    key: keyof Settings["commandSettings"][CommandName],
    value: boolean | "all" | "currentWindow",
  ) => void;
}

export function ShortcutsSection(props: ShortcutsSectionProps) {
  const [shortcuts] = createResource(getCommands);

  const sortedShortcuts = () => {
    const list = shortcuts() ?? [];
    return [...list].sort(
      (a, b) => COMMAND_ORDER.indexOf(a.name) - COMMAND_ORDER.indexOf(b.name),
    );
  };

  const modeOptions = [
    { value: "all", label: t(MSG.OPTIONS_MODE_ALL) },
    { value: "currentWindow", label: t(MSG.OPTIONS_MODE_CURRENT) },
  ];

  return (
    <Section title={t(MSG.OPTIONS_GLOBAL_SHORTCUTS)}>
      <div class={styles.shortcutList}>
        <For each={sortedShortcuts()}>
          {(shortcut) => (
            <div class={styles.shortcutItem}>
              <div class={styles.shortcutHeader}>
                <span class={styles.shortcutName}>{shortcut.description}</span>
                <span class={styles.shortcutKey}>{shortcut.shortcut}</span>
              </div>
              <Show when={isPopupCommand(shortcut.name ?? "")}>
                <div class={styles.shortcutSettings}>
                  <div class={styles.settingRow}>
                    <Checkbox
                      checked={
                        props.settings.commandSettings[shortcut.name as CommandName]
                          ?.selectOnClose ?? true
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
                  <div class={styles.settingRow}>
                    <span>{t(MSG.OPTIONS_POPUP_MODE)}:</span>
                    <RadioGroup
                      name={`mode-${shortcut.name}`}
                      options={modeOptions}
                      value={
                        props.settings.commandSettings[shortcut.name as CommandName]?.mode ?? "all"
                      }
                      onChange={(value) =>
                        props.onUpdateCommandSetting(
                          shortcut.name as CommandName,
                          "mode",
                          value as "all" | "currentWindow",
                        )
                      }
                    />
                  </div>
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
