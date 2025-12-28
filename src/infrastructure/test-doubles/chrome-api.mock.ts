/**
 * Chrome API Test Doubles
 *
 * Mock implementations of Chrome API interfaces for unit testing.
 * Uses the same interfaces as the real implementation for type safety.
 */

import type {
  ChromeActionAPI,
  ChromeAPI,
  ChromeCommandsAPI,
  ChromeRuntimeAPI,
  ChromeStorageAPI,
  ChromeStorageArea,
  ChromeTabsAPI,
  ChromeWindowsAPI,
  Port,
  TabInfo,
  WindowInfo,
} from "../chrome/types.ts";

// =============================================================================
// Mock Storage
// =============================================================================

export function createMockStorageArea(): ChromeStorageArea & {
  _data: Map<string, unknown>;
  _clear: () => void;
} {
  const data = new Map<string, unknown>();

  return {
    _data: data,
    _clear: () => data.clear(),

    async get<K extends string>(key: K) {
      return { [key]: data.get(key) } as { [P in K]: unknown | undefined };
    },

    async set(items: Record<string, unknown>) {
      for (const [key, value] of Object.entries(items)) {
        data.set(key, value);
      }
    },
  };
}

export function createMockStorage(): ChromeStorageAPI & {
  _clearAll: () => void;
} {
  const local = createMockStorageArea();
  const session = createMockStorageArea();

  return {
    local,
    session,
    _clearAll: () => {
      local._clear();
      session._clear();
    },
  };
}

// =============================================================================
// Mock Tabs
// =============================================================================

export interface MockTabsOptions {
  tabs?: TabInfo[];
}

export function createMockTabs(options?: MockTabsOptions): ChromeTabsAPI & {
  _tabs: TabInfo[];
  _setTabs: (tabs: TabInfo[]) => void;
  _triggerActivated: (tabId: number, windowId: number) => void;
  _triggerRemoved: (tabId: number, windowId: number) => void;
} {
  let tabs = options?.tabs ?? [];
  const activatedListeners: ((info: { tabId: number; windowId: number }) => void)[] = [];
  const removedListeners: ((
    tabId: number,
    info: { windowId: number; isWindowClosing: boolean },
  ) => void)[] = [];

  return {
    _tabs: tabs,
    _setTabs: (newTabs: TabInfo[]) => {
      tabs = newTabs;
    },
    _triggerActivated: (tabId: number, windowId: number) => {
      activatedListeners.forEach((cb) => cb({ tabId, windowId }));
    },
    _triggerRemoved: (tabId: number, windowId: number) => {
      removedListeners.forEach((cb) => cb(tabId, { windowId, isWindowClosing: false }));
    },

    async query(queryInfo) {
      return tabs.filter((tab) => {
        if (queryInfo.active !== undefined && tab.active !== queryInfo.active) {
          return false;
        }
        if (queryInfo.windowId !== undefined && tab.windowId !== queryInfo.windowId) {
          return false;
        }
        return true;
      });
    },

    async get(tabId: number) {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) {
        throw new Error(`Tab ${tabId} not found`);
      }
      return tab;
    },

    async update(tabId: number, updateProperties) {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab && updateProperties.active !== undefined) {
        tab.active = updateProperties.active;
      }
      return tab;
    },

    async create(createProperties) {
      const newTab: TabInfo = {
        id: Math.max(0, ...tabs.map((t) => t.id)) + 1,
        windowId: 1,
        index: tabs.length,
        title: createProperties.url,
        url: createProperties.url,
        active: true,
      };
      tabs.push(newTab);
      return newTab;
    },

    async captureVisibleTab(_windowId, _options) {
      return "data:image/jpeg;base64,mock-thumbnail";
    },

    onActivated: {
      addListener(callback) {
        activatedListeners.push(callback);
      },
      removeListener(callback) {
        const index = activatedListeners.indexOf(callback);
        if (index >= 0) activatedListeners.splice(index, 1);
      },
    },

    onRemoved: {
      addListener(callback) {
        removedListeners.push(callback);
      },
      removeListener(callback) {
        const index = removedListeners.indexOf(callback);
        if (index >= 0) removedListeners.splice(index, 1);
      },
    },
  };
}

// =============================================================================
// Mock Windows
// =============================================================================

export interface MockWindowsOptions {
  windows?: WindowInfo[];
}

