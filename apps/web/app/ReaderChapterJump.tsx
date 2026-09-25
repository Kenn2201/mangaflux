"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type Chapter = {
  id: string;
  title: string;
  chapter?: string;
};

type ChapterPage = {
  items?: Chapter[];
  total?: number;
  limit?: number;
  offset?: number;
  message?: string;
};

const PAGE_SIZE = 100;
const MAX_INITIAL_PAGES = 20;

function chapterKey(chapter: Chapter) {
  return chapter.chapter ?? chapter.id;
}

function chapterNumber(chapter: Chapter) {
  const value = Number(chapter.chapter);
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

function collapseChapters(
  items: Chapter[],
  currentChapterId: string,
  currentChapter?: string
) {
  const byChapter = new Map<string, Chapter>();

  for (const item of items) {
    const key = chapterKey(item);
    const existing = byChapter.get(key);
    const itemIsCurrent =
      item.id === currentChapterId ||
      (currentChapter !== undefined && item.chapter === currentChapter);
    const existingIsCurrent =
      existing?.id === currentChapterId ||
      (
        currentChapter !== undefined &&
        existing?.chapter === currentChapter
      );

    if (!existing || (itemIsCurrent && !existingIsCurrent)) {
      byChapter.set(key, item);
    }
  }

  return [...byChapter.values()].sort((left, right) => {
    const numberDifference =
      chapterNumber(right) - chapterNumber(left);

    if (Number.isFinite(numberDifference) && numberDifference !== 0) {
      return numberDifference;
    }

    return chapterKey(right).localeCompare(chapterKey(left), undefined, {
      numeric: true
    });
  });
}

export default function ReaderChapterJump({
  mangaId,
  currentChapterId,
  currentChapter,
  querySuffix,
  language = "en",
  languageLabel = "English"
}: {
  mangaId: string;
  currentChapterId: string;
  currentChapter?: string;
  querySuffix: string;
  language?: string;
  languageLabel?: string;
}) {
  const router = useRouter();
  const sheetRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");

  async function fetchPage(offset: number) {
    const response = await fetch(
      `/api/manga/${encodeURIComponent(
        mangaId
      )}/chapters?language=${encodeURIComponent(
        language
      )}&limit=${PAGE_SIZE}&offset=${offset}&order=desc`,
      { cache: "no-store" }
    );

    const payload = (await response.json().catch(() => null)) as
      | ChapterPage
      | null;

    if (!response.ok) {
      throw new Error(payload?.message ?? "Chapter list failed.");
    }

    return {
      items: payload?.items ?? [],
      total: payload?.total ?? 0,
      limit: payload?.limit ?? PAGE_SIZE,
      offset: payload?.offset ?? offset
    };
  }

  async function loadInitial() {
    setBusy(true);
    setMessage("");
    setChapters([]);
    setNextOffset(0);
    setTotal(0);

    try {
      const collected: Chapter[] = [];
      let offset = 0;
      let knownTotal = Number.POSITIVE_INFINITY;
      let pagesLoaded = 0;
      let pagesAfterCurrent = 0;
      let foundCurrent = false;

      while (
        offset < knownTotal &&
        pagesLoaded < MAX_INITIAL_PAGES
      ) {
        const page = await fetchPage(offset);
        collected.push(...page.items);
        knownTotal = page.total;
        pagesLoaded += 1;

        const pageHasCurrent = page.items.some(
          (item) =>
            item.id === currentChapterId ||
            (
              currentChapter !== undefined &&
              item.chapter === currentChapter
            )
        );

        if (pageHasCurrent) foundCurrent = true;
        if (foundCurrent) pagesAfterCurrent += 1;

        offset = page.offset + page.limit;

        if (
          !page.items.length ||
          page.limit <= 0 ||
          (foundCurrent && pagesAfterCurrent >= 2)
        ) {
          break;
        }
      }

      if (
        !foundCurrent &&
        currentChapter &&
        pagesLoaded >= MAX_INITIAL_PAGES
      ) {
        const response = await fetch(
          `/api/manga/${encodeURIComponent(
            mangaId
          )}/chapters?language=${encodeURIComponent(
            language
          )}&limit=100&offset=0&order=desc&chapter=${encodeURIComponent(
            currentChapter
          )}`,
          { cache: "no-store" }
        );

        if (response.ok) {
          const payload = (await response.json()) as ChapterPage;
          collected.push(...(payload.items ?? []));
        }
      }

      setChapters(
        collapseChapters(
          collected,
          currentChapterId,
          currentChapter
        )
      );
      setNextOffset(offset);
      setTotal(
        Number.isFinite(knownTotal)
          ? knownTotal
          : collected.length
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Chapter list failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function loadMore() {
    if (
      busy ||
      loadingMore ||
      nextOffset >= total
    ) {
      return;
    }

    setLoadingMore(true);

    try {
      const page = await fetchPage(nextOffset);

      setChapters((current) =>
        collapseChapters(
          [...current, ...page.items],
          currentChapterId,
          currentChapter
        )
      );
      setNextOffset(page.offset + page.limit);
      setTotal(page.total);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load more chapters."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add("reader-jump-open");
    window.setTimeout(() => closeRef.current?.focus(), 0);
    void loadInitial();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

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

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("reader-jump-open");
      previous?.focus?.();
    };
  }, [
    open,
    mangaId,
    currentChapterId,
    currentChapter,
    language
  ]);

  useEffect(() => {
    if (!open || busy || !chapters.length) return;

    const timer = window.setTimeout(() => {
      listRef.current
        ?.querySelector<HTMLElement>('[data-current="true"]')
        ?.scrollIntoView({
          block: "center",
          behavior: "auto"
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, busy, chapters.length]);

  const layer =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="reader-jump-layer">
            <button
              type="button"
              className="reader-jump-backdrop"
              aria-label="Close chapter jump"
              onClick={() => setOpen(false)}
            />

            <section
              ref={sheetRef}
              className="reader-jump-sheet reader-jump-list-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reader-jump-title"
            >
              <div className="reader-jump-heading">
                <div>
                  <p className="eyebrow">Reader navigation</p>
                  <h2 id="reader-jump-title">Jump to chapter</h2>
                  <p>
                    {currentChapter
                      ? `You are reading chapter ${currentChapter}. Scroll to choose another ${languageLabel} chapter.`
                      : `Scroll to choose a ${languageLabel} chapter.`}
                  </p>
                </div>

                <button
                  ref={closeRef}
                  type="button"
                  className="reader-jump-close"
                  aria-label="Close chapter list"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>

              {busy ? (
                <div
                  className="reader-jump-loading"
                  aria-live="polite"
                >
                  Loading chapters…
                </div>
              ) : (
                <div
                  ref={listRef}
                  className="reader-jump-list"
                  role="list"
                  aria-label="Available chapters"
                  onScroll={(event) => {
                    const target = event.currentTarget;

                    if (
                      target.scrollHeight -
                        target.scrollTop -
                        target.clientHeight <
                      180
                    ) {
                      void loadMore();
                    }
                  }}
                >
                  {chapters.map((item) => {
                    const isCurrent =
                      item.id === currentChapterId ||
                      (
                        currentChapter !== undefined &&
                        item.chapter === currentChapter
                      );

                    return (
                      <button
                        type="button"
                        role="listitem"
                        className={isCurrent ? "is-current" : ""}
                        data-current={isCurrent ? "true" : undefined}
                        aria-current={isCurrent ? "page" : undefined}
                        key={chapterKey(item)}
                        onClick={() => {
                          if (isCurrent) {
                            setOpen(false);
                            return;
                          }

                          setOpen(false);
                          router.push(
                            `/read/${item.id}${querySuffix}`
                          );
                        }}
                      >
                        <span>
                          {item.chapter
                            ? `Chapter ${item.chapter}`
                            : item.title}
                        </span>
                        {isCurrent ? (
                          <strong>Reading now</strong>
                        ) : (
                          <small>{item.title}</small>
                        )}
                      </button>
                    );
                  })}

                  {loadingMore ? (
                    <div className="reader-jump-loading">
                      Loading older chapters…
                    </div>
                  ) : null}

                  {!loadingMore &&
                  nextOffset >= total &&
                  chapters.length ? (
                    <div className="reader-jump-end">
                      End of {languageLabel} chapter list
                    </div>
                  ) : null}
                </div>
              )}

              {message ? (
                <span
                  className="reader-jump-message"
                  role="status"
                >
                  {message}
                </span>
              ) : null}
            </section>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        className="reader-jump-trigger"
        type="button"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
      >
        Jump chapter
      </button>
      {layer}
    </>
  );
}
