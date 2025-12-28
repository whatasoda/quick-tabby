import { css } from "../../../styled-system/css";

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
      Saved!
    </div>
  );
}
