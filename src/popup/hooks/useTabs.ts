import { type Accessor, createResource } from "solid-js";
import { getMRUTabs } from "../../infrastructure/chrome";
import type { DisplayMode } from "../../shared/types";

export function useTabs({
  windowInstance,
  displayMode,
}: {
  windowInstance: Accessor<chrome.windows.Window | undefined>;
  displayMode: Accessor<DisplayMode | null>;
}) {
  const [tabs, { refetch: refetchTabs }] = createResource(
    () => {
      const wid = windowInstance()?.id ?? null;
      const currentDisplayMode = displayMode();
      return wid !== null
        ? {
            windowOnly: currentDisplayMode === "currentWindow",
            windowId: wid,
          }
        : null;
    },
    async (params) =>
      params !== null
        ? await getMRUTabs(params.windowOnly, params.windowId)
        : []
  );
  return { tabs, refetchTabs };
}
