"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalRouteError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("MangaFlux route error", error);
  }, [error]);

  return (
    <main className="release-state-page">
      <section className="panel release-state-card" role="alert">
        <p className="eyebrow">MangaFlux</p>
        <h1 className="title-small">Something went wrong.</h1>
        <p>
          This page hit an unexpected error. Your account session and saved
          library are not cleared by retrying.
        </p>
        <div className="release-state-actions">
          <button type="button" onClick={reset}>
            Try again
          </button>
          <Link href="/status">System status</Link>
          <Link href="/">Home</Link>
        </div>
      </section>
    </main>
  );
}
