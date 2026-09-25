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
  createdAt: string;
};

type Progress = {
  mangaId: string;
  mangaTitle: string;
  updatedAt: string;
};

type Summary = {
  bookmarks: Bookmark[];
  history: Progress[];
  continueReading: Progress | null;
};

type Details = {
  id: string;
  title: string;
  year?: number | null;
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

type ActivitySeed = {
  mangaId: string;
  title: string;
  activityAt: string;
};

type RecommendationSignal = {
  key: string;
  url: string;
  activityWeight: number;
  signalWeight: number;
  reasons: Set<string>;
};

type RankedItem = {
  item: MangaTileItem;
  score: number;
  reasons: Set<string>;
};

type Recommendation = {
  item: MangaTileItem;
  reasons: string[];
};

const MAX_ACTIVITY_SEEDS = 3;
const MAX_DISCOVERY_SIGNALS = 8;

function addSignal(
  signals: Map<string, RecommendationSignal>,
  input: Omit<RecommendationSignal, "reasons"> & {
    reason: string;
  }
) {
  const current = signals.get(input.key);

  if (current) {
    current.activityWeight += input.activityWeight;
    current.signalWeight = Math.max(
      current.signalWeight,
      input.signalWeight
    );
    current.reasons.add(input.reason);
    return;
  }

  signals.set(input.key, {
    key: input.key,
    url: input.url,
    activityWeight: input.activityWeight,
    signalWeight: input.signalWeight,
    reasons: new Set([input.reason])
  });
}

export default function PersonalRecommendations() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [seedTitles, setSeedTitles] = useState<string[]>([]);
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

    async function loadSeedDetails(seed: ActivitySeed) {
      try {
        const response = await reliableFetch(
          `/api/manga/${encodeURIComponent(seed.mangaId)}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!response.ok) return null;

        const payload = (await response.json()) as {
          item: Details;
        };

        return {
          seed,
          details: payload.item
        };
      } catch (error) {
        if ((error as Error).name === "AbortError") throw error;
        return null;
      }
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

        const candidates: ActivitySeed[] = [
          ...summary.history.map((item) => ({
            mangaId: item.mangaId,
            title: item.mangaTitle,
            activityAt: item.updatedAt
          })),
          ...summary.bookmarks.map((item) => ({
            mangaId: item.mangaId,
            title: item.title,
            activityAt: item.createdAt
          }))
        ].sort(
          (left, right) =>
            (Date.parse(right.activityAt) || 0) -
            (Date.parse(left.activityAt) || 0)
        );

        const activitySeeds: ActivitySeed[] = [];
        const seenSeeds = new Set<string>();

        for (const candidate of candidates) {
          if (seenSeeds.has(candidate.mangaId)) continue;
          seenSeeds.add(candidate.mangaId);
          activitySeeds.push(candidate);

          if (activitySeeds.length >= MAX_ACTIVITY_SEEDS) break;
        }

        if (!activitySeeds.length) return;

        setSeedTitles(activitySeeds.map((seed) => seed.title));

        const seedDetails = (
          await Promise.all(activitySeeds.map(loadSeedDetails))
        ).filter(
          (
            item
          ): item is {
            seed: ActivitySeed;
            details: Details;
          } => Boolean(item)
        );

        if (!seedDetails.length) return;

        const signals = new Map<string, RecommendationSignal>();

        seedDetails.forEach(({ seed, details }, seedIndex) => {
          const activityWeight = Math.max(
            1,
            MAX_ACTIVITY_SEEDS - seedIndex
          );
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

          if (primaryCreator) {
            addSignal(signals, {
              key: `creator:${primaryCreator.id}`,
              url:
                "/api/discovery?kind=popular&limit=12&creator=" +
                encodeURIComponent(primaryCreator.id),
              activityWeight,
              signalWeight: 3,
              reason: `Same creator as ${seed.title}: ${primaryCreator.name}`
            });
          }

          seedTags.forEach((tag, tagIndex) => {
            addSignal(signals, {
              key: `tag:${tag.id}`,
              url:
                `/api/discovery?kind=${
                  tagIndex === 0 ? "popular" : "top"
                }&limit=12&tag=` +
                encodeURIComponent(tag.id),
              activityWeight,
              signalWeight: tagIndex === 0 ? 4 : 3,
              reason: `Shares ${tag.name} with ${seed.title}`
            });
          });

          if (details.year) {
            addSignal(signals, {
              key: `year:${details.year}`,
              url:
                "/api/discovery?kind=top&limit=12&year=" +
                encodeURIComponent(String(details.year)),
              activityWeight,
              signalWeight: 1,
              reason: `Same release year as ${seed.title}: ${details.year}`
            });
          }
        });

        const selectedSignals = [...signals.values()]
          .sort(
            (left, right) =>
              right.activityWeight +
              right.signalWeight -
              (left.activityWeight + left.signalWeight)
          )
          .slice(0, MAX_DISCOVERY_SIGNALS);

        const groups = await Promise.all(
          selectedSignals.map(async (signal) => ({
            ...signal,
            items: await fetchItems(signal.url)
          }))
        );

        const excluded = new Set<string>([
          ...summary.bookmarks.map((item) => item.mangaId),
          ...summary.history.map((item) => item.mangaId)
        ]);
        const ranked = new Map<string, RankedItem>();

        groups.forEach((group) => {
          group.items.forEach((item, itemIndex) => {
            if (excluded.has(item.id)) return;

            const current = ranked.get(item.id);
            const positionWeight =
              Math.max(0, 12 - itemIndex) / 12;
            const reasons = new Set(current?.reasons ?? []);

            group.reasons.forEach((reason) => reasons.add(reason));

            ranked.set(item.id, {
              item,
              score:
                (current?.score ?? 0) +
                group.activityWeight +
                group.signalWeight +
                positionWeight,
              reasons
            });
          });
        });

        setItems(
          [...ranked.values()]
            .sort((left, right) => right.score - left.score)
            .slice(0, 12)
            .map((entry) => ({
              item: entry.item,
              reasons: [...entry.reasons].slice(0, 2)
            }))
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

  const heading =
    seedTitles.length === 1
      ? `Because you read ${seedTitles[0]}`
      : seedTitles.length > 1
        ? "Based on your recent activity"
        : "Recommendations";

  return (
    <section className="personal-recommendations">
      <div className="discovery-heading">
        <div>
          <p className="eyebrow">For you</p>
          <h2>{heading}</h2>
          <p>
            MangaFlux blends your recent reading and library activity, then
            matches creator, genre, theme, and year signals.
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
          : items.map((recommendation) => (
              <div
                className="recommendation-explained"
                key={recommendation.item.id}
              >
                <MangaTile
                  item={recommendation.item}
                  className="recommendation-card"
                />
                <p className="recommendation-reason">
                  {recommendation.reasons.join(" · ")}
                </p>
              </div>
            ))}
      </div>
    </section>
  );
}
