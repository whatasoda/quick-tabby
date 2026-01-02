/**
 * Pure functions for filtering and sorting tabs by search relevance
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
 * Filter tabs by search query, sorted by match relevance
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
  const fuseResults = fuse.search(query);

  // Return results in Fuse.js score order (best matches first)
  return fuseResults.map((result) => ({
    tab: result.item,
    matches: (result.matches ?? []).map((m) => ({
      key: m.key as "title" | "url",
      indices: convertFuseIndices(m.indices),
    })),
  }));
}
