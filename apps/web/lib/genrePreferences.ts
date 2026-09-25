export type PreferredGenre = {
  id: string;
  name: string;
};

export const PREFERRED_GENRES_EVENT =
  "mangaflux:preferred-genres-changed";
const STORAGE_KEY = "mangaflux:preferred-genres:v1";
export const MAX_PREFERRED_GENRES = 3;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeGenre(value: unknown): PreferredGenre | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<PreferredGenre>;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  const name = typeof item.name === "string" ? item.name.trim() : "";

  if (!UUID_RE.test(id) || !name || name.length > 80) return null;

  return { id, name };
}

export function readPreferredGenres(): PreferredGenre[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const genres: PreferredGenre[] = [];

    for (const value of parsed) {
      const genre = normalizeGenre(value);
      if (!genre || seen.has(genre.id)) continue;

      seen.add(genre.id);
      genres.push(genre);

      if (genres.length >= MAX_PREFERRED_GENRES) break;
    }

    return genres;
  } catch {
    return [];
  }
}

export function writePreferredGenres(genres: PreferredGenre[]) {
  if (typeof window === "undefined") return false;

  const next: PreferredGenre[] = [];
  const seen = new Set<string>();

  for (const value of genres) {
    const genre = normalizeGenre(value);
    if (!genre || seen.has(genre.id)) continue;

    seen.add(genre.id);
    next.push(genre);

    if (next.length >= MAX_PREFERRED_GENRES) break;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent<PreferredGenre[]>(PREFERRED_GENRES_EVENT, {
        detail: next
      })
    );
    return true;
  } catch {
    return false;
  }
}
