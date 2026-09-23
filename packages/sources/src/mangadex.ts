import {
  fetchBinarySource,
  fetchSource
} from "@mangaflux/runtime";
import type {
  Chapter,
  ChapterPages,
  MangaDetails,
  MangaSource,
  MangaSummary
} from "./types.js";

const BASE = process.env.MANGADEX_BASE_URL ?? "https://api.mangadex.org";
const HOSTS = ["api.mangadex.org"];
const COVER_BASE = "https://uploads.mangadex.org/covers";
const USER_AGENT = "MangaFlux/0.5.1 (+https://manga.kenncode.me)";
const MANIFEST_TTL_MS = 60_000;
const SEARCH_TTL_MS = 30_000;
const DETAILS_TTL_MS = 5 * 60_000;
const CHAPTERS_TTL_MS = 60_000;
const MAX_IMAGE_BYTES = 15_000_000;
const MANGADEX_MIN_INTERVAL_MS = 250;

type Relationship = {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    name?: string;
  };
};

type MangaEntity = {
  id: string;
  attributes: {
    title: Record<string, string>;
    altTitles?: Array<Record<string, string>>;
    description?: Record<string, string>;
    status?: string;
    year?: number | null;
    originalLanguage?: string;
    tags?: Array<{ attributes?: { name?: Record<string, string> } }>;
  };
  relationships?: Relationship[];
};

type MangaDexCollection<T> = {
  data: T[];
  limit?: number;
  offset?: number;
  total?: number;
};

type MangaDexEntityResponse<T> = {
  data: T;
};

type ChapterEntity = {
  id: string;
  attributes: {
    title?: string | null;
    chapter?: string | null;
    volume?: string | null;
    translatedLanguage?: string;
    publishAt?: string;
  };
  relationships?: Relationship[];
};

type AtHomeResponse = {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const atHomeCache = new Map<string, CacheEntry<AtHomeResponse>>();
const searchCache = new Map<string, CacheEntry<MangaSummary[]>>();
const detailsCache = new Map<string, CacheEntry<MangaDetails>>();
const chaptersCache = new Map<string, CacheEntry<Chapter[]>>();

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function readCache<T>(cache: Map<string, CacheEntry<T>>, key: string) {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return entry.value;
}

function writeCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttlMs: number
) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

async function paceMangaDexRequest<T>(task: () => Promise<T>) {
  let release!: () => void;
  const previous = requestQueue;

  requestQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    const waitFor = Math.max(
      0,
      MANGADEX_MIN_INTERVAL_MS - (Date.now() - lastRequestAt)
    );

    if (waitFor > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitFor));
    }

    lastRequestAt = Date.now();
    return await task();
  } finally {
    release();
  }
}

function mangaDexHeaders() {
  return {
    "User-Agent": USER_AGENT,
    Accept: "application/json"
  };
}

async function mangaDexFetch(url: string) {
  return paceMangaDexRequest(() =>
    fetchSource(url, {
      allowedHosts: HOSTS,
      init: { headers: mangaDexHeaders() }
    })
  );
}

function pickText(values: Record<string, string> | undefined) {
  if (!values) return undefined;
  return values.en ?? Object.values(values)[0];
}

function coverUrl(item: MangaEntity, size = 512) {
  const cover = item.relationships?.find(
    (relationship) => relationship.type === "cover_art"
  );
  const fileName = cover?.attributes?.fileName;
  if (!fileName) return undefined;
  return `${COVER_BASE}/${item.id}/${fileName}.${size}.jpg`;
}

function relationshipNames(item: { relationships?: Relationship[] }, type: string) {
  return (item.relationships ?? [])
    .filter((relationship) => relationship.type === type)
    .map((relationship) => relationship.attributes?.name)
    .filter((name): name is string => Boolean(name));
}

function mangaSummary(item: MangaEntity): MangaSummary {
  const altTitles = (item.attributes.altTitles ?? [])
    .map((entry) => pickText(entry))
    .filter((title): title is string => Boolean(title));

  return {
    id: item.id,
    source: "mangadex",
    title: pickText(item.attributes.title) ?? "Untitled",
    coverUrl: coverUrl(item),
    altTitles
  };
}

