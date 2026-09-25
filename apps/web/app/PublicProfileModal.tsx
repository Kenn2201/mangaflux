"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";

type PublicCommentActivity = {
  id: string;
  targetType: "manga" | "chapter";
  targetId: string;
  body: string;
  createdAt: string;
};

type PublicProfile = {
  user: {
    id: string;
    displayName?: string | null;
    avatarDataUrl?: string | null;
    bio?: string | null;
    createdAt?: string | null;
  };
  activityVisible: boolean;
  stats: {
    comments: number;
    reactions: number;
  };
  recentComments: PublicCommentActivity[];
};

type PublicActivityPayload = {
  activityVisible: boolean;
  items: PublicCommentActivity[];
  total: number;
  limit: number;
  offset: number;
};

const ACTIVITY_LIMIT = 8;

function formatJoined(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "MangaFlux member";

  return `Joined ${new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric"
  }).format(date)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function ActivityList({
  items,
  onNavigate
}: {
  items: PublicCommentActivity[];
  onNavigate: () => void;
}) {
  return (
    <div className="public-profile-comment-list">
      {items.map((comment) => (
        <Link
          key={comment.id}
          href={
            comment.targetType === "manga"
              ? `/manga/${comment.targetId}`
              : `/read/${comment.targetId}`
          }
          onClick={onNavigate}
        >
          <div>
            <strong>
              {comment.targetType === "manga"
                ? "Manga discussion"
                : "Chapter discussion"}
            </strong>
            <span>{formatDate(comment.createdAt)}</span>
          </div>
          <p>{comment.body}</p>
        </Link>
      ))}
    </div>
  );
}

export default function PublicProfileModal({
  userId,
  onClose
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activityMode, setActivityMode] = useState(false);
  const [activityData, setActivityData] =
    useState<PublicActivityPayload | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityMessage, setActivityMessage] = useState("");

  async function loadActivity(nextOffset: number) {
    if (!userId || activityLoading) return;

    setActivityLoading(true);
    setActivityMessage("");

    try {
      const response = await fetch(
        `/api/community/users/${encodeURIComponent(
          userId
        )}/activity?limit=${ACTIVITY_LIMIT}&offset=${nextOffset}`,
        { cache: "no-store" }
      );

      const payload = (await response.json().catch(() => null)) as
        | (PublicActivityPayload & { message?: string })
        | null;

      if (!response.ok || !payload) {
        throw new Error(
          payload?.message ?? "Activity is temporarily unavailable."
        );
      }

      if (!payload.activityVisible) {
        setData((current) =>
          current
            ? {
                ...current,
                activityVisible: false,
                stats: { comments: 0, reactions: 0 },
                recentComments: []
              }
            : current
        );
        setActivityMode(false);
        setActivityData(null);
        return;
      }

      setActivityData(payload);
      setActivityMode(true);
    } catch (error) {
      setActivityMessage(
        error instanceof Error
          ? error.message
          : "Activity is temporarily unavailable."
      );
    } finally {
      setActivityLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) {
      setData(null);
      setMessage("");
      setActivityMode(false);
      setActivityData(null);
      setActivityMessage("");
      return;
    }

    const selectedUserId = userId;
    const previous = document.activeElement as HTMLElement | null;
    const controller = new AbortController();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const body = document.body;
    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow
    };

    setLoading(true);
    setMessage("");
    setActivityMode(false);
    setActivityData(null);
    setActivityMessage("");
    body.classList.add("profile-modal-open");
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    async function load() {
      try {
        const response = await fetch(
          `/api/community/users/${encodeURIComponent(selectedUserId)}/profile`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        const payload = (await response.json().catch(() => null)) as
          | (PublicProfile & { message?: string })
          | null;

        if (!response.ok || !payload) {
          throw new Error(
            payload?.message ?? "Community profile is unavailable."
          );
        }

        setData(payload);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessage(
            error instanceof Error
              ? error.message
              : "Community profile is unavailable."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => closeRef.current?.focus(), 0);
    void load();

    return () => {
      controller.abort();
      document.removeEventListener("keydown", onKeyDown);

      body.classList.remove("profile-modal-open");
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;

      window.scrollTo(scrollX, scrollY);

      if (previous?.isConnected) {
        previous.focus({ preventScroll: true });
      }

      window.requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    };
  }, [userId]);

  if (!userId || typeof document === "undefined") return null;

  const name = data?.user.displayName || "MangaFlux Reader";
  const initial = name.trim().charAt(0).toUpperCase() || "R";
  const activityPage = activityData
    ? Math.floor(activityData.offset / activityData.limit) + 1
    : 1;
  const activityTotalPages = activityData
    ? Math.max(1, Math.ceil(activityData.total / activityData.limit))
    : 1;

  return createPortal(
    <div className="public-profile-layer">
      <button
        type="button"
        className="public-profile-backdrop"
        aria-label="Close community profile"
        onClick={onClose}
      />

      <section
        className="public-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-profile-title"
      >
        <div className="public-profile-top">
          <p className="eyebrow">Community profile</p>
          <button
            ref={closeRef}
            type="button"
            className="public-profile-close"
            aria-label="Close community profile"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="public-profile-loading" aria-busy="true">
            <span className="skeleton public-profile-avatar" />
            <span className="skeleton skeleton-line" style={{ width: "52%" }} />
            <span className="skeleton skeleton-line" style={{ width: "34%" }} />
          </div>
        ) : message ? (
          <div className="community-empty">
            <strong>Profile unavailable.</strong>
            <span>{message}</span>
          </div>
        ) : data ? (
          <>
            <div className="public-profile-identity">
              <div className="public-profile-avatar">
                {data.user.avatarDataUrl ? (
                  <img src={data.user.avatarDataUrl} alt="" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>

              <div>
                <h2 id="public-profile-title">{name}</h2>
                {data.user.createdAt ? (
                  <span>{formatJoined(data.user.createdAt)}</span>
                ) : (
                  <span>Joined date hidden</span>
                )}
              </div>
            </div>

            {data.user.bio ? (
              <p className="public-profile-bio">{data.user.bio}</p>
            ) : null}

            {data.activityVisible ? (
              <>
                <div className="public-profile-stats">
                  <div>
                    <strong>{data.stats.comments}</strong>
                    <span>Comments</span>
                  </div>
                  <div>
                    <strong>{data.stats.reactions}</strong>
                    <span>Reactions</span>
                  </div>
                </div>

                <div className="public-profile-activity">
                  <div className="section-heading public-activity-heading">
                    <div>
                      <p className="eyebrow">Activity</p>
                      <h3>
                        {activityMode ? "Comment history" : "Recent comments"}
                      </h3>
                    </div>

                    {data.stats.comments > data.recentComments.length ? (
                      <button
                        type="button"
                        className="public-activity-mode-button"
                        disabled={activityLoading}
                        onClick={() => {
                          if (activityMode) {
                            setActivityMode(false);
                            setActivityMessage("");
                          } else {
                            void loadActivity(0);
                          }
                        }}
                      >
                        {activityMode ? "Recent" : "View all"}
                      </button>
                    ) : null}
                  </div>

                  {activityMessage ? (
                    <p className="community-message">{activityMessage}</p>
                  ) : null}

                  {activityLoading ? (
                    <div className="public-activity-loading" aria-busy="true">
                      Loading activity…
                    </div>
                  ) : activityMode ? (
                    activityData?.items.length ? (
                      <>
                        <ActivityList
                          items={activityData.items}
                          onNavigate={onClose}
                        />

                        {activityData.total > activityData.limit ? (
                          <nav
                            className="public-activity-pagination"
                            aria-label="Profile activity pages"
                          >
                            <button
                              type="button"
                              disabled={
                                activityData.offset <= 0 ||
                                activityLoading
                              }
                              onClick={() =>
                                void loadActivity(
                                  Math.max(
                                    0,
                                    activityData.offset -
                                      activityData.limit
                                  )
                                )
                              }
                            >
                              ← Newer
                            </button>

                            <span>
                              Page {activityPage} / {activityTotalPages}
                            </span>

                            <button
                              type="button"
                              disabled={
                                activityData.offset +
                                  activityData.limit >=
                                  activityData.total ||
                                activityLoading
                              }
                              onClick={() =>
                                void loadActivity(
                                  activityData.offset +
                                    activityData.limit
                                )
                              }
                            >
                              Older →
                            </button>
                          </nav>
                        ) : null}
                      </>
                    ) : (
                      <div className="community-empty">
                        <strong>No comments yet.</strong>
                        <span>This reader has not posted publicly yet.</span>
                      </div>
                    )
                  ) : data.recentComments.length ? (
                    <ActivityList
                      items={data.recentComments}
                      onNavigate={onClose}
                    />
                  ) : (
                    <div className="community-empty">
                      <strong>No comments yet.</strong>
                      <span>This reader has not posted publicly yet.</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="community-empty public-profile-private">
                <strong>Activity is private.</strong>
                <span>
                  This reader chose not to show public activity totals or
                  recent comments.
                </span>
              </div>
            )}
          </>
        ) : null}
      </section>
    </div>,
    document.body
  );
}
