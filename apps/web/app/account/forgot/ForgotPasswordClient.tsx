"use client";

import Link from "next/link";
import {
  FormEvent,
  useState
} from "react";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mangaflux-client": "web"
        },
        body: JSON.stringify({ email })
      });

      const body = await response.json().catch(() => null) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.message ?? "Could not request password reset.");
      }

      setMessage(
        body?.message ??
          "If an account exists for that email, a reset link has been sent."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not request password reset."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-shell">
      <Link className="back-link" href="/account">← Account</Link>

      <div className="panel account-panel">
        <p className="eyebrow">Account recovery</p>
        <h1 className="account-title">Reset your password.</h1>
        <p className="muted">
          Enter your MangaFlux account email. If it exists, we&apos;ll send a
          secure reset link that expires in 30 minutes.
        </p>

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

          <button className="account-submit" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send reset email"}
          </button>
        </form>

        {message ? <p className="account-message">{message}</p> : null}
      </div>
    </section>
  );
}
