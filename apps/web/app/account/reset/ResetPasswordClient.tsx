"use client";

import Link from "next/link";
import {
  FormEvent,
  useState
} from "react";
import { notify } from "../../../lib/toast";
import ConfirmDialog from "../../ConfirmDialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!token) {
      const text = "This reset link is missing its token.";
      setMessage(text);
      notify({ tone: "error", title: "Invalid reset link", message: text });
      return;
    }

    if (password.length < 12 || password.length > 128) {
      const text = "Use a password between 12 and 128 characters.";
      setMessage(text);
      notify({ tone: "error", title: "Password not accepted", message: text });
      return;
    }

    if (password !== confirm) {
      const text = "The passwords do not match.";
      setMessage(text);
      notify({ tone: "error", title: "Passwords don’t match", message: text });
      return;
    }

    setMessage("");
    setConfirmOpen(true);
  }

  async function performReset() {
    if (busy) return;

    setConfirmOpen(false);
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

      const text =
        body?.message ??
        "Password updated. Sign in again with your new password.";

      setDone(true);
      setPassword("");
      setConfirm("");
      setMessage(text);
      window.history.replaceState({}, "", "/account/reset");

      notify({
        tone: "success",
        title: "Password updated",
        message: "All previous account sessions were signed out."
      });
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "Could not reset password.";

      setMessage(text);

      notify({
        tone: "error",
        title: "Password reset failed",
        message: text
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-shell compact-account-shell">
      <Link className="back-link" href="/account">← Account</Link>

      <div className="panel account-panel recovery-card">
        <p className="eyebrow">Secure reset</p>
        <h1 className="account-title">Choose a new password.</h1>
        <p className="account-lede">
          Confirming this change signs out every existing MangaFlux session.
        </p>

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
              {busy ? (
                <span className="button-working">
                  <span className="mini-spinner" aria-hidden="true" />
                  Updating
                </span>
              ) : (
                "Review password reset"
              )}
            </button>
          </form>
        ) : (
          <Link className="account-primary-link" href="/account">
            Sign in
          </Link>
        )}

        {message ? <p className="account-message">{message}</p> : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset your password?"
        description="Your password will change immediately and every existing MangaFlux session will be signed out. You will need to sign in again."
        confirmLabel="Reset password"
        danger
        busy={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void performReset()}
      />
    </section>
  );
}
