import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { SearchResult } from "../../core/search";
import { t } from "../../shared/i18n/index.ts";
import { MSG } from "../../shared/i18n/message-keys.ts";
import { TabItem } from "./TabItem.tsx";

interface TabListProps {
  tabs: SearchResult[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  showTabIndex?: boolean;
}

const TAB_ITEM_HEIGHT = 98;

const styles = {
  tabListContainer: css({
    flex: 1,
    overflowY: "auto",
    minHeight: 0,
  }),
  tabListInner: css({
    width: "100%",
    position: "relative",
  }),
  virtualItem: css({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  }),
  emptyState: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    color: "text.secondary",
    fontSize: "sm",
  }),
};

export function TabList(props: TabListProps) {
  let scrollElement!: HTMLDivElement;

  const virtualizer = createVirtualizer({
    get count() {
      return props.tabs.length;
    },
    getScrollElement: () => scrollElement,
    estimateSize: () => TAB_ITEM_HEIGHT,
    overscan: 3,
  });

  createEffect(() => {
    const index = props.selectedIndex;
    if (index >= 0 && index < props.tabs.length) {
      virtualizer.scrollToIndex(index, { align: "auto" });
    }
  });

  return (
    <Show
      when={props.tabs.length > 0}
      fallback={<div class={styles.emptyState}>{t(MSG.POPUP_NO_RESULTS)}</div>}
    >
      <div class={styles.tabListContainer} ref={scrollElement}>
        <div class={styles.tabListInner} style={{ height: `${virtualizer.getTotalSize()}px` }}>
          <For each={virtualizer.getVirtualItems()}>
            {(virtualItem) => {
              const searchResult = props.tabs[virtualItem.index];
              const titleMatches =
                searchResult?.matches
                  .filter((m) => m.key === "title")
                  .flatMap((m) => m.indices) ?? [];
              const urlMatches =
                searchResult?.matches
                  .filter((m) => m.key === "url")
                  .flatMap((m) => m.indices) ?? [];

              return (
                <Show when={searchResult}>
                  {(result) => (
                    <div
                      class={styles.virtualItem}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <TabItem
                        tab={result().tab}
                        isSelected={virtualItem.index === props.selectedIndex}
                        onSelect={() => props.onSelect(virtualItem.index)}
                        showIndex={props.showTabIndex}
                        titleMatches={titleMatches}
                        urlMatches={urlMatches}
                      />
                    </div>
                  )}
                </Show>
              );
            }}
          </For>
        </div>
      </div>
    </Show>
  );
}
