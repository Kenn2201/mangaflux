"use client";

import {
  FormEvent,
  useEffect,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { reliableFetch } from "../lib/reliableFetch";

type Genre = {
  id: string;
  name: string;
  group?: string;
};

export default function BrowseFilters({
  kind,
  tagId,
  tagName,
  year,
  status,
  creatorId,
  creatorName
}: {
  kind: "hot" | "popular" | "top" | "latest";
  tagId?: string;
  tagName?: string;
  year?: number;
  status?: string;
  creatorId?: string;
  creatorName?: string;
}) {
  const router = useRouter();
  const [selectedKind, setSelectedKind] = useState(kind);
  const [selectedTag, setSelectedTag] = useState(tagId ?? "");
  const [selectedYear, setSelectedYear] = useState(year ? String(year) : "");
  const [selectedStatus, setSelectedStatus] = useState(status ?? "");
  const [genres, setGenres] = useState<Genre[]>(
    tagId && tagName
      ? [{ id: tagId, name: tagName, group: "genre" }]
      : []
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadGenres() {
      try {
        const response = await reliableFetch(
          "/api/genres",
          {
            cache: "no-store",
            signal: controller.signal
          },
          { retries: 1 }
        );

        if (!response.ok) return;

        const payload = (await response.json()) as {
          items: Genre[];
        };

        const next = payload.items
          .filter((item) => item.group === "genre")
          .sort((left, right) => left.name.localeCompare(right.name));

        if (!controller.signal.aborted) setGenres(next);
      } catch {
        // Filtering remains useful without the optional genre list.
      }
    }

    void loadGenres();
    return () => controller.abort();
  }, []);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      kind: selectedKind,
      page: "1"
    });

    if (selectedStatus) params.set("status", selectedStatus);

    if (creatorId) {
      params.set("creator", creatorId);
      if (creatorName) params.set("creatorName", creatorName);
    }

    const parsedYear = Number(selectedYear);
    if (
      selectedYear &&
      Number.isInteger(parsedYear) &&
      parsedYear >= 1900 &&
      parsedYear <= 2100
    ) {
      params.set("year", String(parsedYear));
    }

    if (selectedTag) {
      const genre = genres.find((item) => item.id === selectedTag);
      params.set("tag", selectedTag);
      if (genre?.name) params.set("name", genre.name);
    }

    router.push(`/browse?${params.toString()}`);
  }

  function clear() {
    setSelectedKind("popular");
    setSelectedTag("");
    setSelectedYear("");
    setSelectedStatus("");
    router.push("/browse?kind=popular&page=1");
  }

  return (
    <>
      {creatorName ? (
        <div className="browse-filter-context">
          <span>Creator filter</span>
          <strong>{creatorName}</strong>
        </div>
      ) : null}

      <form className="browse-filter-bar" onSubmit={apply}>
      <label>
        <span>Sort</span>
        <select
          value={selectedKind}
          onChange={(event) =>
            setSelectedKind(
              event.target.value as
                | "hot"
                | "popular"
                | "top"
                | "latest"
            )
          }
        >
          <option value="popular">Popular</option>
          <option value="top">Top rated</option>
          <option value="latest">Latest updates</option>
          <option value="hot">MangaFlux Hot</option>
        </select>
      </label>

      <label>
        <span>Genre</span>
        <select
          value={selectedTag}
          onChange={(event) => setSelectedTag(event.target.value)}
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option value={genre.id} key={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Status</span>
        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="">Any status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label>
        <span>Year</span>
        <input
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder="Any"
          value={selectedYear}
          onChange={(event) => setSelectedYear(event.target.value)}
        />
      </label>

      <div className="browse-filter-actions">
        <button type="submit">Apply filters</button>
        <button type="button" className="secondary-button" onClick={clear}>
          Clear
        </button>
      </div>
      </form>
    </>
  );
}
