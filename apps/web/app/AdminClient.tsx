"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState
} from "react";
import { notify } from "../lib/toast";

type Session = {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    displayName?: string | null;
    role?: "user" | "admin";
  } | null;
};

type AdminUser = {
  id: string;
  email: string;
  displayName?: string | null;
  avatarDataUrl?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
};

type AdminComment = {
  id: string;
  userId: string;
  userEmail: string;
  displayName?: string | null;
  avatarDataUrl?: string | null;
  targetType: string;
  targetId: string;
  body: string;
  createdAt: string;
};

type Diagnostics = {
  process: {
    uptimeSeconds: number;
    nodeVersion: string;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
  sourceCache: {
    hits: number;
    misses: number;
    writes: number;
    evictions: number;
    dedupedRequests: number;
    inFlightRequests: number;
    entries: number;
  };
  traffic: {
    windowMinutes: number;
    requests: number;
    clientErrors: number;
    rateLimited: number;
    serverErrors: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
    routes: Array<{
      route: string;
      method: string;
      requests: number;
      errors: number;
      averageLatencyMs: number;
      maxLatencyMs: number;
    }>;
    recentFailures: Array<{
      at: number;
      route: string;
      method: string;
      statusCode: number;
      durationMs: number;
    }>;
  };
};

type Overview = {
  admin: {
    id: string;
    email: string;
    displayName?: string | null;
  };
  counts: {
    users: number;
    activeSessions: number;
    comments: number;
    reactions: number;
    bookmarks: number;
    readingProgress: number;
  };
  recentUsers: AdminUser[];
  recentComments: AdminComment[];
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function initialFor(
  displayName?: string | null,
  email?: string | null
) {
  return (displayName || email || "M").trim().charAt(0).toUpperCase();
}

export default function AdminClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const sessionResponse = await fetch("/api/auth/session", {
        cache: "no-store"
      });

      const sessionPayload = (await sessionResponse
        .json()
        .catch(() => null)) as Session | null;

      if (!sessionResponse.ok || !sessionPayload) {
        throw new Error("Could not verify your account session.");
      }

      setSession(sessionPayload);

      if (
        !sessionPayload.authenticated ||
        sessionPayload.user?.role !== "admin"
      ) {
        setOverview(null);
        setDiagnostics(null);
        return;
      }

      const [overviewResponse, diagnosticsResponse] = await Promise.all([
        fetch("/api/admin/overview", {
          cache: "no-store"
        }),
        fetch("/api/admin/diagnostics", {
          cache: "no-store"
        })
      ]);

      const payload = (await overviewResponse.json().catch(() => null)) as
        | (Overview & { message?: string })
        | null;
      const diagnosticsPayload = (await diagnosticsResponse
        .json()
        .catch(() => null)) as
        | (Diagnostics & { message?: string })
        | null;

      if (!overviewResponse.ok || !payload) {
        throw new Error(
          payload?.message ?? "Admin console is temporarily unavailable."
        );
      }

      setOverview(payload);

      if (diagnosticsResponse.ok && diagnosticsPayload) {
        setDiagnostics(diagnosticsPayload);
      } else {
        setDiagnostics(null);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Admin console is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  async function deleteComment(commentId: string) {
    if (busyId) return;
    setBusyId(commentId);

    try {
      const response = await fetch(
        `/api/admin/comments/${encodeURIComponent(commentId)}`,
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
        throw new Error(payload?.message ?? "Comment could not be removed.");
      }

      notify({
        tone: "success",
        title: "Comment removed",
        message: "The comment was removed from MangaFlux community."
      });

      await loadOverview();
    } catch (error) {
      notify({
        tone: "error",
        title: "Admin action failed",
        message:
          error instanceof Error ? error.message : "Try again shortly."
      });
    } finally {
      setBusyId("");
    }
  }

  async function revokeSessions(userId: string) {
    if (busyId) return;
    setBusyId(userId);

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(
          userId
        )}/revoke-sessions`,
        {
          method: "POST",
          headers: {
            "x-mangaflux-client": "web"
          }
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Sessions could not be revoked.");
      }

      notify({
        tone: "success",
        title: "Sessions revoked",
        message: "That user will need to sign in again."
      });

      await loadOverview();
    } catch (error) {
      notify({
        tone: "error",
        title: "Admin action failed",
        message:
          error instanceof Error ? error.message : "Try again shortly."
      });
    } finally {
      setBusyId("");
    }
  }

  if (loading && !session) {
    return (
      <main className="admin-page">
        <section className="admin-hero" aria-busy="true">
          <span className="skeleton skeleton-line" style={{ width: "18%" }} />
          <span className="skeleton admin-title-skeleton" />
          <span className="skeleton skeleton-line" style={{ width: "56%" }} />
        </section>
      </main>
    );
  }

  if (!session?.authenticated) {
    return (
      <main className="admin-page">
        <section className="panel compact">
          <p className="eyebrow">Admin console</p>
          <h1>Sign in first.</h1>
          <p>Administrator access is tied to a verified MangaFlux account.</p>
          <Link className="account-primary-link" href="/account">
            Open account
          </Link>
        </section>
      </main>
    );
  }

  if (session.user?.role !== "admin") {
    return (
      <main className="admin-page">
        <section className="panel compact">
          <p className="eyebrow">Admin console</p>
          <h1>Administrator access required.</h1>
          <p>
            This account is signed in, but it is not on the server-side admin
            allowlist.
          </p>
          <Link className="secondary-button" href="/status">
            View public system status
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="eyebrow">MangaFlux operations</p>
          <h1>Admin console</h1>
          <p>
            Operational visibility and limited safety controls without exposing
            passwords, session tokens, API keys, or database credentials.
          </p>
        </div>

        <div className="admin-hero-actions">
          <Link href="/status">System status →</Link>
          <button
            type="button"
            onClick={() => void loadOverview()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </section>

      {message ? <p className="message">{message}</p> : null}

      {overview ? (
        <>
          <section className="admin-stat-grid">
            {[
              ["Users", overview.counts.users],
              ["Active sessions", overview.counts.activeSessions],
              ["Comments", overview.counts.comments],
              ["Reactions", overview.counts.reactions],
              ["Bookmarks", overview.counts.bookmarks],
              ["Reading progress", overview.counts.readingProgress]
            ].map(([label, value]) => (
              <article key={String(label)}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          {diagnostics ? (
            <section className="admin-diagnostics">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">Last {diagnostics.traffic.windowMinutes} minutes</p>
                  <h2>Runtime diagnostics</h2>
                </div>
                <span>
                  Node {diagnostics.process.nodeVersion} · uptime{" "}
                  {Math.floor(diagnostics.process.uptimeSeconds / 60)}m
                </span>
              </div>

              <div className="admin-diagnostic-grid">
                {[
                  ["Requests", diagnostics.traffic.requests],
                  ["5xx errors", diagnostics.traffic.serverErrors],
                  ["Rate limited", diagnostics.traffic.rateLimited],
                  ["Average", `${diagnostics.traffic.averageLatencyMs} ms`],
                  ["P95", `${diagnostics.traffic.p95LatencyMs} ms`],
                  ["Memory", `${diagnostics.process.memory.rssMb} MB`],
                  ["Cache hits", diagnostics.sourceCache.hits],
                  ["Cache entries", diagnostics.sourceCache.entries],
                  ["Deduped", diagnostics.sourceCache.dedupedRequests]
                ].map(([label, value]) => (
                  <article key={String(label)}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>

              <div className="admin-diagnostic-columns">
                <div>
                  <p className="eyebrow">Top routes</p>
                  <div className="admin-route-list">
                    {diagnostics.traffic.routes.length ? (
                      diagnostics.traffic.routes.map((route) => (
                        <div
                          key={`${route.method}:${route.route}`}
                          className="admin-route-row"
                        >
                          <div>
                            <strong>{route.method}</strong>
                            <span>{route.route}</span>
                          </div>
                          <small>
                            {route.requests} req · {route.averageLatencyMs} ms avg
                            {route.errors ? ` · ${route.errors} errors` : ""}
                          </small>
                        </div>
                      ))
                    ) : (
                      <p className="admin-empty">No request samples yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="eyebrow">Recent failures</p>
                  <div className="admin-route-list">
                    {diagnostics.traffic.recentFailures.length ? (
                      diagnostics.traffic.recentFailures.map((failure, index) => (
                        <div
                          key={`${failure.at}:${failure.route}:${index}`}
                          className="admin-route-row"
                        >
                          <div>
                            <strong>{failure.statusCode}</strong>
                            <span>
                              {failure.method} {failure.route}
                            </span>
                          </div>
                          <small>{failure.durationMs} ms</small>
                        </div>
                      ))
                    ) : (
                      <p className="admin-empty">
                        No 429/5xx failures in this runtime window.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="admin-diagnostic-note">
                MangaDex cache uses bounded in-memory entries and coalesces
                identical in-flight requests to reduce duplicate upstream work.
                Diagnostics are in-memory and privacy-minimized: no request
                bodies, query strings, IP addresses, authorization headers,
                emails, passwords, or tokens are collected.
              </p>
            </section>
          ) : null}

          <section className="admin-grid">
            <div className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">Accounts</p>
                  <h2>Recent users</h2>
                </div>
                <span>{overview.counts.users} total</span>
              </div>

              <div className="admin-list">
                {overview.recentUsers.map((user) => (
                  <article className="admin-user-row" key={user.id}>
                    <div className="admin-avatar">
                      {user.avatarDataUrl ? (
                        <img src={user.avatarDataUrl} alt="" />
                      ) : (
                        initialFor(user.displayName, user.email)
                      )}
                    </div>

                    <div className="admin-user-copy">
                      <strong>{user.displayName || user.email}</strong>
                      {user.displayName ? <span>{user.email}</span> : null}
                      <small>
                        {user.emailVerifiedAt ? "Verified" : "Unverified"} ·{" "}
                        joined {formatDate(user.createdAt)}
                      </small>
                    </div>

                    <button
                      type="button"
                      disabled={
                        busyId !== "" ||
                        user.id === overview.admin.id
                      }
                      onClick={() => void revokeSessions(user.id)}
                    >
                      {user.id === overview.admin.id
                        ? "Current admin"
                        : busyId === user.id
                          ? "Revoking…"
                          : "Revoke sessions"}
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">Community</p>
                  <h2>Recent comments</h2>
                </div>
                <span>{overview.counts.comments} total</span>
              </div>

              <div className="admin-list">
                {overview.recentComments.length ? (
                  overview.recentComments.map((comment) => (
                    <article className="admin-comment-row" key={comment.id}>
                      <div className="admin-comment-meta">
                        <div>
                          <strong>
                            {comment.displayName || comment.userEmail}
                          </strong>
                          <span>
                            {comment.targetType} · {formatDate(comment.createdAt)}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={busyId !== ""}
                          onClick={() => void deleteComment(comment.id)}
                        >
                          {busyId === comment.id ? "Removing…" : "Remove"}
                        </button>
                      </div>

                      <p>{comment.body}</p>
                    </article>
                  ))
                ) : (
                  <p className="admin-empty">No community comments yet.</p>
                )}
              </div>
            </div>
          </section>

          <section className="panel admin-safety-note">
            <p className="eyebrow">Admin scope</p>
            <h2>Intentionally limited.</h2>
            <p>
              This console can inspect aggregate operations, review recent
              accounts/comments, remove community comments, revoke another
              user&apos;s active sessions, and open system status. It cannot
              view passwords, reset passwords for users, reveal session tokens,
              read API keys, run SQL, or change deployment secrets.
            </p>
          </section>
        </>
      ) : null}
    </main>
  );
}
