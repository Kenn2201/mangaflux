"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getPreferredSource,
  savePreferredSource
} from "../lib/sourcePreferences";

type Edition = {
  source: string;
  mangaId: string;
  sourceTitle: string;
  mappingMethod: string;
};

type Identity = {
  canonicalId: string;
  displayTitle: string;
  editions: Edition[];
};

function sourceName(source: string) {
  if (source === "mangadex") return "MangaDex";
  if (source === "mangaster") return "MangaSter";
  return source;
}

export default function CanonicalEditions({
  source,
  mangaId
}: {
  source: string;
  mangaId: string;
}) {
  const [data, setData] = useState<Identity | null>(null);
  const [preferredSource, setPreferredSource] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setData(null);
    setPreferredSource(null);
    setMessage("");

    void fetch(
      `/api/manga/${encodeURIComponent(mangaId)}/identity?source=${encodeURIComponent(source)}`,
      { cache: "no-store", signal: controller.signal }
    )
      .then(async (response) => response.ok ? await response.json() : null)
      .then((payload: Identity | null) => {
        if (!active) return;
        setData(payload);
        if (payload) {
          const stored = getPreferredSource(payload.canonicalId);
          setPreferredSource(
            payload.editions.some((edition) => edition.source === stored)
              ? stored
              : null
          );
        }
      })
      .catch(() => {});

    return () => {
      active = false;
      controller.abort();
    };
  }, [source, mangaId]);

  if (!data) return null;

  const editions = [...data.editions].sort((left, right) => {
    if (left.source === preferredSource) return -1;
    if (right.source === preferredSource) return 1;
    return left.source.localeCompare(right.source);
  });

  function setPreference(next: string | null) {
    if (!data || !savePreferredSource(data.canonicalId, next)) {
      setMessage("Could not save preference on this device.");
      return;
    }

    setPreferredSource(next);
    setMessage(
      next
        ? `${sourceName(next)} is now preferred for this title on this device.`
        : "Source preference cleared on this device."
    );
  }

  return (
    <section className="panel" aria-label="MangaFlux canonical manga sources">
      <p className="eyebrow">MangaFlux title identity</p>
      <h2>{data.displayTitle}</h2>
      <p className="muted">
        Reviewed source editions ({data.editions.length}). Choose a
        preferred source to see it first when alternatives are available.
        This preference is saved on this device only and never switches chapters
        automatically.
      </p>

      <div className="tag-row">
        {editions.map((edition) => (
          <article
            className="panel compact"
            key={edition.source + ":" + edition.mangaId}
          >
            <Link
              className="tag tag-link"
              href={`/manga/${encodeURIComponent(edition.mangaId)}?source=${encodeURIComponent(edition.source)}`}
              aria-current={
                edition.source === source && edition.mangaId === mangaId
                  ? "page"
                  : undefined
              }
            >
              {sourceName(edition.source)} · {edition.sourceTitle}
              {edition.source === source && edition.mangaId === mangaId
                ? " (current)"
                : ""}
              {edition.source === preferredSource ? " · Preferred" : ""}
            </Link>
            <button
              className="secondary-button"
              type="button"
              aria-pressed={edition.source === preferredSource}
              onClick={() => setPreference(
                preferredSource === edition.source ? null : edition.source
              )}
            >
              {edition.source === preferredSource
                ? "Clear preference"
                : `Prefer ${sourceName(edition.source)}`}
            </button>
          </article>
        ))}
      </div>
      {message ? <p className="device-note" role="status">{message}</p> : null}
    </section>
  );
}
