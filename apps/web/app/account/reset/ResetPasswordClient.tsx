"use client";

import Link from "next/link";
import {
  FormEvent,
  useState
} from "react";

export default function ResetPasswordClient({
  token
}: {
  token: string;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!token) {
      setMessage("This reset link is missing its token.");
      return;
    }

    if (password !== confirm) {
      setMessage("The passwords do not match.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mangaflux-client": "web"
        },
        body: JSON.stringify({ token, password })
      });

      const body = await response.json().catch(() => null) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.message ?? "Could not reset password.");
      }

      setDone(true);
      setPassword("");
      setConfirm("");
      setMessage(
        body?.message ??
          "Password updated. Sign in again with your new password."
      );
      window.history.replaceState({}, "", "/account/reset");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not reset password."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-shell">
      <Link className="back-link" href="/account">← Account</Link>

      <div className="panel account-panel">
        <p className="eyebrow">Secure reset</p>
        <h1 className="account-title">Choose a new password.</h1>

        {!done ? (
          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>New password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="12+ characters"
              />
            </label>

            <label>
              <span>Confirm password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat password"
              />
            </label>

            <button className="account-submit" type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        ) : (
          <Link className="account-primary-link" href="/account">
            Sign in
          </Link>
        )}

        {message ? <p className="account-message">{message}</p> : null}
      </div>
    </section>
  );
}
