"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";
import { reliableFetch } from "../lib/reliableFetch";
import {
  MAX_PREFERRED_GENRES,
  type PreferredGenre
} from "../lib/genrePreferences";
import { usePreferredGenres } from "../lib/usePreferredGenres";
import { notify } from "../lib/toast";

type MangaTag = PreferredGenre & {
  group?: string;
};

export default function GenrePreferences({
  compact = false
}: {
  compact?: boolean;
}) {
  const { genres: preferredGenres, setGenres } = usePreferredGenres();
  const [available, setAvailable] = useState<MangaTag[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
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
          items?: MangaTag[];
        };

        const genres = (payload.items ?? [])
          .filter((item) => item.group === "genre")
          .sort((left, right) => left.name.localeCompare(right.name));

        if (!controller.signal.aborted) setAvailable(genres);
      } catch {
        // Existing preferences remain manageable if the genre list is unavailable.
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const choices = useMemo(
    () =>
      available.filter(
        (genre) => !preferredGenres.some((item) => item.id === genre.id)
      ),
    [available, preferredGenres]
  );

  function addGenre() {
    const genre = available.find((item) => item.id === selected);
    if (!genre) return;

    if (preferredGenres.length >= MAX_PREFERRED_GENRES) {
      notify({
        tone: "info",
        title: "Genre preference limit reached",
        message: "Remove one of your three preferred genres before adding another."
      });
      return;
    }

    if (!setGenres([...preferredGenres, { id: genre.id, name: genre.name }])) {
      notify({
        tone: "error",
        title: "Could not save genres",
        message: "Browser storage is unavailable."
      });
      return;
    }

    setSelected("");
  }

  function removeGenre(id: string) {
    if (!setGenres(preferredGenres.filter((genre) => genre.id !== id))) {
      notify({
        tone: "error",
        title: "Could not update genres",
        message: "Browser storage is unavailable."
      });
    }
  }

  function clearGenres() {
    if (!setGenres([])) {
      notify({
        tone: "error",
        title: "Could not clear genres",
        message: "Browser storage is unavailable."
      });
    }
  }

  return (
    <section
      className={`genre-preferences ${compact ? "is-compact" : ""}`}
      aria-label="Preferred genres"
    >
      <div className="genre-preferences-copy">
        <strong>Preferred genres</strong>
        <span>
          Pick up to three. MangaFlux uses them for a dedicated personalized discovery rail on this device.
        </span>
      </div>

      <div className="genre-preferences-controls">
        <select
          aria-label="Add preferred genre"
          value={selected}
          disabled={
            preferredGenres.length >= MAX_PREFERRED_GENRES ||
            choices.length === 0
          }
          onChange={(event) => setSelected(event.target.value)}
        >
          <option value="">
            {preferredGenres.length >= MAX_PREFERRED_GENRES
              ? "3 of 3 selected"
              : "Choose a genre"}
          </option>
          {choices.map((genre) => (
            <option value={genre.id} key={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selected || preferredGenres.length >= MAX_PREFERRED_GENRES}
          onClick={addGenre}
        >
          Add
        </button>
      </div>

      {preferredGenres.length ? (
        <div className="preferred-genre-list">
          {preferredGenres.map((genre) => (
            <span className="preferred-genre-chip" key={genre.id}>
              <span>{genre.name}</span>
              <button
                type="button"
                aria-label={`Remove preferred genre ${genre.name}`}
                onClick={() => removeGenre(genre.id)}
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            className="preferred-genre-clear"
            onClick={clearGenres}
          >
            Clear
          </button>
        </div>
      ) : null}
    </section>
  );
}
