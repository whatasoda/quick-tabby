import { For, createEffect } from "solid-js";
import { css } from "../../../styled-system/css";
import type { TabInfo } from "../../shared/types.ts";
import { TabItem } from "./TabItem.tsx";

interface TabListProps {
  tabs: TabInfo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  showTabIndex?: boolean;
}

const tabListStyle = css({
  flex: 1,
  overflowY: "auto",
  maxHeight: "calc(var(--popup-height) - 120px)",
});

export function TabList(props: TabListProps) {
  let containerRef: HTMLDivElement | undefined;
  const itemRefs: (HTMLDivElement | undefined)[] = [];

  createEffect(() => {
    const index = props.selectedIndex;
    const selectedElement = itemRefs[index];
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });

  return (
    <div class={tabListStyle} ref={containerRef}>
      <For each={props.tabs}>
        {(tab, index) => (
          <div ref={(el) => (itemRefs[index()] = el)}>
            <TabItem
              tab={tab}
              isSelected={index() === props.selectedIndex}
              onSelect={() => props.onSelect(index())}
              index={index() + 1}
              showIndex={props.showTabIndex}
            />
          </div>
        )}
      </For>
    </div>
  );
}
