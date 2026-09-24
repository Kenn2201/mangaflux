"use client";

import Link from "next/link";
import {
  useEffect,
  useState
} from "react";

export default function LandingSessionCta() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store"
        });

        if (!cancelled) {
          setAuthenticated(
            response.ok &&
              Boolean((await response.json()).authenticated)
          );
        }
      } catch {
        if (!cancelled) setAuthenticated(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="landing-actions">
      {authenticated === null ? (
        <span className="skeleton landing-action-skeleton" />
      ) : authenticated ? (
        <Link className="landing-primary" href="/dashboard">
          Open dashboard
        </Link>
      ) : (
        <Link className="landing-primary" href="/account">
          Create account
        </Link>
      )}

      <Link className="landing-secondary" href="#discover">
        Explore manga
      </Link>
    </div>
  );
}
