"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState
} from "react";
import { LibrarySkeleton } from "./Skeletons";
import ConfirmDialog from "./ConfirmDialog";
import { notify } from "../lib/toast";

type Bookmark = {
  source: string;
  mangaId: string;
  title: string;
  coverUrl?: string | null;
  createdAt: string;
};

type Follow = {
  source: string;
  mangaId: string;
  title: string;
  coverUrl?: string | null;
  notificationsEnabled: boolean;
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
  following?: Follow[];
  history: Progress[];
  continueReading: Progress | null;
};

type HistoryCleanupDays = 30 | 90;

type PendingHistoryAction =
  | { type: "item"; item: Progress }
  | { type: "older"; days: HistoryCleanupDays }
  | { type: "all" }
  | null;

export default function LibraryClient() {
  const [data, setData] = useState<ReaderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<
    "all" | "bookmarks" | "following" | "history"
  >("all");
  const [sort, setSort] = useState<"recent" | "title" | "progress">("recent");
  const [pendingHistoryAction, setPendingHistoryAction] =
    useState<PendingHistoryAction>(null);
  const [historyCleanupDays, setHistoryCleanupDays] =
    useState<HistoryCleanupDays>(90);
  const [historyBusy, setHistoryBusy] = useState(false);

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

  const normalizedQuery = query.trim().toLowerCase();

  const filteredBookmarks = useMemo(() => {
    if (!data) return [];

    return [...data.bookmarks]
      .filter((item) =>
        normalizedQuery
          ? item.title.toLowerCase().includes(normalizedQuery)
          : true
      )
      .sort((left, right) => {
        if (sort === "title") {
          return left.title.localeCompare(right.title);
        }

        return (
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
        );
      });
  }, [data, normalizedQuery, sort]);

  const filteredFollowing = useMemo(() => {
    if (!data) return [];

    return [...(data.following ?? [])]
      .filter((item) =>
        normalizedQuery
          ? item.title.toLowerCase().includes(normalizedQuery)
          : true
      )
      .sort((left, right) => {
        if (sort === "title") {
          return left.title.localeCompare(right.title);
        }

        return (
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
        );
      });
  }, [data, normalizedQuery, sort]);

  const filteredHistory = useMemo(() => {
    if (!data) return [];

    return [...data.history]
      .filter((item) =>
        normalizedQuery
          ? item.mangaTitle.toLowerCase().includes(normalizedQuery)
          : true
      )
      .sort((left, right) => {
        if (sort === "title") {
          return left.mangaTitle.localeCompare(right.mangaTitle);
        }

        if (sort === "progress") {
          const leftProgress =
            left.page / Math.max(1, left.totalPages);
          const rightProgress =
            right.page / Math.max(1, right.totalPages);
          return rightProgress - leftProgress;
        }

        return (
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime()
        );
      });
  }, [data, normalizedQuery, sort]);

  async function applyHistoryAction(
    action: Exclude<PendingHistoryAction, null>
  ) {
    if (historyBusy) return;
    setHistoryBusy(true);

    try {
      const url =
        action.type === "item"
          ? `/api/state/progress?source=${encodeURIComponent(
              action.item.source
            )}&mangaId=${encodeURIComponent(action.item.mangaId)}`
          : action.type === "older"
            ? `/api/state/progress?olderThanDays=${action.days}`
            : "/api/state/progress?all=1";

      const response = await fetch(url, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Reading history update failed.");
      }

      const payload = (await response.json()) as {
        removed?: number;
        before?: string;
      };
      const before =
        action.type === "older" && payload.before
          ? Date.parse(payload.before)
          : null;

      setData((current) => {
        if (!current) return current;

        const history =
          action.type === "item"
            ? current.history.filter(
                (entry) =>
                  !(
                    entry.source === action.item.source &&
                    entry.mangaId === action.item.mangaId
                  )
              )
            : action.type === "older" && before !== null
              ? current.history.filter(
                  (entry) =>
                    new Date(entry.updatedAt).getTime() >= before
                )
              : [];

        return {
          ...current,
          history,
          continueReading: history[0] ?? null
        };
      });

      notify({
        tone: "success",
        title:
          action.type === "item"
            ? "Removed from history"
            : action.type === "older"
              ? "Old history cleared"
              : "Reading history cleared",
        message:
          action.type === "item"
            ? `${action.item.mangaTitle} was removed from recent reading.`
            : action.type === "older"
              ? `${payload.removed ?? 0} entr${payload.removed === 1 ? "y" : "ies"} older than ${action.days} days removed. Bookmarks were not changed.`
              : "Your saved bookmarks were not changed."
      });
    } catch {
      notify({
        tone: "error",
        title: "History update failed",
        message: "Try again shortly."
      });
    } finally {
      setHistoryBusy(false);
      setPendingHistoryAction(null);
    }
  }

  async function setFollowNotifications(
    item: Follow,
    notificationsEnabled: boolean
  ) {
    try {
      const response = await fetch("/api/state/follow", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: item.source,
          mangaId: item.mangaId,
          notificationsEnabled
        })
      });

      if (!response.ok) {
        throw new Error("Notification preference update failed.");
      }

      setData((current) =>
        current
          ? {
              ...current,
              following: (current.following ?? []).map((follow) =>
                follow.source === item.source &&
                follow.mangaId === item.mangaId
                  ? { ...follow, notificationsEnabled }
                  : follow
              )
            }
          : current
      );

      notify({
        tone: "success",
        title: notificationsEnabled
          ? "Manga notifications on"
          : "Manga notifications off",
        message: `${item.title} chapter alerts are ${notificationsEnabled ? "enabled" : "muted"}.`
      });
    } catch {
      notify({
        tone: "error",
        title: "Notification setting failed",
        message: "Try again shortly."
      });
    }
  }

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

  const empty =
    !data?.continueReading &&
    !data?.bookmarks.length &&
    !(data?.following?.length ?? 0) &&
    !data?.history.length;

  if (empty) {
    return (
      <section id="library" className="library-panel panel compact">
        <p className="eyebrow">Your library</p>
        <h2>Start building your shelf.</h2>
        <p>
          Bookmark or follow a manga, or start reading a chapter and MangaFlux
          will keep your place. Following is account-only and independent from
          bookmarks and reading progress.
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
        <span>
          {data?.bookmarks.length ?? 0} bookmarked · {data?.following?.length ?? 0} following
        </span>
      </div>

      <div className="library-controls">
        <div className="library-view-tabs" aria-label="Library view">
          {(["all", "bookmarks", "following", "history"] as const).map((item) => (
            <button
              type="button"
              key={item}
              className={view === item ? "is-active" : ""}
              aria-pressed={view === item}
              onClick={() => setView(item)}
            >
              {item === "all"
                ? "All"
                : item === "bookmarks"
                  ? "Bookmarks"
                  : item === "following"
                    ? "Following"
                    : "History"}
            </button>
          ))}
        </div>

        <label className="library-search">
          <span className="sr-only">Filter your library</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter library…"
          />
        </label>

        <label className="library-sort">
          <span className="sr-only">Sort library</span>
          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as
                  | "recent"
                  | "title"
                  | "progress"
              )
            }
          >
            <option value="recent">Recently updated</option>
            <option value="title">Title A–Z</option>
            <option value="progress">Reading progress</option>
          </select>
        </label>
      </div>

      {view !== "bookmarks" && view !== "following" && data?.continueReading ? (
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

      {(view === "all" || view === "bookmarks") && filteredBookmarks.length ? (
        <div className="library-block">
          <div className="library-subheading">
            <h3>Bookmarks</h3>
            <span>{filteredBookmarks.length}</span>
          </div>

          <div className="bookmark-strip library-bookmark-grid">
            {filteredBookmarks.map((item) => (
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

      {(view === "all" || view === "following") && filteredFollowing.length ? (
        <div className="library-block">
          <div className="library-subheading">
            <h3>Following</h3>
            <span>{filteredFollowing.length}</span>
          </div>

          <div className="bookmark-strip library-bookmark-grid">
            {filteredFollowing.map((item) => (
              <article
                className="following-card-wrap"
                key={`follow:${item.source}:${item.mangaId}`}
              >
                <Link
                  className="bookmark-card following-card"
                  href={`/manga/${item.mangaId}`}
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
                  <span>Following</span>
                </Link>
                <button
                  type="button"
                  className={`following-alert-toggle ${item.notificationsEnabled ? "is-active" : ""}`}
                  aria-pressed={item.notificationsEnabled}
                  onClick={() =>
                    void setFollowNotifications(
                      item,
                      !item.notificationsEnabled
                    )
                  }
                >
                  {item.notificationsEnabled
                    ? "🔔 Alerts on"
                    : "🔕 Alerts off"}
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {(view === "all" || view === "history") && filteredHistory.length ? (
        <div className="library-block">
          <div className="library-subheading library-history-heading">
            <div>
              <h3>Reading history</h3>
              <span>{filteredHistory.length}</span>
            </div>

            <div className="library-history-actions">
              <label>
                <span className="sr-only">History cleanup age</span>
                <select
                  value={historyCleanupDays}
                  onChange={(event) =>
                    setHistoryCleanupDays(
                      Number(event.target.value) as HistoryCleanupDays
                    )
                  }
                  aria-label="History cleanup age"
                >
                  <option value={30}>Older than 30 days</option>
                  <option value={90}>Older than 90 days</option>
                </select>
              </label>

              <button
                type="button"
                className="library-clear-history"
                onClick={() =>
                  setPendingHistoryAction({
                    type: "older",
                    days: historyCleanupDays
                  })
                }
              >
                Clear {historyCleanupDays}d+
              </button>

              <button
                type="button"
                className="library-clear-history"
                onClick={() =>
                  setPendingHistoryAction({ type: "all" })
                }
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="history-list history-list-v11">
            {filteredHistory.map((item) => (
              <article
                className="history-row"
                key={`${item.source}:${item.mangaId}`}
              >
                <Link
                  href={`/read/${item.chapterId}?resume=${item.page}`}
                >
                  <strong>{item.mangaTitle}</strong>
                  <span>
                    {item.chapterLabel || "Chapter"} · Page {item.page} /{" "}
                    {item.totalPages}
                  </span>
                </Link>

                <button
                  type="button"
                  aria-label={`Remove ${item.mangaTitle} from reading history`}
                  onClick={() =>
                    setPendingHistoryAction({
                      type: "item",
                      item
                    })
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {!filteredBookmarks.length &&
      !filteredFollowing.length &&
      !filteredHistory.length &&
      normalizedQuery ? (
        <div className="library-no-results">
          <strong>No library matches.</strong>
          <span>Try a different title or clear the filter.</span>
        </div>
      ) : null}

      <p className="device-note">
        Signed-out bookmarks and reading progress stay on this browser.
        Following is account-only and syncs across signed-in devices.
      </p>

      <ConfirmDialog
        open={Boolean(pendingHistoryAction)}
        title={
          pendingHistoryAction?.type === "all"
            ? "Clear all reading history?"
            : pendingHistoryAction?.type === "older"
              ? `Clear history older than ${pendingHistoryAction.days} days?`
              : "Remove from reading history?"
        }
        description={
          pendingHistoryAction?.type === "all"
            ? "This clears all reading progress/history from your current MangaFlux identity. Bookmarks are kept."
            : pendingHistoryAction?.type === "older"
              ? `This removes reading progress last updated more than ${pendingHistoryAction.days} days ago. Newer progress and bookmarks are kept.`
              : "This removes the saved reading position for this manga. Your bookmark, if any, stays saved."
        }
        confirmLabel={
          pendingHistoryAction?.type === "all"
            ? "Clear all"
            : pendingHistoryAction?.type === "older"
              ? "Clear old history"
              : "Remove"
        }
        danger
        busy={historyBusy}
        onCancel={() => setPendingHistoryAction(null)}
        onConfirm={() => {
          if (pendingHistoryAction) {
            void applyHistoryAction(pendingHistoryAction);
          }
        }}
      />
    </section>
  );
}
