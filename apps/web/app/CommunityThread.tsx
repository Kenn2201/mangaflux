"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { notify } from "../lib/toast";
import ConfirmDialog from "./ConfirmDialog";
import PublicProfileModal from "./PublicProfileModal";

type CommunityComment = {
  id: string;
  userId: string;
  displayName?: string | null;
  avatarDataUrl?: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type CommentOrder = "desc" | "asc";

type CommunityPayload = {
  items: CommunityComment[];
  total: number;
  limit: number;
  offset: number;
  order?: CommentOrder;
  reactions: Record<string, number>;
  viewerReaction?: string | null;
  viewerUserId?: string | null;
  authenticated: boolean;
};

const REACTIONS = [
  { key: "like", emoji: "❤️", label: "Like" },
  { key: "funny", emoji: "😂", label: "Funny" },
  { key: "wow", emoji: "😮", label: "Wow" },
  { key: "sad", emoji: "😢", label: "Sad" },
  { key: "fire", emoji: "🔥", label: "Fire" }
] as const;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function avatarInitial(comment: CommunityComment) {
  return (comment.displayName?.trim().charAt(0) || "R").toUpperCase();
}

export default function CommunityThread({
  targetType,
  targetId,
  heading = "Community"
}: {
  targetType: "manga" | "chapter";
  targetId: string;
  heading?: string;
}) {
  const limit = 10;
  const [data, setData] = useState<CommunityPayload | null>(null);
  const [offset, setOffset] = useState(0);
  const [commentOrder, setCommentOrder] = useState<CommentOrder>("desc");
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/community/${targetType}/${encodeURIComponent(
          targetId
        )}?limit=${limit}&offset=${offset}&order=${commentOrder}`,
        { cache: "no-store" }
      );

      const payload = (await response.json().catch(() => null)) as
        | (CommunityPayload & { message?: string })
        | null;

      if (!response.ok || !payload) {
        throw new Error(
          payload?.message ?? "Community is temporarily unavailable."
        );
      }

      setData(payload);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Community is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, [commentOrder, offset, targetId, targetType]);

  useEffect(() => {
    void load();
  }, [load]);

  async function react(reaction: string) {
    if (!data?.authenticated) {
      notify({
        tone: "info",
        title: "Sign in to react",
        message: "MangaFlux reactions are tied to verified accounts."
      });
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      const response = await fetch(
        `/api/community/${targetType}/${encodeURIComponent(
          targetId
        )}/reaction`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "x-mangaflux-client": "web"
          },
          body: JSON.stringify({ reaction })
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | {
            selected?: string | null;
            reactions?: Record<string, number>;
            message?: string;
          }
        | null;

      if (!response.ok || !payload) {
        throw new Error(payload?.message ?? "Reaction failed.");
      }

      setData((current) =>
        current
          ? {
              ...current,
              viewerReaction: payload.selected ?? null,
              reactions: payload.reactions ?? current.reactions
            }
          : current
      );
    } catch (error) {
      notify({
        tone: "error",
        title: "Reaction failed",
        message:
          error instanceof Error ? error.message : "Try again shortly."
      });
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!data?.authenticated) {
      notify({
        tone: "info",
        title: "Sign in to comment",
        message: "Comments are available to verified MangaFlux accounts."
      });
      return;
    }

    const value = body.trim();
    if (!value) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/community/${targetType}/${encodeURIComponent(
          targetId
        )}/comments`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mangaflux-client": "web"
          },
          body: JSON.stringify({ body: value })
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            retryAfterSeconds?: number;
          }
        | null;

      if (!response.ok) {
        if (response.status === 429 && payload?.retryAfterSeconds) {
          const minutes = Math.ceil(payload.retryAfterSeconds / 60);
          throw new Error(
            `You can comment again in about ${minutes} minute${
              minutes === 1 ? "" : "s"
            }.`
          );
        }

        throw new Error(payload?.message ?? "Comment could not be posted.");
      }

      setBody("");

      if (commentOrder !== "desc") {
        setCommentOrder("desc");
        setOffset(0);
      } else if (offset !== 0) {
        setOffset(0);
      } else {
        await load();
      }

      notify({
        tone: "success",
        title: "Comment posted",
        message: "Your newest comment is now at the top of the discussion."
      });
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : "Comment could not be posted.";

      setMessage(text);

      notify({
        tone: "error",
        title: "Comment not posted",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId: string) {
    if (busy) return;
    setBusy(true);

    try {
      const response = await fetch(
        `/api/community/comments/${encodeURIComponent(commentId)}`,
        {
          method: "DELETE",
          headers: {
            "x-mangaflux-client": "web"
          }
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Comment could not be deleted.");
      }

      if ((data?.items.length ?? 0) <= 1 && offset > 0) {
        setOffset((current) => Math.max(0, current - limit));
      } else {
        await load();
      }

      notify({
        tone: "success",
        title: "Comment deleted"
      });
    } catch (error) {
      notify({
        tone: "error",
        title: "Delete failed",
        message:
          error instanceof Error ? error.message : "Try again shortly."
      });
    } finally {
      setBusy(false);
    }
  }

  const page = Math.floor(offset / limit) + 1;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.total ?? 0) / limit)),
    [data?.total]
  );
  const reactionTotal = useMemo(
    () =>
      Object.values(data?.reactions ?? {}).reduce(
        (total, value) => total + value,
        0
      ),
    [data?.reactions]
  );
  const selectedReaction = REACTIONS.find(
    (reaction) => reaction.key === data?.viewerReaction
  );

  return (
    <section className="community-panel">
      <div className="community-heading">
        <div>
          <p className="eyebrow">
            {targetType === "manga" ? "Manga community" : "Chapter community"}
          </p>
          <h2>{heading}</h2>
        </div>

        <span>{data?.total ?? 0} comments</span>
      </div>

      <div className="reaction-row" aria-label="Reactions">
        {REACTIONS.map((reaction) => {
          const count = data?.reactions?.[reaction.key] ?? 0;
          const active = data?.viewerReaction === reaction.key;

          return (
            <button
              type="button"
              key={reaction.key}
              className={active ? "is-active" : ""}
              aria-pressed={active}
              aria-label={`${reaction.label}, ${count} reaction${
                count === 1 ? "" : "s"
              }`}
              disabled={busy}
              onClick={() => void react(reaction.key)}
            >
              <span aria-hidden="true">{reaction.emoji}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>

      <p className="reaction-summary" role="status" aria-live="polite">
        {reactionTotal} reaction{reactionTotal === 1 ? "" : "s"}
        {selectedReaction
          ? ` · You reacted ${selectedReaction.emoji} ${selectedReaction.label}`
          : data?.authenticated
            ? " · Choose one to react"
            : ""}
      </p>

      {data?.authenticated ? (
        <form className="comment-composer" onSubmit={submit}>
          <textarea
            value={body}
            maxLength={1000}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add a comment…"
            aria-label="Comment"
          />
          <div>
            <span>{body.length} / 1000 · one comment every 5 minutes</span>
            <button type="submit" disabled={busy || !body.trim()}>
              {busy ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="community-signin">
          <span>Sign in with a verified MangaFlux account to react or comment.</span>
          <Link href="/account">Sign in</Link>
        </div>
      )}

      {message ? <p className="community-message">{message}</p> : null}

      <div className="comment-toolbar">
        <div>
          <span>Discussion order</span>
          <strong>
            {commentOrder === "desc" ? "Newest first" : "Oldest first"}
          </strong>
        </div>
        <div className="comment-sort" aria-label="Comment sort order">
          <button
            type="button"
            className={commentOrder === "desc" ? "is-active" : ""}
            aria-pressed={commentOrder === "desc"}
            disabled={loading}
            onClick={() => {
              setCommentOrder("desc");
              setOffset(0);
            }}
          >
            Newest
          </button>
          <button
            type="button"
            className={commentOrder === "asc" ? "is-active" : ""}
            aria-pressed={commentOrder === "asc"}
            disabled={loading}
            onClick={() => {
              setCommentOrder("asc");
              setOffset(0);
            }}
          >
            Oldest
          </button>
        </div>
      </div>

      {loading ? (
        <div className="comment-list" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="comment-card comment-skeleton" key={index}>
              <span className="skeleton skeleton-comment-avatar" />
              <div>
                <span className="skeleton skeleton-line" style={{ width: "34%" }} />
                <span className="skeleton skeleton-comment-body" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="comment-list">
          {data?.items.map((comment) => {
            const isViewer = data.viewerUserId === comment.userId;

            return (
              <article
                className={`comment-card ${isViewer ? "is-viewer" : ""}`}
                key={comment.id}
              >
                <button
                  type="button"
                  className="comment-avatar comment-profile-trigger"
                  aria-label={`View ${comment.displayName || "reader"} profile`}
                  onClick={() => setProfileUserId(comment.userId)}
                >
                  {comment.avatarDataUrl ? (
                    <img src={comment.avatarDataUrl} alt="" />
                  ) : (
                    <span>{avatarInitial(comment)}</span>
                  )}
                </button>

                <div className="comment-content">
                  <div className="comment-meta">
                    <div>
                      <button
                        type="button"
                        className="comment-name-button"
                        onClick={() => setProfileUserId(comment.userId)}
                      >
                        {comment.displayName || "MangaFlux Reader"}
                      </button>
                      {isViewer ? (
                        <span className="comment-you-badge">You</span>
                      ) : null}
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>

                    {isViewer ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDeletePendingId(comment.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>

                  <p>{comment.body}</p>
                </div>
              </article>
            );
          })}

          {!data?.items.length ? (
            <div className="community-empty">
              <strong>No comments yet.</strong>
              <span>Be the first MangaFlux reader to start the discussion.</span>
            </div>
          ) : null}
        </div>
      )}

      {data && data.total > limit ? (
        <nav className="comment-pagination" aria-label="Comment pages">
          <button
            type="button"
            disabled={offset <= 0 || loading}
            onClick={() =>
              setOffset((current) => Math.max(0, current - limit))
            }
          >
            {commentOrder === "desc" ? "← Newer" : "← Older"}
          </button>

          <span>Page {page} / {totalPages}</span>

          <button
            type="button"
            disabled={offset + limit >= data.total || loading}
            onClick={() => setOffset((current) => current + limit)}
          >
            {commentOrder === "desc" ? "Older →" : "Newer →"}
          </button>
        </nav>
      ) : null}

      <PublicProfileModal
        userId={profileUserId}
        onClose={() => setProfileUserId(null)}
      />

      <ConfirmDialog
        open={Boolean(deletePendingId)}
        title="Delete this comment?"
        description="This removes the comment from MangaFlux community. This action cannot be undone."
        confirmLabel="Delete comment"
        danger
        busy={busy}
        onCancel={() => setDeletePendingId(null)}
        onConfirm={() => {
          const id = deletePendingId;
          setDeletePendingId(null);
          if (id) void removeComment(id);
        }}
      />
    </section>
  );
}
