"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { ReaderSkeleton } from "../../Skeletons";
import CommunityThread from "../../CommunityThread";

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

type ChapterPage = {
  items: Chapter[];
  total: number;
  limit: number;
  offset: number;
};

type MangaMeta = {
  id: string;
  title: string;
  coverUrl?: string;
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
  const resumePageRef = useRef<number | null>(null);
  const lastSavedRef = useRef("");

  const [data, setData] = useState<ReaderResponse | null>(null);
  const [mangaMeta, setMangaMeta] = useState<MangaMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dataSaver, setDataSaver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previousChapter, setPreviousChapter] = useState<Chapter>();
  const [nextChapter, setNextChapter] = useState<Chapter>();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("q")?.slice(0, 120) ?? "");
    setDataSaver(
      window.localStorage.getItem("mangaflux:data-saver") === "true"
    );

    const resume = Number(params.get("resume") ?? "0");
    if (Number.isInteger(resume) && resume > 0 && resume <= 500) {
      resumePageRef.current = resume;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");
      setData(null);
      setMangaMeta(null);
      setPreviousChapter(undefined);
      setNextChapter(undefined);
      setCurrentPage(1);
      setControlsVisible(true);
      setSaveState("idle");
      lastSavedRef.current = "";

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

    async function loadMangaContext() {
      const mangaId = data!.chapter.mangaId;

      try {
        const detailsResponse = await fetch(
          `/api/manga/${encodeURIComponent(mangaId)}`,
          { cache: "no-store" }
        );

        if (detailsResponse.ok) {
          const payload = (await detailsResponse.json()) as {
            item: MangaMeta;
          };

          if (!cancelled) setMangaMeta(payload.item);
        }
      } catch {
        // Reader stays usable without the supplemental title context.
      }

      try {
        const collected: Chapter[] = [];
        let offset = 0;
        let total = Number.POSITIVE_INFINITY;
        let foundIndex = -1;
        let pagesScanned = 0;

        while (
          !cancelled &&
          offset < total &&
          offset <= 10_000 &&
          pagesScanned < 20
        ) {
          const response = await fetch(
            `/api/manga/${encodeURIComponent(
              mangaId
            )}/chapters?language=en&limit=100&offset=${offset}&order=desc`,
            { cache: "no-store" }
          );

          if (!response.ok) break;

          const payload = (await response.json()) as ChapterPage;
          collected.push(...payload.items);
          total = payload.total;
          pagesScanned += 1;

          foundIndex = collected.findIndex(
            (chapter) => chapter.id === chapterId
          );

          if (foundIndex >= 0) {
            let previous = findDistinctNeighbor(
              collected,
              foundIndex,
              1
            );
            const next = findDistinctNeighbor(
              collected,
              foundIndex,
              -1
            );

            const nextOffset = offset + payload.limit;

            if (
              !previous &&
              nextOffset < total &&
              nextOffset <= 10_000 &&
              pagesScanned < 20
            ) {
              const nextPageResponse = await fetch(
                `/api/manga/${encodeURIComponent(
                  mangaId
                )}/chapters?language=en&limit=100&offset=${nextOffset}&order=desc`,
                { cache: "no-store" }
              );

              if (nextPageResponse.ok) {
                const nextPage = (await nextPageResponse.json()) as ChapterPage;
                collected.push(...nextPage.items);
                previous = findDistinctNeighbor(
                  collected,
                  foundIndex,
                  1
                );
              }
            }

            if (!cancelled) {
              setPreviousChapter(previous);
              setNextChapter(next);
            }

            break;
          }

          if (!payload.items.length || payload.limit <= 0) break;
          offset += payload.limit;
        }
      } catch {
        // Chapter navigation is supplemental; the reader still works.
      }
    }

    void loadMangaContext();

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

          visibility.set(
            page,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }

        let bestPage = 0;
        let bestRatio = 0;

        for (const [page, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestPage = page;
            bestRatio = ratio;
          }
        }

        if (bestPage > 0) setCurrentPage(bestPage);
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

  useEffect(() => {
    const requestedPage = resumePageRef.current;
    const container = pagesRef.current;

    if (
      !requestedPage ||
      !container ||
      !data?.pages.length ||
      requestedPage > data.pages.length
    ) {
      return;
    }

    setCurrentPage(requestedPage);
    resumePageRef.current = null;

    const timer = window.setTimeout(() => {
      container
        .querySelector<HTMLElement>(
          `[data-page-index="${requestedPage}"]`
        )
        ?.scrollIntoView({
          block: "start",
          behavior: "auto"
        });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [chapterId, data?.pages.length]);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 650);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!controlsVisible || loading) return;

    const timer = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [controlsVisible, loading, chapterId]);

  const totalPages = data?.pages.length ?? 0;

  useEffect(() => {
    if (
      !data?.chapter.mangaId ||
      !mangaMeta ||
      !totalPages ||
      currentPage < 1
    ) {
      return;
    }

    const chapterLabel = data.chapter.chapter
      ? `Chapter ${data.chapter.chapter}`
      : data.chapter.title;
    const saveKey =
      `${chapterId}:${currentPage}:${totalPages}`;

    if (lastSavedRef.current === saveKey) return;

    setSaveState("saving");

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/state/progress", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            source: "mangadex",
            mangaId: data.chapter.mangaId,
            mangaTitle: mangaMeta.title,
            coverUrl: mangaMeta.coverUrl,
            chapterId,
            chapterLabel,
            page: currentPage,
            totalPages
          })
        });

        if (!response.ok) {
          throw new Error("Progress save failed");
        }

        lastSavedRef.current = saveKey;
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    chapterId,
    currentPage,
    data,
    mangaMeta,
    totalPages
  ]);

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
      ? `/search?q=${encodeURIComponent(searchQuery)}`
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

  function toggleControls(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("a, button, input, textarea, label")) return;

    setControlsVisible((visible) => !visible);
  }

  if (loading) {
    return <ReaderSkeleton backHref={chaptersHref} />;
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
    <main
      id="reader-content"
      tabIndex={-1}
      className={`reader reader-immersive ${
        controlsVisible ? "controls-visible" : "controls-hidden"
      }`}
      onClick={toggleControls}
    >
      <div
        className="reader-progress reader-progress-persistent"
        role="progressbar"
        aria-label="Chapter reading progress"
        aria-valuemin={1}
        aria-valuemax={Math.max(1, totalPages)}
        aria-valuenow={Math.min(currentPage, Math.max(1, totalPages))}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="reader-page-hud" aria-live="polite">
        {pageLabel}
      </div>

      <header
        className="reader-chrome reader-chrome-top"
        aria-hidden={!controlsVisible}
        inert={!controlsVisible ? true : undefined}
      >
        <div className="reader-chrome-main">
          <Link className="reader-chrome-back" href={chaptersHref}>
            ← Chapters
          </Link>

          {mangaMeta?.coverUrl ? (
            <div className="reader-chrome-cover" aria-hidden="true">
              <img src={mangaMeta.coverUrl} alt="" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="reader-chrome-cover reader-chrome-cover-empty" aria-hidden="true">
              M
            </div>
          )}

          <div className="reader-chrome-title">
            <strong>
              {data.chapter.chapter
                ? `Chapter ${data.chapter.chapter}`
                : data.chapter.title}
            </strong>
            <span>
              {mangaMeta?.title ?? "MangaFlux Reader"}
            </span>
          </div>

          <button
            className={`reader-mode-button ${dataSaver ? "is-active" : ""}`}
            type="button"
            onClick={toggleDataSaver}
            aria-pressed={dataSaver}
          >
            Data saver {dataSaver ? "On" : "Off"}
          </button>
        </div>

        <div className="reader-chrome-meta">
          <span
            className={`reader-save-state reader-save-${saveState}`}
            aria-live="polite"
          >
            {saveState === "saving"
              ? "Saving progress…"
              : saveState === "saved"
                ? "Progress saved"
                : saveState === "error"
                  ? "Save unavailable"
                  : "Reading progress"}
          </span>

          <a
            href={data.attribution.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {data.attribution.sourceName} ↗
          </a>
        </div>
      </header>

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

      <nav
        className="reader-chrome reader-chrome-bottom"
        aria-label="Chapter navigation"
        aria-hidden={!controlsVisible}
        inert={!controlsVisible ? true : undefined}
      >
        {previousChapter ? (
          <Link href={chapterHref(previousChapter.id)}>
            <span>← Previous</span>
            <small>
              {previousChapter.chapter
                ? `Ch. ${previousChapter.chapter}`
                : previousChapter.title}
            </small>
          </Link>
        ) : (
          <span className="reader-overlay-disabled">
            <span>← Previous</span>
            <small>No older chapter</small>
          </span>
        )}

        <Link
          className="reader-home-button"
          href={chaptersHref}
          aria-label="Back to manga chapters"
          title="Back to chapters"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </Link>

        {nextChapter ? (
          <Link href={chapterHref(nextChapter.id)}>
            <span>Next →</span>
            <small>
              {nextChapter.chapter
                ? `Ch. ${nextChapter.chapter}`
                : nextChapter.title}
            </small>
          </Link>
        ) : (
          <span className="reader-overlay-disabled">
            <span>Next →</span>
            <small>No newer chapter</small>
          </span>
        )}
      </nav>

      {showScrollTop ? (
        <button
          className="reader-scroll-top"
          type="button"
          aria-label="Scroll to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches
                ? "auto"
                : "smooth"
            })
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V5" />
            <path d="m6.5 10.5 5.5-5.5 5.5 5.5" />
          </svg>
        </button>
      ) : null}

      <footer className="reader-footer reader-end-card">
        <span>{pageLabel}</span>
        <a href={data.attribution.sourceUrl} target="_blank" rel="noreferrer">
          MangaDex source / chapter attribution
        </a>

        <nav aria-label="End of chapter navigation">
          {previousChapter ? (
            <Link href={chapterHref(previousChapter.id)}>
              ← Previous chapter
            </Link>
          ) : null}

          <Link
            className="reader-end-home"
            href={chaptersHref}
            aria-label="Back to manga chapters"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
              <path d="M9 21v-6h6v6" />
            </svg>
            Chapters
          </Link>

          {nextChapter ? (
            <Link href={chapterHref(nextChapter.id)}>
              Next chapter →
            </Link>
          ) : null}
        </nav>
      </footer>

      <div className="reader-community-wrap">
        <CommunityThread
          targetType="chapter"
          targetId={chapterId}
          heading="Chapter reactions & comments"
        />
      </div>
    </main>
  );
}
