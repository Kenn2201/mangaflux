"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState
} from "react";
import { SearchSkeleton } from "./Skeletons";

type MangaSummary = {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
  altTitles?: string[];
};

export default function SearchClient({
  initialQuery = ""
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<MangaSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const performSearch = useCallback(async (rawQuery: string) => {
    const value = rawQuery.trim();

    if (!value) {
      setItems([]);
      setMessage("");
      return;
    }

    setLoading(true);
    setItems([]);
    setMessage("");

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(value)}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Search is temporarily unavailable.");
      }

      const payload = (await response.json()) as { items: MangaSummary[] };
      setItems(payload.items);

      if (payload.items.length === 0) {
        setMessage("No MangaDex results found.");
      }
    } catch (error) {
      setItems([]);
      setMessage(
        error instanceof Error ? error.message : "Search failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const value = initialQuery.trim().slice(0, 120);
    setQuery(value);
    void performSearch(value);
  }, [initialQuery, performSearch]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim().slice(0, 120);

    if (!value) {
      router.replace("/", { scroll: false });
      setItems([]);
      setMessage("");
      return;
    }

    if (value === initialQuery.trim()) {
      void performSearch(value);
      return;
    }

    router.replace(`/?q=${encodeURIComponent(value)}`, { scroll: false });
  }

  function clearSearch() {
    setQuery("");
    setItems([]);
    setMessage("");
    router.replace("/", { scroll: false });
  }

  const preservedQuery = initialQuery.trim().slice(0, 120);
  const mangaQuerySuffix = preservedQuery
    ? `?q=${encodeURIComponent(preservedQuery)}`
    : "";

  return (
    <section id="search" className="search-section">
      <div className="section-kicker">
        <p className="eyebrow">Explore MangaDex</p>
        <h2>Find your next read.</h2>
      </div>

      <form className="search-form" onSubmit={submit}>
        <input
          aria-label="Search manga"
          maxLength={120}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Title, series, or manga…"
        />
        <div className="search-actions">
          {initialQuery ? (
            <button
              className="secondary-button"
              type="button"
              onClick={clearSearch}
            >
              Clear
            </button>
          ) : null}
          <button type="submit" disabled={loading}>
            {loading ? (
              <span className="button-working">
                <span className="mini-spinner" aria-hidden="true" />
                Searching
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {initialQuery && !loading ? (
        <p className="search-context">
          Showing results for <strong>{initialQuery}</strong>
        </p>
      ) : null}

      {message ? <p className="message">{message}</p> : null}

      {loading ? <SearchSkeleton /> : null}

      {!loading && items.length > 0 ? (
        <div className="manga-grid" aria-live="polite">
          {items.map((item) => (
            <Link
              className="manga-card"
              href={`/manga/${item.id}${mangaQuerySuffix}`}
              key={item.id}
            >
              <div className="cover-shell">
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="cover-placeholder">No cover</div>
                )}
              </div>
              <strong>{item.title}</strong>
              <span>MangaDex</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
