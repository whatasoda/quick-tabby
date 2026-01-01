import { describe, expect, test } from "vitest";
import { DEFAULT_RETRY_CONFIG } from "./retry-config.ts";
import { calculateBackoffDelay, isRetryableError } from "./retry-logic.ts";

describe("calculateBackoffDelay", () => {
  test("returns base delay for first attempt", () => {
    const delay = calculateBackoffDelay(0, DEFAULT_RETRY_CONFIG);
    expect(delay).toBe(100);
  });

  test("doubles delay for each subsequent attempt", () => {
    expect(calculateBackoffDelay(1, DEFAULT_RETRY_CONFIG)).toBe(200);
    expect(calculateBackoffDelay(2, DEFAULT_RETRY_CONFIG)).toBe(400);
    expect(calculateBackoffDelay(3, DEFAULT_RETRY_CONFIG)).toBe(800);
  });

  test("caps delay at maxDelayMs", () => {
    const delay = calculateBackoffDelay(10, DEFAULT_RETRY_CONFIG);
    expect(delay).toBe(2000);
  });

  test("respects custom configuration", () => {
    const config = {
      maxAttempts: 5,
      baseDelayMs: 50,
      maxDelayMs: 500,
      backoffMultiplier: 3,
    };

    expect(calculateBackoffDelay(0, config)).toBe(50);
    expect(calculateBackoffDelay(1, config)).toBe(150);
    expect(calculateBackoffDelay(2, config)).toBe(450);
    expect(calculateBackoffDelay(3, config)).toBe(500); // capped
  });
});

describe("isRetryableError", () => {
  test("returns false for non-Error objects", () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
    expect(isRetryableError("error string")).toBe(false);
    expect(isRetryableError({ message: "error" })).toBe(false);
  });

  test("returns true for service worker termination errors", () => {
    expect(isRetryableError(new Error("Receiving end does not exist"))).toBe(true);
    expect(isRetryableError(new Error("Extension context invalidated"))).toBe(true);
    expect(isRetryableError(new Error("Message port closed before response"))).toBe(true);
    expect(isRetryableError(new Error("Could not establish connection"))).toBe(true);
  });

  test("returns true regardless of case", () => {
    expect(isRetryableError(new Error("RECEIVING END DOES NOT EXIST"))).toBe(true);
    expect(isRetryableError(new Error("receiving end does not exist"))).toBe(true);
  });

  test("returns false for unrelated errors", () => {
    expect(isRetryableError(new Error("Network error"))).toBe(false);
    expect(isRetryableError(new Error("TypeError: undefined"))).toBe(false);
    expect(isRetryableError(new Error("Something went wrong"))).toBe(false);
  });

  test("returns true when pattern is part of longer message", () => {
    expect(
      isRetryableError(new Error("Failed: Receiving end does not exist. Please try again.")),
    ).toBe(true);
  });
});
