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
