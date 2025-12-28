/**
 * Keybinding Matcher Tests
 */

import { describe, expect, test } from "bun:test";
import {
  isValidKeybindingKey,
  type KeyEvent,
  keybindingFromEvent,
  keybindingsToString,
  keybindingToString,
  matchesAnyKeybinding,
  matchesKeybinding,
  parseShortcut,
} from "./keybinding-matcher.ts";

/**
 * Helper to create a mock KeyEvent
 */
function createKeyEvent(overrides: Partial<KeyEvent>): KeyEvent {
  return {
    key: "",
    code: "",
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    ...overrides,
  };
}

describe("matchesKeybinding", () => {
  test("should match single character by code", () => {
    const event = createKeyEvent({ key: "j", code: "KeyJ" });
    const binding = { key: "j" };

    expect(matchesKeybinding(event, binding)).toBe(true);
  });

  test("should match with Ctrl modifier", () => {
    const event = createKeyEvent({ key: "k", code: "KeyK", ctrlKey: true });
    const binding = { key: "k", ctrl: true };

    expect(matchesKeybinding(event, binding)).toBe(true);
  });

  test("should match with Alt modifier", () => {
    const event = createKeyEvent({ key: "q", code: "KeyQ", altKey: true });
    const binding = { key: "q", alt: true };

    expect(matchesKeybinding(event, binding)).toBe(true);
  });

  test("should match with Shift modifier", () => {
    const event = createKeyEvent({ key: "K", code: "KeyK", shiftKey: true });
    const binding = { key: "k", shift: true };

    expect(matchesKeybinding(event, binding)).toBe(true);
  });

  test("should match with Meta modifier", () => {
    const event = createKeyEvent({ key: "j", code: "KeyJ", metaKey: true });
    const binding = { key: "j", meta: true };

    expect(matchesKeybinding(event, binding)).toBe(true);
  });

  test("should require all specified modifiers", () => {
    const event = createKeyEvent({
      key: "j",
      code: "KeyJ",
      ctrlKey: true,
      shiftKey: true,
    });
    const binding = { key: "j", ctrl: true, shift: true };

    expect(matchesKeybinding(event, binding)).toBe(true);
  });

  test("should reject extra modifiers", () => {
    const event = createKeyEvent({
      key: "j",
      code: "KeyJ",
      ctrlKey: true,
      altKey: true,
    });
    const binding = { key: "j", ctrl: true };

    expect(matchesKeybinding(event, binding)).toBe(false);
  });

  test("should reject missing modifiers", () => {
    const event = createKeyEvent({ key: "j", code: "KeyJ", ctrlKey: false });
    const binding = { key: "j", ctrl: true };

    expect(matchesKeybinding(event, binding)).toBe(false);
  });

  test("should match special keys (Enter, Escape, Tab)", () => {
    expect(
      matchesKeybinding(createKeyEvent({ key: "Enter", code: "Enter" }), { key: "Enter" }),
    ).toBe(true);

    expect(
      matchesKeybinding(createKeyEvent({ key: "Escape", code: "Escape" }), { key: "Escape" }),
    ).toBe(true);

    expect(matchesKeybinding(createKeyEvent({ key: "Tab", code: "Tab" }), { key: "Tab" })).toBe(
      true,
    );
  });

  test("should handle Mac Alt key character substitution via code", () => {
    // On Mac, Alt+Q produces "œ" in event.key, but code is still "KeyQ"
    const event = createKeyEvent({ key: "œ", code: "KeyQ", altKey: true });
    const binding = { key: "q", alt: true };

    expect(matchesKeybinding(event, binding)).toBe(true);
  });
});

describe("matchesAnyKeybinding", () => {
  test("should return true if any binding matches", () => {
    const event = createKeyEvent({ key: "j", code: "KeyJ" });
    const bindings = [{ key: "k" }, { key: "j" }];

    expect(matchesAnyKeybinding(event, bindings)).toBe(true);
  });

  test("should return false if no bindings match", () => {
    const event = createKeyEvent({ key: "x", code: "KeyX" });
    const bindings = [{ key: "k" }, { key: "j" }];

    expect(matchesAnyKeybinding(event, bindings)).toBe(false);
  });

  test("should return false for empty bindings array", () => {
    const event = createKeyEvent({ key: "j", code: "KeyJ" });

    expect(matchesAnyKeybinding(event, [])).toBe(false);
  });
});

describe("keybindingToString", () => {
  test("should display single character as uppercase", () => {
    expect(keybindingToString({ key: "j" })).toBe("J");
    expect(keybindingToString({ key: "k" })).toBe("K");
  });

  test("should display Space as 'Space'", () => {
    expect(keybindingToString({ key: " " })).toBe("Space");
  });

  test("should display arrow keys as symbols", () => {
    expect(keybindingToString({ key: "ArrowUp" })).toBe("↑");
    expect(keybindingToString({ key: "ArrowDown" })).toBe("↓");
    expect(keybindingToString({ key: "ArrowLeft" })).toBe("←");
    expect(keybindingToString({ key: "ArrowRight" })).toBe("→");
  });

  test("should join modifiers with '+'", () => {
    expect(keybindingToString({ key: "j", ctrl: true })).toBe("Ctrl+J");
    expect(keybindingToString({ key: "j", alt: true })).toBe("Alt+J");
    expect(keybindingToString({ key: "j", ctrl: true, shift: true })).toBe("Ctrl+Shift+J");
  });

  test("should display Meta as 'Cmd'", () => {
    expect(keybindingToString({ key: "j", meta: true })).toBe("Cmd+J");
  });

  test("should preserve special key names", () => {
    expect(keybindingToString({ key: "Enter" })).toBe("Enter");
    expect(keybindingToString({ key: "Escape" })).toBe("Escape");
    expect(keybindingToString({ key: "Tab" })).toBe("Tab");
  });
});

