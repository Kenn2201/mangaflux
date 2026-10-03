"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Sample = {
  chapterId: string;
  number: string | null;
  title: string;
  language: string;
  source: string;
};
type EditionCoverage = {
  source: string;
  mangaId: string;
  sourceTitle: string;
  status: "ok" | "error" | "unavailable";
  total: number | null;
  samples: Sample[];
  sampledOnly: boolean;
  message: string;
};
type Coverage = {
  canonicalId: string;
  displayTitle: string;
  language: string;
  sampledAt: string;
  policy: {
    mappedEditionsOnly: boolean;
    sourceIsolated: boolean;
    automaticChapterSubstitution: false;
    verifiedChapterEquivalence: false;
    gapsVerified: false;
  };
  editions: EditionCoverage[];
};
function label(source: string) {
  return source === "mangadex"
    ? "MangaDex"
    : source === "mangaster"
      ? "MangaSter"
      : source;
}
export default function CanonicalCoverage({
  source, mangaId, language
}: {
  source: string;
  mangaId: string;
  language: string;
}) {
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setCoverage(null);
    setError("");
    setRequested(false);
  }, [source, mangaId, language]);

  async function load() {
    if (loading) return;
    setLoading(true);
    setError("");
    setRequested(true);
    try {
      const response = await fetch(
        `/api/manga/${encodeURIComponent(mangaId)}/coverage?source=${encodeURIComponent(source)}&language=${encodeURIComponent(language)}`,
        { cache: "no-store" }
      );
      const payload = await response.json().catch(() => null) as
        | (Coverage & { message?: string })
        | null;
      if (!response.ok || !payload?.editions) {
        throw new Error(payload?.message ?? "Chapter coverage is temporarily unavailable.");
      }
      setCoverage(payload);
    } catch (cause) {
      setCoverage(null);
      setError(cause instanceof Error ? cause.message : "Coverage request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel" aria-label="Source chapter coverage">
      <p className="eyebrow">Source chapter availability</p>
      <h2>Check available chapters by source</h2>
      <p className="muted">
        Compare chapter counts for reviewed editions. These are live provider
        snapshots, not guaranteed complete coverage or verified equivalent chapters.
      </p>
      <button
        type="button"
        className="secondary-button"
        disabled={loading}
        onClick={() => void load()}
      >
        {loading ? "Checking sources…" : requested ? "Refresh source coverage" : "Check chapter coverage"}
      </button>
      {error ? <p className="message" role="status">{error}</p> : null}
      {coverage ? (
        <>
          <div className="tag-row">
            {coverage.editions.map((edition) => (
              <article className="panel compact" key={edition.source + ":" + edition.mangaId}>
                <p className="eyebrow">{label(edition.source)}</p>
                <strong>{edition.sourceTitle}</strong>
                <p className="muted">
                  {edition.status === "ok"
                    ? `${edition.total ?? 0} chapter releases reported`
                    : "Source unavailable — other sources remain usable"}
                </p>
                <p className="muted">{edition.message}</p>
                {edition.status === "ok" ? (
                  <p className="muted">
                    {edition.samples.length} sampled releases
                    {edition.sampledOnly ? " (partial sample)" : ""}
                  </p>
                ) : null}
                <Link
                  className="secondary-button"
                  href={`/manga/${encodeURIComponent(edition.mangaId)}?source=${encodeURIComponent(edition.source)}`}
                >
                  Open {label(edition.source)} chapters →
                </Link>
              </article>
            ))}
          </div>
          <p className="device-note">
            Missing-chapter detection and automatic fallback are not enabled yet.
            The displayed totals can contain alternate translations/releases or
            unnumbered chapters. MangaFlux never substitutes a source silently.
          </p>
        </>
      ) : null}
    </section>
  );
}
