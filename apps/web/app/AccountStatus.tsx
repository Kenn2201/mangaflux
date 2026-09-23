"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Session = {
  authenticated: boolean;
  user?: {
    email: string;
  } | null;
};

export default function AccountStatus() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store"
        });

        if (!response.ok) {
          if (!cancelled) {
            setSession({ authenticated: false, user: null });
          }
          return;
        }

        const payload = (await response.json()) as Session;
        if (!cancelled) setSession(payload);
      } catch {
        if (!cancelled) {
          setSession({ authenticated: false, user: null });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (session === null) {
    return (
      <span
        className="account-chip account-chip-loading"
        aria-label="Checking account status"
      >
        <span className="skeleton skeleton-dot" />
        <span className="skeleton skeleton-account-label" />
      </span>
    );
  }

  const email = session.user?.email;
  const initial = email?.trim().charAt(0).toUpperCase() || "M";

  return (
    <Link className="account-chip" href="/account">
      <span className="account-chip-avatar" aria-hidden="true">
        {session.authenticated ? initial : "○"}
      </span>
      <span className="account-chip-label">
        {session.authenticated ? email ?? "Account" : "Sign in"}
      </span>
    </Link>
  );
}
