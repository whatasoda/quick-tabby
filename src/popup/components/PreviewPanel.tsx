import { Show } from "solid-js";
import { css } from "../../../styled-system/css";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import type { TabInfo } from "../../shared/types.ts";

// Styles co-located with component (PandaCSS best practice)
const styles = {
  previewPanel: css({
    width: "var(--preview-width, 180px)",
    maxHeight: "var(--popup-height)",
    background: "surfaceAlt",
    padding: "md",
    flexShrink: 0,
    borderRight: "1px solid token(colors.border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  }),
  thumbnail: css({
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    maxHeight: "calc(var(--popup-height) - 80px)",
    objectFit: "contain",
    borderRadius: "lg",
    background: "background",
    boxShadow: "sm",
  }),
  placeholder: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "14 / 9",
    background:
      "linear-gradient(135deg, token(colors.surface) 0%, token(colors.surfaceHover) 100%)",
    borderRadius: "lg",
  }),
  favicon: css({
    width: "32px",
    height: "32px",
    opacity: 0.5,
  }),
  noThumbnail: css({
    marginTop: "sm",
    fontSize: "sm",
    color: "text.muted",
  }),
  info: css({
    marginTop: "sm",
    height: "56px",
    flexShrink: 0,
  }),
  title: css({
    fontWeight: 500,
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    boxOrient: "vertical",
  }),
  url: css({
    fontSize: "sm",
    color: "text.secondary",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "2px",
  }),
};

interface PreviewPanelProps {
  selectedTab: TabInfo | null;
}

export function PreviewPanel(props: PreviewPanelProps) {
  return (
    <div class={styles.previewPanel}>
      <Show
        when={props.selectedTab}
        fallback={
          <div class={styles.placeholder}>
            <div class={styles.noThumbnail}>{t(MSG.POPUP_SELECT_TO_PREVIEW)}</div>
          </div>
        }
      >
        {(tab) => (
          <>
            <Show
              when={tab().thumbnailUrl}
              fallback={
                <div class={styles.placeholder}>
                  <img class={styles.favicon} src={tab().favIconUrl || ""} alt="" />
                  <div class={styles.noThumbnail}>{t(MSG.POPUP_NO_PREVIEW)}</div>
                </div>
              }
            >
              <img class={styles.thumbnail} src={tab().thumbnailUrl} alt={tab().title} />
            </Show>
            <div class={styles.info}>
              <div class={styles.title}>{tab().title}</div>
              <div class={styles.url}>{tab().url}</div>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
