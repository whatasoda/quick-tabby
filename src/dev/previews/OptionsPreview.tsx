import { css } from "../../../styled-system/css";
import { App as OptionsApp } from "../../options/index.tsx";
import "../../options/index.css";

const styles = {
  container: css({
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
    maxWidth: "900px",
  }),
  title: css({
    fontSize: "20px",
    fontWeight: 600,
    color: "#333",
    margin: 0,
  }),
  frame: css({
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "24px",
    minHeight: "600px",
  }),
};

export function OptionsPreview() {
  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Options Preview</h2>
      <div class={styles.frame}>
        <OptionsApp />
      </div>
    </div>
  );
}
