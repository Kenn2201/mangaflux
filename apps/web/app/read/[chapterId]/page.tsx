"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

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

type Chapter = {
  id: string;
  title: string;
  chapter?: string;
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
  index,
  dataSaver
}: {
  chapterId: string;
  index: number;
  dataSaver: boolean;
}) {
  const [fallbackSaver, setFallbackSaver] = useState(false);
  const [failed, setFailed] = useState(false);
  const useSaver = dataSaver || fallbackSaver;
  const src = proxyImageUrl(chapterId, index, useSaver);

  useEffect(() => {
    setFallbackSaver(false);
    setFailed(false);
  }, [chapterId, dataSaver]);

  return (
    <figure
      className={`reader-page ${failed ? "reader-page-failed" : ""}`}
      data-page-index={index}
    >
      {!failed ? (
        <img
          src={src}
          alt={`Page ${index}`}
          loading={index <= 2 ? "eager" : "lazy"}
          onError={() => {
            if (!useSaver) {
              setFallbackSaver(true);
              return;
            }

            setFailed(true);
          }}
        />
      ) : (
        <div className="reader-image-error">
          <strong>Page {index} could not load</strong>
          <span>Retry the page or switch the reader quality mode.</span>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setFallbackSaver(false);
            }}
          >
            Retry page
          </button>
        </div>
      )}
    </figure>
  );
}

function findDistinctNeighbor(
  chapters: Chapter[],
  currentIndex: number,
  step: -1 | 1
) {
  if (currentIndex < 0) return undefined;
  const currentNumber = chapters[currentIndex]?.chapter;

  for (
    let index = currentIndex + step;
    index >= 0 && index < chapters.length;
    index += step
  ) {
    const candidate = chapters[index];

    if (!currentNumber || candidate.chapter !== currentNumber) {
      return candidate;
    }
  }

  return undefined;
}

