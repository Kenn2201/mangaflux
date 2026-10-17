"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";
import {
  getPreferredSource,
  savePreferredSource,
  SOURCE_PREFERENCE_CHANGED
} from "../lib/sourcePreferences";

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
  canonicalId?: string;
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
  language,
  preferredScanlationGroup
}: {
  source: string;
  mangaId: string;
  chapter?: string;
  language: string;
  preferredScanlationGroup?: string;
}) {
  const router = useRouter();
  const [requestedChapter, setRequestedChapter] = useState(chapter ?? "");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chosen, setChosen] = useState<Alternative | null>(null);
  const [preferredSource, setPreferredSource] = useState<string | null>(null);
  const [preferenceMessage, setPreferenceMessage] = useState("");

  useEffect(() => {
    setRequestedChapter(chapter ?? "");
    setResult(null);
    setChosen(null);
    setMessage("");
    setPreferredSource(null);
    setPreferenceMessage("");
  }, [source, mangaId, chapter, language]);

  useEffect(() => {
    if (!result?.canonicalId) return;
    const canonicalId = result.canonicalId;
    function onPreferenceChange() {
      setPreferredSource(getPreferredSource(canonicalId));
    }
    window.addEventListener(SOURCE_PREFERENCE_CHANGED, onPreferenceChange);
    return () => window.removeEventListener(SOURCE_PREFERENCE_CHANGED, onPreferenceChange);
  }, [result?.canonicalId]);

  async function checkAlternatives() {
    const number = requestedChapter.trim();
    if (loading || !mangaId) return;
    if (!/^\d+(?:\.\d+)?$/.test(number) || number.length > 40) {
      setMessage("Enter a chapter number such as 4 or 4.5.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const query = new URLSearchParams({
        source,
        chapter: number,
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
      setPreferredSource(payload.canonicalId ? getPreferredSource(payload.canonicalId) : null);
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

  if (!mangaId) {
    return null;
  }

  const groupKey = preferredScanlationGroup?.trim().toLowerCase();
  function matchesGroup(option: Alternative) {
    return Boolean(
      groupKey &&
      option.scanlationGroups.some((group) =>
        group.trim().toLowerCase() === groupKey
      )
    );
  }

  const orderedAlternatives = [...(result?.alternatives ?? [])].sort((a, b) => {
    const sourceA = a.source === preferredSource ? 1 : 0;
    const sourceB = b.source === preferredSource ? 1 : 0;
    if (sourceA !== sourceB) return sourceB - sourceA;
    const groupA = matchesGroup(a) ? 1 : 0;
    const groupB = matchesGroup(b) ? 1 : 0;
    if (groupA !== groupB) return groupB - groupA;
    return a.source.localeCompare(b.source) || a.chapterId.localeCompare(b.chapterId);
  });

  function preferOption(option: Alternative) {
    if (
      !result?.canonicalId ||
      !savePreferredSource(result.canonicalId, option.source)
    ) {
      setPreferenceMessage("Could not save this source preference.");
      return;
    }
    setPreferredSource(option.source);
    setPreferenceMessage(
      `${sourceLabel(option.source)} is now preferred for this title on this device.`
    );
  }

  return (
    <section
      className="panel"
      id="reader-other-sources"
      aria-label="Choose another chapter source"
    >
      <p className="eyebrow">Optional source selection</p>
      <h2>Find a chapter from another source</h2>
      <p className="muted">
        Check approved mapped editions for a release with this chapter number.
        Choosing another provider is optional, and its content may differ.
        Only releases matching the selected chapter language are offered.
      </p>

      <label className="muted" htmlFor="fallback-chapter-number">
        Chapter number to find
      </label>
      <input
        id="fallback-chapter-number"
        type="text"
        inputMode="decimal"
        value={requestedChapter}
        maxLength={40}
        placeholder="For example: 4 or 4.5"
        onChange={(event) => {
          setRequestedChapter(event.target.value);
          setResult(null);
          setMessage("");
        }}
      />

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
          <p className="device-note">
            Language: {language.toUpperCase()}. {preferredSource
              ? `Preferred source: ${sourceLabel(preferredSource)} (shown first).`
              : "No preferred source set."}
            {preferredScanlationGroup
              ? ` Preferred scanlation group: ${preferredScanlationGroup} when listed.`
              : ""}
          </p>
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
              {orderedAlternatives.map((option) => (
                <article
                  className="history-row"
                  key={option.source + ":" + option.chapterId}
                >
                  <div>
                    <strong>
                      {sourceLabel(option.source)}
                      {option.source === preferredSource ? " · Preferred source" : ""}
                      {matchesGroup(option) ? " · Preferred group" : ""}
                    </strong>
                    <span>
                      {option.sourceTitle} · {option.chapterTitle}
                    </span>
                    <small>
                      {option.language.toUpperCase()} · Chapter {option.chapter}
                      {option.scanlationGroups.length
                        ? ` · ${option.scanlationGroups.join(", ")}`
                        : " · Group not listed"}
                    </small>
                  </div>
                  <div className="tag-row">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => setChosen(option)}
                    >
                      Select {sourceLabel(option.source)}
                    </button>
                    {option.source !== preferredSource ? (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => preferOption(option)}
                      >
                        Prefer {sourceLabel(option.source)}
                      </button>
                    ) : null}
                  </div>
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

      {preferenceMessage ? <p className="device-note" role="status">{preferenceMessage}</p> : null}

      <p className="device-note">
        Source and scanlation group are ordering preferences, not quality scores.
        Unknown metadata stays unknown. These choices never override explicit
        confirmation. Switching sources never transfers or overwrites your existing reading
        progress. Matching chapter numbers do not guarantee identical pages.
      </p>

      <ConfirmDialog
        open={chosen !== null}
        title={chosen
          ? `Open Chapter ${chosen.chapter} from ${sourceLabel(chosen.source)}?`
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
