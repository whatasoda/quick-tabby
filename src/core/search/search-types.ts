/**
 * Search result types for fuzzy search
 */
import type { TabInfo } from "../../shared/types.ts";

export interface MatchRange {
  start: number;
  end: number;
}

export interface SearchMatch {
  key: "title" | "url";
  indices: MatchRange[];
}

export interface SearchResult {
  tab: TabInfo;
  matches: SearchMatch[];
}
