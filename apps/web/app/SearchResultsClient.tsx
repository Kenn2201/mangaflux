"use client";

import {
  useEffect,
  useState
} from "react";
import MangaTile, {
  type MangaTileItem
} from "./MangaTile";
import { SearchSkeleton } from "./Skeletons";
import Link from "next/link";
import { reliableFetch } from "../lib/reliableFetch";

export default function SearchResultsClient({
  query
}: {
  query: string;
}) {
  const [items, setItems] = useState<MangaTileItem[]>([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      setLoading(false);
      setMessage("");
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setMessage("");

      try {
        const response = await reliableFetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&limit=24`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Search is temporarily unavailable.");
        }

        const payload = (await response.json()) as {
          items: MangaTileItem[];
        };

        setItems(payload.items);

        if (!payload.items.length) {
          setMessage("No MangaDex results found.");
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessage(
            error instanceof Error
              ? error.message
              : "Search failed. Try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [query]);

  if (!query.trim()) {
    return (
      <section className="search-empty panel">
        <p className="eyebrow">Search</p>
        <h2>Type a title in the search bar above.</h2>
        <p>Suggestions will appear while you type.</p>
      </section>
    );
  }

  if (loading) {
    return <SearchSkeleton count={10} />;
  }

  return (
    <>
      {message ? (
        <div className="reliability-error">
          <p className="message">{message}</p>
          <Link href="/status">Check system status →</Link>
        </div>
      ) : null}

      {items.length ? (
        <div className="browse-grid">
          {items.map((item) => (
            <MangaTile item={item} query={query} key={item.id} />
          ))}
        </div>
      ) : null}
    </>
  );
}
