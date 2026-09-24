"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState
} from "react";
import { notify } from "../../../lib/toast";
import { MangaDetailsSkeleton } from "../../Skeletons";
import CommunityThread from "../../CommunityThread";
import MangaRecommendations from "../../MangaRecommendations";

type MangaDetails = {
  id: string;
  title: string;
  coverUrl?: string;
  description?: string;
  status?: string;
  year?: number;
  tags?: string[];
  tagDetails?: Array<{
    id: string;
    name: string;
    group?: string;
  }>;
  authors?: string[];
  artists?: string[];
  creators?: Array<{
    id: string;
    name: string;
    role: "author" | "artist";
  }>;
  externalUrl?: string;
};

type Chapter = {
  id: string;
  title: string;
  chapter?: string;
  volume?: string;
  language?: string;
  publishedAt?: string;
  scanlationGroups?: string[];
};

type ChapterPayload = {
  items: Chapter[];
  total: number;
  limit: number;
  offset: number;
  order: "asc" | "desc";
};

const CHAPTER_LIMIT = 50;

export default function MangaPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [manga, setManga] = useState<MangaDetails | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterTotal, setChapterTotal] = useState(0);
  const [chapterPage, setChapterPage] = useState(1);
  const [chapterOrder, setChapterOrder] = useState<"asc" | "desc">("desc");
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterInput, setChapterInput] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chapterMessage, setChapterMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  useEffect(() => {
    const query =
      new URLSearchParams(window.location.search).get("q")?.slice(0, 120) ?? "";
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/manga/${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            `Manga details failed (${response.status}). Try again shortly.`
          );
        }

        const payload = (await response.json()) as {
          item: MangaDetails;
        };

        if (!cancelled) setManga(payload.item);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "The source request failed temporarily."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadChapters() {
      setChapterLoading(true);
      setChapterMessage("");

      const query = new URLSearchParams({
        language: "en",
        limit: String(CHAPTER_LIMIT),
        offset: String((chapterPage - 1) * CHAPTER_LIMIT),
        order: chapterOrder
      });

      if (chapterFilter) query.set("chapter", chapterFilter);

      try {
        const response = await fetch(
          `/api/manga/${encodeURIComponent(id)}/chapters?${query.toString()}`,
          { cache: "no-store" }
        );

        const body = await response.json().catch(() => null) as
          | (ChapterPayload & { message?: string })
          | null;

        if (!response.ok || !body) {
          throw new Error(
            body?.message ??
              `Chapters failed (${response.status}). Try again shortly.`
          );
        }

        if (!cancelled) {
          setChapters(body.items);
          setChapterTotal(body.total);
        }
      } catch (error) {
        if (!cancelled) {
          setChapters([]);
          setChapterTotal(0);
          setChapterMessage(
            error instanceof Error
              ? error.message
              : "Chapters are temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) setChapterLoading(false);
      }
    }

    void loadChapters();

    return () => {
      cancelled = true;
    };
  }, [id, chapterPage, chapterOrder, chapterFilter]);

  useEffect(() => {
    if (!manga) return;

    let cancelled = false;

    async function loadBookmark() {
      try {
        const response = await fetch(
          `/api/state/bookmark?source=mangadex&mangaId=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const payload = (await response.json()) as {
          bookmarked: boolean;
        };

        if (!cancelled) setBookmarked(payload.bookmarked);
      } catch {
        // Bookmark state is optional; manga details stay usable.
      }
    }

    void loadBookmark();

    return () => {
      cancelled = true;
    };
  }, [id, manga]);

  async function toggleBookmark() {
    if (!manga || bookmarkBusy) return;

    setBookmarkBusy(true);

    try {
      const response = bookmarked
        ? await fetch(
            `/api/state/bookmark?source=mangadex&mangaId=${encodeURIComponent(id)}`,
            { method: "DELETE" }
          )
        : await fetch("/api/state/bookmark", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              source: "mangadex",
              mangaId: id,
              title: manga.title,
              coverUrl: manga.coverUrl
            })
          });

      if (!response.ok) {
        throw new Error("Bookmark update failed");
      }

      const nextBookmarked = !bookmarked;
      setBookmarked(nextBookmarked);

      notify({
        tone: "success",
        title: nextBookmarked ? "Added to library" : "Removed from library",
        message: nextBookmarked
          ? `${manga.title} is bookmarked.`
          : `${manga.title} was removed from bookmarks.`
      });
    } catch {
      const text = "Bookmark storage is temporarily unavailable.";
      setMessage(text);

      notify({
        tone: "error",
        title: "Bookmark failed",
        message: text
      });
    } finally {
      setBookmarkBusy(false);
    }
  }

  function submitChapterSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = chapterInput.trim();

    if (!value) {
      setChapterFilter("");
      setChapterPage(1);
      return;
    }

    if (!/^[0-9]+(?:\.[0-9]+)?$/.test(value)) {
      setChapterMessage("Enter a chapter number like 1, 12, or 12.5.");
      return;
    }

    setChapterFilter(value);
    setChapterPage(1);
  }

  function clearChapterSearch() {
    setChapterInput("");
    setChapterFilter("");
    setChapterPage(1);
    setChapterMessage("");
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(chapterTotal / CHAPTER_LIMIT)),
    [chapterTotal]
  );

  const querySuffix = searchQuery
    ? `?q=${encodeURIComponent(searchQuery)}`
    : "";

  const searchHref = searchQuery
    ? `/search?q=${encodeURIComponent(searchQuery)}`
    : "/";

  if (loading) {
    return <MangaDetailsSkeleton backHref={searchHref} />;
  }

  if (!manga) {
    return (
      <main>
        <Link className="back-link" href={searchHref}>← Search</Link>
        <section className="panel">
          <p className="eyebrow">MangaDex</p>
          <h2>Couldn&apos;t load this manga</h2>
          <p className="message">
            {message || "The source request failed temporarily."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Link className="back-link" href={searchHref}>
        ← {searchQuery ? `Back to “${searchQuery}”` : "Discover"}
      </Link>

      <section className="details">
        <div className="details-cover">
          {manga.coverUrl ? (
            <img src={manga.coverUrl} alt="" referrerPolicy="no-referrer" />
          ) : null}
        </div>

        <div>
          <p className="eyebrow">MangaDex</p>
          <h1 className="title-small">{manga.title}</h1>

          <div className="meta-row">
            {manga.status ? (
              <Link
                className="meta-link"
                href={`/browse?kind=popular&status=${encodeURIComponent(
                  manga.status
                )}`}
              >
                {manga.status}
              </Link>
            ) : null}

            {manga.year ? (
              <Link
                className="meta-link"
                href={`/browse?kind=popular&year=${manga.year}`}
              >
                {manga.year}
              </Link>
            ) : null}
          </div>

          {manga.creators?.some(
            (creator) => creator.role === "author"
          ) ? (
            <p className="muted creator-line">
              <span>Author:</span>{" "}
              {manga.creators
                .filter((creator) => creator.role === "author")
                .map((creator, index, authors) => (
                  <span key={creator.id}>
                    <Link
                      className="creator-link"
                      href={`/browse?kind=popular&creator=${encodeURIComponent(
                        creator.id
                      )}&creatorName=${encodeURIComponent(creator.name)}`}
                    >
                      {creator.name}
                    </Link>
                    {index < authors.length - 1 ? ", " : ""}
                  </span>
                ))}
            </p>
          ) : manga.authors?.length ? (
            <p className="muted">Author: {manga.authors.join(", ")}</p>
          ) : null}

          {manga.creators?.some(
            (creator) => creator.role === "artist"
          ) ? (
            <p className="muted creator-line">
              <span>Artist:</span>{" "}
              {manga.creators
                .filter((creator) => creator.role === "artist")
                .map((creator, index, artists) => (
                  <span key={creator.id}>
                    <Link
                      className="creator-link"
                      href={`/browse?kind=popular&creator=${encodeURIComponent(
                        creator.id
                      )}&creatorName=${encodeURIComponent(creator.name)}`}
                    >
                      {creator.name}
                    </Link>
                    {index < artists.length - 1 ? ", " : ""}
                  </span>
                ))}
            </p>
          ) : null}

          {manga.description ? (
            <p className="description">{manga.description}</p>
          ) : null}

          {manga.tagDetails?.length ? (
            <div className="tag-row">
              {manga.tagDetails.slice(0, 12).map((tag) => (
                <Link
                  className="tag tag-link"
                  key={tag.id}
                  href={`/browse?kind=popular&tag=${encodeURIComponent(
                    tag.id
                  )}&name=${encodeURIComponent(tag.name)}`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          ) : manga.tags?.length ? (
            <div className="tag-row">
              {manga.tags.slice(0, 12).map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}

          <div className="manga-actions">
            <button
              className={`bookmark-button ${bookmarked ? "is-active" : ""}`}
              type="button"
              onClick={toggleBookmark}
              disabled={bookmarkBusy || bookmarked === null}
              aria-pressed={bookmarked === true}
            >
              {bookmarkBusy
                ? "Saving…"
                : bookmarked
                  ? "★ Bookmarked"
                  : "☆ Bookmark"}
            </button>

            {manga.externalUrl ? (
              <a
                className="source-link"
                href={manga.externalUrl}
                target="_blank"
                rel="noreferrer"
              >
                View on MangaDex ↗
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel chapters-panel">
        <div className="chapter-panel-heading">
          <div>
            <p className="eyebrow">English chapters</p>
            <h2>
              {chapterFilter
                ? `Chapter ${chapterFilter}`
                : chapterOrder === "desc"
                  ? "Newest first"
                  : "Oldest first"}
            </h2>
          </div>

          <span>
            {chapterLoading
              ? "Loading…"
              : chapterFilter
                ? `${chapterTotal} match${chapterTotal === 1 ? "" : "es"}`
                : `${chapterTotal} chapters`}
          </span>
        </div>

        <div className="chapter-toolbar">
          <form
            className="chapter-search-form"
            onSubmit={submitChapterSearch}
          >
            <input
              inputMode="decimal"
              value={chapterInput}
              onChange={(event) => setChapterInput(event.target.value)}
              placeholder="Jump to chapter…"
              aria-label="Find chapter number"
            />
            <button type="submit">Find</button>
            {chapterFilter ? (
              <button
                className="secondary-button"
                type="button"
                onClick={clearChapterSearch}
              >
                Clear
              </button>
            ) : null}
          </form>

          <div className="chapter-sort" aria-label="Chapter sort order">
            <button
              type="button"
              className={chapterOrder === "desc" ? "is-active" : ""}
              onClick={() => {
                setChapterOrder("desc");
                setChapterPage(1);
              }}
            >
              Newest
            </button>
            <button
              type="button"
              className={chapterOrder === "asc" ? "is-active" : ""}
              onClick={() => {
                setChapterOrder("asc");
                setChapterPage(1);
              }}
            >
              Oldest
            </button>
          </div>
        </div>

        {chapterMessage ? (
          <p className="message">{chapterMessage}</p>
        ) : null}

        {chapterLoading ? (
          <div className="chapter-list chapter-list-loading" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <span className="skeleton skeleton-chapter" key={index} />
            ))}
          </div>
        ) : (
          <div className="chapter-list">
            {chapters.map((chapter) => (
              <Link
                className="chapter-row"
                href={`/read/${chapter.id}${querySuffix}`}
                key={chapter.id}
              >
                <div>
                  <strong>
                    {chapter.chapter
                      ? `Chapter ${chapter.chapter}`
                      : chapter.title}
                  </strong>
                  {chapter.title &&
                  chapter.title !== `Chapter ${chapter.chapter}` ? (
                    <span className="chapter-title">{chapter.title}</span>
                  ) : null}
                </div>

                <div className="chapter-meta">
                  {chapter.scanlationGroups?.length
                    ? chapter.scanlationGroups.join(", ")
                    : "Unknown group"}
                </div>
              </Link>
            ))}

            {!chapterMessage && chapters.length === 0 ? (
              <p className="message">No matching English chapters were returned.</p>
            ) : null}
          </div>
        )}

        {!chapterFilter && chapterTotal > CHAPTER_LIMIT ? (
          <nav
            className="chapter-pagination"
            aria-label="Chapter pages"
          >
            <button
              type="button"
              disabled={chapterPage <= 1 || chapterLoading}
              onClick={() => setChapterPage((page) => Math.max(1, page - 1))}
            >
              ← Newer
            </button>

            <span>
              Page {chapterPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={chapterPage >= totalPages || chapterLoading}
              onClick={() =>
                setChapterPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Older →
            </button>
          </nav>
        ) : null}
      </section>

      <MangaRecommendations
        mangaId={id}
        title={manga.title}
        year={manga.year}
        tags={manga.tagDetails ?? []}
        creators={manga.creators ?? []}
      />

      <CommunityThread
        targetType="manga"
        targetId={id}
        heading="Reader reactions & comments"
      />
    </main>
  );
}
