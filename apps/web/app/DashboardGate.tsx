"use client";

import Link from "next/link";
import {
  useEffect,
  useState
} from "react";
import DiscoverySections from "./DiscoverySections";
import GenreShelf from "./GenreShelf";
import LibraryClient from "./LibraryClient";
import PersonalRecommendations from "./PersonalRecommendations";
import RecentlyViewed from "./RecentlyViewed";

type Session = {
  authenticated: boolean;
  user?: {
    email: string;
  } | null;
};

export default function DashboardGate() {
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
      <>
        <section className="dashboard-heading">
          <span className="skeleton skeleton-line" style={{ width: "110px" }} />
          <span className="skeleton dashboard-title-skeleton" />
          <span className="skeleton skeleton-line" style={{ width: "62%" }} />
        </section>
        <section className="panel dashboard-loading-card">
          <span className="skeleton skeleton-block" />
        </section>
      </>
    );
  }

  if (!session.authenticated) {
    return (
      <>
        <section className="dashboard-guest panel">
          <p className="eyebrow">Your dashboard</p>
          <h1>Sign in to bring your library together.</h1>
          <p>
            Your device reading still works while signed out. An account adds
            cross-device bookmarks, history, and Continue Reading.
          </p>
          <div className="landing-actions">
            <Link className="landing-primary" href="/account">
              Sign in / Create account
            </Link>
            <Link className="landing-secondary" href="/browse?kind=popular">
              Browse manga
            </Link>
          </div>
        </section>
        <RecentlyViewed compact />
      </>
    );
  }

  return (
    <>
      <section className="dashboard-heading">
        <p className="eyebrow">Dashboard</p>
        <h1>Your reading, in one place.</h1>
        <p>
          Continue where you stopped, revisit your library, then see what is
          moving across MangaFlux.
        </p>
      </section>

      <LibraryClient />
      <PersonalRecommendations />
      <RecentlyViewed compact />
      <DiscoverySections compact />
      <GenreShelf />
    </>
  );
}
