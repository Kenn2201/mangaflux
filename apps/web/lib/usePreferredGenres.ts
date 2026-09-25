"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";
import {
  PREFERRED_GENRES_EVENT,
  readPreferredGenres,
  writePreferredGenres,
  type PreferredGenre
} from "./genrePreferences";

export function usePreferredGenres() {
  const [genres, setGenres] = useState<PreferredGenre[]>([]);

  useEffect(() => {
    function sync(event?: Event) {
      if (event instanceof CustomEvent && Array.isArray(event.detail)) {
        setGenres(event.detail as PreferredGenre[]);
        return;
      }

      setGenres(readPreferredGenres());
    }

    sync();
    window.addEventListener(PREFERRED_GENRES_EVENT, sync);

    return () => {
      window.removeEventListener(PREFERRED_GENRES_EVENT, sync);
    };
  }, []);

  const updateGenres = useCallback((next: PreferredGenre[]) => {
    if (writePreferredGenres(next)) {
      setGenres(next.slice(0, 3));
      return true;
    }

    return false;
  }, []);

  return {
    genres,
    setGenres: updateGenres
  };
}