function chapterFromEntity(item: ChapterEntity, mangaId = ""): Chapter {
  const chapterNumber = item.attributes.chapter ?? undefined;
  const title = item.attributes.title?.trim() || (
    chapterNumber ? `Chapter ${chapterNumber}` : "Oneshot"
  );

  return {
    id: item.id,
    mangaId,
    source: "mangadex",
    title,
    chapter: chapterNumber,
    volume: item.attributes.volume ?? undefined,
    language: item.attributes.translatedLanguage,
    publishedAt: item.attributes.publishAt,
    scanlationGroups: relationshipNames(item, "scanlation_group"),
    externalUrl: `https://mangadex.org/chapter/${item.id}`
  };
}

async function getChapter(chapterId: string) {
  const url = new URL(`/chapter/${encodeURIComponent(chapterId)}`, BASE);
  url.searchParams.append("includes[]", "scanlation_group");

  const response = await mangaDexFetch(url.toString());
  if (!response.ok) {
    throw new Error(`MangaDex chapter lookup failed with ${response.status}`);
  }

  return response.json<MangaDexEntityResponse<ChapterEntity>>().data;
}

async function getAtHomeManifest(chapterId: string) {
  const cached = readCache(atHomeCache, chapterId);
  if (cached) return cached;

  const atHomeUrl = new URL(
    `/at-home/server/${encodeURIComponent(chapterId)}`,
    BASE
  );
  atHomeUrl.searchParams.set("forcePort443", "true");

  const response = await mangaDexFetch(atHomeUrl.toString());
  if (!response.ok) {
    throw new Error(`MangaDex At-Home lookup failed with ${response.status}`);
  }

  const value = response.json<AtHomeResponse>();
  const base = new URL(value.baseUrl);

  if (base.protocol !== "https:") {
    throw new Error("MangaDex returned a non-HTTPS image server");
  }

  writeCache(atHomeCache, chapterId, value, MANIFEST_TTL_MS);
  return value;
}

function atHomePageUrl(
  manifest: AtHomeResponse,
  pageIndex: number,
  dataSaver: boolean
) {
  const files = dataSaver
    ? manifest.chapter.dataSaver
    : manifest.chapter.data;

  const fileName = files[pageIndex - 1];
  if (!fileName) {
    throw new RangeError(`Page ${pageIndex} does not exist`);
  }

  return `${manifest.baseUrl}/${dataSaver ? "data-saver" : "data"}/${manifest.chapter.hash}/${fileName}`;
}

async function downloadPage(
  manifest: AtHomeResponse,
  pageIndex: number,
  dataSaver: boolean
) {
  const url = atHomePageUrl(manifest, pageIndex, dataSaver);
  const baseHost = new URL(manifest.baseUrl).hostname;

  const response = await fetchBinarySource(url, {
    allowedHosts: [baseHost],
    maxBytes: MAX_IMAGE_BYTES,
    timeoutMs: 20_000,
    maxRedirects: 2,
    init: {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
      }
    }
  });

  if (!response.ok) {
    throw new Error(`MangaDex image request failed with ${response.status}`);
  }

  const contentType =
    response.headers["content-type"] ?? "application/octet-stream";

  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("MangaDex returned a non-image response");
  }

  return {
    bytes: response.bytes,
    contentType
  };
}

export async function fetchMangaDexPageImage(
  chapterId: string,
  pageIndex: number,
  preferDataSaver = false
) {
  const manifest = await getAtHomeManifest(chapterId);

  try {
    return await downloadPage(manifest, pageIndex, preferDataSaver);
  } catch (error) {
    if (preferDataSaver || !manifest.chapter.dataSaver[pageIndex - 1]) {
      throw error;
    }

    return downloadPage(manifest, pageIndex, true);
  }
}

