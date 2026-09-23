"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState
} from "react";
import { notify } from "../../lib/toast";
import { AccountSkeleton } from "../Skeletons";

type Session = {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    emailVerifiedAt?: string | null;
    createdAt: string;
  } | null;
};

type Progress = {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterLabel?: string | null;
  page: number;
  totalPages: number;
};

type ReaderSummary = {
  bookmarks: Array<{ mangaId: string }>;
  history: Progress[];
  continueReading: Progress | null;
};

type Mode = "login" | "signup";

export default function AccountClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<ReaderSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  async function refreshSession() {
    const response = await fetch("/api/auth/session", {
      cache: "no-store"
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null) as {
        message?: string;
      } | null;

      setSession({ authenticated: false, user: null });

      if (response.status === 503) {
        setMessage(
          body?.message ?? "Authentication is not configured yet."
        );
      }
      return;
    }

    setSession((await response.json()) as Session);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  useEffect(() => {
    if (!session?.authenticated) {
      setSummary(null);
      return;
    }

    let cancelled = false;
    setSummaryLoading(true);

    async function loadSummary() {
      try {
        const response = await fetch("/api/state/summary", {
          cache: "no-store"
        });

        if (!response.ok) return;

        const payload = (await response.json()) as ReaderSummary;
        if (!cancelled) setSummary(payload);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [session?.authenticated]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");
    setNeedsVerification(false);

    try {
      const response = await fetch(
        `/api/auth/${mode === "signup" ? "signup" : "login"}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mangaflux-client": "web"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const body = await response.json().catch(() => null) as {
        error?: string;
        message?: string;
        verificationRequired?: boolean;
        emailSent?: boolean;
      } | null;

      if (!response.ok) {
        if (body?.error === "EMAIL_NOT_VERIFIED") {
          setNeedsVerification(true);
        }

        throw new Error(
          body?.message ??
            (mode === "signup"
              ? "Could not create account."
              : "Could not sign in.")
        );
      }

      setPassword("");

      if (mode === "signup") {
        const successMessage = body?.emailSent
          ? "Check your inbox for the MangaFlux verification link."
          : "Account created, but email delivery is not configured yet.";

        setNeedsVerification(true);
        setMessage(successMessage);
        setMode("login");
        notify({
          tone: "success",
          title: "Account created",
          message: successMessage
        });
        return;
      }

      await refreshSession();
      setMessage("");
      notify({
        tone: "success",
        title: "Welcome back",
        message: "Your account library and reading progress are ready."
      });
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Authentication failed.";
      setMessage(text);
      notify({
        tone: "error",
        title: "Couldn’t continue",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification(targetEmail = email) {
    if (!targetEmail || busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mangaflux-client": "web"
        },
        body: JSON.stringify({ email: targetEmail })
      });

      const body = await response.json().catch(() => null) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.message ?? "Could not resend verification.");
      }

      const text =
        body?.message ??
        "If verification is still needed, a new email has been sent.";

      setMessage(text);
      notify({
        tone: "success",
        title: "Verification email requested",
        message: text
      });
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : "Could not resend verification.";
      setMessage(text);
      notify({
        tone: "error",
        title: "Email not sent",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "x-mangaflux-client": "web" }
      });

      if (!response.ok) {
        throw new Error("Could not sign out.");
      }

      setSession({ authenticated: false, user: null });
      setSummary(null);
      notify({
        tone: "success",
        title: "Signed out",
        message: "This browser is no longer using your account session."
      });
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Could not sign out.";
      setMessage(text);
      notify({
        tone: "error",
        title: "Sign out failed",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  const user = session?.authenticated ? session.user : null;
  const initial = user?.email.charAt(0).toUpperCase() || "M";

  return (
    <section className="account-shell">
      <div className="account-header account-page-heading">
        <div>
          <p className="eyebrow">MangaFlux account</p>
          <h1 className="account-title">Your library, across devices.</h1>
          <p className="account-lede">
            One account for bookmarks, history, Continue Reading, and recovery.
          </p>
        </div>
      </div>

      {session === null ? (
        <AccountSkeleton />
      ) : user ? (
        <div className="profile-stack">
          <section className="panel account-panel profile-card">
            <div className="profile-identity">
              <div className="profile-avatar" aria-hidden="true">
                {initial}
              </div>

              <div className="profile-identity-copy">
                <p className="eyebrow">Signed in</p>
                <h2>{user.email}</h2>
                <span
                  className={`email-badge ${
                    user.emailVerifiedAt ? "verified" : "pending"
                  }`}
                >
                  {user.emailVerifiedAt
                    ? "✓ Verified email"
                    : "Verification pending"}
                </span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <strong>{summaryLoading ? "—" : summary?.bookmarks.length ?? 0}</strong>
                <span>Bookmarks</span>
              </div>
              <div className="profile-stat">
                <strong>{summaryLoading ? "—" : summary?.history.length ?? 0}</strong>
                <span>Series in progress</span>
              </div>
            </div>

            {summary?.continueReading ? (
              <Link
                className="profile-continue"
                href={`/read/${summary.continueReading.chapterId}?resume=${summary.continueReading.page}`}
              >
                <div>
                  <p className="eyebrow">Continue reading</p>
                  <strong>{summary.continueReading.mangaTitle}</strong>
                  <span>
                    {summary.continueReading.chapterLabel || "Current chapter"} ·
                    Page {summary.continueReading.page} /{" "}
                    {summary.continueReading.totalPages}
                  </span>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}

            {!user.emailVerifiedAt ? (
              <button
                className="email-link-button"
                type="button"
                disabled={busy}
                onClick={() => void resendVerification(user.email)}
              >
                Resend verification email
              </button>
            ) : null}
          </section>

          <section className="panel account-panel security-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Security</p>
                <h2>Account controls</h2>
              </div>
            </div>

            <div className="security-list">
              <div className="security-row">
                <div>
                  <strong>Email</strong>
                  <span>{user.email}</span>
                </div>
                <span className="security-state">
                  {user.emailVerifiedAt ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="security-row">
                <div>
                  <strong>Password</strong>
                  <span>Reset through your verified inbox</span>
                </div>
                <Link href="/account/forgot">Change</Link>
              </div>

              <div className="security-row">
                <div>
                  <strong>Session</strong>
                  <span>This browser is signed in</span>
                </div>
                <span className="security-state">Active</span>
              </div>
            </div>
          </section>

          <div className="account-actions profile-actions">
            <Link className="account-primary-link" href="/#library">
              Open library
            </Link>
            <button
              className="secondary-button account-button"
              type="button"
              onClick={logout}
              disabled={busy}
            >
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : (
        <div className="panel account-panel auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "is-active" : ""}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "signup" ? "is-active" : ""}
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="12+ characters"
              />
            </label>

            <button
              className="account-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <span className="button-working">
                  <span className="mini-spinner" aria-hidden="true" />
                  Working
                </span>
              ) : mode === "signup" ? (
                "Create MangaFlux account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="auth-helper-row">
            <Link href="/account/forgot">Forgot password?</Link>
            {needsVerification ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void resendVerification()}
              >
                Resend verification
              </button>
            ) : null}
          </div>

          <p className="device-note">
            New accounts receive a verification email from MangaFlux
            &lt;noreply@manga.kenncode.me&gt;.
          </p>
        </div>
      )}

      {message ? (
        <p className="account-message" role="status">{message}</p>
      ) : null}
    </section>
  );
}
