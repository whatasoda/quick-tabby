import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, For, Show } from "solid-js";
import { css } from "../../../styled-system/css";
import type { TabInfo } from "../../shared/types.ts";
import { TabItem } from "./TabItem.tsx";

interface TabListProps {
  tabs: TabInfo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  showTabIndex?: boolean;
}

const TAB_ITEM_HEIGHT = 90;

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
      virtualizer.scrollToIndex(index, { align: "auto", behavior: "smooth" });
    }
  });

  return (
    <div class={styles.tabListContainer} ref={scrollElement}>
      <div class={styles.tabListInner} style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <For each={virtualizer.getVirtualItems()}>
          {(virtualItem) => {
            const tab = props.tabs[virtualItem.index];
            return (
              <Show when={tab}>
                {(tab) => (
                  <div
                    class={styles.virtualItem}
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <TabItem
                      tab={tab()}
                      isSelected={virtualItem.index === props.selectedIndex}
                      onSelect={() => props.onSelect(virtualItem.index)}
                      showIndex={props.showTabIndex}
                    />
                  </div>
                )}
              </Show>
            );
          }}
        </For>
      </div>
    </div>
  );
}
