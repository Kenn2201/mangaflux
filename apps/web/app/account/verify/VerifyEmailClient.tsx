"use client";

import Link from "next/link";
import {
  useEffect,
  useState
} from "react";

export default function VerifyEmailClient({
  token
}: {
  token: string;
}) {
  const [state, setState] = useState<
    "checking" | "success" | "error"
  >("checking");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setState("error");
        setMessage("This verification link is missing its token.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mangaflux-client": "web"
          },
          body: JSON.stringify({ token })
        });

        const body = await response.json().catch(() => null) as {
          message?: string;
        } | null;

        if (!response.ok) {
          throw new Error(
            body?.message ?? "This verification link could not be used."
          );
        }

        if (!cancelled) {
          setState("success");
          setMessage(
            body?.message ?? "Email verified. You can sign in now."
          );
          window.history.replaceState({}, "", "/account/verify");
        }
      } catch (error) {
        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "This verification link could not be used."
          );
        }
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className="account-shell">
      <div className="panel account-panel email-result-panel">
        <div className={`email-result-icon ${state}`}>
          {state === "checking" ? "…" : state === "success" ? "✓" : "!"}
        </div>
        <p className="eyebrow">MangaFlux email</p>
        <h1 className="account-title">
          {state === "success"
            ? "Email verified."
            : state === "error"
              ? "Verification problem."
              : "Verifying…"}
        </h1>
        <p className="muted">{message}</p>

        <Link className="account-primary-link" href="/account">
          Go to account
        </Link>
      </div>
    </section>
  );
}
