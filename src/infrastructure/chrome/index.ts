export type {
  AlarmCreateInfo,
  AlarmInfo,
  CaptureVisibleTabOptions,
  ChromeActionAPI,
  ChromeAlarmsAPI,
  ChromeAPI,
  ChromeCommandsAPI,
  ChromeEvent,
  ChromeRuntimeAPI,
  ChromeStorageAPI,
  ChromeStorageArea,
  ChromeTabsAPI,
  ChromeWindowsAPI,
  Command,
  ConnectInfo,
  MessageSender,
  Port,
  TabActiveInfo,
  TabInfo,
  TabQueryInfo,
  TabRemoveInfo,
  TabUpdateProperties,
  WindowGetInfo,
  WindowInfo,
  WindowUpdateInfo,
} from "./types.ts";

import { createChromeAction } from "./action.ts";
import { createChromeAlarms } from "./alarms.ts";
import { createChromeCommands } from "./commands.ts";
import { createChromeRuntime } from "./runtime.ts";
import { createChromeStorage } from "./storage.ts";
import { createChromeTabs } from "./tabs.ts";
import type { ChromeAPI } from "./types.ts";
import { createChromeWindows } from "./windows.ts";

export function createChromeAPI(): ChromeAPI {
  return {
    storage: createChromeStorage(),
    tabs: createChromeTabs(),
    windows: createChromeWindows(),
    runtime: createChromeRuntime(),
    commands: createChromeCommands(),
    action: createChromeAction(),
    alarms: createChromeAlarms(),
  };
}

export {
  createChromeAction,
  createChromeAlarms,
  createChromeCommands,
  createChromeRuntime,
  createChromeStorage,
  createChromeTabs,
  createChromeWindows,
};

export * from "./messaging.ts";
export * from "./mode-storage.ts";
