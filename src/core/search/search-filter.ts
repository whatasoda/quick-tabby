/**
 * Pure functions for filtering tabs while preserving MRU order
 */
import Fuse from "fuse.js";
import type { TabInfo } from "../../shared/types.ts";
import { FUSE_OPTIONS } from "./search-config.ts";
import type { MatchRange, SearchMatch, SearchResult } from "./search-types.ts";

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
 * Filter tabs by search query while preserving original (MRU) order
 *
 * @param tabs - Tabs in MRU order
 * @param query - Search query string
 * @returns Filtered tabs with match information, maintaining MRU order
 */
export function filterTabsByQuery(tabs: TabInfo[], query: string): SearchResult[] {
  if (!query.trim()) {
    // No query: return all tabs without match info
    return tabs.map((tab) => ({ tab, matches: [] }));
  }

  const fuse = createTabSearcher(tabs);
  const fuseResults = fuse.search(query);

  // Create a map of tabId -> matches for O(1) lookup
  const matchMap = new Map<number, SearchMatch[]>();
  for (const result of fuseResults) {
    const matches: SearchMatch[] = (result.matches ?? []).map((m) => ({
      key: m.key as "title" | "url",
      indices: convertFuseIndices(m.indices),
    }));
    matchMap.set(result.item.id, matches);
  }

  // Filter tabs maintaining MRU order, only include matched tabs
  return tabs
    .filter((tab) => matchMap.has(tab.id))
    .map((tab) => ({
      tab,
      matches: matchMap.get(tab.id) ?? [],
    }));
}
