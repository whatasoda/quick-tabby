/**
 * Japanese converter tests
 */
import { describe, expect, test } from "vitest";
import {
  containsJapanese,
  containsRomaji,
  generateQueryVariants,
  getActiveVariants,
} from "./japanese-converter.ts";

describe("containsJapanese", () => {
  test("should detect hiragana", () => {
    expect(containsJapanese("たぶ")).toBe(true);
    expect(containsJapanese("あいうえお")).toBe(true);
  });

  test("should detect katakana", () => {
    expect(containsJapanese("タブ")).toBe(true);
    expect(containsJapanese("アイウエオ")).toBe(true);
  });

  test("should detect kanji", () => {
    expect(containsJapanese("東京")).toBe(true);
    expect(containsJapanese("日本語")).toBe(true);
  });

  test("should not detect romaji", () => {
    expect(containsJapanese("tab")).toBe(false);
    expect(containsJapanese("GitHub")).toBe(false);
  });

  test("should detect mixed content", () => {
    expect(containsJapanese("Googleタブ")).toBe(true);
    expect(containsJapanese("test検索")).toBe(true);
  });
});

describe("containsRomaji", () => {
  test("should detect lowercase ASCII letters", () => {
    expect(containsRomaji("tab")).toBe(true);
    expect(containsRomaji("github")).toBe(true);
  });

  test("should detect uppercase ASCII letters", () => {
    expect(containsRomaji("TAB")).toBe(true);
    expect(containsRomaji("GitHub")).toBe(true);
  });

  test("should not detect Japanese only", () => {
    expect(containsRomaji("タブ")).toBe(false);
    expect(containsRomaji("たぶ")).toBe(false);
    expect(containsRomaji("東京")).toBe(false);
  });

  test("should detect mixed content", () => {
    expect(containsRomaji("Googleタブ")).toBe(true);
  });

  test("should not detect numbers only", () => {
    expect(containsRomaji("12345")).toBe(false);
  });
});

describe("generateQueryVariants", () => {
  test("should convert romaji to hiragana and katakana", () => {
    const result = generateQueryVariants("tabu");
    expect(result.original).toBe("tabu");
    expect(result.hiragana).toBe("たぶ");
    expect(result.katakana).toBe("タブ");
    expect(result.romaji).toBeNull();
  });

  test("should convert katakana to romaji", () => {
    const result = generateQueryVariants("タブ");
    expect(result.original).toBe("タブ");
    expect(result.romaji).toBe("tabu");
    expect(result.hiragana).toBeNull();
    expect(result.katakana).toBeNull();
  });

  test("should convert hiragana to romaji", () => {
    const result = generateQueryVariants("たぶ");
    expect(result.original).toBe("たぶ");
    expect(result.romaji).toBe("tabu");
    expect(result.hiragana).toBeNull();
    expect(result.katakana).toBeNull();
  });

  test("should handle empty query", () => {
    const result = generateQueryVariants("");
    expect(result.original).toBe("");
    expect(result.hiragana).toBeNull();
    expect(result.katakana).toBeNull();
    expect(result.romaji).toBeNull();
  });

  test("should handle whitespace-only query", () => {
    const result = generateQueryVariants("   ");
    expect(result.original).toBe("");
    expect(result.hiragana).toBeNull();
    expect(result.katakana).toBeNull();
    expect(result.romaji).toBeNull();
  });

  test("should convert mixed Japanese and romaji to romaji", () => {
    const result = generateQueryVariants("Googleタブ");
    // When input contains both Japanese and romaji, convert Japanese part to romaji
    expect(result.original).toBe("Googleタブ");
    expect(result.romaji).toBe("Googletabu");
    expect(result.hiragana).toBeNull();
    expect(result.katakana).toBeNull();
  });

  test("should handle special romaji patterns", () => {
    // shi, chi, tsu patterns
    const result = generateQueryVariants("sushi");
    expect(result.hiragana).toBe("すし");
    expect(result.katakana).toBe("スシ");
  });

  test("should handle long vowels", () => {
    const result = generateQueryVariants("toukyou");
    expect(result.hiragana).toBe("とうきょう");
    expect(result.katakana).toBe("トウキョウ");
  });
});

describe("getActiveVariants", () => {
  test("should return all non-null unique variants for romaji input", () => {
    const variants = generateQueryVariants("tabu");
    const active = getActiveVariants(variants);
    expect(active).toContain("tabu");
    expect(active).toContain("たぶ");
    expect(active).toContain("タブ");
    expect(active).toHaveLength(3);
  });

  test("should return original and romaji for Japanese input", () => {
    const variants = generateQueryVariants("タブ");
    const active = getActiveVariants(variants);
    expect(active).toContain("タブ");
    expect(active).toContain("tabu");
    expect(active).toHaveLength(2);
  });

  test("should return only original for empty query", () => {
    const variants = generateQueryVariants("");
    const active = getActiveVariants(variants);
    expect(active).toEqual([""]);
  });

  test("should not duplicate original", () => {
    const variants = {
      original: "タブ",
      hiragana: null,
      katakana: null,
      romaji: "tabu",
    };
    const active = getActiveVariants(variants);
    expect(active).toEqual(["タブ", "tabu"]);
  });

  test("should exclude variants that match original", () => {
    // If conversion results in same string, don't include it
    const variants = {
      original: "test",
      hiragana: "test", // same as original (hypothetically)
      katakana: null,
      romaji: null,
    };
    const active = getActiveVariants(variants);
    expect(active).toEqual(["test"]);
  });
});
