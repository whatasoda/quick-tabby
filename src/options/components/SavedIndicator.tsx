import { css } from "../../../styled-system/css";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";

const styles = {
  indicator: css({
    position: "fixed",
    top: "xl",
    right: "xl",
    background: "success",
    color: "white",
    padding: "8px 16px",
    borderRadius: "md",
    fontSize: "lg",
    opacity: 0,
    transition: "opacity 0.3s",
  }),
  visible: css({
    opacity: 1,
  }),
};

interface SavedIndicatorProps {
  visible: boolean;
}

export function SavedIndicator(props: SavedIndicatorProps) {
  return (
    <div class={`${styles.indicator} ${props.visible ? styles.visible : ""}`}>
      {t(MSG.COMMON_SAVED)}
    </div>
  );
}
