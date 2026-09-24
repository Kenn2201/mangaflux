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

type SearchPayload = {
  items: MangaTileItem[];
};

export default function HeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MangaTileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (pathname !== "/search") return;

    const value =
      new URLSearchParams(window.location.search)
        .get("q")
        ?.slice(0, 120) ?? "";

    setQuery(value);
  }, [pathname]);

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}&limit=6`,
          {
            cache: "no-store",
            signal: controller.signal
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

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) {
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
      const item = items[activeIndex];
      setOpen(false);
      router.push(
        `/manga/${item.id}?q=${encodeURIComponent(query.trim())}`
      );
    }
  }

  return (
    <div className="header-search-shell" ref={shellRef}>
      <form className="header-search" onSubmit={goToResults}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>

        <input
          value={query}
          maxLength={120}
          autoComplete="off"
          enterKeyHint="search"
          aria-label="Search manga"
          aria-expanded={open}
          aria-controls="mangaflux-search-suggestions"
          placeholder="Search manga…"
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (items.length) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />

        {loading ? (
          <span className="mini-spinner header-search-spinner" aria-hidden="true" />
        ) : null}
      </form>

      {open ? (
        <div
          className="search-suggestions"
          id="mangaflux-search-suggestions"
          role="listbox"
        >
          {items.map((item, index) => {
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
                href={`/manga/${item.id}?q=${encodeURIComponent(query.trim())}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => setOpen(false)}
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
          })}

          <button
            className="search-all-button"
            type="button"
            onClick={() => goToResults()}
          >
            Search all results for “{query.trim()}”
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