describe("keybindingsToString", () => {
  test("should join multiple bindings with ' / '", () => {
    const bindings = [{ key: "j" }, { key: "ArrowDown" }];

    expect(keybindingsToString(bindings)).toBe("J / ↓");
  });

  test("should handle single binding", () => {
    expect(keybindingsToString([{ key: "Enter" }])).toBe("Enter");
  });

  test("should handle empty array", () => {
    expect(keybindingsToString([])).toBe("");
  });
});

describe("parseShortcut", () => {
  test("should parse 'Alt+Shift+Q' correctly", () => {
    const result = parseShortcut("Alt+Shift+Q");

    expect(result).toEqual({
      key: "q",
      ctrl: false,
      alt: true,
      shift: true,
      meta: false,
    });
  });

  test("should lowercase single character keys", () => {
    expect(parseShortcut("K").key).toBe("k");
    expect(parseShortcut("Ctrl+J").key).toBe("j");
  });

  test("should preserve multi-character key names", () => {
    expect(parseShortcut("Enter").key).toBe("Enter");
    expect(parseShortcut("Ctrl+Escape").key).toBe("Escape");
  });

  test("should detect all modifier types", () => {
    expect(parseShortcut("Ctrl+K").ctrl).toBe(true);
    expect(parseShortcut("Alt+K").alt).toBe(true);
    expect(parseShortcut("Shift+K").shift).toBe(true);
    expect(parseShortcut("Command+K").meta).toBe(true);
    expect(parseShortcut("Meta+K").meta).toBe(true);
  });

  test("should handle multiple modifiers", () => {
    const result = parseShortcut("Ctrl+Alt+Shift+K");

    expect(result.ctrl).toBe(true);
    expect(result.alt).toBe(true);
    expect(result.shift).toBe(true);
    expect(result.key).toBe("k");
  });
});

describe("isValidKeybindingKey", () => {
  test("should return true for alphanumeric characters", () => {
    expect(isValidKeybindingKey("a")).toBe(true);
    expect(isValidKeybindingKey("Z")).toBe(true);
    expect(isValidKeybindingKey("0")).toBe(true);
    expect(isValidKeybindingKey("9")).toBe(true);
  });

  test("should return true for special keys", () => {
    expect(isValidKeybindingKey("Enter")).toBe(true);
    expect(isValidKeybindingKey("Escape")).toBe(true);
    expect(isValidKeybindingKey("Tab")).toBe(true);
    expect(isValidKeybindingKey("Space")).toBe(true);
    expect(isValidKeybindingKey(" ")).toBe(true);
    expect(isValidKeybindingKey("ArrowUp")).toBe(true);
    expect(isValidKeybindingKey("ArrowDown")).toBe(true);
    expect(isValidKeybindingKey("Backspace")).toBe(true);
    expect(isValidKeybindingKey("Delete")).toBe(true);
  });

  test("should return false for invalid keys", () => {
    expect(isValidKeybindingKey("")).toBe(false);
    expect(isValidKeybindingKey("!")).toBe(false);
    expect(isValidKeybindingKey("@")).toBe(false);
    expect(isValidKeybindingKey("abc")).toBe(false);
    expect(isValidKeybindingKey("InvalidKey")).toBe(false);
  });
});

describe("keybindingFromEvent", () => {
  test("should extract key and modifiers from event", () => {
    const event = createKeyEvent({
      key: "J",
      code: "KeyJ",
      ctrlKey: true,
      shiftKey: true,
    });

    const result = keybindingFromEvent(event);

    expect(result.key).toBe("j");
    expect(result.ctrl).toBe(true);
    expect(result.shift).toBe(true);
    expect(result.alt).toBeUndefined();
    expect(result.meta).toBeUndefined();
  });

  test("should lowercase single character keys", () => {
    const event = createKeyEvent({ key: "K", code: "KeyK" });

    expect(keybindingFromEvent(event).key).toBe("k");
  });

  test("should preserve special key names", () => {
    const event = createKeyEvent({ key: "Enter", code: "Enter" });

    expect(keybindingFromEvent(event).key).toBe("Enter");
  });

  test("should omit false modifiers as undefined", () => {
    const event = createKeyEvent({
      key: "j",
      code: "KeyJ",
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
    });

    const result = keybindingFromEvent(event);

    expect(result.ctrl).toBeUndefined();
    expect(result.alt).toBeUndefined();
    expect(result.shift).toBeUndefined();
    expect(result.meta).toBeUndefined();
  });
});
