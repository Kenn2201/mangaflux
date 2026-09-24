"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { reliableFetch } from "../lib/reliableFetch";

type MangaTag = {
  id: string;
  name: string;
  group?: string;
};

export default function GenreMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MangaTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || items.length) return;

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    async function load() {
      try {
        const response = await reliableFetch(
          "/api/genres",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Genres unavailable");
        }

        const payload = (await response.json()) as {
          items: MangaTag[];
        };

        if (!cancelled) {
          setItems(payload.items);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, items.length, requestKey]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("genre-sheet-open");
    window.setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("genre-sheet-open");
      triggerRef.current?.focus();
    };
  }, [open]);

  const genres = useMemo(() => {
    const grouped = items.filter((item) => item.group === "genre");
    return (grouped.length ? grouped : items).slice(0, 24);
  }, [items]);

  const layer =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="genre-menu-layer">
            <button
              type="button"
              className="genre-menu-backdrop"
              aria-label="Close genre browser"
              onClick={() => setOpen(false)}
            />

            <section
              className="genre-menu-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="genre-menu-title"
            >
              <div className="genre-menu-heading">
                <div>
                  <p className="eyebrow">Browse</p>
                  <h2 id="genre-menu-title">Genres</h2>
                </div>

                <button
                  type="button"
                  className="genre-close"
                  ref={closeRef}
                  aria-label="Close genres"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>

              {loading ? (
                <div className="genre-loading" aria-busy="true">
                  {Array.from({ length: 14 }).map((_, index) => (
                    <span className="skeleton" key={index} />
                  ))}
                </div>
              ) : failed ? (
                <div className="genre-error">
                  <strong>Genres did not load.</strong>
                  <span>Search and discovery still work.</span>
                  <button
                    type="button"
                    onClick={() => setRequestKey((value) => value + 1)}
                  >
                    Retry
                  </button>
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

              <div className="genre-menu-links">
                <Link
                  href="/genres"
                  onClick={() => setOpen(false)}
                >
                  Browse more genres
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="/browse?kind=popular"
                  onClick={() => setOpen(false)}
                >
                  Browse all manga
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        className="genre-menu-button"
        ref={triggerRef}
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

      {layer}
    </>
  );
}
