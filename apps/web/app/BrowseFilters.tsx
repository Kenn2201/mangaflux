"use client";

import {
  FormEvent,
  useEffect,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { reliableFetch } from "../lib/reliableFetch";
import { notify } from "../lib/toast";
import { discoveryLanguageOptions } from "../lib/discoveryPreferences";
import { useDiscoveryLanguage } from "../lib/useDiscoveryLanguage";

type DiscoveryKind = "hot" | "popular" | "top" | "latest";

type Genre = {
  id: string;
  name: string;
  group?: string;
};

type SavedDiscoveryFilter = {
  id: string;
  kind: DiscoveryKind;
  tagId?: string;
  tagName?: string;
  year?: number;
  status?: string;
  creatorId?: string;
  creatorName?: string;
  savedAt: string;
};

const STORAGE_KEY = "mangaflux:saved-discovery-filters:v1";
const MAX_SAVED_FILTERS = 5;
const DISCOVERY_KINDS = new Set<DiscoveryKind>([
  "hot",
  "popular",
  "top",
  "latest"
]);
const MANGA_STATUSES = new Set([
  "ongoing",
  "completed",
  "hiatus",
  "cancelled"
]);

const KIND_LABELS: Record<DiscoveryKind, string> = {
  popular: "Popular",
  top: "Top rated",
  latest: "Latest",
  hot: "Hot"
};

function readSavedFilters(): SavedDiscoveryFilter[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is SavedDiscoveryFilter => {
        if (!item || typeof item !== "object") return false;
        if (typeof item.id !== "string" || !item.id) return false;
        if (!DISCOVERY_KINDS.has(item.kind)) return false;
        if (typeof item.savedAt !== "string") return false;
        if (
          item.year !== undefined &&
          (!Number.isInteger(item.year) ||
            item.year < 1900 ||
            item.year > 2100)
        ) {
          return false;
        }
        if (
          item.status !== undefined &&
          !MANGA_STATUSES.has(item.status)
        ) {
          return false;
        }
        return true;
      })
      .slice(0, MAX_SAVED_FILTERS);
  } catch {
    return [];
  }
}

function writeSavedFilters(filters: SavedDiscoveryFilter[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(filters.slice(0, MAX_SAVED_FILTERS))
  );
}

function filterSignature(filter: Omit<SavedDiscoveryFilter, "id" | "savedAt">) {
  return [
    filter.kind,
    filter.tagId ?? "",
    filter.year ?? "",
    filter.status ?? "",
    filter.creatorId ?? ""
  ].join("|");
}

function filterHref(
  filter: Omit<SavedDiscoveryFilter, "id" | "savedAt">
) {
  const params = new URLSearchParams({
    kind: filter.kind,
    page: "1"
  });

  if (filter.tagId) {
    params.set("tag", filter.tagId);
    if (filter.tagName) params.set("name", filter.tagName);
  }

  if (filter.year) params.set("year", String(filter.year));
  if (filter.status) params.set("status", filter.status);

  if (filter.creatorId) {
    params.set("creator", filter.creatorId);
    if (filter.creatorName) {
      params.set("creatorName", filter.creatorName);
    }
  }

  return `/browse?${params.toString()}`;
}

function filterLabel(filter: SavedDiscoveryFilter) {
  const parts = [KIND_LABELS[filter.kind]];

  if (filter.tagName) parts.push(filter.tagName);
  if (filter.status) {
    parts.push(
      filter.status.charAt(0).toUpperCase() + filter.status.slice(1)
    );
  }
  if (filter.year) parts.push(String(filter.year));
  if (filter.creatorName) parts.push(filter.creatorName);

  return parts.join(" · ");
}

