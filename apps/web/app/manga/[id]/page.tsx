"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import ReaderSettingsSheet from "../../ReaderSettingsSheet";
import {
  getReaderPreferences,
  readerLanguageOptions,
  syncReaderPreferences,
  type ReaderPreferences
} from "../../../lib/readerPreferences";
import { recordRecentlyViewed } from "../../../lib/recentlyViewed";

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
  const router = useRouter();
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
  const [followed, setFollowed] = useState<boolean | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [followNotificationsEnabled, setFollowNotificationsEnabled] =
    useState(true);
  const [followAvailable, setFollowAvailable] = useState(true);
  const [readerSettingsOpen, setReaderSettingsOpen] = useState(false);
  const [surpriseBusy, setSurpriseBusy] = useState(false);
  const [readerPreferences, setReaderPreferences] =
    useState<ReaderPreferences>({
      language: "en",
      dataSaver: false,
      showAlternateReleases: false,
      imageFit: "width",
      pageGap: "none",
      textSize: "standard"
    });

  useEffect(() => {
    const query =
      new URLSearchParams(window.location.search).get("q")?.slice(0, 120) ?? "";
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReaderPreferences(getReaderPreferences(id));

    void syncReaderPreferences(id).then((next) => {
      if (!cancelled) setReaderPreferences(next);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

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

        if (!cancelled) {
          setManga(payload.item);
          recordRecentlyViewed({
            id: payload.item.id,
            source: "mangadex",
            title: payload.item.title,
            coverUrl: payload.item.coverUrl,
            year: payload.item.year,
            tags:
              payload.item.tagDetails?.map((tag) => tag.name).slice(0, 4) ??
              payload.item.tags?.slice(0, 4)
          });
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
        language: readerPreferences.language,
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
  }, [
    id,
    chapterPage,
    chapterOrder,
    chapterFilter,
    readerPreferences.language
  ]);

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

  useEffect(() => {
    if (!manga) return;

    let cancelled = false;

    async function loadFollow() {
      try {
        const response = await fetch(
          `/api/state/follow?source=mangadex&mangaId=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        if (response.status === 401) {
          if (!cancelled) {
            setFollowAvailable(false);
            setFollowed(false);
          }
          return;
        }

        if (!response.ok) return;

        const payload = (await response.json()) as {
          followed: boolean;
          item?: { notificationsEnabled?: boolean } | null;
        };

        if (!cancelled) {
          setFollowAvailable(true);
          setFollowed(payload.followed);
          setFollowNotificationsEnabled(
            payload.item?.notificationsEnabled ?? true
          );
        }
      } catch {
        // Following is account-only and optional to basic reading.
      }
    }

    void loadFollow();

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

  async function toggleFollow() {
    if (!manga || followBusy || !followAvailable) return;

    setFollowBusy(true);

    try {
      const response = followed
        ? await fetch(
            `/api/state/follow?source=mangadex&mangaId=${encodeURIComponent(id)}`,
            { method: "DELETE" }
          )
        : await fetch("/api/state/follow", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              source: "mangadex",
              mangaId: id,
              title: manga.title,
              coverUrl: manga.coverUrl
            })
          });

      if (response.status === 401) {
        setFollowAvailable(false);
        notify({
          tone: "error",
          title: "Sign in to follow",
          message: "Following syncs with your MangaFlux account."
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Follow update failed");
      }

      const nextFollowed = !followed;
      setFollowed(nextFollowed);
      if (nextFollowed) setFollowNotificationsEnabled(true);

      notify({
        tone: "success",
        title: nextFollowed ? "Following manga" : "Unfollowed manga",
        message: nextFollowed
          ? `${manga.title} is now in Following.`
          : `${manga.title} was removed from Following.`
      });
    } catch {
      notify({
        tone: "error",
        title: "Follow update failed",
        message: "Try again shortly."
      });
    } finally {
      setFollowBusy(false);
    }
  }

  async function toggleFollowNotifications() {
    if (!manga || followBusy || !followed) return;

    setFollowBusy(true);
    const nextEnabled = !followNotificationsEnabled;

    try {
      const response = await fetch("/api/state/follow", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "mangadex",
          mangaId: id,
          notificationsEnabled: nextEnabled
        })
      });

      if (!response.ok) {
        throw new Error("Notification preference update failed");
      }

      setFollowNotificationsEnabled(nextEnabled);
      notify({
        tone: "success",
        title: nextEnabled ? "Manga notifications on" : "Manga notifications off",
        message: nextEnabled
          ? `Future chapter alerts for ${manga.title} are enabled.`
          : `Future chapter alerts for ${manga.title} are muted.`
      });
    } catch {
      notify({
        tone: "error",
        title: "Notification setting failed",
        message: "Try again shortly."
      });
    } finally {
      setFollowBusy(false);
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

  const chapterReleaseCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const chapter of chapters) {
      const key = chapter.chapter ?? chapter.id;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }, [chapters]);

  const visibleChapters = useMemo(() => {
    if (readerPreferences.showAlternateReleases) {
      return chapters;
    }

    const preferred = readerPreferences.preferredScanlationGroup;
    const selected = new Map<string, Chapter>();

    for (const chapter of chapters) {
      const key = chapter.chapter ?? chapter.id;
      const current = selected.get(key);

      if (!current) {
        selected.set(key, chapter);
        continue;
      }

      if (
        preferred &&
        chapter.scanlationGroups?.includes(preferred) &&
        !current.scanlationGroups?.includes(preferred)
      ) {
        selected.set(key, chapter);
      }
    }

    return chapters.filter((chapter) => {
      const key = chapter.chapter ?? chapter.id;
      return selected.get(key)?.id === chapter.id;
    });
  }, [
    chapters,
    readerPreferences.showAlternateReleases,
    readerPreferences.preferredScanlationGroup
  ]);

  const chapterLanguageName =
    readerLanguageOptions.find(
      ([value]) => value === readerPreferences.language
    )?.[1] ?? readerPreferences.language.toUpperCase();

  const querySuffix = searchQuery
    ? `?q=${encodeURIComponent(searchQuery)}`
    : "";

  const searchHref = searchQuery
    ? `/search?q=${encodeURIComponent(searchQuery)}`
    : "/";

  async function surpriseMe() {
    if (!manga || surpriseBusy) return;

    setSurpriseBusy(true);

    try {
      const usefulTags =
        manga.tagDetails
          ?.filter(
            (tag) =>
              tag.group === "genre" ||
              tag.group === "theme"
          )
          .slice(0, 2) ?? [];
      const creator =
        manga.creators?.find(
          (item) => item.role === "author"
        ) ?? manga.creators?.[0];

      const requests: string[] = usefulTags.map(
        (tag, index) =>
          `/api/discovery?kind=${
            index === 0 ? "popular" : "top"
          }&limit=18&tag=${encodeURIComponent(tag.id)}`
      );

      if (creator) {
        requests.push(
          `/api/discovery?kind=popular&limit=18&creator=${encodeURIComponent(
            creator.id
          )}`
        );
      }

      if (!requests.length) {
        requests.push("/api/discovery?kind=popular&limit=24");
      }

      const groups = await Promise.all(
        requests.map(async (url) => {
          const response = await fetch(url, {
            cache: "no-store"
          });

          if (!response.ok) return [];

          const payload = (await response.json()) as {
            items?: Array<{ id: string }>;
          };

          return payload.items ?? [];
        })
      );

      const candidates = new Map<string, { id: string }>();

      for (const group of groups) {
        for (const item of group) {
          if (item.id !== id) {
            candidates.set(item.id, item);
          }
        }
      }

      const pool = [...candidates.values()];

      if (!pool.length) {
        throw new Error("No similar manga available.");
      }

      const random = new Uint32Array(1);
      window.crypto.getRandomValues(random);
      const pick = pool[random[0] % pool.length];

      router.push(`/manga/${pick.id}`);
    } catch {
      router.push("/browse?kind=popular");
    } finally {
      setSurpriseBusy(false);
    }
  }

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
      <div className="manga-context-nav" aria-label="Manga navigation">
        <Link href="/dashboard#library">
          ← Library
        </Link>
        <Link href="/browse?kind=popular">
          Discover more
        </Link>
        <button
          type="button"
          disabled={surpriseBusy}
          onClick={() => void surpriseMe()}
        >
          {surpriseBusy ? "Rolling…" : "Surprise me"}
        </button>
      </div>

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

            <button
              className={`follow-button ${followed ? "is-active" : ""}`}
              type="button"
              onClick={() => void toggleFollow()}
              disabled={followBusy || followed === null || !followAvailable}
              aria-pressed={followed === true}
              title={
                followAvailable
                  ? "Following is separate from bookmarks and reading progress."
                  : "Sign in to follow manga."
              }
            >
              {!followAvailable
                ? "Sign in to follow"
                : followBusy
                  ? "Saving…"
                  : followed
                    ? "✓ Following"
                    : "+ Follow"}
            </button>

            {followed ? (
              <button
                className={`follow-notification-button ${followNotificationsEnabled ? "is-active" : ""}`}
                type="button"
                onClick={() => void toggleFollowNotifications()}
                disabled={followBusy}
                aria-pressed={followNotificationsEnabled}
                title="Choose whether this followed manga can create future chapter notifications."
              >
                {followNotificationsEnabled
                  ? "🔔 Alerts on"
                  : "🔕 Alerts off"}
              </button>
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
        </div>
      </section>

      <section className="panel chapters-panel">
        <div className="chapter-panel-heading">
          <div>
            <p className="eyebrow">{chapterLanguageName} chapters</p>
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

          <div className="chapter-toolbar-actions">
            <button
              className="reader-settings-trigger"
              type="button"
              onClick={() => setReaderSettingsOpen(true)}
            >
              Reader settings
            </button>

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
            {visibleChapters.map((chapter) => (
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
                  <span>
                    {chapter.scanlationGroups?.length
                      ? chapter.scanlationGroups.join(", ")
                      : "Unknown group"}
                  </span>
                  {!readerPreferences.showAlternateReleases &&
                  (chapterReleaseCounts.get(chapter.chapter ?? chapter.id) ?? 0) > 1 ? (
                    <small>
                      +{(chapterReleaseCounts.get(chapter.chapter ?? chapter.id) ?? 1) - 1} alternate
                    </small>
                  ) : null}
                </div>
              </Link>
            ))}

            {!chapterMessage && chapters.length === 0 ? (
              <p className="message">
                No matching {chapterLanguageName} chapters were returned.
              </p>
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

      <ReaderSettingsSheet
        mangaId={id}
        scanlationGroups={chapters.flatMap(
          (chapter) => chapter.scanlationGroups ?? []
        )}
        open={readerSettingsOpen}
        onClose={() => setReaderSettingsOpen(false)}
        onChange={(next) => {
          setReaderPreferences(next);
          setChapterPage(1);
        }}
      />

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
