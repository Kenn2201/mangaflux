"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.manga.kenncode.me";

type ReaderResponse = {
  chapter: {
    id: string;
    mangaId: string;
    title: string;
    chapter?: string;
    scanlationGroups?: string[];
    externalUrl?: string;
  };
  pages: Array<{
    index: number;
  }>;
  attribution: {
    sourceName: string;
    sourceUrl: string;
    scanlationGroups: string[];
  };
};

function proxyImageUrl(
  chapterId: string,
  index: number,
  dataSaver: boolean
) {
  const base = API_URL.replace(/\/$/, "");
  return `${base}/api/chapter/mangadex/${encodeURIComponent(chapterId)}/image/${index}?dataSaver=${dataSaver}`;
}

function ReaderImage({
  chapterId,
  index
}: {
  chapterId: string;
  index: number;
}) {
  const [dataSaver, setDataSaver] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = proxyImageUrl(chapterId, index, dataSaver);

  return (
    <figure className={`reader-page ${failed ? "reader-page-failed" : ""}`}>
      {!failed ? (
        <img
          src={src}
          alt={`Page ${index}`}
          loading={index <= 2 ? "eager" : "lazy"}
          onError={() => {
            if (!dataSaver) {
              setDataSaver(true);
              return;
            }

            setFailed(true);
          }}
        />
      ) : (
        <div className="reader-image-error">
          <strong>Page {index} could not load</strong>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setDataSaver(false);
            }}
          >
            Retry page
          </button>
        </div>
      )}
    </figure>
  );
}

export default function ReaderPage() {
  const params = useParams<{ chapterId: string }>();
  const chapterId = params.chapterId;

  const [data, setData] = useState<ReaderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/chapter/${encodeURIComponent(chapterId)}/pages`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            `Reader failed (${response.status})${body ? `: ${body.slice(0, 180)}` : ""}`
          );
        }

        const payload = (await response.json()) as ReaderResponse;
        if (!cancelled) setData(payload);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "The chapter source is temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  if (loading) {
    return (
      <main>
        <Link className="back-link" href="/">← MangaFlux</Link>
        <section className="panel">
          <p className="eyebrow">Reader</p>
          <h2>Loading chapter…</h2>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main>
        <Link className="back-link" href="/">← MangaFlux</Link>
        <section className="panel">
          <p className="eyebrow">Reader</p>
          <h2>Couldn't load this chapter</h2>
          <p className="message">
            {message || "The chapter source is temporarily unavailable."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="reader">
      <header className="reader-header">
        <div>
          {data.chapter.mangaId ? (
            <Link className="back-link" href={`/manga/${data.chapter.mangaId}`}>
              ← Chapters
            </Link>
          ) : (
            <Link className="back-link" href="/">← MangaFlux</Link>
          )}

          <h1 className="reader-title">
            {data.chapter.chapter
              ? `Chapter ${data.chapter.chapter}`
              : data.chapter.title}
          </h1>
        </div>

        <div className="reader-credit">
          <a href={data.attribution.sourceUrl} target="_blank" rel="noreferrer">
            Read via {data.attribution.sourceName} ↗
          </a>
          <span>
            {data.attribution.scanlationGroups.length
              ? `Scanlation: ${data.attribution.scanlationGroups.join(", ")}`
              : "Scanlation group not provided"}
          </span>
        </div>
      </header>

      <div className="reader-pages">
        {data.pages.map((page) => (
          <ReaderImage
            key={page.index}
            chapterId={chapterId}
            index={page.index}
          />
        ))}
      </div>

      <footer className="reader-footer">
        <a href={data.attribution.sourceUrl} target="_blank" rel="noreferrer">
          MangaDex source / chapter attribution
        </a>
      </footer>
    </div>
  );
}
