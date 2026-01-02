/**
 * Pure functions for filtering and sorting tabs by search relevance
 */
import Fuse, { type FuseResult } from "fuse.js";
import type { TabInfo } from "../../shared/types.ts";
import { generateQueryVariants, getActiveVariants } from "./japanese-converter.ts";
import { FUSE_OPTIONS } from "./search-config.ts";
import type { MatchRange, SearchResult } from "./search-types.ts";

/**
 * Create a Fuse instance for tab searching
 */
export function createTabSearcher(tabs: TabInfo[]): Fuse<TabInfo> {
  return new Fuse(tabs, FUSE_OPTIONS);
}

/**
 * Convert Fuse.js match indices to our MatchRange format
 * Fuse.js uses [start, end] where end is inclusive, we use end as exclusive
 */
function convertFuseIndices(indices: readonly [number, number][]): MatchRange[] {
  return indices.map(([start, end]) => ({ start, end: end + 1 }));
}

/**
 * Merge search results from multiple query variants, keeping best matches
 */
function mergeSearchResults(resultSets: FuseResult<TabInfo>[][]): FuseResult<TabInfo>[] {
  const tabMap = new Map<number, FuseResult<TabInfo>>();

  for (const results of resultSets) {
    for (const result of results) {
      const tabId = result.item.id;
      const existing = tabMap.get(tabId);

      if (
        !existing ||
        (result.score !== undefined &&
          existing.score !== undefined &&
          result.score < existing.score)
      ) {
        // Keep result with better (lower) score
        tabMap.set(tabId, result);
      }
    }
  }

  // Sort by score (best first)
  return Array.from(tabMap.values()).sort((a, b) => {
    const scoreA = a.score ?? 1;
    const scoreB = b.score ?? 1;
    return scoreA - scoreB;
  });
}

/**
 * Filter tabs by search query with Japanese/Romaji bidirectional support
 *
 * @param tabs - Tabs in MRU order
 * @param query - Search query string
 * @returns Filtered tabs with match information, sorted by relevance (best match first)
 */
export function filterTabsByQuery(tabs: TabInfo[], query: string): SearchResult[] {
  if (!query.trim()) {
    // No query: return all tabs in MRU order without match info
    return tabs.map((tab) => ({ tab, matches: [] }));
  }

  const fuse = createTabSearcher(tabs);

  // Generate query variants for bidirectional search
  const variants = generateQueryVariants(query);
  const activeQueries = getActiveVariants(variants);

  // Search with each variant
  const resultSets = activeQueries.map((q) => fuse.search(q));

  // Merge results, keeping best matches
  const mergedResults = mergeSearchResults(resultSets);

  // Return results in score order (best matches first)
  return mergedResults.map((result) => ({
    tab: result.item,
    matches: (result.matches ?? []).map((m) => ({
      key: m.key as "title" | "url",
      indices: convertFuseIndices(m.indices),
    })),
  }));
}
