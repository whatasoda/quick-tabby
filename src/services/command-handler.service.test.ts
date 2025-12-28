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
  let mockSettingsService: SettingsService;
  let deps: CommandHandlerDependencies;

  beforeEach(() => {
    mockAction = createMockAction();
    mockCommands = createMockCommands();
    mockSettingsService = createMockSettingsService();
    deps = {
      action: mockAction,
      commands: mockCommands,
      settingsService: mockSettingsService,
    };
  });

  describe("initialize", () => {
    test("should register command listener", () => {
      const service = createCommandHandlerService(deps);

      service.initialize();

      // Trigger command to verify listener is set up
      mockCommands._triggerCommand("open-popup-all-windows");
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

    test("should set mode to 'all' when open-popup-all-windows command is triggered", async () => {
      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("open-popup-all-windows");
      // Wait for async handler
      await new Promise((resolve) => setTimeout(resolve, 0));

      const launchInfo = service.getLaunchInfo();
      expect(launchInfo.mode).toBe("all");
      expect(launchInfo.command).toBe("open-popup-all-windows");
    });

    test("should set mode to 'currentWindow' when open-popup-current-window command is triggered", async () => {
      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("open-popup-current-window");
      await new Promise((resolve) => setTimeout(resolve, 0));

      const launchInfo = service.getLaunchInfo();
      expect(launchInfo.mode).toBe("currentWindow");
      expect(launchInfo.command).toBe("open-popup-current-window");
    });
  });

  describe("clearLaunchInfo", () => {
    test("should reset launch info", async () => {
      const service = createCommandHandlerService(deps);
      service.initialize();

      mockCommands._triggerCommand("open-popup-all-windows");
      await new Promise((resolve) => setTimeout(resolve, 0));

      service.clearLaunchInfo();

      const launchInfo = service.getLaunchInfo();
      expect(launchInfo.mode).toBeNull();
      expect(launchInfo.command).toBeNull();
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

      mockCommands._triggerCommand("open-popup-all-windows");
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
