import { getPreviousTabInWindow, switchToTab, getMRUTabs } from "./mru-tracker.ts";

async function handleToggleRecent(): Promise<void> {
  const tabs = await getMRUTabs(false);
  if (tabs.length >= 2 && tabs[1]) {
    await switchToTab(tabs[1].id);
  }
}

async function handleToggleRecentSameWindow(): Promise<void> {
  const currentWindow = await chrome.windows.getCurrent();
  if (currentWindow.id === undefined) return;

  const previousTabId = await getPreviousTabInWindow(currentWindow.id);
  if (previousTabId !== null) {
    await switchToTab(previousTabId);
  }
}

export function initializeCommands(): void {
  chrome.commands.onCommand.addListener(async (command) => {
    switch (command) {
      case "toggle-recent":
        await handleToggleRecent();
        break;
      case "toggle-recent-same-window":
        await handleToggleRecentSameWindow();
        break;
    }
  });
}
