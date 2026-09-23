"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState
} from "react";

type Session = {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
};

type Mode = "login" | "signup";

export default function AccountClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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
          body?.message ??
            "Authentication is not configured yet."
        );
      }
      return;
    }

    setSession((await response.json()) as Session);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/auth/${mode === "signup" ? "signup" : "login"}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mangaflux-client": "web"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const body = await response.json().catch(() => null) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(
          body?.message ??
            (mode === "signup"
              ? "Could not create account."
              : "Could not sign in.")
        );
      }

      setPassword("");
      setMessage(
        mode === "signup"
          ? "Account created. Your device library was imported."
          : "Signed in. Your device library was checked for import."
      );

      await refreshSession();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed."
      );
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
        headers: {
          "x-mangaflux-client": "web"
        }
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as {
          message?: string;
        } | null;

        throw new Error(body?.message ?? "Could not sign out.");
      }

      setSession({ authenticated: false, user: null });
      setMessage("Signed out on this browser.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not sign out."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-shell">
      <div className="account-header">
        <div>
          <p className="eyebrow">MangaFlux account</p>
          <h1 className="account-title">Your library, across devices.</h1>
        </div>

        <Link className="back-link" href="/">← MangaFlux</Link>
      </div>

      {session?.authenticated && session.user ? (
        <div className="panel account-panel">
          <p className="eyebrow">Signed in</p>
          <h2>{session.user.email}</h2>
          <p className="muted">
            Bookmarks, reading history, chapter progress, and Continue Reading
            now use your account instead of only this browser.
          </p>

          <div className="account-actions">
            <Link className="account-primary-link" href="/">
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
        <div className="panel account-panel">
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
                  mode === "signup"
                    ? "new-password"
                    : "current-password"
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
              {busy
                ? "Working…"
                : mode === "signup"
                  ? "Create MangaFlux account"
                  : "Sign in"}
            </button>
          </form>

          <p className="device-note">
            Your existing device bookmarks and reading progress are imported
            once when this browser signs into an account.
          </p>

          <p className="device-note">
            Email verification and password recovery are not part of this
            pre-1.0 milestone yet. Use a unique password you can retain.
          </p>
        </div>
      )}

      {message ? (
        <p className="account-message" role="status">{message}</p>
      ) : null}
    </section>
  );
}