export default function BrowseFilters({
  kind,
  tagId,
  tagName,
  year,
  status,
  creatorId,
  creatorName
}: {
  kind: DiscoveryKind;
  tagId?: string;
  tagName?: string;
  year?: number;
  status?: string;
  creatorId?: string;
  creatorName?: string;
}) {
  const router = useRouter();
  const { language, setLanguage } = useDiscoveryLanguage();
  const [selectedKind, setSelectedKind] = useState<DiscoveryKind>(kind);
  const [selectedTag, setSelectedTag] = useState(tagId ?? "");
  const [selectedYear, setSelectedYear] = useState(year ? String(year) : "");
  const [selectedStatus, setSelectedStatus] = useState(status ?? "");
  const [savedFilters, setSavedFilters] = useState<SavedDiscoveryFilter[]>([]);
  const [genres, setGenres] = useState<Genre[]>(
    tagId && tagName
      ? [{ id: tagId, name: tagName, group: "genre" }]
      : []
  );

  useEffect(() => {
    setSavedFilters(readSavedFilters());
  }, []);

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

  function currentFilter() {
    const parsedYear = Number(selectedYear);
    const selectedGenreName =
      genres.find((item) => item.id === selectedTag)?.name ??
      (selectedTag === tagId ? tagName : undefined);

    return {
      kind: selectedKind,
      tagId: selectedTag || undefined,
      tagName: selectedTag ? selectedGenreName : undefined,
      year:
        selectedYear &&
        Number.isInteger(parsedYear) &&
        parsedYear >= 1900 &&
        parsedYear <= 2100
          ? parsedYear
          : undefined,
      status: selectedStatus || undefined,
      creatorId,
      creatorName
    };
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(filterHref(currentFilter()));
  }

  function clear() {
    setSelectedKind("popular");
    setSelectedTag("");
    setSelectedYear("");
    setSelectedStatus("");
    router.push("/browse?kind=popular&page=1");
  }

  function saveCurrent() {
    const nextFilter = currentFilter();
    const signature = filterSignature(nextFilter);

    if (
      savedFilters.some(
        (item) => filterSignature(item) === signature
      )
    ) {
      notify({
        tone: "info",
        title: "Already saved",
        message: "That discovery filter is already on this device."
      });
      return;
    }

    if (savedFilters.length >= MAX_SAVED_FILTERS) {
      notify({
        tone: "error",
        title: "Saved filter limit reached",
        message: "Remove one of your five saved filters before adding another."
      });
      return;
    }

    const item: SavedDiscoveryFilter = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...nextFilter,
      savedAt: new Date().toISOString()
    };
    const next = [item, ...savedFilters];

    try {
      writeSavedFilters(next);
      setSavedFilters(next);
      notify({
        tone: "success",
        title: "Discovery filter saved",
        message: "This preset is stored on this device."
      });
    } catch {
      notify({
        tone: "error",
        title: "Could not save filter",
        message: "Browser storage is unavailable."
      });
    }
  }

  function applySaved(filter: SavedDiscoveryFilter) {
    setSelectedKind(filter.kind);
    setSelectedTag(filter.tagId ?? "");
    setSelectedYear(filter.year ? String(filter.year) : "");
    setSelectedStatus(filter.status ?? "");
    router.push(filterHref(filter));
  }

  function removeSaved(id: string) {
    const next = savedFilters.filter((item) => item.id !== id);

    try {
      writeSavedFilters(next);
      setSavedFilters(next);
    } catch {
      notify({
        tone: "error",
        title: "Could not remove filter",
        message: "Browser storage is unavailable."
      });
    }
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
              setSelectedKind(event.target.value as DiscoveryKind)
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

        <label>
          <span>Language</span>
          <select
            value={language}
            title="Only show manga with chapters available in this language."
            onChange={(event) => {
              if (!setLanguage(event.target.value)) {
                notify({
                  tone: "error",
                  title: "Could not save language",
                  message: "Browser storage is unavailable."
                });
              }
            }}
          >
            {discoveryLanguageOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="browse-filter-actions">
          <button type="submit">Apply filters</button>
          <button type="button" className="secondary-button" onClick={saveCurrent}>
            Save
          </button>
          <button type="button" className="secondary-button" onClick={clear}>
            Clear
          </button>
        </div>
      </form>

      {savedFilters.length ? (
        <section
          className="saved-discovery-filters"
          aria-label="Saved discovery filters"
        >
          <div className="saved-discovery-heading">
            <div>
              <p className="eyebrow">Saved filters</p>
              <p>Stored on this device · {savedFilters.length}/{MAX_SAVED_FILTERS}</p>
            </div>
          </div>

          <div className="saved-discovery-list">
            {savedFilters.map((filter) => (
              <div className="saved-discovery-item" key={filter.id}>
                <button
                  type="button"
                  className="saved-discovery-apply"
                  onClick={() => applySaved(filter)}
                >
                  {filterLabel(filter)}
                </button>
                <button
                  type="button"
                  className="saved-discovery-remove"
                  aria-label={`Remove saved filter ${filterLabel(filter)}`}
                  onClick={() => removeSaved(filter.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
