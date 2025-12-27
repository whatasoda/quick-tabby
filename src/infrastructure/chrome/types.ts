/**
 * Chrome API abstraction types
 *
 * These interfaces provide type-safe wrappers around Chrome Extension APIs,
 * enabling dependency injection and testability.
 */

// =============================================================================
// Event Types
// =============================================================================

export interface ChromeEvent<T extends (...args: never[]) => void> {
  addListener(callback: T): void;
  removeListener(callback: T): void;
}

// =============================================================================
// Storage API
// =============================================================================

export interface ChromeStorageArea<T = unknown> {
  get<K extends string>(
    key: K
  ): Promise<{ [P in K]: T | undefined }>;
  set(items: Record<string, T>): Promise<void>;
}

export interface ChromeStorageAPI {
  local: ChromeStorageArea;
  session: ChromeStorageArea;
}

// =============================================================================
// Tabs API
// =============================================================================

export interface TabInfo {
  id: number;
  windowId: number;
  index: number;
  title: string;
  url: string;
  active: boolean;
  favIconUrl?: string;
}

export interface TabActiveInfo {
  tabId: number;
  windowId: number;
}

export interface TabRemoveInfo {
  windowId: number;
  isWindowClosing: boolean;
}

export interface TabQueryInfo {
  active?: boolean;
  windowId?: number;
}

export interface TabUpdateProperties {
  active?: boolean;
}

export interface CaptureVisibleTabOptions {
  format?: "jpeg" | "png";
  quality?: number;
}

export interface ChromeTabsAPI {
  query(queryInfo: TabQueryInfo): Promise<TabInfo[]>;
  get(tabId: number): Promise<TabInfo>;
  update(tabId: number, updateProperties: TabUpdateProperties): Promise<TabInfo | undefined>;
  create(createProperties: { url: string }): Promise<TabInfo>;
  captureVisibleTab(windowId: number, options: CaptureVisibleTabOptions): Promise<string>;
  onActivated: ChromeEvent<(activeInfo: TabActiveInfo) => void>;
  onRemoved: ChromeEvent<(tabId: number, removeInfo: TabRemoveInfo) => void>;
}

// =============================================================================
// Windows API
// =============================================================================

export interface WindowInfo {
  id: number;
  focused: boolean;
  tabs?: TabInfo[];
}

export interface WindowUpdateInfo {
  focused?: boolean;
}

export interface WindowGetInfo {
  populate?: boolean;
}

export interface ChromeWindowsAPI {
  getCurrent(): Promise<WindowInfo>;
  update(windowId: number, updateInfo: WindowUpdateInfo): Promise<WindowInfo>;
  getAll(getInfo?: WindowGetInfo): Promise<WindowInfo[]>;
  onRemoved: ChromeEvent<(windowId: number) => void>;
}

// =============================================================================
// Runtime API
// =============================================================================

export interface MessageSender {
  tab?: TabInfo;
  frameId?: number;
  id?: string;
  url?: string;
}

export interface Port {
  name: string;
  disconnect(): void;
  postMessage(message: unknown): void;
  onMessage: ChromeEvent<(message: unknown) => void>;
  onDisconnect: ChromeEvent<(port: Port) => void>;
}

export interface ConnectInfo {
  name: string;
}

export interface ChromeRuntimeAPI {
  sendMessage<TMessage, TResponse>(message: TMessage): Promise<TResponse>;
  connect(connectInfo: ConnectInfo): Port;
  openOptionsPage(): Promise<void>;
  onConnect: ChromeEvent<(port: Port) => void>;
  onMessage: ChromeEvent<
    (
      message: unknown,
      sender: MessageSender,
      sendResponse: (response: unknown) => void
    ) => boolean | void
  >;
}

// =============================================================================
// Commands API
// =============================================================================

export interface Command {
  name?: string;
  description?: string;
  shortcut?: string;
}

export interface ChromeCommandsAPI {
  getAll(): Promise<Command[]>;
  onCommand: ChromeEvent<(command: string) => void>;
}

// =============================================================================
// Action API
// =============================================================================

export interface ChromeActionAPI {
  openPopup(): Promise<void>;
}

// =============================================================================
// Aggregated Chrome API
// =============================================================================

export interface ChromeAPI {
  storage: ChromeStorageAPI;
  tabs: ChromeTabsAPI;
  windows: ChromeWindowsAPI;
  runtime: ChromeRuntimeAPI;
  commands: ChromeCommandsAPI;
  action: ChromeActionAPI;
}
