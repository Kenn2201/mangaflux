"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { MangaTileItem } from "./MangaTile";
import { reliableFetch } from "../lib/reliableFetch";
import {
  clearSearchHistory,
  readSearchHistory,
  recordSearchHistory,
  removeSearchHistory,
  SEARCH_HISTORY_EVENT,
  SEARCH_QUERY_EVENT,
  type SearchHistoryItem
} from "../lib/searchHistory";

type SearchPayload = {
  items: MangaTileItem[];
};

export default function HeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MangaTileItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    function syncHistory() {
      setRecentSearches(readSearchHistory());
    }

    syncHistory();
    window.addEventListener("storage", syncHistory);
    window.addEventListener(SEARCH_HISTORY_EVENT, syncHistory);

    return () => {
      window.removeEventListener("storage", syncHistory);
      window.removeEventListener(SEARCH_HISTORY_EVENT, syncHistory);
    };
  }, []);

  useEffect(() => {
    function syncQuery(event: Event) {
      const value = (event as CustomEvent<string>).detail;

      if (typeof value === "string") {
        setQuery(value.slice(0, 120));
      }
    }

    window.addEventListener(SEARCH_QUERY_EVENT, syncQuery);
    return () => {
      window.removeEventListener(SEARCH_QUERY_EVENT, syncQuery);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/search") return;

    const value =
      new URLSearchParams(window.location.search)
        .get("q")
        ?.slice(0, 120) ?? "";

    setQuery(value);
  }, [pathname]);

  useEffect(() => {
    if (focused && !query.trim()) {
      setOpen(recentSearches.length > 0);
    }
  }, [focused, query, recentSearches.length]);

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      setItems([]);
      setLoading(false);
      setActiveIndex(-1);

      if (value.length > 0) {
        setOpen(false);
      }
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await reliableFetch(
          `/api/search?q=${encodeURIComponent(value)}&limit=6`,
          {
            cache: "no-store",
            signal: controller.signal
          },
          {
            retries: 1,
            timeoutMs: 9_000
          }
        );

        if (!response.ok) {
          throw new Error("Search unavailable");
        }

        const payload = (await response.json()) as SearchPayload;
        setItems(payload.items);
        setOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function closeOnOutside(event: PointerEvent) {
      if (
        shellRef.current &&
        !shellRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setFocused(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
    };
  }, []);

  function goToResults(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const value = query.trim().slice(0, 120);
    if (!value) return;

    recordSearchHistory(value);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  function openSuggestion(item: MangaTileItem) {
    const value = query.trim().slice(0, 120);

    if (value) recordSearchHistory(value);
    setOpen(false);
    router.push(
      `/manga/${item.id}?q=${encodeURIComponent(value)}`
    );
  }

  function runRecent(value: string) {
    recordSearchHistory(value);
    setQuery(value);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0 || query.trim().length < 2) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        Math.min(items.length - 1, current + 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(-1, current - 1));
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      openSuggestion(items[activeIndex]);
    }
  }

  const showRecent =
    open && !query.trim() && recentSearches.length > 0;
  const showSuggestions =
    open && query.trim().length >= 2;

  return (
    <div className="header-search-shell" ref={shellRef}>
      <form
        className="header-search"
        role="search"
        onSubmit={goToResults}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>

        <input
          value={query}
          maxLength={120}
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-label="Search manga"
          aria-autocomplete="list"
          aria-expanded={showRecent || showSuggestions}
          aria-controls="mangaflux-search-suggestions"
          aria-activedescendant={
            activeIndex >= 0
              ? `mangaflux-search-option-${activeIndex}`
              : undefined
          }
          placeholder="Search manga…"
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);

            if (!value.trim()) {
              setOpen(recentSearches.length > 0);
            } else if (value.trim().length < 2) {
              setOpen(false);
            }
          }}
          onFocus={() => {
            setFocused(true);

            if (!query.trim() && recentSearches.length) {
              setOpen(true);
            } else if (items.length) {
              setOpen(true);
            }
          }}
          onKeyDown={onKeyDown}
        />

        {loading ? (
          <span className="mini-spinner header-search-spinner" aria-hidden="true" />
        ) : null}
      </form>

      {showRecent || showSuggestions ? (
        <div
          className="search-suggestions"
          id="mangaflux-search-suggestions"
          role={showSuggestions ? "listbox" : undefined}
        >
          {showRecent ? (
            <div className="search-recent">
              <div className="search-recent-heading">
                <span>Recent searches</span>
                <button
                  type="button"
                  onClick={() => clearSearchHistory()}
                >
                  Clear all
                </button>
              </div>

              {recentSearches.map((item) => (
                <div
                  className="search-recent-row"
                  key={item.query.toLocaleLowerCase()}
                >
                  <button
                    type="button"
                    className="search-recent-run"
                    onClick={() => runRecent(item.query)}
                  >
                    <span aria-hidden="true">⌕</span>
                    <strong>{item.query}</strong>
                  </button>
                  <button
                    type="button"
                    className="search-recent-remove"
                    aria-label={`Remove ${item.query} from search history`}
                    onClick={() => removeSearchHistory(item.query)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {showSuggestions
            ? items.map((item, index) => {
                const meta = [
                  "Manga",
                  item.year ? String(item.year) : undefined,
                  item.tags?.[0]
                ].filter(Boolean);

                return (
                  <Link
                    key={item.id}
                    className={`search-suggestion ${
                      index === activeIndex ? "is-active" : ""
                    }`}
                    id={`mangaflux-search-option-${index}`}
                    href={`/manga/${item.id}?q=${encodeURIComponent(
                      query.trim()
                    )}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onClick={(event) => {
                      event.preventDefault();
                      openSuggestion(item);
                    }}
                  >
                    <div className="search-suggestion-cover">
                      {item.coverUrl ? (
                        <img
                          src={item.coverUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span />
                      )}
                    </div>

                    <div>
                      <strong>{item.title}</strong>
                      <span>{meta.join(" · ")}</span>
                    </div>
                  </Link>
                );
              })
            : null}

          {showSuggestions ? (
            <button
              className="search-all-button"
              type="button"
              onClick={() => goToResults()}
            >
              Search all results for “{query.trim()}”
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
