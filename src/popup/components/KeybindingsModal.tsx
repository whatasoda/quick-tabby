import { css } from "../../../styled-system/css";
import { keybindingToString } from "../../core/keybindings/keybinding-matcher.ts";
import type { Settings } from "../../core/settings/settings-types.ts";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import { Button, Modal } from "../../shared/ui";

interface KeybindingsModalProps {
  settings: Settings;
  onClose: () => void;
  onOpenSettings: () => void;
}

const styles = {
  title: css({
    fontSize: "md",
    fontWeight: 600,
    marginBottom: "md",
    color: "text.primary",
  }),
  table: css({
    width: "100%",
    marginBottom: "md",
  }),
  row: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
    borderBottom: "1px solid token(colors.borderLight)",
    _last: {
      borderBottom: "none",
    },
  }),
  label: css({
    fontSize: "sm",
    color: "text.secondary",
  }),
  kbd: css({
    display: "inline-block",
    padding: "2px 6px",
    fontFamily: "monospace",
    fontSize: "xs",
    background: "surfaceHover",
    borderRadius: "sm",
    color: "text.primary",
  }),
  kbdGroup: css({
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  }),
  footer: css({
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "sm",
    borderTop: "1px solid token(colors.border)",
  }),
};

function getKeybindingLabel(key: string): string {
  const labels: Record<string, string> = {
    moveDown: t(MSG.KEYBINDING_MOVE_DOWN),
    moveUp: t(MSG.KEYBINDING_MOVE_UP),
    confirm: t(MSG.KEYBINDING_CONFIRM),
    cancel: t(MSG.KEYBINDING_CANCEL),
    toggleMode: t(MSG.KEYBINDING_TOGGLE_MODE),
  };
  return labels[key] || key;
}

export function KeybindingsModal(props: KeybindingsModalProps) {
  const keybindings = () => {
    return Object.entries(props.settings.keybindings) as [
      keyof typeof props.settings.keybindings,
      typeof props.settings.keybindings.moveDown,
    ][];
  };

  return (
    <Modal onClose={props.onClose} size="sm">
      <div class={styles.title}>{t(MSG.POPUP_KEYBOARD_SHORTCUTS)}</div>
      <div class={styles.table}>
        {keybindings().map(([key, bindings]) => (
          <div class={styles.row}>
            <span class={styles.label}>{getKeybindingLabel(key)}</span>
            <div class={styles.kbdGroup}>
              {bindings.map((binding) => (
                <span class={styles.kbd}>{keybindingToString(binding)}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div class={styles.footer}>
        <Button variant="link" onClick={props.onOpenSettings}>
          {t(MSG.POPUP_OPEN_SETTINGS)}
        </Button>
      </div>
    </Modal>
  );
}
