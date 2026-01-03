import { type Accessor, createMemo, createSignal } from "solid-js";
import { filterTabsByQuery, type SearchResult } from "../../core/search";
import type { SearchBarMode } from "../../core/settings/settings-types.ts";
import type { TabInfo } from "../../shared/types.ts";

export interface UseSearchOptions {
  tabs: Accessor<TabInfo[] | undefined>;
  searchBarMode: Accessor<SearchBarMode>;
}

export interface UseSearchReturn {
  query: Accessor<string>;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  filteredTabs: Accessor<SearchResult[]>;
  isSearchVisible: Accessor<boolean>;
  showSearch: () => void;
  hideSearch: () => void;
  inputRef: Accessor<HTMLInputElement | null>;
  setInputRef: (ref: HTMLInputElement | null) => void;
}

export function useSearch(options: UseSearchOptions): UseSearchReturn {
  const { tabs, searchBarMode } = options;

  const [query, setQuery] = createSignal("");
  const [isSearchVisibleManual, setIsSearchVisibleManual] = createSignal(false);
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null);

  const filteredTabs = createMemo(() => {
    const tabList = tabs();
    if (!tabList) return [];
    return filterTabsByQuery(tabList, query());
  });

  const isSearchVisible = createMemo(() => {
    const mode = searchBarMode();
    if (mode === "always") return true;
    // onType mode: visible if query exists or manually shown
    return query().length > 0 || isSearchVisibleManual();
  });

  function clearQuery() {
    setQuery("");
  }

  function showSearch() {
    setIsSearchVisibleManual(true);
    // Focus the input after showing
    setTimeout(() => inputRef()?.focus(), 0);
  }

  function hideSearch() {
    setIsSearchVisibleManual(false);
    clearQuery();
  }

  return {
    query,
    setQuery,
    clearQuery,
    filteredTabs,
    isSearchVisible,
    showSearch,
    hideSearch,
    inputRef,
    setInputRef,
  };
}
