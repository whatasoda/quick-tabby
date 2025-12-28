/**
 * MRU Operations Tests
 */

import { describe, expect, test } from "vitest";
import {
  addTabToMRU,
  getMRUList,
  getPreviousTabId,
  getTabPosition,
  isTabInMRU,
  removeTabFromMRU,
  removeWindowFromMRU,
} from "./mru-operations.ts";
import { EMPTY_MRU_STATE, type MRUState } from "./mru-state.ts";

describe("addTabToMRU", () => {
  test("should add new tab to empty state", () => {
    const result = addTabToMRU(EMPTY_MRU_STATE, 1, 100);

    expect(result.global).toEqual([1]);
    expect(result.byWindow[100]).toEqual([1]);
  });

  test("should move existing tab to front (no duplicates)", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2, 3] },
    };

    const result = addTabToMRU(state, 3, 100);

    expect(result.global).toEqual([3, 1, 2]);
    expect(result.byWindow[100]).toEqual([3, 1, 2]);
  });

  test("should respect maxSize config for global list", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2, 3] },
    };

    const result = addTabToMRU(state, 4, 100, { maxSize: 3 });

    expect(result.global).toEqual([4, 1, 2]);
    expect(result.global).toHaveLength(3);
  });

  test("should respect maxSize config for window list", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2, 3] },
    };

    const result = addTabToMRU(state, 4, 100, { maxSize: 2 });

    expect(result.byWindow[100]).toEqual([4, 1]);
    expect(result.byWindow[100]).toHaveLength(2);
  });

  test("should create window list if not exists", () => {
    const state: MRUState = {
      global: [1],
      byWindow: { 100: [1] },
    };

    const result = addTabToMRU(state, 2, 200);

    expect(result.byWindow[200]).toEqual([2]);
    expect(result.byWindow[100]).toEqual([1]);
  });

  test("should maintain immutability", () => {
    const state: MRUState = {
      global: [1, 2],
      byWindow: { 100: [1, 2] },
    };

    const result = addTabToMRU(state, 3, 100);

    expect(result).not.toBe(state);
    expect(result.global).not.toBe(state.global);
    expect(result.byWindow).not.toBe(state.byWindow);
    expect(state.global).toEqual([1, 2]);
    expect(state.byWindow[100]).toEqual([1, 2]);
  });
});

describe("removeTabFromMRU", () => {
  test("should remove tab from global list", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2] },
    };

    const result = removeTabFromMRU(state, 2);

    expect(result.global).toEqual([1, 3]);
  });

  test("should remove tab from all window lists", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2], 200: [2, 3] },
    };

    const result = removeTabFromMRU(state, 2);

    expect(result.byWindow[100]).toEqual([1]);
    expect(result.byWindow[200]).toEqual([3]);
  });

  test("should handle non-existent tab gracefully", () => {
    const state: MRUState = {
      global: [1, 2],
      byWindow: { 100: [1, 2] },
    };

    const result = removeTabFromMRU(state, 999);

    expect(result.global).toEqual([1, 2]);
    expect(result.byWindow[100]).toEqual([1, 2]);
  });

  test("should maintain immutability", () => {
    const state: MRUState = {
      global: [1, 2],
      byWindow: { 100: [1, 2] },
    };

    const result = removeTabFromMRU(state, 1);

    expect(result).not.toBe(state);
    expect(state.global).toEqual([1, 2]);
  });
});

describe("removeWindowFromMRU", () => {
  test("should remove window's MRU list", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2], 200: [3] },
    };

    const result = removeWindowFromMRU(state, 100);

    expect(result.byWindow[100]).toBeUndefined();
  });

  test("should preserve other windows", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2], 200: [3] },
    };

    const result = removeWindowFromMRU(state, 100);

    expect(result.byWindow[200]).toEqual([3]);
  });

  test("should preserve global list", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [1, 2] },
    };

    const result = removeWindowFromMRU(state, 100);

    expect(result.global).toEqual([1, 2, 3]);
  });

  test("should handle non-existent window gracefully", () => {
    const state: MRUState = {
      global: [1, 2],
      byWindow: { 100: [1, 2] },
    };

    const result = removeWindowFromMRU(state, 999);

    expect(result.byWindow[100]).toEqual([1, 2]);
    expect(result.global).toEqual([1, 2]);
  });
});

describe("getMRUList", () => {
  const state: MRUState = {
    global: [1, 2, 3],
    byWindow: { 100: [1, 2], 200: [3] },
  };

  test("should return global list when windowOnly is false", () => {
    const result = getMRUList(state, false);

    expect(result).toEqual([1, 2, 3]);
  });

  test("should return window list when windowOnly is true", () => {
    const result = getMRUList(state, true, 100);

    expect(result).toEqual([1, 2]);
  });

  test("should return empty array for non-existent window", () => {
    const result = getMRUList(state, true, 999);

    expect(result).toEqual([]);
  });
});

describe("getPreviousTabId", () => {
  test("should return second tab in list", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: {},
    };

    const result = getPreviousTabId(state, false);

    expect(result).toBe(2);
  });

  test("should return null when list has fewer than 2 items", () => {
    const state: MRUState = {
      global: [1],
      byWindow: {},
    };

    const result = getPreviousTabId(state, false);

    expect(result).toBeNull();
  });

  test("should return null for empty list", () => {
    const result = getPreviousTabId(EMPTY_MRU_STATE, false);

    expect(result).toBeNull();
  });

  test("should work with window-specific list", () => {
    const state: MRUState = {
      global: [1, 2, 3],
      byWindow: { 100: [10, 20, 30] },
    };

    const result = getPreviousTabId(state, true, 100);

    expect(result).toBe(20);
  });
});

describe("isTabInMRU", () => {
  const state: MRUState = {
    global: [1, 2, 3],
    byWindow: {},
  };

  test("should return true for existing tab", () => {
    expect(isTabInMRU(state, 2)).toBe(true);
  });

  test("should return false for non-existent tab", () => {
    expect(isTabInMRU(state, 999)).toBe(false);
  });
});

describe("getTabPosition", () => {
  const state: MRUState = {
    global: [1, 2, 3],
    byWindow: { 100: [10, 20, 30] },
  };

  test("should return 0-based index for found tab", () => {
    expect(getTabPosition(state, 2, false)).toBe(1);
    expect(getTabPosition(state, 1, false)).toBe(0);
    expect(getTabPosition(state, 3, false)).toBe(2);
  });

  test("should return -1 for non-existent tab", () => {
    expect(getTabPosition(state, 999, false)).toBe(-1);
  });

  test("should work with window-specific list", () => {
    expect(getTabPosition(state, 20, true, 100)).toBe(1);
  });
});
