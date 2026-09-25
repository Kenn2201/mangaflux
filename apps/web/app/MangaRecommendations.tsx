"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";
import MangaTile, {
  type MangaTileItem
} from "./MangaTile";
import { reliableFetch } from "../lib/reliableFetch";
import { useDiscoveryLanguage } from "../lib/useDiscoveryLanguage";

type MangaTag = {
  id: string;
  name: string;
  group?: string;
};

type MangaCreator = {
  id: string;
  name: string;
  role: "author" | "artist";
};

type RelatedItem = MangaTileItem & {
  relation: string;
};

type RankedItem = {
  item: MangaTileItem;
  score: number;
};

function usefulTags(tags: MangaTag[]) {
  const preferred = tags.filter(
    (tag) => tag.group === "genre" || tag.group === "theme"
  );

  return (preferred.length ? preferred : tags).slice(0, 2);
}

export default function MangaRecommendations({
  mangaId,
  title,
  year,
  tags,
  creators
}: {
  mangaId: string;
  title: string;
  year?: number;
  tags: MangaTag[];
  creators: MangaCreator[];
}) {
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [similar, setSimilar] = useState<MangaTileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useDiscoveryLanguage();

  const seedTags = useMemo(() => usefulTags(tags), [tags]);
  const primaryCreator = useMemo(
    () =>
      creators.find((creator) => creator.role === "author") ??
      creators[0],
    [creators]
  );
  const tagKey = seedTags.map((tag) => tag.id).join(",");
  const creatorId = primaryCreator?.id ?? "";

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPage(url: string) {
      const response = await reliableFetch(url, {
        cache: "no-store",
        signal: controller.signal
      });

      if (!response.ok) return [];

      const payload = (await response.json()) as {
        items?: MangaTileItem[];
      };

      return payload.items ?? [];
    }

    async function load() {
      setLoading(true);

      try {
        const relatedPromise = reliableFetch(
          `/api/manga/${encodeURIComponent(mangaId)}/related`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        )
          .then(async (response) => {
            if (!response.ok) return [] as RelatedItem[];

            const payload = (await response.json()) as {
              items?: RelatedItem[];
            };

            return payload.items ?? [];
          })
          .catch(() => [] as RelatedItem[]);

        const requests: Array<Promise<MangaTileItem[]>> = [];

        if (primaryCreator) {
          requests.push(
            fetchPage(
              `/api/discovery?kind=popular&limit=12&creator=${encodeURIComponent(
                primaryCreator.id
              )}&language=${encodeURIComponent(language)}`
            )
          );
        }

        seedTags.forEach((tag, index) => {
          requests.push(
            fetchPage(
              `/api/discovery?kind=${
                index === 0 ? "popular" : "top"
              }&limit=12&tag=${encodeURIComponent(
                tag.id
              )}&language=${encodeURIComponent(language)}`
            )
          );
        });

        if (year) {
          requests.push(
            fetchPage(
              `/api/discovery?kind=top&limit=12&year=${encodeURIComponent(
                String(year)
              )}&language=${encodeURIComponent(language)}`
            )
          );
        }

        const [relatedItems, ...groups] = await Promise.all([
          relatedPromise,
          ...requests
        ]);

        const relatedIds = new Set(
          relatedItems.map((item) => item.id)
        );
        const ranked = new Map<string, RankedItem>();

        groups.forEach((group, groupIndex) => {
          group.forEach((item, itemIndex) => {
            if (
              item.id === mangaId ||
              relatedIds.has(item.id)
            ) {
              return;
            }

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

        setRelated(
          relatedItems
            .filter((item) => item.id !== mangaId)
            .slice(0, 12)
        );

        setSimilar(
          [...ranked.values()]
            .sort((left, right) => right.score - left.score)
            .slice(0, 12)
            .map((entry) => entry.item)
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [
    mangaId,
    creatorId,
    tagKey,
    year,
    language
  ]);

  if (!loading && !related.length && !similar.length) {
    return null;
  }

  return (
    <section className="recommendation-stack" aria-label="Recommendations">
      {related.length ? (
        <div className="recommendation-section">
          <div className="discovery-heading recommendation-heading">
            <div>
              <p className="eyebrow">MangaDex relations</p>
              <h2>Related titles</h2>
              <p>
                Sequels, prequels, side stories, spin-offs, and other explicit
                relations when available.
              </p>
            </div>
          </div>

          <div className="discovery-rail">
            {related.map((item) => (
              <MangaTile
                item={item}
                key={item.id}
                className="recommendation-card"
              />
            ))}
          </div>
        </div>
      ) : null}

      {loading || similar.length ? (
        <div className="recommendation-section">
          <div className="discovery-heading recommendation-heading">
            <div>
              <p className="eyebrow">MangaFlux recommendations</p>
              <h2>More like {title}</h2>
              <p>
                Built from shared genres, themes, creator, and release-year
                signals.
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
              : similar.map((item) => (
                  <MangaTile
                    item={item}
                    key={item.id}
                    className="recommendation-card"
                  />
                ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
