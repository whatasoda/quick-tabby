/**
 * Keybinding matching logic
 *
 * Pure functions for matching keyboard events against keybinding configurations.
 */

import type { Keybinding, KeybindingList } from "../settings/settings-types.ts";

/**
 * Normalized keyboard event for matching
 * This allows testing without actual KeyboardEvent objects
 */
export interface KeyEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/**
 * Check if a keyboard event matches a keybinding
 *
 * @param event - Keyboard event (or normalized KeyEvent)
 * @param binding - Keybinding to match against
 * @returns True if the event matches the binding
 */
export function matchesKeybinding(event: KeyEvent | KeyboardEvent, binding: Keybinding): boolean {
  // For single character keys, use event.code to handle Alt/Option key combinations
  // On Mac, Alt+Q produces "œ" in event.key, but event.code is still "KeyQ"
  let keyMatches: boolean;
  if (binding.key.length === 1) {
    const expectedCode = `Key${binding.key.toUpperCase()}`;
    keyMatches = event.code === expectedCode;
  } else {
    keyMatches = event.key === binding.key || event.key.toLowerCase() === binding.key;
  }

  const ctrlMatches = !!binding.ctrl === event.ctrlKey;
  const altMatches = !!binding.alt === event.altKey;
  const shiftMatches = !!binding.shift === event.shiftKey;
  const metaMatches = !!binding.meta === event.metaKey;

  return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
}

/**
 * Check if a keyboard event matches any keybinding in a list
 *
 * @param event - Keyboard event (or normalized KeyEvent)
 * @param bindings - List of keybindings to match against
 * @returns True if the event matches any binding in the list
 */
export function matchesAnyKeybinding(
  event: KeyEvent | KeyboardEvent,
  bindings: KeybindingList,
): boolean {
  return bindings.some((binding) => matchesKeybinding(event, binding));
}

/**
 * Convert a keybinding to a human-readable string
 *
 * @param binding - Keybinding to convert
 * @returns Human-readable string representation (e.g., "Ctrl+Shift+K")
 */
export function keybindingToString(binding: Keybinding): string {
  const parts: string[] = [];

  if (binding.ctrl) parts.push("Ctrl");
  if (binding.alt) parts.push("Alt");
  if (binding.shift) parts.push("Shift");
  if (binding.meta) parts.push("Cmd");

  // Format key for display
  let keyDisplay = binding.key;
  if (binding.key === " ") keyDisplay = "Space";
  else if (binding.key === "ArrowUp") keyDisplay = "↑";
  else if (binding.key === "ArrowDown") keyDisplay = "↓";
  else if (binding.key === "ArrowLeft") keyDisplay = "←";
  else if (binding.key === "ArrowRight") keyDisplay = "→";
  else if (binding.key.length === 1) keyDisplay = binding.key.toUpperCase();

  parts.push(keyDisplay);
  return parts.join("+");
}

/**
 * Convert a list of keybindings to a human-readable string
 *
 * @param bindings - List of keybindings to convert
 * @returns Human-readable string with bindings separated by " / "
 */
export function keybindingsToString(bindings: KeybindingList): string {
  return bindings.map(keybindingToString).join(" / ");
}

/**
 * Parse a Chrome shortcut string into a Keybinding
 *
 * @param shortcut - Chrome shortcut string (e.g., "Alt+Shift+Q")
 * @returns Parsed Keybinding object
 */
export function parseShortcut(shortcut: string): Keybinding {
  const parts = shortcut.split("+");
  const key = parts[parts.length - 1] ?? "";

  return {
    key: key.length === 1 ? key.toLowerCase() : key,
    ctrl: parts.includes("Ctrl"),
    alt: parts.includes("Alt"),
    shift: parts.includes("Shift"),
    meta: parts.includes("Command") || parts.includes("Meta"),
  };
}

/**
 * Validate if a key value is acceptable for a keybinding
 *
 * @param key - Key value to validate
 * @returns True if the key is valid for keybinding
 */
export function isValidKeybindingKey(key: string): boolean {
  // Single alphanumeric characters
  if (key.length === 1 && /^[a-zA-Z0-9]$/.test(key)) {
    return true;
  }

  // Special keys
  const validSpecialKeys = [
    "Enter",
    "Escape",
    "Tab",
    "Space",
    " ",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Backspace",
    "Delete",
    "Home",
    "End",
    "PageUp",
    "PageDown",
  ];

  return validSpecialKeys.includes(key);
}

/**
 * Create a keybinding from a KeyboardEvent
 *
 * @param event - Keyboard event to convert
 * @returns Keybinding object representing the pressed keys
 */
export function keybindingFromEvent(event: KeyEvent | KeyboardEvent): Keybinding {
  let key = event.key;

  // Normalize single character keys to lowercase
  if (key.length === 1) {
    key = key.toLowerCase();
  }

  return {
    key,
    ctrl: event.ctrlKey || undefined,
    alt: event.altKey || undefined,
    shift: event.shiftKey || undefined,
    meta: event.metaKey || undefined,
  };
}
