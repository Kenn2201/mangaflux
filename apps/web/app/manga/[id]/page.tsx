"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type MangaDetails = {
  id: string;
  title: string;
  coverUrl?: string;
  description?: string;
  status?: string;
  year?: number;
  tags?: string[];
  authors?: string[];
  artists?: string[];
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

export default function MangaPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [manga, setManga] = useState<MangaDetails | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const query =
      new URLSearchParams(window.location.search).get("q")?.slice(0, 120) ?? "";
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");

      try {
        const [detailsResponse, chaptersResponse] = await Promise.all([
          fetch(`/api/manga/${encodeURIComponent(id)}`, {
            cache: "no-store"
          }),
          fetch(
            `/api/manga/${encodeURIComponent(id)}/chapters?language=en`,
            { cache: "no-store" }
          )
        ]);

        if (!detailsResponse.ok) {
          throw new Error(
            `Manga details failed (${detailsResponse.status}). Try again shortly.`
          );
        }

        const detailsPayload = (await detailsResponse.json()) as {
          item: MangaDetails;
        };

        if (cancelled) return;
        setManga(detailsPayload.item);

        if (chaptersResponse.ok) {
          const chapterPayload = (await chaptersResponse.json()) as {
            items: Chapter[];
          };
          if (!cancelled) setChapters(chapterPayload.items);
        } else if (!cancelled) {
          setMessage(
            `Manga loaded, but chapters failed (${chaptersResponse.status}).`
          );
        }
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

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const querySuffix = searchQuery
    ? `?q=${encodeURIComponent(searchQuery)}`
    : "";
  const searchHref = searchQuery
    ? `/?q=${encodeURIComponent(searchQuery)}`
    : "/";

  if (loading) {
    return (
      <main>
        <Link className="back-link" href={searchHref}>← Search</Link>
        <section className="panel loading-panel">
          <p className="eyebrow">MangaDex</p>
          <h2>Loading manga…</h2>
          <p className="message">Fetching details and the latest English chapters.</p>
        </section>
      </main>
    );
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
        ← {searchQuery ? `Back to “${searchQuery}”` : "Search"}
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
            {manga.status ? <span>{manga.status}</span> : null}
            {manga.year ? <span>{manga.year}</span> : null}
          </div>

          {manga.authors?.length ? (
            <p className="muted">Author: {manga.authors.join(", ")}</p>
          ) : null}

          {manga.description ? (
            <p className="description">{manga.description}</p>
          ) : null}

          {manga.tags?.length ? (
            <div className="tag-row">
              {manga.tags.slice(0, 12).map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}

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
      </section>

      <section className="panel chapters-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">English</p>
            <h2>Recent chapters</h2>
          </div>
          <span>{chapters.length} loaded</span>
        </div>

        {message ? <p className="message">{message}</p> : null}

        <div className="chapter-list">
          {chapters.map((chapter) => (
            <Link
              className="chapter-row"
              href={`/read/${chapter.id}${querySuffix}`}
              key={chapter.id}
            >
              <div>
                <strong>
                  {chapter.chapter ? `Chapter ${chapter.chapter}` : chapter.title}
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

          {!message && chapters.length === 0 ? (
            <p className="message">No English chapters were returned.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
