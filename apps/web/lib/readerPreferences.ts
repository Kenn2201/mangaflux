export type ReaderImageFit = "width" | "screen";
export type ReaderPageGap = "none" | "small" | "large";

export type ReaderPreferences = {
  language: string;
  dataSaver: boolean;
  showAlternateReleases: boolean;
  preferredScanlationGroup?: string;
  imageFit: ReaderImageFit;
  pageGap: ReaderPageGap;
};

type StoredReaderPreferences = ReaderPreferences & {
  updatedAt?: string;
};

type SyncedReaderPreferences = {
  mangaId: string;
  language: string;
  dataSaver: boolean;
  showAlternateReleases: boolean;
  preferredScanlationGroup?: string | null;
  imageFit: ReaderImageFit;
  pageGap: ReaderPageGap;
  updatedAt: string;
};

const DEFAULTS: ReaderPreferences = {
  language: "en",
  dataSaver: false,
  showAlternateReleases: false,
  imageFit: "width",
  pageGap: "none"
};

const GLOBAL_KEY = "mangaflux:reader-defaults:v1";
const SERIES_PREFIX = "mangaflux:reader-series:v1:";

function normalizeImageFit(
  value: unknown
): ReaderImageFit | undefined {
  return value === "width" || value === "screen"
    ? value
    : undefined;
}

function normalizePageGap(
  value: unknown
): ReaderPageGap | undefined {
  return value === "none" || value === "small" || value === "large"
    ? value
    : undefined;
}

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

function parse(value: string | null): Partial<StoredReaderPreferences> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as Partial<StoredReaderPreferences>;

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
          : undefined,
      preferredScanlationGroup:
        typeof parsed.preferredScanlationGroup === "string" &&
        parsed.preferredScanlationGroup.length <= 120
          ? parsed.preferredScanlationGroup
          : undefined,
      imageFit: normalizeImageFit(parsed.imageFit),
      pageGap: normalizePageGap(parsed.pageGap),
      updatedAt:
        typeof parsed.updatedAt === "string" &&
        !Number.isNaN(Date.parse(parsed.updatedAt))
          ? parsed.updatedAt
          : undefined
    };
  } catch {
    return {};
  }
}

function seriesKey(mangaId: string) {
  return `${SERIES_PREFIX}${mangaId}`;
}

function getStoredSeries(mangaId: string) {
  if (typeof window === "undefined") return {};

  return parse(window.localStorage.getItem(seriesKey(mangaId)));
}

export function getReaderPreferences(mangaId?: string): ReaderPreferences {
  if (typeof window === "undefined") return DEFAULTS;

  const global = parse(window.localStorage.getItem(GLOBAL_KEY));
  const series = mangaId ? getStoredSeries(mangaId) : {};

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
      DEFAULTS.showAlternateReleases,
    preferredScanlationGroup:
      series.preferredScanlationGroup ??
      global.preferredScanlationGroup,
    imageFit:
      series.imageFit ??
      global.imageFit ??
      DEFAULTS.imageFit,
    pageGap:
      series.pageGap ??
      global.pageGap ??
      DEFAULTS.pageGap
  };
}

function persistReaderPreferences(
  preferences: ReaderPreferences,
  mangaId?: string,
  scope: "series" | "global" = mangaId ? "series" : "global",
  updatedAt = new Date().toISOString()
) {
  if (typeof window === "undefined") return updatedAt;

  const key =
    scope === "series" && mangaId
      ? seriesKey(mangaId)
      : GLOBAL_KEY;

  window.localStorage.setItem(
    key,
    JSON.stringify({
      ...preferences,
      preferredScanlationGroup:
        preferences.preferredScanlationGroup || undefined,
      updatedAt
    })
  );
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

  return updatedAt;
}

export function saveReaderPreferences(
  preferences: ReaderPreferences,
  mangaId?: string,
  scope: "series" | "global" = mangaId ? "series" : "global"
) {
  return persistReaderPreferences(preferences, mangaId, scope);
}

export async function syncReaderPreferences(
  mangaId: string
): Promise<ReaderPreferences> {
  const local = getReaderPreferences(mangaId);
  const stored = getStoredSeries(mangaId);
  const localUpdatedAt = stored.updatedAt
    ? Date.parse(stored.updatedAt)
    : 0;

  try {
    const response = await fetch(
      `/api/state/reader-preferences?mangaId=${encodeURIComponent(mangaId)}`,
      { cache: "no-store" }
    );

    if (!response.ok) return local;

    const payload = (await response.json()) as {
      synced?: boolean;
      item?: SyncedReaderPreferences | null;
    };

    if (!payload.synced) return local;

    if (!payload.item) {
      const updatedAt =
        stored.updatedAt ?? new Date().toISOString();

      if (!stored.updatedAt) {
        persistReaderPreferences(local, mangaId, "series", updatedAt);
      }

      await pushReaderPreferences(mangaId, local, updatedAt);
      return local;
    }

    const remoteUpdatedAt = Date.parse(payload.item.updatedAt);

    if (localUpdatedAt > remoteUpdatedAt) {
      await pushReaderPreferences(
        mangaId,
        local,
        stored.updatedAt!
      );
      return local;
    }

    const remote: ReaderPreferences = {
      language: payload.item.language,
      dataSaver: payload.item.dataSaver,
      showAlternateReleases:
        payload.item.showAlternateReleases,
      preferredScanlationGroup:
        payload.item.preferredScanlationGroup || undefined,
      imageFit: normalizeImageFit(payload.item.imageFit) ?? DEFAULTS.imageFit,
      pageGap: normalizePageGap(payload.item.pageGap) ?? DEFAULTS.pageGap
    };

    persistReaderPreferences(
      remote,
      mangaId,
      "series",
      payload.item.updatedAt
    );

    return remote;
  } catch {
    return local;
  }
}

async function pushReaderPreferences(
  mangaId: string,
  preferences: ReaderPreferences,
  updatedAt: string
) {
  try {
    const response = await fetch("/api/state/reader-preferences", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mangaId,
        ...preferences,
        preferredScanlationGroup:
          preferences.preferredScanlationGroup ?? null,
        updatedAt
      })
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function syncSavedReaderPreferences(
  mangaId: string
) {
  if (typeof window === "undefined") return;

  const preferences = getReaderPreferences(mangaId);
  const stored = getStoredSeries(mangaId);
  const updatedAt =
    stored.updatedAt ?? persistReaderPreferences(
      preferences,
      mangaId,
      "series"
    );

  void pushReaderPreferences(mangaId, preferences, updatedAt);
}

export function clearSeriesReaderPreferences(mangaId: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(seriesKey(mangaId));
  window.dispatchEvent(
    new CustomEvent("mangaflux:reader-preferences", {
      detail: { mangaId }
    })
  );
}
