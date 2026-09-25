export type RecentlyViewedItem = {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
  year?: number;
  tags?: string[];
  viewedAt: string;
};

export const RECENTLY_VIEWED_EVENT = "mangaflux:recently-viewed-changed";
const STORAGE_KEY = "mangaflux:recently-viewed:v1";
const MAX_RECENTLY_VIEWED = 12;

function isRecentlyViewedItem(value: unknown): value is RecentlyViewedItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<RecentlyViewedItem>;

  if (
    typeof item.id !== "string" ||
    !item.id ||
    typeof item.source !== "string" ||
    !item.source ||
    typeof item.title !== "string" ||
    !item.title ||
    typeof item.viewedAt !== "string"
  ) {
    return false;
  }

  if (
    item.year !== undefined &&
    (!Number.isInteger(item.year) || item.year < 1900 || item.year > 2100)
  ) {
    return false;
  }

  if (
    item.tags !== undefined &&
    (!Array.isArray(item.tags) ||
      item.tags.some((tag) => typeof tag !== "string"))
  ) {
    return false;
  }

  return true;
}

export function readRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecentlyViewedItem)
      .slice(0, MAX_RECENTLY_VIEWED)
      .map((item) => ({
        ...item,
        tags: item.tags?.slice(0, 4)
      }));
  } catch {
    return [];
  }
}

function writeRecentlyViewed(items: RecentlyViewedItem[]) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_RECENTLY_VIEWED))
    );
    window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function recordRecentlyViewed(
  item: Omit<RecentlyViewedItem, "viewedAt">
) {
  const existing = readRecentlyViewed().filter(
    (entry) => entry.id !== item.id
  );

  return writeRecentlyViewed([
    {
      ...item,
      tags: item.tags?.slice(0, 4),
      viewedAt: new Date().toISOString()
    },
    ...existing
  ]);
}

export function removeRecentlyViewed(id: string) {
  return writeRecentlyViewed(
    readRecentlyViewed().filter((item) => item.id !== id)
  );
}

export function clearRecentlyViewed() {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
    return true;
  } catch {
    return false;
  }
}
