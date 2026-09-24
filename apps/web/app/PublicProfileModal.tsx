"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";

type PublicProfile = {
  user: {
    id: string;
    displayName?: string | null;
    avatarDataUrl?: string | null;
    createdAt: string;
  };
  stats: {
    comments: number;
    reactions: number;
  };
  recentComments: Array<{
    id: string;
    targetType: "manga" | "chapter";
    targetId: string;
    body: string;
    createdAt: string;
  }>;
};

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

  useEffect(() => {
    if (!userId) {
      setData(null);
      setMessage("");
      return;
    }

    const previous = document.activeElement as HTMLElement | null;
    const controller = new AbortController();

    setLoading(true);
    setMessage("");
    document.body.classList.add("profile-modal-open");

    async function load() {
      try {
        const response = await fetch(
          `/api/community/users/${encodeURIComponent(userId)}/profile`,
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
      document.body.classList.remove("profile-modal-open");
      previous?.focus?.();
    };
  }, [userId]);

  if (!userId || typeof document === "undefined") return null;

  const name = data?.user.displayName || "MangaFlux Reader";
  const initial = name.trim().charAt(0).toUpperCase() || "R";

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
                <span>{formatJoined(data.user.createdAt)}</span>
              </div>
            </div>

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
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Activity</p>
                  <h3>Recent comments</h3>
                </div>
              </div>

              {data.recentComments.length ? (
                <div className="public-profile-comment-list">
                  {data.recentComments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={
                        comment.targetType === "manga"
                          ? `/manga/${comment.targetId}`
                          : `/read/${comment.targetId}`
                      }
                      onClick={onClose}
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
              ) : (
                <div className="community-empty">
                  <strong>No comments yet.</strong>
                  <span>This reader has not posted publicly yet.</span>
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </div>,
    document.body
  );
}
