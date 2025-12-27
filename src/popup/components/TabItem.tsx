import type { TabInfo } from "../../shared/types.ts";

interface TabItemProps {
  tab: TabInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export function TabItem(props: TabItemProps) {
  return (
    <div
      class={`tab-item ${props.isSelected ? "selected" : ""}`}
      onClick={props.onSelect}
    >
      <img
        class="tab-favicon"
        src={props.tab.favIconUrl || ""}
        alt=""
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div class="tab-info">
        <div class="tab-title">{props.tab.title || "Untitled"}</div>
        <div class="tab-url">{props.tab.url}</div>
      </div>
    </div>
  );
}
