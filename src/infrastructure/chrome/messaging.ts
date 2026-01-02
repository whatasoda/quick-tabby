/**
 * Messaging utilities for popup-to-background communication
 *
 * Provides type-safe wrappers around Chrome runtime messaging API.
 * Includes retry logic for handling service worker termination.
 */

import {
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
  delay,
  isRetryableError,
  type RetryConfig,
} from "../../core/retry/index.ts";
import type { ThumbnailConfig } from "../../core/settings/settings-types.ts";
import type { LaunchInfo, MessageResponse, MessageType, TabInfo } from "../../shared/types.ts";
import { MessagingError, toMessagingError } from "./messaging-errors.ts";

/**
 * Send a message to the background script and return the response.
 * This is the low-level function without retry logic.
 */
async function sendMessageRaw(message: MessageType): Promise<MessageResponse | null> {
  const response = await chrome.runtime.sendMessage(message);
  return response as MessageResponse | null;
}

/**
 * Send a message to the background script with retry logic.
 * Automatically retries on recoverable errors (e.g., service worker termination).
 *
 * @param message - The message to send
 * @param config - Optional retry configuration
 * @returns The response from the background script
 * @throws MessagingError if all retry attempts fail
 */
export async function sendMessage(
  message: MessageType,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<MessageResponse | null> {
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      const response = await sendMessageRaw(message);

      // Handle ERROR response type from background
      if (response?.type === "ERROR") {
        throw new MessagingError(response.message, "RESPONSE_ERROR");
      }

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a retryable error or this is the last attempt
      if (!isRetryableError(error) || attempt >= config.maxAttempts - 1) {
        break;
      }

      // Wait before retrying with exponential backoff
      const backoffDelay = calculateBackoffDelay(attempt, config);
      await delay(backoffDelay);
    }
  }

  throw toMessagingError(lastError);
}

/**
 * Fetch MRU tabs from the background script
 */
export async function getMRUTabs(windowOnly: boolean, windowId: number): Promise<TabInfo[]> {
  const response = await sendMessage({
    type: "GET_MRU_TABS",
    windowOnly,
    windowId,
  });
  return response?.type === "MRU_TABS" ? response.tabs : [];
}

/**
 * Switch to a tab and close the popup
 */
export async function switchToTab(tabId: number): Promise<void> {
  await sendMessage({ type: "SWITCH_TO_TAB", tabId });
  window.close();
}

/**
 * Capture the current tab's thumbnail
 */
export async function captureCurrentTab(
  windowId: number | undefined,
  thumbnailConfig: ThumbnailConfig,
): Promise<void> {
  await sendMessage({
    type: "CAPTURE_CURRENT_TAB",
    windowId,
    thumbnailConfig,
  });
}

/**
 * Get launch info (mode override from shortcut)
 */
export async function getLaunchInfo(): Promise<LaunchInfo | null> {
  const response = await sendMessage({ type: "GET_LAUNCH_INFO" });
  return response?.type === "LAUNCH_INFO" ? response.info : null;
}

/**
 * Clear launch info after use
 */
export async function clearLaunchInfo(): Promise<void> {
  await sendMessage({ type: "CLEAR_LAUNCH_INFO" });
}

/**
 * Connect to the background script for persistent communication
 */
export function connectPopup(): chrome.runtime.Port {
  return chrome.runtime.connect({ name: "popup" });
}

/**
 * Managed popup connection with automatic reconnection support
 */
export interface PopupConnection {
  /** Get the current port (null if disconnected) */
  getPort(): chrome.runtime.Port | null;
  /** Whether the connection is currently active */
  isConnected(): boolean;
  /** Manually trigger reconnection */
  reconnect(): void;
  /** Disconnect and stop reconnection attempts */
  disconnect(): void;
  /** Add a listener for connection state changes */
  onConnectionChange(callback: (connected: boolean) => void): () => void;
  /** Add a message listener */
  onMessage(callback: (message: unknown) => void): () => void;
}

/**
 * Configuration for popup connection
 */
