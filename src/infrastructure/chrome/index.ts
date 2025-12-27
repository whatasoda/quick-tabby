export type {
  ChromeAPI,
  ChromeStorageAPI,
  ChromeStorageArea,
  ChromeTabsAPI,
  ChromeWindowsAPI,
  ChromeRuntimeAPI,
  ChromeCommandsAPI,
  ChromeActionAPI,
  ChromeEvent,
  TabInfo,
  TabActiveInfo,
  TabRemoveInfo,
  TabQueryInfo,
  TabUpdateProperties,
  CaptureVisibleTabOptions,
  WindowInfo,
  WindowUpdateInfo,
  WindowGetInfo,
  Port,
  ConnectInfo,
  MessageSender,
  Command,
} from "./types.ts";

import type { ChromeAPI } from "./types.ts";
import { createChromeStorage } from "./storage.ts";
import { createChromeTabs } from "./tabs.ts";
import { createChromeWindows } from "./windows.ts";
import { createChromeRuntime } from "./runtime.ts";
import { createChromeCommands } from "./commands.ts";
import { createChromeAction } from "./action.ts";

export function createChromeAPI(): ChromeAPI {
  return {
    storage: createChromeStorage(),
    tabs: createChromeTabs(),
    windows: createChromeWindows(),
    runtime: createChromeRuntime(),
    commands: createChromeCommands(),
    action: createChromeAction(),
  };
}

export {
  createChromeStorage,
  createChromeTabs,
  createChromeWindows,
  createChromeRuntime,
  createChromeCommands,
  createChromeAction,
};
