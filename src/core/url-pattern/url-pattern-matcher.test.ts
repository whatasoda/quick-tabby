import { describe, expect, test } from "vitest";
import {
  compilePattern,
  getPatternError,
  isValidPattern,
  matchesAnyPattern,
  matchesPattern,
  parsePattern,
} from "./url-pattern-matcher";

describe("parsePattern", () => {
  test("should parse valid patterns", () => {
    expect(parsePattern("https://example.com/*")).toEqual({
      scheme: "https",
      host: "example.com",
      path: "/*",
    });

    expect(parsePattern("*://*.bank.com/*")).toEqual({
      scheme: "*",
      host: "*.bank.com",
      path: "/*",
    });

    expect(parsePattern("chrome://*")).toEqual({
      scheme: "chrome",
      host: "*",
      path: "/",
    });
  });

  test("should return null for invalid patterns", () => {
    expect(parsePattern("example.com")).toBeNull();
    expect(parsePattern("")).toBeNull();
  });
});

describe("isValidPattern", () => {
  test("should accept valid patterns", () => {
    expect(isValidPattern("*://*/*")).toBe(true);
    expect(isValidPattern("https://*.example.com/*")).toBe(true);
    expect(isValidPattern("chrome://*")).toBe(true);
    expect(isValidPattern("chrome-extension://*/*")).toBe(true);
    expect(isValidPattern("about:*")).toBe(true);
    expect(isValidPattern("edge://*")).toBe(true);
    expect(isValidPattern("http://localhost/*")).toBe(true);
    expect(isValidPattern("*://localhost/*")).toBe(true);
  });

  test("should reject invalid patterns", () => {
    expect(isValidPattern("example.com")).toBe(false);
    expect(isValidPattern("invalid://*")).toBe(false);
    expect(isValidPattern("")).toBe(false);
    expect(isValidPattern("   ")).toBe(false);
  });
});

describe("getPatternError", () => {
  test("should return null for valid patterns", () => {
    expect(getPatternError("*://*.example.com/*")).toBeNull();
    expect(getPatternError("chrome://*")).toBeNull();
  });

  test("should return error for empty pattern", () => {
    expect(getPatternError("")).toBe("Pattern cannot be empty");
    expect(getPatternError("   ")).toBe("Pattern cannot be empty");
  });

  test("should return error for missing scheme", () => {
    expect(getPatternError("example.com")).toBe("Pattern must include scheme (e.g., *://, https://, about:)");
  });

  test("should return error for invalid scheme", () => {
    const error = getPatternError("invalid://example.com/*");
    expect(error).toContain("Invalid scheme: invalid");
  });
});

describe("compilePattern", () => {
  test("should compile valid patterns to regex", () => {
    expect(compilePattern("*://*/*")).toBeInstanceOf(RegExp);
    expect(compilePattern("https://example.com/*")).toBeInstanceOf(RegExp);
  });

  test("should return null for invalid patterns", () => {
    expect(compilePattern("example.com")).toBeNull();
    expect(compilePattern("")).toBeNull();
  });
});

describe("matchesPattern", () => {
  test("should match wildcard scheme", () => {
    const pattern = "*://example.com/*";
    expect(matchesPattern("https://example.com/", pattern)).toBe(true);
    expect(matchesPattern("http://example.com/page", pattern)).toBe(true);
    expect(matchesPattern("ftp://example.com/file", pattern)).toBe(true);
  });

  test("should match specific scheme", () => {
    const pattern = "https://example.com/*";
    expect(matchesPattern("https://example.com/", pattern)).toBe(true);
    expect(matchesPattern("http://example.com/", pattern)).toBe(false);
  });

  test("should match wildcard subdomain", () => {
    const pattern = "*://*.example.com/*";
    expect(matchesPattern("https://www.example.com/", pattern)).toBe(true);
    expect(matchesPattern("https://mail.example.com/", pattern)).toBe(true);
    expect(matchesPattern("https://a.b.example.com/", pattern)).toBe(true);
    // Note: This pattern requires a subdomain
    expect(matchesPattern("https://example.com/", pattern)).toBe(false);
  });

  test("should match chrome URLs", () => {
    const pattern = "chrome://*";
    expect(matchesPattern("chrome://settings/", pattern)).toBe(true);
    expect(matchesPattern("chrome://extensions/", pattern)).toBe(true);
    expect(matchesPattern("chrome://newtab/", pattern)).toBe(true);
  });

  test("should match chrome-extension URLs", () => {
    const pattern = "chrome-extension://*/*";
    expect(matchesPattern("chrome-extension://abcdef123/popup.html", pattern)).toBe(true);
  });

  test("should match about URLs", () => {
    const pattern = "about:*";
    expect(matchesPattern("about:blank", pattern)).toBe(true);
    expect(matchesPattern("about:srcdoc", pattern)).toBe(true);
  });

  test("should not match non-matching URLs", () => {
    const pattern = "*://example.com/*";
    expect(matchesPattern("https://other.com/", pattern)).toBe(false);
    expect(matchesPattern("https://notexample.com/", pattern)).toBe(false);
  });

  test("should be case insensitive for scheme and host", () => {
    const pattern = "https://Example.COM/*";
    expect(matchesPattern("https://example.com/page", pattern)).toBe(true);
    expect(matchesPattern("HTTPS://EXAMPLE.COM/page", pattern)).toBe(true);
  });

  test("should return false for invalid patterns", () => {
    expect(matchesPattern("https://example.com/", "invalid")).toBe(false);
  });
});

describe("matchesAnyPattern", () => {
  test("should return true if any pattern matches", () => {
    const patterns = ["chrome://*", "*://*.bank.com/*"];
    expect(matchesAnyPattern("chrome://settings/", patterns)).toBe(true);
    expect(matchesAnyPattern("https://www.bank.com/login", patterns)).toBe(true);
    expect(matchesAnyPattern("http://mybank.com/account", patterns)).toBe(false);
  });

  test("should return false if no patterns match", () => {
    const patterns = ["chrome://*", "edge://*"];
    expect(matchesAnyPattern("https://example.com/", patterns)).toBe(false);
  });

  test("should return false for empty patterns list", () => {
    expect(matchesAnyPattern("https://example.com/", [])).toBe(false);
  });

  test("should handle multiple matching patterns", () => {
    const patterns = ["*://example.com/*", "https://*/*"];
    expect(matchesAnyPattern("https://example.com/", patterns)).toBe(true);
  });
});
