"use client";

import Link from "next/link";
import {
  useEffect,
  useState
} from "react";
import { notify } from "../../../lib/toast";

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
        const text = "This verification link is missing its token.";
        setState("error");
        setMessage(text);
        notify({
          tone: "error",
          title: "Verification problem",
          message: text
        });
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
          const text =
            body?.message ?? "Email verified. You can sign in now.";
          setState("success");
          setMessage(text);
          window.history.replaceState({}, "", "/account/verify");
          notify({
            tone: "success",
            title: "Email verified",
            message: "Your MangaFlux account is ready to sign in."
          });
        }
      } catch (error) {
        if (!cancelled) {
          const text =
            error instanceof Error
              ? error.message
              : "This verification link could not be used.";
          setState("error");
          setMessage(text);
          notify({
            tone: "error",
            title: "Verification problem",
            message: text
          });
        }
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className="account-shell compact-account-shell">
      <div className="panel account-panel email-result-panel">
        <div className={`email-result-icon ${state}`}>
          {state === "checking" ? (
            <span className="mini-spinner" aria-hidden="true" />
          ) : state === "success" ? (
            "✓"
          ) : (
            "!"
          )}
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

        {state !== "checking" ? (
          <Link className="account-primary-link" href="/account">
            Go to account
          </Link>
        ) : null}
      </div>
    </section>
  );
}
