"use client";

import {
  useEffect,
  useState
} from "react";
import MangaTile, {
  type MangaTileItem
} from "./MangaTile";
import { reliableFetch } from "../lib/reliableFetch";

type Bookmark = {
  mangaId: string;
  title: string;
};

type Progress = {
  mangaId: string;
  mangaTitle: string;
};

type Summary = {
  bookmarks: Bookmark[];
  history: Progress[];
  continueReading: Progress | null;
};

type Details = {
  id: string;
  title: string;
  year?: number;
  tagDetails?: Array<{
    id: string;
    name: string;
    group?: string;
  }>;
  creators?: Array<{
    id: string;
    name: string;
    role: "author" | "artist";
  }>;
};

type RankedItem = {
  item: MangaTileItem;
  score: number;
};

export default function PersonalRecommendations() {
  const [items, setItems] = useState<MangaTileItem[]>([]);
  const [seedTitle, setSeedTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchItems(url: string) {
      const response = await reliableFetch(url, {
        cache: "no-store",
        signal: controller.signal
      });

      if (!response.ok) return [] as MangaTileItem[];

      const payload = (await response.json()) as {
        items?: MangaTileItem[];
      };

      return payload.items ?? [];
    }

    async function load() {
      try {
        const summaryResponse = await reliableFetch(
          "/api/state/summary",
          {
            cache: "no-store",
            signal: controller.signal
          },
          {
            retries: 1
          }
        );

        if (!summaryResponse.ok) return;

        const summary =
          (await summaryResponse.json()) as Summary;

        const historySeed =
          summary.continueReading ??
          (summary.history.length ? summary.history[0] : null);
        const bookmarkSeed =
          summary.bookmarks.length ? summary.bookmarks[0] : null;
        const seed = historySeed ?? bookmarkSeed;

        if (!seed) return;

        const seedId = seed.mangaId;
        const title =
          "mangaTitle" in seed ? seed.mangaTitle : seed.title;

        setSeedTitle(title);

        const detailsResponse = await reliableFetch(
          `/api/manga/${encodeURIComponent(seedId)}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!detailsResponse.ok) return;

        const detailsPayload =
          (await detailsResponse.json()) as {
            item: Details;
          };
        const details = detailsPayload.item;

        const preferredTags = (
          details.tagDetails ?? []
        ).filter(
          (tag) =>
            tag.group === "genre" ||
            tag.group === "theme"
        );
        const seedTags = (
          preferredTags.length
            ? preferredTags
            : details.tagDetails ?? []
        ).slice(0, 2);

        const primaryCreator =
          details.creators?.find(
            (creator) => creator.role === "author"
          ) ?? details.creators?.[0];

        const requests: Array<Promise<MangaTileItem[]>> = [];

        if (primaryCreator) {
          requests.push(
            fetchItems(
              `/api/discovery?kind=popular&limit=12&creator=${encodeURIComponent(
                primaryCreator.id
              )}`
            )
          );
        }

        seedTags.forEach((tag, index) => {
          requests.push(
            fetchItems(
              `/api/discovery?kind=${
                index === 0 ? "popular" : "top"
              }&limit=12&tag=${encodeURIComponent(tag.id)}`
            )
          );
        });

        if (details.year) {
          requests.push(
            fetchItems(
              `/api/discovery?kind=top&limit=12&year=${encodeURIComponent(
                String(details.year)
              )}`
            )
          );
        }

        const groups = await Promise.all(requests);
        const excluded = new Set<string>([
          seedId,
          ...summary.bookmarks.map((item) => item.mangaId),
          ...summary.history.map((item) => item.mangaId)
        ]);
        const ranked = new Map<string, RankedItem>();

        groups.forEach((group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            if (excluded.has(item.id)) return;

            const current = ranked.get(item.id);
            const signalWeight = Math.max(1, 5 - groupIndex);
            const positionWeight =
              Math.max(0, 12 - itemIndex) / 12;

            ranked.set(item.id, {
              item,
              score:
                (current?.score ?? 0) +
                signalWeight +
                positionWeight
            });
          });
        });

        setItems(
          [...ranked.values()]
            .sort((left, right) => right.score - left.score)
            .slice(0, 12)
            .map((entry) => entry.item)
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  if (!loading && !items.length) return null;

  return (
    <section className="personal-recommendations">
      <div className="discovery-heading">
        <div>
          <p className="eyebrow">For you</p>
          <h2>
            {seedTitle
              ? `Because you read ${seedTitle}`
              : "Recommendations"}
          </h2>
          <p>
            MangaFlux uses your recent reading/library as a seed, then matches
            creator, genre, theme, and year signals.
          </p>
        </div>
      </div>

      <div className="discovery-rail" aria-busy={loading}>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div className="discovery-card" key={index}>
                <span className="skeleton discovery-cover" />
                <span className="skeleton skeleton-line" />
                <span
                  className="skeleton skeleton-line"
                  style={{ width: "58%" }}
                />
              </div>
            ))
          : items.map((item) => (
              <MangaTile
                item={item}
                key={item.id}
                className="recommendation-card"
              />
            ))}
      </div>
    </section>
  );
}
