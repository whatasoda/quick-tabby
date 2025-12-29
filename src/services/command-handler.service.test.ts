/**
 * Command Handler Service Tests
 */

import { beforeEach, describe, expect, test } from "vitest";
import { DEFAULT_SETTINGS } from "../core/settings/settings-defaults.ts";
import type { Settings } from "../core/settings/settings-types.ts";
import type { Port } from "../infrastructure/chrome/types.ts";
import {
  createMockAction,
  createMockCommands,
  createMockTabs,
} from "../infrastructure/test-doubles/chrome-api.mock.ts";
import {
  type CommandHandlerDependencies,
  createCommandHandlerService,
} from "./command-handler.service.ts";
import type { SettingsService } from "./settings.service.ts";

function createMockSettingsService(settings?: Partial<Settings>): SettingsService {
  const fullSettings = { ...DEFAULT_SETTINGS, ...settings };
  return {
    async load() {
      return fullSettings;
    },
    async save() {},
  };
}

function createMockPort(name: string): Port & { _messages: unknown[] } {
  const messages: unknown[] = [];
  const messageListeners: ((message: unknown) => void)[] = [];
  const disconnectListeners: ((port: Port) => void)[] = [];

  const port: Port & { _messages: unknown[] } = {
    name,
    _messages: messages,
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
}

describe("CommandHandlerService", () => {
  let mockAction: ReturnType<typeof createMockAction>;
  let mockCommands: ReturnType<typeof createMockCommands>;
  let mockTabs: ReturnType<typeof createMockTabs>;
  let mockSettingsService: SettingsService;
  let deps: CommandHandlerDependencies;

  beforeEach(() => {
    mockAction = createMockAction();
    mockCommands = createMockCommands();
    mockTabs = createMockTabs({
      tabs: [
        { id: 1, windowId: 1, index: 0, title: "Tab 1", url: "https://example.com/1", active: true },
        { id: 2, windowId: 1, index: 1, title: "Tab 2", url: "https://example.com/2", active: false },
        { id: 3, windowId: 1, index: 2, title: "Tab 3", url: "https://example.com/3", active: false },
      ],
    });
    mockSettingsService = createMockSettingsService();
    deps = {
      action: mockAction,
      commands: mockCommands,
      tabs: mockTabs,
      settingsService: mockSettingsService,
    };
  });

  describe("initialize", () => {
    test("should register command listener", async () => {
      const service = createCommandHandlerService(deps);

      service.initialize();

      // Trigger command to verify listener is set up
      mockCommands._triggerCommand("open-popup");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockAction._popupOpened).toBe(true);
    });
  });

  describe("getLaunchInfo", () => {
    test("should return null mode initially", () => {
      const service = createCommandHandlerService(deps);

      const launchInfo = service.getLaunchInfo();

      expect(launchInfo.mode).toBeNull();
      expect(launchInfo.command).toBeNull();
    });

    test("should set mode from settings when open-popup command is triggered", async () => {
      // Default mode for open-popup is "currentWindow"
      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("open-popup");
      await new Promise((resolve) => setTimeout(resolve, 0));

      const launchInfo = service.getLaunchInfo();
      expect(launchInfo.mode).toBe("currentWindow");
      expect(launchInfo.command).toBe("open-popup");
    });
  });

  describe("clearLaunchInfo", () => {
    test("should reset launch info", async () => {
      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("open-popup");
      await new Promise((resolve) => setTimeout(resolve, 0));

      service.clearLaunchInfo();

      const launchInfo = service.getLaunchInfo();
      expect(launchInfo.mode).toBeNull();
      expect(launchInfo.command).toBeNull();
    });
  });

  describe("tab navigation", () => {
    test("should activate right adjacent tab", async () => {
      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("move-tab-right");
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Tab 1 (index 0) was active, should now activate Tab 2 (index 1)
      const tabs = mockTabs._tabs;
      expect(tabs[0]?.active).toBe(false);
      expect(tabs[1]?.active).toBe(true);
    });

    test("should activate left adjacent tab", async () => {
      // Set Tab 2 as active
      const tabs = mockTabs._tabs;
      if (tabs[0]) tabs[0].active = false;
      if (tabs[1]) tabs[1].active = true;

      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("move-tab-left");
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Tab 2 (index 1) was active, should now activate Tab 1 (index 0)
      expect(tabs[0]?.active).toBe(true);
      expect(tabs[1]?.active).toBe(false);
    });

    test("should loop to last tab when moving left from first tab", async () => {
      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("move-tab-left");
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Tab 1 (index 0) was active, should loop to Tab 3 (index 2)
      const tabs = mockTabs._tabs;
      expect(tabs[0]?.active).toBe(false);
      expect(tabs[2]?.active).toBe(true);
    });
  });

  describe("popup port management", () => {
    test("should track popup port connection", () => {
      const service = createCommandHandlerService(deps);
      const mockPort = createMockPort("popup");

      service.setPopupPort(mockPort);

      expect(service.getPopupPort()).toBe(mockPort);
      expect(service.isPopupOpen()).toBe(true);
    });

    test("should track popup port disconnection", () => {
      const service = createCommandHandlerService(deps);
      const mockPort = createMockPort("popup");

      service.setPopupPort(mockPort);
      service.setPopupPort(null);

      expect(service.getPopupPort()).toBeNull();
      expect(service.isPopupOpen()).toBe(false);
    });

    test("should send close message when command triggered while popup is open", async () => {
      const service = createCommandHandlerService(deps);
      service.initialize();
      const mockPort = createMockPort("popup");
      service.setPopupPort(mockPort);

      mockCommands._triggerCommand("open-popup");
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockPort._messages.length).toBeGreaterThan(0);
      const lastMessage = mockPort._messages[mockPort._messages.length - 1] as {
        type: string;
        selectFocused: boolean;
      };
      expect(lastMessage.type).toBe("CLOSE_POPUP");
    });
  });
});