export default function ReaderPage() {
  const params = useParams<{ chapterId: string }>();
  const chapterId = params.chapterId;
  const pagesRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<ReaderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dataSaver, setDataSaver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previousChapter, setPreviousChapter] = useState<Chapter>();
  const [nextChapter, setNextChapter] = useState<Chapter>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("q")?.slice(0, 120) ?? "");
    setDataSaver(
      window.localStorage.getItem("mangaflux:data-saver") === "true"
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");
      setData(null);
      setPreviousChapter(undefined);
      setNextChapter(undefined);
      setCurrentPage(1);

      try {
        const response = await fetch(
          `/api/chapter/${encodeURIComponent(chapterId)}/pages`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            `Reader failed (${response.status}). Try again shortly.`
          );
        }

        const payload = (await response.json()) as ReaderResponse;

        if (!cancelled) {
          setData(payload);
          window.scrollTo(0, 0);
        }
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

    void load();
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  useEffect(() => {
    if (!data?.chapter.mangaId) return;

    let cancelled = false;

    async function loadChapterNavigation() {
      try {
        const response = await fetch(
          `/api/manga/${encodeURIComponent(data!.chapter.mangaId)}/chapters?language=en`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const payload = (await response.json()) as { items: Chapter[] };
        const currentIndex = payload.items.findIndex(
          (chapter) => chapter.id === chapterId
        );

        if (cancelled || currentIndex < 0) return;

        // MangaDex feed is descending: +1 is an older/lower chapter,
        // -1 is a newer/higher chapter.
        setPreviousChapter(
          findDistinctNeighbor(payload.items, currentIndex, 1)
        );
        setNextChapter(
          findDistinctNeighbor(payload.items, currentIndex, -1)
        );
      } catch {
        // Reader remains usable even if adjacent chapter lookup fails.
      }
    }

    void loadChapterNavigation();
    return () => {
      cancelled = true;
    };
  }, [chapterId, data]);

  useEffect(() => {
    const container = pagesRef.current;
    if (!container || !data?.pages.length) return;

    const visibility = new Map<number, number>();
    const pageElements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-page-index]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const page = Number(
            (entry.target as HTMLElement).dataset.pageIndex ?? "0"
          );
          if (!page) continue;
          visibility.set(page, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestPage = 0;
        let bestRatio = 0;

        for (const [page, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestPage = page;
            bestRatio = ratio;
          }
        }

        if (bestPage > 0) {
          setCurrentPage(bestPage);
        }
      },
      {
        root: null,
        rootMargin: "-22% 0px -22% 0px",
        threshold: [0, 0.05, 0.15, 0.3, 0.5, 0.75]
      }
    );

    for (const element of pageElements) observer.observe(element);

    return () => observer.disconnect();
  }, [chapterId, data?.pages.length]);

  const totalPages = data?.pages.length ?? 0;
  const progress = totalPages
    ? Math.min(100, Math.max(0, (currentPage / totalPages) * 100))
    : 0;

  const querySuffix = searchQuery
    ? `?q=${encodeURIComponent(searchQuery)}`
    : "";

  const chapterHref = (id: string) => `/read/${id}${querySuffix}`;

  const chaptersHref = data?.chapter.mangaId
    ? `/manga/${data.chapter.mangaId}${querySuffix}`
    : searchQuery
      ? `/?q=${encodeURIComponent(searchQuery)}`
      : "/";

  const pageLabel = useMemo(
    () => (totalPages ? `Page ${currentPage} / ${totalPages}` : "Page —"),
    [currentPage, totalPages]
  );

  function toggleDataSaver() {
    setDataSaver((current) => {
      const next = !current;
      window.localStorage.setItem("mangaflux:data-saver", String(next));
      return next;
    });
  }

  if (loading) {
    return (
      <main>
        <Link className="back-link" href={chaptersHref}>← MangaFlux</Link>
        <section className="panel loading-panel">
          <p className="eyebrow">Reader</p>
          <h2>Loading chapter…</h2>
          <p className="message">Resolving the chapter and page list.</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main>
        <Link className="back-link" href={chaptersHref}>← MangaFlux</Link>
        <section className="panel">
          <p className="eyebrow">Reader</p>
          <h2>Couldn&apos;t load this chapter</h2>
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
        <div className="reader-heading">
          <Link className="back-link" href={chaptersHref}>
            ← Chapters
          </Link>

          <h1 className="reader-title">
            {data.chapter.chapter
              ? `Chapter ${data.chapter.chapter}`
              : data.chapter.title}
          </h1>
        </div>

        <div className="reader-tools">
          <strong className="reader-page-count" aria-live="polite">
            {pageLabel}
          </strong>

          <button
            className={`reader-mode-button ${dataSaver ? "is-active" : ""}`}
            type="button"
            onClick={toggleDataSaver}
            aria-pressed={dataSaver}
          >
            Data saver {dataSaver ? "On" : "Off"}
          </button>

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
        </div>

        <div
          className="reader-progress"
          role="progressbar"
          aria-label="Chapter reading progress"
          aria-valuemin={1}
          aria-valuemax={Math.max(1, totalPages)}
          aria-valuenow={Math.min(currentPage, Math.max(1, totalPages))}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <nav className="reader-chapter-nav reader-chapter-nav-top" aria-label="Chapter navigation">
        {previousChapter ? (
          <Link href={chapterHref(previousChapter.id)}>
            ← Previous
            <small>
              {previousChapter.chapter
                ? `Ch. ${previousChapter.chapter}`
                : previousChapter.title}
            </small>
          </Link>
        ) : (
          <span className="reader-nav-disabled">← Previous</span>
        )}

        {nextChapter ? (
          <Link href={chapterHref(nextChapter.id)}>
            Next →
            <small>
              {nextChapter.chapter
                ? `Ch. ${nextChapter.chapter}`
                : nextChapter.title}
            </small>
          </Link>
        ) : (
          <span className="reader-nav-disabled">Next →</span>
        )}
      </nav>

      <div className="reader-pages" ref={pagesRef}>
        {data.pages.map((page) => (
          <ReaderImage
            key={page.index}
            chapterId={chapterId}
            index={page.index}
            dataSaver={dataSaver}
          />
        ))}
      </div>

      <nav className="reader-chapter-nav" aria-label="Chapter navigation">
        {previousChapter ? (
          <Link href={chapterHref(previousChapter.id)}>
            ← Previous chapter
            <small>
              {previousChapter.chapter
                ? `Chapter ${previousChapter.chapter}`
                : previousChapter.title}
            </small>
          </Link>
        ) : (
          <span className="reader-nav-disabled">← Previous chapter</span>
        )}

        {nextChapter ? (
          <Link href={chapterHref(nextChapter.id)}>
            Next chapter →
            <small>
              {nextChapter.chapter
                ? `Chapter ${nextChapter.chapter}`
                : nextChapter.title}
            </small>
          </Link>
        ) : (
          <span className="reader-nav-disabled">Next chapter →</span>
        )}
      </nav>

      <footer className="reader-footer">
        <span>{pageLabel}</span>
        <a href={data.attribution.sourceUrl} target="_blank" rel="noreferrer">
          MangaDex source / chapter attribution
        </a>
      </footer>
    </div>
  );
}
