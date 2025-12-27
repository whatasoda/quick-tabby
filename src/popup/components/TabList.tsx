import { For, createEffect } from "solid-js";
import type { TabInfo } from "../../shared/types.ts";
import { TabItem } from "./TabItem.tsx";

interface TabListProps {
  tabs: TabInfo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

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
    <div class="tab-list" ref={containerRef}>
      <For each={props.tabs}>
        {(tab, index) => (
          <div ref={(el) => (itemRefs[index()] = el)}>
            <TabItem
              tab={tab}
              isSelected={index() === props.selectedIndex}
              onSelect={() => props.onSelect(index())}
            />
          </div>
        )}
      </For>
    </div>
  );
}