export interface PopupConnectionConfig {
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts: number;
  /** Base delay in milliseconds before first reconnection */
  baseDelayMs: number;
  /** Maximum delay in milliseconds between reconnections */
  maxDelayMs: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
}

const DEFAULT_POPUP_CONNECTION_CONFIG: PopupConnectionConfig = {
  maxReconnectAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 2000,
  backoffMultiplier: 2,
};

/**
 * Create a managed popup connection with automatic reconnection.
 * Handles service worker termination gracefully by attempting to reconnect.
 *
 * @param config - Optional connection configuration
 * @returns A PopupConnection object for managing the connection
 */
export function createPopupConnection(
  config: Partial<PopupConnectionConfig> = {},
): PopupConnection {
  const fullConfig = { ...DEFAULT_POPUP_CONNECTION_CONFIG, ...config };

  let port: chrome.runtime.Port | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let isDisconnecting = false;

  const connectionListeners = new Set<(connected: boolean) => void>();
  const messageListeners = new Set<(message: unknown) => void>();

  function notifyConnectionChange(connected: boolean): void {
    for (const listener of connectionListeners) {
      listener(connected);
    }
  }

  function handleMessage(message: unknown): void {
    for (const listener of messageListeners) {
      listener(message);
    }
  }

  function handleDisconnect(): void {
    port = null;
    notifyConnectionChange(false);

    // Don't reconnect if manually disconnecting
    if (isDisconnecting) {
      return;
    }

    attemptReconnect();
  }

  function attemptReconnect(): void {
    if (reconnectAttempts >= fullConfig.maxReconnectAttempts) {
      return;
    }

    const delayMs = fullConfig.baseDelayMs * fullConfig.backoffMultiplier ** reconnectAttempts;
    const cappedDelay = Math.min(delayMs, fullConfig.maxDelayMs);
    reconnectAttempts++;

    reconnectTimeoutId = setTimeout(() => {
      reconnectTimeoutId = null;
      if (!port && !isDisconnecting) {
        connect();
      }
    }, cappedDelay);
  }

  function connect(): void {
    try {
      port = chrome.runtime.connect({ name: "popup" });
      reconnectAttempts = 0;
      port.onMessage.addListener(handleMessage);
      port.onDisconnect.addListener(handleDisconnect);
      notifyConnectionChange(true);
    } catch {
      port = null;
      attemptReconnect();
    }
  }

  // Initial connection
  connect();

  return {
    getPort(): chrome.runtime.Port | null {
      return port;
    },

    isConnected(): boolean {
      return port !== null;
    },

    reconnect(): void {
      if (port) {
        return; // Already connected
      }
      reconnectAttempts = 0;
      connect();
    },

    disconnect(): void {
      isDisconnecting = true;

      if (reconnectTimeoutId !== null) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }

      if (port) {
        port.disconnect();
        port = null;
      }

      connectionListeners.clear();
      messageListeners.clear();
    },

    onConnectionChange(callback: (connected: boolean) => void): () => void {
      connectionListeners.add(callback);
      return () => connectionListeners.delete(callback);
    },

    onMessage(callback: (message: unknown) => void): () => void {
      messageListeners.add(callback);
      return () => messageListeners.delete(callback);
    },
  };
}

/**
 * Open the extension options page
 */
export function openOptionsPage(): void {
  chrome.runtime.openOptionsPage();
}

/**
 * Get the current window
 */
export async function getWindowInstance(): Promise<chrome.windows.Window> {
  return chrome.windows.getCurrent();
}

/**
 * Shortcut information from Chrome commands
 */
export interface ShortcutInfo {
  name: string;
  description: string;
  shortcut: string;
}

/**
 * Get all registered keyboard shortcuts for this extension
 */
export async function getCommands(): Promise<ShortcutInfo[]> {
  const commands = await chrome.commands.getAll();
  return commands.map((cmd) => ({
    name: cmd.name ?? "",
    description: cmd.description ?? "",
    shortcut: cmd.shortcut ?? "Not set",
  }));
}

/**
 * Open Chrome's extension shortcuts settings page
 */
export function openShortcutsPage(): void {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
}