export const mangaDexSource: MangaSource = {
  id: "mangadex",
  name: "MangaDex",

  async search(query): Promise<MangaSummary[]> {
    const cacheKey = query.trim().toLowerCase();
    const cached = readCache(searchCache, cacheKey);
    if (cached) return cached;

    const url = new URL("/manga", BASE);
    url.searchParams.set("title", query);
    url.searchParams.set("limit", "24");
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.set("order[relevance]", "desc");

    const response = await mangaDexFetch(url.toString());
    if (!response.ok) {
      throw new Error(`MangaDex search failed with ${response.status}`);
    }

    const payload = response.json<MangaDexCollection<MangaEntity>>();
    const items = payload.data.map(mangaSummary);
    writeCache(searchCache, cacheKey, items, SEARCH_TTL_MS);
    return items;
  },

  async details(id): Promise<MangaDetails> {
    const cached = readCache(detailsCache, id);
    if (cached) return cached;

    const url = new URL(`/manga/${encodeURIComponent(id)}`, BASE);
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.append("includes[]", "author");
    url.searchParams.append("includes[]", "artist");

    const response = await mangaDexFetch(url.toString());
    if (!response.ok) {
      throw new Error(`MangaDex details failed with ${response.status}`);
    }

    const item = response.json<MangaDexEntityResponse<MangaEntity>>().data;
    const summary = mangaSummary(item);

    const details: MangaDetails = {
      ...summary,
      description: pickText(item.attributes.description),
      status: item.attributes.status,
      year: item.attributes.year ?? undefined,
      originalLanguage: item.attributes.originalLanguage,
      tags: (item.attributes.tags ?? [])
        .map((tag) => pickText(tag.attributes?.name))
        .filter((tag): tag is string => Boolean(tag)),
      authors: relationshipNames(item, "author"),
      artists: relationshipNames(item, "artist"),
      externalUrl: `https://mangadex.org/title/${item.id}`
    };

    writeCache(detailsCache, id, details, DETAILS_TTL_MS);
    return details;
  },

  async chapters(id, options): Promise<Chapter[]> {
    const language = options?.language?.trim() || "en";
    const cacheKey = `${id}:${language.toLowerCase()}`;
    const cached = readCache(chaptersCache, cacheKey);
    if (cached) return cached;

    const url = new URL(`/manga/${encodeURIComponent(id)}/feed`, BASE);

    url.searchParams.set("limit", "100");
    url.searchParams.set("offset", "0");
    url.searchParams.append("translatedLanguage[]", language);
    url.searchParams.append("includes[]", "scanlation_group");
    url.searchParams.set("order[chapter]", "desc");

    const response = await mangaDexFetch(url.toString());
    if (!response.ok) {
      throw new Error(`MangaDex chapters failed with ${response.status}`);
    }

    const payload = response.json<MangaDexCollection<ChapterEntity>>();
    const items = payload.data.map((chapter) => chapterFromEntity(chapter, id));
    writeCache(chaptersCache, cacheKey, items, CHAPTERS_TTL_MS);
    return items;
  },

  async pages(chapterId, options): Promise<ChapterPages> {
    const [chapter, atHome] = await Promise.all([
      getChapter(chapterId),
      getAtHomeManifest(chapterId)
    ]);

    const normalPages = atHome.chapter.data;
    const saverPages = atHome.chapter.dataSaver;
    const dataSaver = options?.dataSaver ?? false;
    const files = dataSaver ? saverPages : normalPages;

    const pages = files.map((fileName, index) => ({
      index: index + 1,
      imageUrl: `${atHome.baseUrl}/${dataSaver ? "data-saver" : "data"}/${atHome.chapter.hash}/${fileName}`,
      dataSaverUrl: saverPages[index]
        ? `${atHome.baseUrl}/data-saver/${atHome.chapter.hash}/${saverPages[index]}`
        : undefined
    }));

    const normalizedChapter = chapterFromEntity(
      chapter,
      chapter.relationships?.find(
        (relationship) => relationship.type === "manga"
      )?.id ?? ""
    );

    return {
      chapter: normalizedChapter,
      pages,
      dataSaver,
      attribution: {
        sourceName: "MangaDex",
        sourceUrl:
          normalizedChapter.externalUrl ?? "https://mangadex.org",
        scanlationGroups: normalizedChapter.scanlationGroups ?? []
      }
    };
  }
};
