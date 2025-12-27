import type { ChromeCommandsAPI, Command } from "./types.ts";

function mapCommand(command: chrome.commands.Command): Command {
  return {
    name: command.name,
    description: command.description,
    shortcut: command.shortcut,
  };
}

export function createChromeCommands(): ChromeCommandsAPI {
  return {
    async getAll(): Promise<Command[]> {
      const commands = await chrome.commands.getAll();
      return commands.map(mapCommand);
    },

    onCommand: {
      addListener(callback: (command: string) => void) {
        chrome.commands.onCommand.addListener(callback);
      },
      removeListener(callback: (command: string) => void) {
        chrome.commands.onCommand.removeListener(callback);
      },
    },
  };
}
