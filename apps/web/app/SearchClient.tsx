"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type MangaSummary = {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
  altTitles?: string[];
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MangaSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    setLoading(true);
    setMessage("");

    try {
      // Use a same-origin Next.js route. The Vercel server then calls Render
      // server-to-server, which removes browser CORS from the search path.
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
  }

  return (
    <section className="search-section">
      <form className="search-form" onSubmit={submit}>
        <input
          aria-label="Search manga"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search MangaDex..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {message ? <p className="message">{message}</p> : null}

      {items.length > 0 ? (
        <div className="manga-grid">
          {items.map((item) => (
            <Link className="manga-card" href={`/manga/${item.id}`} key={item.id}>
              <div className="cover-shell">
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt="" loading="lazy" />
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
