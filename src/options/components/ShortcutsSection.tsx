import { createResource, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { CommandName, Settings } from "../../core/settings/settings-types";
import { getCommands, openShortcutsPage } from "../../infrastructure/chrome/messaging";
import { t } from "../../shared/i18n/index.ts";
import { type MessageKey, MSG } from "../../shared/i18n/message-keys.ts";
import { Button, Checkbox, RadioGroup, Section } from "../../shared/ui";

/**
 * Fixed display order for commands in the options page.
 */
const COMMAND_ORDER = ["open-popup", "move-tab-left", "move-tab-right"];

/**
 * Mapping from command names to i18n message keys for descriptions.
 */
const COMMAND_DESCRIPTION_KEYS: Record<string, MessageKey> = {
  "open-popup": MSG.MANIFEST_COMMAND_OPEN_POPUP,
  "move-tab-left": MSG.MANIFEST_COMMAND_MOVE_TAB_LEFT,
  "move-tab-right": MSG.MANIFEST_COMMAND_MOVE_TAB_RIGHT,
};

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
    gap: "md",
  }),
  shortcutHeaderLeft: css({
    display: "flex",
    alignItems: "center",
    gap: "md",
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
    paddingLeft: "sm",
  }),
  note: css({
    fontSize: "12px",
    color: "text.secondary",
    marginTop: "sm",
  }),
};

function isPopupCommand(name: string): boolean {
  return name === "open-popup";
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
    return [...list].sort((a, b) => COMMAND_ORDER.indexOf(a.name) - COMMAND_ORDER.indexOf(b.name));
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
                <div class={styles.shortcutHeaderLeft}>
                  <span class={styles.shortcutName}>
                    {t(COMMAND_DESCRIPTION_KEYS[shortcut.name] ?? shortcut.name)}
                  </span>
                  <Show when={isPopupCommand(shortcut.name ?? "")}>
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
                  </Show>
                </div>
                <span class={styles.shortcutKey}>{shortcut.shortcut}</span>
              </div>
              <Show when={isPopupCommand(shortcut.name ?? "")}>
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
