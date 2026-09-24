"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState
} from "react";

type MangaTag = {
  id: string;
  name: string;
  group?: string;
};

export default function GenreShelf() {
  const [items, setItems] = useState<MangaTag[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/genres", {
          cache: "no-store"
        });

        if (!response.ok) return;

        const payload = (await response.json()) as {
          items: MangaTag[];
        };

        if (!cancelled) setItems(payload.items);
      } catch {
        // Discovery still works without the genre shelf.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const genres = useMemo(() => {
    const grouped = items.filter((item) => item.group === "genre");
    return (grouped.length ? grouped : items).slice(0, 24);
  }, [items]);

  if (!genres.length) return null;

  return (
    <section className="genre-shelf">
      <div className="discovery-heading">
        <div>
          <p className="eyebrow">Browse by genre</p>
          <h2>Pick a mood.</h2>
        </div>
      </div>

      <div className="genre-chip-grid">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/browse?kind=popular&tag=${encodeURIComponent(
              genre.id
            )}&name=${encodeURIComponent(genre.name)}`}
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
