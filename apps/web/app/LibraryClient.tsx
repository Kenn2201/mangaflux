"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LibrarySkeleton } from "./Skeletons";

type Bookmark = {
  source: string;
  mangaId: string;
  title: string;
  coverUrl?: string | null;
  createdAt: string;
};

type Progress = {
  source: string;
  mangaId: string;
  mangaTitle: string;
  coverUrl?: string | null;
  chapterId: string;
  chapterLabel?: string | null;
  page: number;
  totalPages: number;
  updatedAt: string;
};

type ReaderSummary = {
  bookmarks: Bookmark[];
  history: Progress[];
  continueReading: Progress | null;
};

export default function LibraryClient() {
  const [data, setData] = useState<ReaderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/state/summary", {
          cache: "no-store"
        });

        if (!response.ok) {
          if (!cancelled) setUnavailable(true);
          return;
        }

        const payload = (await response.json()) as ReaderSummary;
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LibrarySkeleton />;
  }

  if (unavailable) {
    return (
      <section id="library" className="library-panel panel compact">
        <p className="eyebrow">Your library</p>
        <h2>Library temporarily unavailable</h2>
        <p>
          Manga search and reading still work. Saved progress will resume once
          persistence is available.
        </p>
      </section>
    );
  }

  if (!data?.continueReading && !data?.bookmarks.length) {
    return (
      <section id="library" className="library-panel panel compact">
        <p className="eyebrow">Your library</p>
        <h2>Start building your shelf.</h2>
        <p>
          Bookmark a manga or start reading a chapter and MangaFlux will keep
          your place. Signed-in libraries sync through your account.
        </p>
      </section>
    );
  }

  return (
    <section id="library" className="library-panel panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your library</p>
          <h2>Pick up where you left off.</h2>
        </div>
        <span>{data.bookmarks.length} saved</span>
      </div>

      {data.continueReading ? (
        <Link
          className="continue-card"
          href={`/read/${data.continueReading.chapterId}?resume=${data.continueReading.page}`}
        >
          <div className="continue-cover">
            {data.continueReading.coverUrl ? (
              <img
                src={data.continueReading.coverUrl}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="cover-placeholder">No cover</div>
            )}
          </div>

          <div className="continue-copy">
            <p className="eyebrow">Continue reading</p>
            <strong>{data.continueReading.mangaTitle}</strong>
            <span>
              {data.continueReading.chapterLabel || "Current chapter"} · Page{" "}
              {data.continueReading.page} / {data.continueReading.totalPages}
            </span>
            <div className="continue-progress" aria-hidden="true">
              <i
                style={{
                  width: `${Math.min(
                    100,
                    (data.continueReading.page /
                      Math.max(1, data.continueReading.totalPages)) *
                      100
                  )}%`
                }}
              />
            </div>
          </div>

          <span className="continue-arrow" aria-hidden="true">→</span>
        </Link>
      ) : null}

      {data.bookmarks.length ? (
        <div className="library-block">
          <div className="library-subheading">
            <h3>Bookmarks</h3>
            <span>{data.bookmarks.length}</span>
          </div>

          <div className="bookmark-strip">
            {data.bookmarks.slice(0, 6).map((item) => (
              <Link
                className="bookmark-card"
                href={`/manga/${item.mangaId}`}
                key={`${item.source}:${item.mangaId}`}
              >
                <div className="bookmark-cover">
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="cover-placeholder">No cover</div>
                  )}
                </div>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {data.history.length > 1 ? (
        <div className="library-block">
          <div className="library-subheading">
            <h3>Recent reading</h3>
          </div>

          <div className="history-list">
            {data.history.slice(1, 5).map((item) => (
              <Link
                href={`/read/${item.chapterId}?resume=${item.page}`}
                key={`${item.source}:${item.mangaId}`}
              >
                <strong>{item.mangaTitle}</strong>
                <span>
                  {item.chapterLabel || "Chapter"} · Page {item.page} /{" "}
                  {item.totalPages}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <p className="device-note">
        Signed-out libraries stay on this browser. Sign in to use the same
        bookmarks and progress across devices.
      </p>
    </section>
  );
}
