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

type ReconciliationEdition = {
  source: string;
  mangaId: string;
  sourceTitle: string;
  status: "complete" | "incomplete" | "error" | "unavailable";
  totalReported: number | null;
  fetchedReleases: number;
  uniqueNumberedChapters: number;
  duplicateNumberedReleases: number;
  unnumberedReleases: number;
  complete: boolean;
  reason: string | null;
};

type ReconciliationDifference = {
  chapter: string;
  availableIn: Array<{
    source: string;
    mangaId: string;
    sourceTitle: string;
    chapterId: string;
    chapterTitle: string;
    releaseCount: number;
  }>;
  notReportedBy: Array<{
    source: string;
    mangaId: string;
    sourceTitle: string;
  }>;
};

type Reconciliation = {
  canonicalId: string;
  displayTitle: string;
  language: string;
  reconciledAt: string;
  ready: boolean;
  comparedSources: string[];
  editions: ReconciliationEdition[];
  differenceTotal: number;
  differencesReturned: number;
  differencesTruncated: boolean;
  differences: ReconciliationDifference[];
};

function label(source: string) {
  return source === "mangadex"
    ? "MangaDex"
    : source === "mangaster"
      ? "MangaSter"
      : source;
}

export default function CanonicalCoverage({
  source,
  mangaId,
  language
}: {
  source: string;
  mangaId: string;
  language: string;
}) {
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [coverageRequested, setCoverageRequested] = useState(false);
  const [coverageError, setCoverageError] = useState("");

  const [reconciliation, setReconciliation] =
    useState<Reconciliation | null>(null);
  const [reconciliationLoading, setReconciliationLoading] =
    useState(false);
  const [reconciliationRequested, setReconciliationRequested] =
    useState(false);
  const [reconciliationError, setReconciliationError] = useState("");

  useEffect(() => {
    setCoverage(null);
    setCoverageError("");
    setCoverageRequested(false);
    setReconciliation(null);
    setReconciliationError("");
    setReconciliationRequested(false);
  }, [source, mangaId, language]);

  async function loadCoverage() {
    if (coverageLoading) return;

    setCoverageLoading(true);
    setCoverageError("");
    setCoverageRequested(true);

    try {
      const response = await fetch(
        `/api/manga/${encodeURIComponent(mangaId)}/coverage?source=${encodeURIComponent(source)}&language=${encodeURIComponent(language)}`,
        { cache: "no-store" }
      );

      const payload = (await response.json().catch(() => null)) as
        | (Coverage & { message?: string })
        | null;

      if (!response.ok || !payload?.editions) {
        throw new Error(
          payload?.message ?? "Chapter coverage is temporarily unavailable."
        );
      }

      setCoverage(payload);
    } catch (cause) {
      setCoverage(null);
      setCoverageError(
        cause instanceof Error
          ? cause.message
          : "Coverage request failed."
      );
    } finally {
      setCoverageLoading(false);
    }
  }

  async function loadReconciliation() {
    if (reconciliationLoading) return;

    setReconciliationLoading(true);
    setReconciliationError("");
    setReconciliationRequested(true);

    try {
      const response = await fetch(
        `/api/manga/${encodeURIComponent(mangaId)}/reconciliation?source=${encodeURIComponent(source)}&language=${encodeURIComponent(language)}&limit=100`,
        { cache: "no-store" }
      );

      const payload = (await response.json().catch(() => null)) as
        | (Reconciliation & { message?: string })
        | null;

      if (!response.ok || !payload?.editions) {
        throw new Error(
          payload?.message ??
            "Missing-chapter reconciliation is temporarily unavailable."
        );
      }

      setReconciliation(payload);
    } catch (cause) {
      setReconciliation(null);
      setReconciliationError(
        cause instanceof Error
          ? cause.message
          : "Reconciliation request failed."
      );
    } finally {
      setReconciliationLoading(false);
    }
  }

  return (
    <section className="panel" aria-label="Source chapter coverage">
      <p className="eyebrow">Source chapter availability</p>
      <h2>Compare reviewed source editions</h2>
      <p className="muted">
        Coverage snapshots are source-reported. Missing-chapter analysis only
        activates after MangaFlux fully enumerates at least two reviewed feeds
        for the same language.
      </p>

      <div className="tag-row">
        <button
          type="button"
          className="secondary-button"
          disabled={coverageLoading}
          onClick={() => void loadCoverage()}
        >
          {coverageLoading
            ? "Checking sources…"
            : coverageRequested
              ? "Refresh source coverage"
              : "Check chapter coverage"}
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={reconciliationLoading}
          onClick={() => void loadReconciliation()}
        >
          {reconciliationLoading
            ? "Reconciling full feeds…"
            : reconciliationRequested
              ? "Refresh missing-chapter analysis"
              : "Analyze missing chapters"}
        </button>
      </div>

      {coverageError ? (
        <p className="message" role="status">{coverageError}</p>
      ) : null}

      {coverage ? (
        <>
          <div className="tag-row">
            {coverage.editions.map((edition) => (
              <article
                className="panel compact"
                key={edition.source + ":" + edition.mangaId}
              >
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
            Coverage sampling alone never marks a chapter missing and never
            switches sources automatically.
          </p>
        </>
      ) : null}

      {reconciliationError ? (
        <p className="message" role="status">{reconciliationError}</p>
      ) : null}

      {reconciliation ? (
        <div className="library-block">
          <div className="library-subheading">
            <div>
              <p className="eyebrow">Full-feed reconciliation</p>
              <h3>
                {reconciliation.ready
                  ? `${reconciliation.differenceTotal} chapter availability difference${reconciliation.differenceTotal === 1 ? "" : "s"}`
                  : "Not enough complete feeds to compare safely"}
              </h3>
            </div>
          </div>

          <div className="tag-row">
            {reconciliation.editions.map((edition) => (
              <article
                className="panel compact"
                key={edition.source + ":" + edition.mangaId}
              >
                <p className="eyebrow">{label(edition.source)}</p>
                <strong>{edition.sourceTitle}</strong>
                <p className="muted">
                  {edition.complete
                    ? `${edition.uniqueNumberedChapters} unique numbered chapters from ${edition.fetchedReleases} releases`
                    : "Excluded from gap comparison"}
                </p>
                <p className="muted">
                  {edition.duplicateNumberedReleases} duplicate numbered releases ·{" "}
                  {edition.unnumberedReleases} unnumbered releases
                </p>
                {!edition.complete && edition.reason ? (
                  <p className="message">{edition.reason}</p>
                ) : null}
              </article>
            ))}
          </div>

          {reconciliation.ready && reconciliation.differences.length ? (
            <div className="history-list history-list-v11">
              {reconciliation.differences.map((difference) => (
                <article
                  className="history-row"
                  key={difference.chapter}
                >
                  <div>
                    <strong>Chapter {difference.chapter}</strong>
                    <span>
                      Reported by{" "}
                      {difference.availableIn
                        .map((entry) => label(entry.source))
                        .join(", ")}
                      {" · "}
                      Not reported by{" "}
                      {difference.notReportedBy
                        .map((entry) => label(entry.source))
                        .join(", ")}
                    </span>
                  </div>

                  <div className="tag-row">
                    {difference.availableIn.map((entry) => (
                      <Link
                        className="secondary-button"
                        key={
                          entry.source +
                          ":" +
                          entry.chapterId
                        }
                        href={`/read/${encodeURIComponent(entry.chapterId)}?source=${encodeURIComponent(entry.source)}`}
                      >
                        Open ch. {difference.chapter} on {label(entry.source)}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : reconciliation.ready ? (
            <p className="message" role="status">
              No numbered chapter availability differences were found between
              the complete reviewed feeds.
            </p>
          ) : null}

          {reconciliation.differencesTruncated ? (
            <p className="device-note">
              Showing {reconciliation.differencesReturned} of{" "}
              {reconciliation.differenceTotal} differences.
            </p>
          ) : null}

          <p className="device-note">
            “Not reported” means the complete provider feed did not return that
            normalized chapter number. It does not prove content equivalence.
            MangaFlux does not silently substitute providers.
          </p>
        </div>
      ) : null}
    </section>
  );
}
