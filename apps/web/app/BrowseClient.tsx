"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState
} from "react";
import MangaTile, {
  type MangaTileItem
} from "./MangaTile";
import { SearchSkeleton } from "./Skeletons";
import { reliableFetch } from "../lib/reliableFetch";
import BrowseFilters from "./BrowseFilters";
import { useDiscoveryLanguage } from "../lib/useDiscoveryLanguage";

type DiscoveryKind = "hot" | "popular" | "top" | "latest";

type PagePayload = {
  items: MangaTileItem[];
  total: number;
  limit: number;
  offset: number;
};

const labels: Record<
  DiscoveryKind,
  { eyebrow: string; title: string; description: string }
> = {
  hot: {
    eyebrow: "MangaFlux Hot",
    title: "Moving right now",
    description:
      "A MangaFlux ranking that blends recent chapter activity with popularity."
  },
  popular: {
    eyebrow: "Popular",
    title: "Most followed manga",
    description: "Browse titles ordered by MangaDex follow popularity."
  },
  top: {
    eyebrow: "Top rated",
    title: "Highly rated manga",
    description: "Browse titles currently ordered by MangaDex rating."
  },
  latest: {
    eyebrow: "Latest updates",
    title: "Fresh chapter activity",
    description: "Browse manga with the newest chapter updates."
  }
};

export default function BrowseClient({
  kind,
  page,
  tagId,
  tagName,
  year,
  creatorId,
  creatorName,
  status
}: {
  kind: DiscoveryKind;
  page: number;
  tagId?: string;
  tagName?: string;
  year?: number;
  creatorId?: string;
  creatorName?: string;
  status?: string;
}) {
  const limit = 24;
  const [data, setData] = useState<PagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { language } = useDiscoveryLanguage();

  useEffect(() => {
    const controller = new AbortController();
    const offset = (page - 1) * limit;

    async function load() {
      setLoading(true);
      setData(null);
      setMessage("");

      const params = new URLSearchParams({
        kind,
        limit: String(limit),
        offset: String(offset)
      });

      if (tagId) params.set("tag", tagId);
      if (year) params.set("year", String(year));
      if (creatorId) params.set("creator", creatorId);
      if (status) params.set("status", status);
      params.set("language", language);

      try {
        const response = await reliableFetch(
          `/api/discovery?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Discovery is temporarily unavailable.");
        }

        const payload = (await response.json()) as PagePayload;
        setData(payload);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessage(
            error instanceof Error
              ? error.message
              : "Discovery failed."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [kind, page, tagId, year, creatorId, status, language]);

  const label = labels[kind];
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / limit))
    : 1;

  const baseQuery = useMemo(() => {
    const params = new URLSearchParams({ kind });

    if (tagId) params.set("tag", tagId);
    if (tagName) params.set("name", tagName);
    if (year) params.set("year", String(year));

    if (creatorId) {
      params.set("creator", creatorId);
    }

    if (creatorName) {
      params.set("creatorName", creatorName);
    }

    if (status) {
      params.set("status", status);
    }

    return params;
  }, [
    kind,
    tagId,
    tagName,
    year,
    creatorId,
    creatorName,
    status
  ]);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams(baseQuery);
    params.set("page", String(nextPage));
    return `/browse?${params.toString()}`;
  }

  const customTitle = creatorName
    ? `Manga by ${creatorName}`
    : year
      ? `Manga from ${year}`
      : status
        ? `${status.charAt(0).toUpperCase() + status.slice(1)} manga`
        : tagName
          ? `${tagName} manga`
          : null;

  const customDescription = creatorName
    ? `Popular MangaDex titles connected to ${creatorName}.`
    : year
      ? `Popular MangaDex titles first released in ${year}.`
      : status
        ? `Popular MangaDex titles currently marked ${status}.`
        : tagName
          ? `Popular MangaDex titles tagged ${tagName}.`
          : label.description;

  return (
    <>
      <section className="browse-heading">
        <p className="eyebrow">
          {creatorName
            ? "Creator"
            : year
              ? "Release year"
              : status
                ? "Publication status"
                : tagName
                  ? "Genre"
                  : label.eyebrow}
        </p>

        <h1>{customTitle ?? label.title}</h1>
        <p>{customDescription}</p>
      </section>

      <BrowseFilters
        kind={kind}
        tagId={tagId}
        tagName={tagName}
        year={year}
        status={status}
        creatorId={creatorId}
        creatorName={creatorName}
      />

      {loading ? <SearchSkeleton count={12} /> : null}
      {message ? (
        <div className="reliability-error">
          <p className="message">{message}</p>
          <Link href="/status">Check system status →</Link>
        </div>
      ) : null}

      {data?.items.length ? (
        <>
          <div className="browse-grid">
            {data.items.map((item) => (
              <MangaTile item={item} key={item.id} />
            ))}
          </div>

          <nav className="browse-pagination" aria-label="Browse pages">
            {page > 1 ? (
              <Link href={pageHref(page - 1)}>← Previous</Link>
            ) : (
              <span className="is-disabled">← Previous</span>
            )}

            <span>
              Page {page}
              {kind !== "hot" ? ` of ${totalPages}` : ""}
            </span>

            {page < totalPages ? (
              <Link href={pageHref(page + 1)}>Next →</Link>
            ) : (
              <span className="is-disabled">Next →</span>
            )}
          </nav>
        </>
      ) : null}

      {!loading && data && !data.items.length ? (
        <section className="panel compact">
          <h2>No manga on this page.</h2>
          <p>Try the previous page or choose another discovery category.</p>
        </section>
      ) : null}
    </>
  );
}
