import { Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { TabInfo } from "../../shared/types.ts";

interface TabItemProps {
  tab: TabInfo;
  isSelected: boolean;
  onSelect: () => void;
}

const styles = {
  tabItem: css({
    display: "flex",
    flexDirection: "column",
    padding: "8px 12px",
    cursor: "pointer",
    borderBottom: "1px solid token(colors.borderLight)",
    transition: "background 0.1s",
    _hover: {
      background: "surface",
    },
  }),
  tabItemSelected: css({
    background: "selected",
  }),
  tabItemHeader: css({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  }),
  tabItemBody: css({
    display: "flex",
    gap: "8px",
  }),
  tabFavicon: css({
    width: "16px",
    height: "16px",
    flexShrink: 0,
  }),
  tabTitle: css({
    flex: 1,
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  }),
  tabThumbnailContainer: css({
    width: "64px",
    height: "48px",
    marginRight: "12px",
    flexShrink: 0,
    borderRadius: "md",
    overflow: "hidden",
    background: "borderLight",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  tabThumbnail: css({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }),
  tabThumbnailPlaceholder: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
  }),
  tabFaviconLarge: css({
    width: "24px",
    height: "24px",
    opacity: 0.6,
  }),
  tabUrl: css({
    flex: 1,
    fontSize: "sm",
    color: "text.secondary",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    wordBreak: "break-all",
    minWidth: 0,
  }),
};

export function TabItem(props: TabItemProps) {
  return (
    <div
      class={`${styles.tabItem} ${props.isSelected ? styles.tabItemSelected : ""}`}
      onClick={props.onSelect}
    >
      <div class={styles.tabItemHeader}>
        <img
          class={styles.tabFavicon}
          src={props.tab.favIconUrl || ""}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div class={styles.tabTitle}>{props.tab.title || "Untitled"}</div>
      </div>
      <div class={styles.tabItemBody}>
        <div class={styles.tabThumbnailContainer}>
          <Show
            when={props.tab.thumbnailUrl}
            fallback={
              <div class={styles.tabThumbnailPlaceholder}>
                <img
                  class={styles.tabFaviconLarge}
                  src={props.tab.favIconUrl || ""}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            }
          >
            <img
              class={styles.tabThumbnail}
              src={props.tab.thumbnailUrl}
              alt=""
              loading="lazy"
            />
          </Show>
        </div>
        <div class={styles.tabUrl}>{props.tab.url}</div>
      </div>
    </div>
  );
}
