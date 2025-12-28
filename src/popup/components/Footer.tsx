import { FiHelpCircle, FiSettings } from "solid-icons/fi";
import { css } from "../../../styled-system/css";
import { Button } from "../../shared/ui";

const styles = {
  footer: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid token(colors.border)",
    background: "surfaceAlt",
    marginTop: "auto",
  }),
  footerLeft: css({
    display: "flex",
    alignItems: "center",
  }),
  footerRight: css({
    display: "flex",
    alignItems: "center",
    gap: "xs",
  }),
  modeIndicator: css({
    fontSize: "sm",
    color: "text.secondary",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "md",
    transition: "all 0.15s",
    userSelect: "none",
    _hover: {
      background: "surfaceHover",
      color: "text.primary",
    },
  }),
};

interface FooterProps {
  windowOnly: boolean;
  onToggleMode: () => void;
  onOpenKeybindings: () => void;
  onOpenSettings: () => void;
}

export function Footer(props: FooterProps) {
  return (
    <div class={styles.footer}>
      <div class={styles.footerLeft}>
        <span
          class={styles.modeIndicator}
          onClick={props.onToggleMode}
          title="Click to toggle mode"
        >
          {props.windowOnly ? "Current Window" : "All Windows"}
        </span>
      </div>
      <div class={styles.footerRight}>
        <Button
          variant="ghost"
          size="icon"
          onClick={props.onOpenKeybindings}
          title="キーボードショートカット"
        >
          <FiHelpCircle size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={props.onOpenSettings} title="設定">
          <FiSettings size={16} />
        </Button>
      </div>
    </div>
  );
}
