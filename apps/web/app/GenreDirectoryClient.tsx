"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState
} from "react";

type MangaTag = {
  id: string;
  name: string;
  group?: string;
};

export default function GenreDirectoryClient() {
  const [items, setItems] = useState<MangaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  async function load() {
    setLoading(true);
    setFailed(false);

    try {
      const response = await fetch("/api/genres", {
        cache: "no-store"
      });

      if (!response.ok) throw new Error("Genres unavailable");

      const payload = (await response.json()) as {
        items: MangaTag[];
      };

      setItems(payload.items);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const sections = useMemo(() => {
    const genres = items.filter((item) => item.group === "genre");
    const themes = items.filter((item) => item.group === "theme");
    const formats = items.filter(
      (item) =>
        item.group !== "genre" &&
        item.group !== "theme" &&
        item.group !== "content"
    );

    return [
      { title: "Genres", items: genres },
      { title: "Themes", items: themes },
      { title: "More tags", items: formats }
    ].filter((section) => section.items.length);
  }, [items]);

  if (loading) {
    return (
      <div className="genre-directory-grid" aria-busy="true">
        {Array.from({ length: 24 }).map((_, index) => (
          <span className="skeleton" key={index} />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <section className="panel compact">
        <h2>Genres didn&apos;t load.</h2>
        <p>Search and other discovery features still work.</p>
        <button className="secondary-button" type="button" onClick={() => void load()}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="genre-directory-sections">
      {sections.map((section) => (
        <section key={section.title}>
          <div className="discovery-heading">
            <div>
              <p className="eyebrow">Browse</p>
              <h2>{section.title}</h2>
            </div>
          </div>

          <div className="genre-directory-grid">
            {section.items.map((tag) => (
              <Link
                key={tag.id}
                href={`/browse?kind=popular&tag=${encodeURIComponent(
                  tag.id
                )}&name=${encodeURIComponent(tag.name)}`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
