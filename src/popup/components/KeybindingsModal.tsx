import { Show, onMount, onCleanup } from "solid-js";
import { css } from "../../../styled-system/css";
import { keybindingToString } from "../../shared/settings.ts";
import type { Settings } from "../../shared/types.ts";

interface KeybindingsModalProps {
  settings: Settings;
  onClose: () => void;
  onOpenSettings: () => void;
}

const styles = {
  overlay: css({
    position: "fixed",
    inset: 0,
    background: "overlay",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  }),
  modal: css({
    background: "background",
    borderRadius: "lg",
    padding: "lg",
    minWidth: "200px",
    maxWidth: "280px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  }),
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
    padding: "xs 0",
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
  footer: css({
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "sm",
    borderTop: "1px solid token(colors.border)",
  }),
  settingsLink: css({
    fontSize: "sm",
    color: "primary",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: "xs sm",
    borderRadius: "sm",
    _hover: {
      background: "surfaceHover",
    },
  }),
};

const KEYBINDING_LABELS: Record<string, string> = {
  moveDown: "下に移動",
  moveUp: "上に移動",
  confirm: "選択",
  cancel: "キャンセル",
  toggleMode: "モード切替",
};

export function KeybindingsModal(props: KeybindingsModalProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      props.onClose();
    }
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  const keybindings = () => {
    return Object.entries(props.settings.keybindings) as [
      keyof typeof props.settings.keybindings,
      typeof props.settings.keybindings.moveDown
    ][];
  };

  return (
    <div class={styles.overlay} onClick={handleOverlayClick}>
      <div class={styles.modal}>
        <div class={styles.title}>キーボードショートカット</div>
        <div class={styles.table}>
          {keybindings().map(([key, binding]) => (
            <div class={styles.row}>
              <span class={styles.label}>{KEYBINDING_LABELS[key]}</span>
              <span class={styles.kbd}>{keybindingToString(binding)}</span>
            </div>
          ))}
        </div>
        <div class={styles.footer}>
          <button class={styles.settingsLink} onClick={props.onOpenSettings}>
            設定を開く
          </button>
        </div>
      </div>
    </div>
  );
}
