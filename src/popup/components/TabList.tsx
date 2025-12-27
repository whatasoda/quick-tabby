import { For } from "solid-js";
import type { TabInfo } from "../../shared/types.ts";
import { TabItem } from "./TabItem.tsx";

interface TabListProps {
  tabs: TabInfo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function TabList(props: TabListProps) {
  return (
    <div class="tab-list">
      <For each={props.tabs}>
        {(tab, index) => (
          <TabItem
            tab={tab}
            isSelected={index() === props.selectedIndex}
            onSelect={() => props.onSelect(index())}
          />
        )}
      </For>
    </div>
  );
}
