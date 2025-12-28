import type { ChromeRuntimeAPI, ConnectInfo, MessageSender, Port } from "./types.ts";

function mapPort(port: chrome.runtime.Port): Port {
  return {
    name: port.name,
    disconnect() {
      port.disconnect();
    },
    postMessage(message: unknown) {
      port.postMessage(message);
    },
    onMessage: {
      addListener(callback: (message: unknown) => void) {
        port.onMessage.addListener(callback);
      },
      removeListener(callback: (message: unknown) => void) {
        port.onMessage.removeListener(callback);
      },
    },
    onDisconnect: {
      addListener(callback: (port: Port) => void) {
        port.onDisconnect.addListener(() => callback(mapPort(port)));
      },
      removeListener(callback: (port: Port) => void) {
        port.onDisconnect.removeListener(() => callback(mapPort(port)));
      },
    },
  };
}

function mapSender(sender: chrome.runtime.MessageSender): MessageSender {
  return {
    tab: sender.tab
      ? {
          id: sender.tab.id ?? -1,
          windowId: sender.tab.windowId ?? -1,
          index: sender.tab.index,
          title: sender.tab.title ?? "",
          url: sender.tab.url ?? "",
          active: sender.tab.active,
          favIconUrl: sender.tab.favIconUrl,
        }
      : undefined,
    frameId: sender.frameId,
    id: sender.id,
    url: sender.url,
  };
}

export function createChromeRuntime(): ChromeRuntimeAPI {
  return {
    async sendMessage<TMessage, TResponse>(message: TMessage): Promise<TResponse> {
      return chrome.runtime.sendMessage(message) as Promise<TResponse>;
    },

    connect(connectInfo: ConnectInfo): Port {
      const port = chrome.runtime.connect(connectInfo);
      return mapPort(port);
    },

    async openOptionsPage(): Promise<void> {
      await chrome.runtime.openOptionsPage();
    },

    onConnect: {
      addListener(callback: (port: Port) => void) {
        chrome.runtime.onConnect.addListener((port) => {
          callback(mapPort(port));
        });
      },
      removeListener(callback: (port: Port) => void) {
        chrome.runtime.onConnect.removeListener((port) => {
          callback(mapPort(port));
        });
      },
    },

    onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response: unknown) => void,
        ) => boolean | undefined,
      ) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          return callback(message, mapSender(sender), sendResponse);
        });
      },
      removeListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response: unknown) => void,
        ) => boolean | undefined,
      ) {
        chrome.runtime.onMessage.removeListener((message, sender, sendResponse) => {
          return callback(message, mapSender(sender), sendResponse);
        });
      },
    },
  };
}
