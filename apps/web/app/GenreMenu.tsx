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

export default function GenreMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MangaTag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || items.length || loading) return;

    let cancelled = false;
    setLoading(true);

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
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, items.length, loading]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const genres = useMemo(() => {
    const grouped = items.filter((item) => item.group === "genre");
    return (grouped.length ? grouped : items).slice(0, 36);
  }, [items]);

  return (
    <>
      <button
        className="genre-menu-button"
        type="button"
        aria-label="Browse genres"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
        </svg>
        <span>Genres</span>
      </button>

      {open ? (
        <div className="genre-menu-layer">
          <button
            type="button"
            className="genre-menu-backdrop"
            aria-label="Close genre browser"
            onClick={() => setOpen(false)}
          />

          <section className="genre-menu-panel" aria-label="Browse manga genres">
            <div className="genre-menu-heading">
              <div>
                <p className="eyebrow">Browse</p>
                <h2>Genres</h2>
              </div>
              <button
                type="button"
                className="genre-close"
                aria-label="Close genres"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            {loading ? (
              <div className="genre-loading">
                {Array.from({ length: 14 }).map((_, index) => (
                  <span className="skeleton" key={index} />
                ))}
              </div>
            ) : (
              <div className="genre-menu-grid">
                {genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/browse?kind=popular&tag=${encodeURIComponent(
                      genre.id
                    )}&name=${encodeURIComponent(genre.name)}`}
                    onClick={() => setOpen(false)}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              className="genre-menu-all"
              href="/browse?kind=popular"
              onClick={() => setOpen(false)}
            >
              Browse all manga
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      ) : null}
    </>
  );
}
