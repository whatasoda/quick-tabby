/**
 * IndexedDB Type Guards Tests
 */

import { describe, expect, test } from "bun:test";
import {
  isIDBOpenDBRequest,
  isIDBRequest,
  isIDBCursorWithValue,
  isStoredThumbnail,
} from "./type-guards.ts";

describe("isIDBOpenDBRequest", () => {
  test("should return true for valid IDBOpenDBRequest-like object", () => {
    const mockRequest = {
      result: {},
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
    };

    expect(isIDBOpenDBRequest(mockRequest as unknown as EventTarget)).toBe(true);
  });

  test("should return false for null", () => {
    expect(isIDBOpenDBRequest(null)).toBe(false);
  });

  test("should return false for object missing 'result' property", () => {
    const mockRequest = {
      onupgradeneeded: null,
    };

    expect(isIDBOpenDBRequest(mockRequest as unknown as EventTarget)).toBe(false);
  });

  test("should return false for object missing 'onupgradeneeded' property", () => {
    const mockRequest = {
      result: {},
    };

    expect(isIDBOpenDBRequest(mockRequest as unknown as EventTarget)).toBe(false);
  });
});

describe("isIDBRequest", () => {
  test("should return true for valid IDBRequest-like object", () => {
    const mockRequest = {
      result: {},
      onsuccess: null,
      onerror: null,
    };

    expect(isIDBRequest(mockRequest as unknown as EventTarget)).toBe(true);
  });

  test("should return false for null", () => {
    expect(isIDBRequest(null)).toBe(false);
  });

  test("should return false for object missing 'result' property", () => {
    const mockRequest = {
      onsuccess: null,
      onerror: null,
    };

    expect(isIDBRequest(mockRequest as unknown as EventTarget)).toBe(false);
  });

  test("should return false for object missing 'onsuccess' property", () => {
    const mockRequest = {
      result: {},
      onerror: null,
    };

    expect(isIDBRequest(mockRequest as unknown as EventTarget)).toBe(false);
  });

  test("should return false for object missing 'onerror' property", () => {
    const mockRequest = {
      result: {},
      onsuccess: null,
    };

    expect(isIDBRequest(mockRequest as unknown as EventTarget)).toBe(false);
  });
});

describe("isIDBCursorWithValue", () => {
  test("should return true for valid cursor-like object", () => {
    const mockCursor = {
      continue: () => {},
      delete: () => {},
      value: {},
    };

    expect(isIDBCursorWithValue(mockCursor)).toBe(true);
  });

  test("should return false for null", () => {
    expect(isIDBCursorWithValue(null)).toBe(false);
  });

  test("should return false for object missing 'continue' property", () => {
    const mockCursor = {
      delete: () => {},
      value: {},
    };

    expect(isIDBCursorWithValue(mockCursor)).toBe(false);
  });

  test("should return false for object missing 'delete' property", () => {
    const mockCursor = {
      continue: () => {},
      value: {},
    };

    expect(isIDBCursorWithValue(mockCursor)).toBe(false);
  });

  test("should return false for object missing 'value' property", () => {
    const mockCursor = {
      continue: () => {},
      delete: () => {},
    };

    expect(isIDBCursorWithValue(mockCursor)).toBe(false);
  });
});

describe("isStoredThumbnail", () => {
  test("should return true for valid StoredThumbnail object", () => {
    const thumbnail = {
      tabId: 1,
      dataUrl: "data:image/jpeg;base64,abc",
      capturedAt: Date.now(),
    };

    expect(isStoredThumbnail(thumbnail)).toBe(true);
  });

  test("should return false for null", () => {
    expect(isStoredThumbnail(null)).toBe(false);
  });

  test("should return false for undefined", () => {
    expect(isStoredThumbnail(undefined)).toBe(false);
  });

  test("should return false for non-object values", () => {
    expect(isStoredThumbnail("string")).toBe(false);
    expect(isStoredThumbnail(123)).toBe(false);
    expect(isStoredThumbnail(true)).toBe(false);
  });

  test("should return false for missing 'tabId' property", () => {
    const thumbnail = {
      dataUrl: "data:image/jpeg;base64,abc",
      capturedAt: Date.now(),
    };

    expect(isStoredThumbnail(thumbnail)).toBe(false);
  });

  test("should return false for missing 'dataUrl' property", () => {
    const thumbnail = {
      tabId: 1,
      capturedAt: Date.now(),
    };

    expect(isStoredThumbnail(thumbnail)).toBe(false);
  });

  test("should return false for missing 'capturedAt' property", () => {
    const thumbnail = {
      tabId: 1,
      dataUrl: "data:image/jpeg;base64,abc",
    };

    expect(isStoredThumbnail(thumbnail)).toBe(false);
  });

  test("should return false for wrong 'tabId' type", () => {
    const thumbnail = {
      tabId: "not-a-number",
      dataUrl: "data:image/jpeg;base64,abc",
      capturedAt: Date.now(),
    };

    expect(isStoredThumbnail(thumbnail)).toBe(false);
  });

  test("should return false for wrong 'dataUrl' type", () => {
    const thumbnail = {
      tabId: 1,
      dataUrl: 12345,
      capturedAt: Date.now(),
    };

    expect(isStoredThumbnail(thumbnail)).toBe(false);
  });

  test("should return false for wrong 'capturedAt' type", () => {
    const thumbnail = {
      tabId: 1,
      dataUrl: "data:image/jpeg;base64,abc",
      capturedAt: "not-a-number",
    };

    expect(isStoredThumbnail(thumbnail)).toBe(false);
  });
});
