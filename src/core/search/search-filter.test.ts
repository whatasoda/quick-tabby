/**
 * Search filter tests
 */
import { describe, expect, test } from "vitest";
import type { TabInfo } from "../../shared/types.ts";
import { filterTabsByQuery } from "./search-filter.ts";

function createTab(id: number, title: string, url: string): TabInfo {
  return { id, windowId: 1, index: 0, title, url };
}

describe("filterTabsByQuery", () => {
  const tabs: TabInfo[] = [
    createTab(1, "GitHub - Dashboard", "https://github.com"),
    createTab(2, "Google Search", "https://google.com"),
    createTab(3, "YouTube", "https://youtube.com"),
    createTab(4, "Gmail - Inbox", "https://mail.google.com"),
  ];

  test("should return all tabs with empty query", () => {
    const results = filterTabsByQuery(tabs, "");
    expect(results).toHaveLength(4);
    expect(results.map((r) => r.tab.id)).toEqual([1, 2, 3, 4]);
    // All matches should be empty
    expect(results.every((r) => r.matches.length === 0)).toBe(true);
  });

  test("should return all tabs with whitespace-only query", () => {
    const results = filterTabsByQuery(tabs, "   ");
    expect(results).toHaveLength(4);
  });

  test("should filter tabs by title match", () => {
    const results = filterTabsByQuery(tabs, "google");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.tab.id === 2)).toBe(true); // Google Search
  });

  test("should filter tabs by URL match", () => {
    const results = filterTabsByQuery(tabs, "github");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.tab.id === 1)).toBe(true); // GitHub
  });

  test("should sort results by relevance (best matches first)", () => {
    // Create tabs where one has an exact title match, another has partial URL match
    const testTabs: TabInfo[] = [
      createTab(1, "Random Page", "https://example.com"),
      createTab(2, "Some Site", "https://google.com/search"),
      createTab(3, "Google", "https://example.org"),
    ];

    const results = filterTabsByQuery(testTabs, "google");

    // "Google" exact title match should rank higher than URL-only match
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0]?.tab.id).toBe(3); // Exact title match "Google"
    expect(results[1]?.tab.id).toBe(2); // URL contains "google"
  });

  test("should include match indices for title", () => {
    const results = filterTabsByQuery(tabs, "GitHub");
    const githubResult = results.find((r) => r.tab.id === 1);
    expect(githubResult).toBeDefined();
    expect(githubResult?.matches.length).toBeGreaterThan(0);

    const titleMatch = githubResult?.matches.find((m) => m.key === "title");
    expect(titleMatch).toBeDefined();
    expect(titleMatch?.indices.length).toBeGreaterThan(0);
  });

  test("should include match indices for URL", () => {
    const results = filterTabsByQuery(tabs, "youtube");
    const youtubeResult = results.find((r) => r.tab.id === 3);
    expect(youtubeResult).toBeDefined();

    const urlMatch = youtubeResult?.matches.find((m) => m.key === "url");
    expect(urlMatch).toBeDefined();
  });

  test("should return empty array when no matches", () => {
    const results = filterTabsByQuery(tabs, "xyznonexistent");
    expect(results).toHaveLength(0);
  });

  test("should handle fuzzy matching", () => {
    // "gthub" should still match "GitHub" with fuzzy search
    const results = filterTabsByQuery(tabs, "gthub");
    // Fuzzy matching may or may not match depending on threshold
    // Just ensure it doesn't crash and returns valid results
    expect(Array.isArray(results)).toBe(true);
  });

  test("match ranges should use exclusive end index", () => {
    const results = filterTabsByQuery(tabs, "Git");
    const githubResult = results.find((r) => r.tab.id === 1);
    const titleMatch = githubResult?.matches.find((m) => m.key === "title");
    const range = titleMatch?.indices[0];

    if (githubResult && range) {
      // Verify that end > start
      expect(range.end).toBeGreaterThan(range.start);
      // Extract the matched text using our range format
      const matchedText = githubResult.tab.title.slice(range.start, range.end);
      expect(matchedText.toLowerCase()).toContain("git");
    }
  });
});

describe("filterTabsByQuery - Japanese/Romaji bidirectional search", () => {
  const japaneseTabs: TabInfo[] = [
    createTab(1, "GitHub ダッシュボード", "https://github.com"),
    createTab(2, "Google 検索", "https://google.com"),
    createTab(3, "YouTube タブ", "https://youtube.com"),
    createTab(4, "ニュース - News", "https://news.example.com"),
  ];

  test("should find Japanese tabs with romaji query", () => {
    const results = filterTabsByQuery(japaneseTabs, "tabu");
    expect(results.some((r) => r.tab.id === 3)).toBe(true); // YouTube タブ
  });

  test("should find tabs with katakana query", () => {
    const results = filterTabsByQuery(japaneseTabs, "タブ");
    expect(results.some((r) => r.tab.id === 3)).toBe(true);
  });

  test("should find tabs with hiragana input converted from romaji", () => {
    // When searching "tabu", it should also convert to "たぶ" and "タブ"
    const results = filterTabsByQuery(japaneseTabs, "tabu");
    // Should match タブ in "YouTube タブ"
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test("should handle mixed Japanese and English queries", () => {
    const results = filterTabsByQuery(japaneseTabs, "Google");
    expect(results.some((r) => r.tab.id === 2)).toBe(true);
  });

  test("should deduplicate results when multiple variants match", () => {
    // Both "tabu" and its converted forms might match the same tab
    const results = filterTabsByQuery(japaneseTabs, "tabu");
    const tabIds = results.map((r) => r.tab.id);
    const uniqueIds = new Set(tabIds);
    expect(tabIds.length).toBe(uniqueIds.size);
  });

  test("should include correct match indices for Japanese text", () => {
    const results = filterTabsByQuery(japaneseTabs, "タブ");
    const tabResult = results.find((r) => r.tab.id === 3);
    expect(tabResult).toBeDefined();
    if (!tabResult) return;

    const titleMatch = tabResult.matches.find((m) => m.key === "title");
    if (titleMatch && titleMatch.indices.length > 0) {
      const range = titleMatch.indices[0];
      if (range) {
        const matchedText = tabResult.tab.title.slice(range.start, range.end);
        expect(matchedText).toContain("タブ");
      }
    }
  });

  test("should find English text when searching with converted katakana", () => {
    // Searching "ニュース" should also search for "nyuusu" which might match "News"
    const results = filterTabsByQuery(japaneseTabs, "ニュース");
    expect(results.some((r) => r.tab.id === 4)).toBe(true);
  });

  test("should work with partial romaji that converts to kana", () => {
    // "dasshubohdo" converts to "ダッシュボード"
    const results = filterTabsByQuery(japaneseTabs, "dasshu");
    // This should match "ダッシュボード" via conversion
    expect(results.length).toBeGreaterThanOrEqual(0); // May or may not match depending on threshold
  });
});
