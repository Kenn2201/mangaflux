"use client";

import {
  useEffect,
  useState
} from "react";
import MangaTile, {
  type MangaTileItem
} from "./MangaTile";
import { reliableFetch } from "../lib/reliableFetch";
import { useDiscoveryLanguage } from "../lib/useDiscoveryLanguage";
import { usePreferredGenres } from "../lib/usePreferredGenres";
import { usePreferredStatus } from "../lib/usePreferredStatus";

type RankedItem = {
  item: MangaTileItem;
  score: number;
  reasons: Set<string>;
};

type Recommendation = {
  item: MangaTileItem;
  reasons: string[];
};

export default function PreferredGenreRecommendations() {
  const { language } = useDiscoveryLanguage();
  const { genres } = usePreferredGenres();
  const { status } = usePreferredStatus();
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const genreKey = genres.map((genre) => genre.id).join(",");

  useEffect(() => {
    const controller = new AbortController();

    if (!genres.length) {
      setItems([]);
      setLoading(false);
      return () => controller.abort();
    }

    async function load() {
      setLoading(true);

      try {
        const groups = await Promise.all(
          genres.map(async (genre, genreIndex) => {
            const kind = genreIndex % 2 === 0 ? "popular" : "top";
            const response = await reliableFetch(
              `/api/discovery?kind=${kind}&limit=12&tag=${encodeURIComponent(
                genre.id
              )}&language=${encodeURIComponent(language)}${status ? `&status=${encodeURIComponent(status)}` : ""}`,
              {
                cache: "no-store",
                signal: controller.signal
              }
            );

            if (!response.ok) {
              return {
                genre,
                genreIndex,
                items: [] as MangaTileItem[]
              };
            }

            const payload = (await response.json()) as {
              items?: MangaTileItem[];
            };

            return {
              genre,
              genreIndex,
              items: payload.items ?? []
            };
          })
        );

        const ranked = new Map<string, RankedItem>();

        groups.forEach(({ genre, genreIndex, items: group }) => {
          group.forEach((item, itemIndex) => {
            const current = ranked.get(item.id);
            const preferenceWeight = Math.max(1, genres.length - genreIndex);
            const positionWeight = Math.max(0, 12 - itemIndex) / 12;
            const reasons = new Set(current?.reasons ?? []);
            reasons.add(`Matches your preferred genre: ${genre.name}`);

            ranked.set(item.id, {
              item,
              score:
                (current?.score ?? 0) +
                preferenceWeight +
                positionWeight,
              reasons
            });
          });
        });

        if (!controller.signal.aborted) {
          setItems(
            [...ranked.values()]
              .sort((left, right) => right.score - left.score)
              .slice(0, 12)
              .map((entry) => ({
                item: entry.item,
                reasons: [...entry.reasons].slice(0, 2)
              }))
          );
        }
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
  }, [genreKey, language, status]);

  if (!genres.length) return null;
  if (!loading && !items.length) return null;

  return (
    <section className="preferred-genre-recommendations">
      <div className="discovery-heading">
        <div>
          <p className="eyebrow">Your genres</p>
          <h2>From your preferred genres</h2>
          <p>
            Ranked from your explicit genre choices and current discovery language.
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
