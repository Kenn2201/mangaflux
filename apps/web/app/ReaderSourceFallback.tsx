"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";

type Alternative = {
  source: string;
  mangaId: string;
  sourceTitle: string;
  chapterId: string;
  chapterTitle: string;
  chapter: string;
  language: string;
  scanlationGroups: string[];
};

type Result = {
  reviewedMapping: boolean;
  alternatives: Alternative[];
  checkedSources: Array<{
    source: string;
    status: "ok" | "error" | "unavailable";
  }>;
  note: string;
  message?: string;
};

function sourceLabel(source: string) {
  if (source === "mangadex") return "MangaDex";
  if (source === "mangaster") return "MangaSter";
  return source;
}

export default function ReaderSourceFallback({
  source,
  mangaId,
  chapter,
  language
}: {
  source: string;
  mangaId: string;
  chapter?: string;
  language: string;
}) {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chosen, setChosen] = useState<Alternative | null>(null);

  useEffect(() => {
    setResult(null);
    setChosen(null);
    setMessage("");
  }, [source, mangaId, chapter, language]);

  async function checkAlternatives() {
    if (loading || !mangaId || !chapter) return;

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const query = new URLSearchParams({
        source,
        chapter,
        language
      });
      const response = await fetch(
        `/api/manga/${encodeURIComponent(mangaId)}/alternatives?${query}`,
        { cache: "no-store" }
      );
      const payload = await response.json().catch(() => null) as
        | Result | null;

      if (!response.ok || !payload?.alternatives) {
        throw new Error(
          payload?.message ?? "Could not check alternate sources."
        );
      }

      setResult(payload);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Alternate sources are unavailable right now."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!mangaId || !chapter || !/^\d+(?:\.\d+)?$/.test(chapter)) {
    return null;
  }

  return (
    <section
      className="panel"
      id="reader-other-sources"
      aria-label="Choose another chapter source"
    >
      <p className="eyebrow">Optional source selection</p>
      <h2>Other sources for Chapter {chapter}</h2>
      <p className="muted">
        Check approved mapped editions for a release with this chapter number.
        Choosing another provider is optional, and its content may differ.
      </p>

      <button
        className="secondary-button"
        type="button"
        disabled={loading}
        onClick={() => void checkAlternatives()}
      >
        {loading ? "Checking other sources…" : "Find another source"}
      </button>

      {message ? <p className="message" role="status">{message}</p> : null}

      {result ? (
        <>
          {!result.reviewedMapping ? (
            <p className="message" role="status">
              No admin-reviewed source match is available for this edition yet.
            </p>
          ) : result.alternatives.length === 0 ? (
            <p className="message" role="status">
              No matching numbered chapter was reported by the available
              alternate sources. Your current source is unchanged.
            </p>
          ) : (
            <div className="history-list history-list-v11">
              {result.alternatives.map((option) => (
                <article
                  className="history-row"
                  key={option.source + ":" + option.chapterId}
                >
                  <div>
                    <strong>{sourceLabel(option.source)}</strong>
                    <span>
                      {option.sourceTitle} · {option.chapterTitle}
                    </span>
                    <small>
                      {option.language.toUpperCase()} · Chapter {option.chapter}
                    </small>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setChosen(option)}
                  >
                    Select {sourceLabel(option.source)}
                  </button>
                </article>
              ))}
            </div>
          )}

          {result.checkedSources.some((item) => item.status !== "ok") ? (
            <p className="device-note">
              A source could not be checked. MangaFlux will not assume the
              chapter is missing or switch automatically.
            </p>
          ) : null}
        </>
      ) : null}

      <p className="device-note">
        Switching sources never transfers or overwrites your existing reading
        progress. Matching chapter numbers do not guarantee identical pages.
      </p>

      <ConfirmDialog
        open={chosen !== null}
        title={chosen
          ? `Open Chapter ${chapter} from ${sourceLabel(chosen.source)}?`
          : "Change source?"}
        description={chosen
          ? `You are on ${sourceLabel(source)}. This opens ${sourceLabel(chosen.source)}'s ${chosen.chapterTitle} as a separate source release. Its contents may differ, and your existing progress stays with ${sourceLabel(source)}. Continue?`
          : ""}
        confirmLabel={chosen ? `Open ${sourceLabel(chosen.source)}` : "Open"}
        onCancel={() => setChosen(null)}
        onConfirm={() => {
          if (!chosen) return;
          const href = `/read/${encodeURIComponent(chosen.chapterId)}?source=${encodeURIComponent(chosen.source)}`;
          setChosen(null);
          router.push(href);
        }}
      />
    </section>
  );
}