export function createMockWindows(options?: MockWindowsOptions): ChromeWindowsAPI & {
  _windows: WindowInfo[];
  _currentWindowId: number;
  _setCurrentWindowId: (id: number) => void;
  _triggerRemoved: (windowId: number) => void;
} {
  const windows = options?.windows ?? [{ id: 1, focused: true }];
  let currentWindowId = 1;
  const removedListeners: ((windowId: number) => void)[] = [];

  return {
    _windows: windows,
    _currentWindowId: currentWindowId,
    _setCurrentWindowId: (id: number) => {
      currentWindowId = id;
    },
    _triggerRemoved: (windowId: number) => {
      removedListeners.forEach((cb) => cb(windowId));
    },

    async getCurrent() {
      return (
        windows.find((w) => w.id === currentWindowId) ?? { id: currentWindowId, focused: true }
      );
    },

    async update(windowId, updateInfo) {
      const window = windows.find((w) => w.id === windowId);
      if (window && updateInfo.focused !== undefined) {
        window.focused = updateInfo.focused;
      }
      return window ?? { id: windowId, focused: true };
    },

    async getAll(_getInfo?) {
      return windows;
    },

    onRemoved: {
      addListener(callback) {
        removedListeners.push(callback);
      },
      removeListener(callback) {
        const index = removedListeners.indexOf(callback);
        if (index >= 0) removedListeners.splice(index, 1);
      },
    },
  };
}

// =============================================================================
// Mock Runtime
// =============================================================================

export function createMockRuntime(): ChromeRuntimeAPI & {
  _messages: unknown[];
  _ports: Port[];
  _triggerConnect: (port: Port) => void;
  _triggerMessage: (message: unknown, sendResponse: (response: unknown) => void) => void;
} {
  const messages: unknown[] = [];
  const ports: Port[] = [];
  const connectListeners: ((port: Port) => void)[] = [];
  const messageListeners: ((
    message: unknown,
    sender: unknown,
    sendResponse: (r: unknown) => void,
  ) => void)[] = [];

  return {
    _messages: messages,
    _ports: ports,
    _triggerConnect: (port: Port) => {
      ports.push(port);
      connectListeners.forEach((cb) => cb(port));
    },
    _triggerMessage: (message: unknown, sendResponse: (response: unknown) => void) => {
      messageListeners.forEach((cb) => cb(message, {}, sendResponse));
    },

    async sendMessage<TMessage, TResponse>(message: TMessage): Promise<TResponse> {
      messages.push(message);
      return {} as TResponse;
    },

    connect(connectInfo) {
      const messageListeners: ((message: unknown) => void)[] = [];
      const disconnectListeners: ((port: Port) => void)[] = [];

      const port: Port = {
        name: connectInfo.name,
        disconnect() {
          disconnectListeners.forEach((cb) => cb(port));
        },
        postMessage(message: unknown) {
          messages.push(message);
        },
        onMessage: {
          addListener(callback) {
            messageListeners.push(callback);
          },
          removeListener(callback) {
            const index = messageListeners.indexOf(callback);
            if (index >= 0) messageListeners.splice(index, 1);
          },
        },
        onDisconnect: {
          addListener(callback) {
            disconnectListeners.push(callback);
          },
          removeListener(callback) {
            const index = disconnectListeners.indexOf(callback);
            if (index >= 0) disconnectListeners.splice(index, 1);
          },
        },
      };

      return port;
    },

    async openOptionsPage() {
      // No-op in tests
    },

    onConnect: {
      addListener(callback) {
        connectListeners.push(callback);
      },
      removeListener(callback) {
        const index = connectListeners.indexOf(callback);
        if (index >= 0) connectListeners.splice(index, 1);
      },
    },

    onMessage: {
      addListener(callback) {
        messageListeners.push(callback);
      },
      removeListener(callback) {
        const index = messageListeners.indexOf(callback);
        if (index >= 0) messageListeners.splice(index, 1);
      },
    },
  };
}

// =============================================================================
// Mock Commands
// =============================================================================

export function createMockCommands(): ChromeCommandsAPI & {
  _triggerCommand: (command: string) => void;
} {
  const commandListeners: ((command: string) => void)[] = [];

  return {
    _triggerCommand: (command: string) => {
      commandListeners.forEach((cb) => cb(command));
    },

    async getAll() {
      return [
        { name: "_execute_action", shortcut: "Alt+Q" },
        { name: "open-popup-all-windows", shortcut: "Alt+Shift+Q" },
        { name: "open-popup-current-window", shortcut: "Alt+Shift+W" },
      ];
    },

    onCommand: {
      addListener(callback) {
        commandListeners.push(callback);
      },
      removeListener(callback) {
        const index = commandListeners.indexOf(callback);
        if (index >= 0) commandListeners.splice(index, 1);
      },
    },
  };
}

// =============================================================================
// Mock Action
// =============================================================================

export function createMockAction(): ChromeActionAPI & {
  _popupOpened: boolean;
} {
  return {
    _popupOpened: false,

    async openPopup() {
      this._popupOpened = true;
    },
  };
}

// =============================================================================
// Full Mock Chrome API
// =============================================================================

export interface MockChromeAPIOptions {
  tabs?: TabInfo[];
  windows?: WindowInfo[];
}

export function createMockChromeAPI(options?: MockChromeAPIOptions): ChromeAPI {
  return {
    storage: createMockStorage(),
    tabs: createMockTabs({ tabs: options?.tabs }),
    windows: createMockWindows({ windows: options?.windows }),
    runtime: createMockRuntime(),
    commands: createMockCommands(),
    action: createMockAction(),
  };
}
