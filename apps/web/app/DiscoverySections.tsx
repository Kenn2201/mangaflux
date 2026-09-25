"use client";

import Link from "next/link";
import {
  useEffect,
  useState
} from "react";
import MangaTile, {
  type MangaTileItem
} from "./MangaTile";
import { reliableFetch } from "../lib/reliableFetch";
import {
  discoveryLanguageLabel,
  discoveryLanguageOptions
} from "../lib/discoveryPreferences";
import { useDiscoveryLanguage } from "../lib/useDiscoveryLanguage";

type DiscoveryPage = {
  items: MangaTileItem[];
  total: number;
  limit: number;
  offset: number;
};

type Payload = {
  sections: {
    hot: DiscoveryPage;
    popular: DiscoveryPage;
    top: DiscoveryPage;
    latest: DiscoveryPage;
  };
};

const sections = [
  {
    key: "hot" as const,
    eyebrow: "MangaFlux Hot",
    title: "Moving right now",
    description: "A MangaFlux blend of recent chapter activity and popularity."
  },
  {
    key: "popular" as const,
    eyebrow: "Popular",
    title: "Most followed",
    description: "Manga readers keep coming back to."
  },
  {
    key: "top" as const,
    eyebrow: "Top rated",
    title: "Highly rated",
    description: "Titles currently ranking strongly by MangaDex rating."
  },
  {
    key: "latest" as const,
    eyebrow: "Latest updates",
    title: "Fresh chapters",
    description: "Series with the most recent chapter activity."
  }
];

export default function DiscoverySections({
  compact = false
}: {
  compact?: boolean;
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);
  const { language, setLanguage } = useDiscoveryLanguage();

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setFailed(false);

    async function load() {
      try {
        const response = await reliableFetch(
          `/api/discovery/home?language=${encodeURIComponent(language)}`,
          { cache: "no-store" }
        );

        if (!response.ok) throw new Error("Discovery unavailable");

        const payload = (await response.json()) as Payload;
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [language]);

  if (failed) {
    return (
      <section className="panel compact discovery-fallback">
        <p className="eyebrow">Discovery</p>
        <h2>Discovery is taking a break.</h2>
        <p>
          Search and your library may still work while the source catches up.
        </p>
        <Link className="reliability-status-link" href="/status">
          Check system status →
        </Link>
      </section>
    );
  }

  return (
    <div
      className={`discovery-stack ${compact ? "is-compact" : ""}`}
      id="discover"
    >
      <div className="discovery-language-bar">
        <div className="discovery-language-copy">
          <strong>Discovery language</strong>
          <span>
            Showing manga with {discoveryLanguageLabel(language)} chapters available.
          </span>
        </div>
        <select
          aria-label="Discovery language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          {discoveryLanguageOptions.map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {sections.map((section) => {
        const page = data?.sections[section.key];

        return (
          <section className="discovery-section" key={section.key}>
            <div className="discovery-heading">
              <div>
                <p className="eyebrow">{section.eyebrow}</p>
                <h2>{section.title}</h2>
                {!compact ? <p>{section.description}</p> : null}
              </div>

              <Link href={`/browse?kind=${section.key}`}>
                Show all <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="discovery-rail" aria-busy={!page}>
              {page
                ? page.items.map((item) => (
                    <MangaTile item={item} key={item.id} />
                  ))
                : Array.from({ length: 6 }).map((_, index) => (
                    <div className="discovery-card" key={index}>
                      <span className="skeleton discovery-cover" />
                      <span className="skeleton skeleton-line" />
                      <span
                        className="skeleton skeleton-line"
                        style={{ width: "58%" }}
                      />
                    </div>
                  ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
