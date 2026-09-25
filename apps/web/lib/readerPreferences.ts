export type ReaderPreferences = {
  language: string;
  dataSaver: boolean;
  showAlternateReleases: boolean;
};

const DEFAULTS: ReaderPreferences = {
  language: "en",
  dataSaver: false,
  showAlternateReleases: false
};

const GLOBAL_KEY = "mangaflux:reader-defaults:v1";
const SERIES_PREFIX = "mangaflux:reader-series:v1:";

export const readerLanguageOptions = [
  ["en", "English"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["zh", "Chinese (Simplified)"],
  ["zh-hk", "Chinese (Traditional)"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["it", "Italian"],
  ["pt-br", "Portuguese (Brazil)"],
  ["id", "Indonesian"],
  ["vi", "Vietnamese"],
  ["th", "Thai"]
] as const;

function parse(value: string | null): Partial<ReaderPreferences> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as Partial<ReaderPreferences>;

    return {
      language:
        typeof parsed.language === "string" && parsed.language.length <= 12
          ? parsed.language
          : undefined,
      dataSaver:
        typeof parsed.dataSaver === "boolean"
          ? parsed.dataSaver
          : undefined,
      showAlternateReleases:
        typeof parsed.showAlternateReleases === "boolean"
          ? parsed.showAlternateReleases
          : undefined
    };
  } catch {
    return {};
  }
}

export function getReaderPreferences(mangaId?: string): ReaderPreferences {
  if (typeof window === "undefined") return DEFAULTS;

  const global = parse(window.localStorage.getItem(GLOBAL_KEY));
  const series = mangaId
    ? parse(
        window.localStorage.getItem(
          `${SERIES_PREFIX}${mangaId}`
        )
      )
    : {};

  const legacyDataSaver =
    window.localStorage.getItem("mangaflux:data-saver") === "true";

  return {
    language: series.language ?? global.language ?? DEFAULTS.language,
    dataSaver:
      series.dataSaver ??
      global.dataSaver ??
      legacyDataSaver ??
      DEFAULTS.dataSaver,
    showAlternateReleases:
      series.showAlternateReleases ??
      global.showAlternateReleases ??
      DEFAULTS.showAlternateReleases
  };
}

export function saveReaderPreferences(
  preferences: ReaderPreferences,
  mangaId?: string,
  scope: "series" | "global" = mangaId ? "series" : "global"
) {
  if (typeof window === "undefined") return;

  const key =
    scope === "series" && mangaId
      ? `${SERIES_PREFIX}${mangaId}`
      : GLOBAL_KEY;

  window.localStorage.setItem(key, JSON.stringify(preferences));
  window.localStorage.setItem(
    "mangaflux:data-saver",
    String(preferences.dataSaver)
  );

  window.dispatchEvent(
    new CustomEvent("mangaflux:reader-preferences", {
      detail: {
        mangaId: scope === "series" ? mangaId : undefined,
        preferences
      }
    })
  );
}

export function clearSeriesReaderPreferences(mangaId: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(`${SERIES_PREFIX}${mangaId}`);
  window.dispatchEvent(
    new CustomEvent("mangaflux:reader-preferences", {
      detail: { mangaId }
    })
  );
}
