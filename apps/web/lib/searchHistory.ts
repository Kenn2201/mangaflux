export type SearchHistoryItem = {
  query: string;
  searchedAt: string;
};

export const SEARCH_HISTORY_EVENT = "mangaflux:search-history-changed";
export const SEARCH_QUERY_EVENT = "mangaflux:search-query";
const STORAGE_KEY = "mangaflux:search-history:v1";
const MAX_SEARCH_HISTORY = 10;

function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, 120);
}

function isSearchHistoryItem(value: unknown): value is SearchHistoryItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<SearchHistoryItem>;

  return (
    typeof item.query === "string" &&
    Boolean(normalizeSearchQuery(item.query)) &&
    typeof item.searchedAt === "string"
  );
}

export function announceSearchQuery(rawQuery: string) {
  if (typeof window === "undefined") return;

  const query = normalizeSearchQuery(rawQuery);
  window.dispatchEvent(
    new CustomEvent<string>(SEARCH_QUERY_EVENT, {
      detail: query
    })
  );
}

export function readSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const items: SearchHistoryItem[] = [];

    for (const value of parsed) {
      if (!isSearchHistoryItem(value)) continue;

      const query = normalizeSearchQuery(value.query);
      const key = query.toLocaleLowerCase();

      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        query,
        searchedAt: value.searchedAt
      });

      if (items.length >= MAX_SEARCH_HISTORY) break;
    }

    return items;
  } catch {
    return [];
  }
}

function writeSearchHistory(items: SearchHistoryItem[]) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_SEARCH_HISTORY))
    );
    window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function recordSearchHistory(rawQuery: string) {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) return false;

  const key = query.toLocaleLowerCase();
  const existing = readSearchHistory().filter(
    (item) => item.query.toLocaleLowerCase() !== key
  );

  return writeSearchHistory([
    {
      query,
      searchedAt: new Date().toISOString()
    },
    ...existing
  ]);
}

export function removeSearchHistory(rawQuery: string) {
  const query = normalizeSearchQuery(rawQuery);
  const key = query.toLocaleLowerCase();

  return writeSearchHistory(
    readSearchHistory().filter(
      (item) => item.query.toLocaleLowerCase() !== key
    )
  );
}

export function clearSearchHistory() {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
    return true;
  } catch {
    return false;
  }
}
