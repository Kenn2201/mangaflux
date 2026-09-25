import {
  fetchBinarySource,
  fetchSource
} from "@mangaflux/runtime";
import type {
  Chapter,
  ChapterListPage,
  ChapterOptions,
  ChapterPages,
  DiscoveryOptions,
  MangaDetails,
  MangaDiscoveryKind,
  MangaListPage,
  MangaRelated,
  MangaSource,
  MangaSummary,
  MangaTag,
  SearchOptions,
  SourceHealth
} from "./types.js";

const BASE = process.env.MANGADEX_BASE_URL ?? "https://api.mangadex.org";
const HOSTS = ["api.mangadex.org"];
const COVER_BASE = "https://uploads.mangadex.org/covers";
const USER_AGENT = "MangaFlux/1.1.4 (+https://manga.kenncode.me)";
const MANIFEST_TTL_MS = 60_000;
const SEARCH_TTL_MS = 30_000;
const DETAILS_TTL_MS = 5 * 60_000;
const RELATED_TTL_MS = 10 * 60_000;
const CHAPTERS_TTL_MS = 60_000;
const DISCOVERY_TTL_MS = 90_000;
const TAGS_TTL_MS = 6 * 60 * 60_000;
const HOT_TTL_MS = 2 * 60_000;
const HEALTH_TTL_MS = 30_000;
const MAX_IMAGE_BYTES = 15_000_000;
const MANGADEX_MIN_INTERVAL_MS = 250;
const MAX_CACHE_ENTRIES = 400;

type Relationship = {
  id: string;
  type: string;
  attributes?: {
    fileName?: string;
    name?: string;
  };
};

type MangaTagEntity = {
  id: string;
  attributes: {
    name?: Record<string, string>;
    group?: string;
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
    contentRating?: string;
    tags?: MangaTagEntity[];
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
const relatedCache = new Map<string, CacheEntry<MangaRelated[]>>();
const chapterPageCache = new Map<string, CacheEntry<ChapterListPage>>();
const discoveryCache = new Map<string, CacheEntry<MangaListPage>>();
const hotPoolCache = new Map<string, CacheEntry<MangaSummary[]>>();
let tagsCache: CacheEntry<MangaTag[]> | undefined;
let healthCache: CacheEntry<SourceHealth> | undefined;

type SourceResponse = Awaited<ReturnType<typeof fetchSource>>;

const inFlightRequests = new Map<string, Promise<SourceResponse>>();
const cacheCounters = {
  hits: 0,
  misses: 0,
  writes: 0,
  evictions: 0,
  dedupedRequests: 0
};

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function pruneCache<T>(cache: Map<string, CacheEntry<T>>) {
  const now = Date.now();

  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
      cacheCounters.evictions += 1;
    }
  }

  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
    cacheCounters.evictions += 1;
  }
}

function readCache<T>(cache: Map<string, CacheEntry<T>>, key: string) {
  const entry = cache.get(key);

  if (!entry) {
    cacheCounters.misses += 1;
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    cacheCounters.evictions += 1;
    cacheCounters.misses += 1;
    return undefined;
  }

  cacheCounters.hits += 1;
  return entry.value;
}

function writeCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttlMs: number
) {
  pruneCache(cache);

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
  cacheCounters.writes += 1;
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
  const existing = inFlightRequests.get(url);

  if (existing) {
    cacheCounters.dedupedRequests += 1;
    return existing;
  }

  const request = paceMangaDexRequest(() =>
    fetchSource(url, {
      allowedHosts: HOSTS,
      init: { headers: mangaDexHeaders() }
    })
  );

  inFlightRequests.set(url, request);

  try {
    return await request;
  } finally {
    inFlightRequests.delete(url);
  }
}

export function getMangaDexCacheStats() {
  return {
    hits: cacheCounters.hits,
    misses: cacheCounters.misses,
    writes: cacheCounters.writes,
    evictions: cacheCounters.evictions,
    dedupedRequests: cacheCounters.dedupedRequests,
    inFlightRequests: inFlightRequests.size,
    entries:
      atHomeCache.size +
      searchCache.size +
      detailsCache.size +
      relatedCache.size +
      chapterPageCache.size +
      discoveryCache.size +
      hotPoolCache.size +
      (tagsCache ? 1 : 0) +
      (healthCache ? 1 : 0)
  };
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

function relationshipNames(
  item: { relationships?: Relationship[] },
  type: string
) {
  return (item.relationships ?? [])
    .filter((relationship) => relationship.type === type)
    .map((relationship) => relationship.attributes?.name)
    .filter((name): name is string => Boolean(name));
}

function creatorDetails(item: { relationships?: Relationship[] }) {
  return (item.relationships ?? [])
    .filter(
      (relationship) =>
        relationship.type === "author" ||
        relationship.type === "artist"
    )
    .map((relationship) => ({
      id: relationship.id,
      name: relationship.attributes?.name ?? "Unknown creator",
      role: relationship.type as "author" | "artist"
    }));
}

function mangaSummary(item: MangaEntity): MangaSummary {
  const altTitles = (item.attributes.altTitles ?? [])
    .map((entry) => pickText(entry))
    .filter((title): title is string => Boolean(title));

  const tags = (item.attributes.tags ?? [])
    .map((tag) => pickText(tag.attributes.name))
    .filter((name): name is string => Boolean(name));

  return {
    id: item.id,
    source: "mangadex",
    title: pickText(item.attributes.title) ?? "Untitled",
    coverUrl: coverUrl(item),
    altTitles,
    year: item.attributes.year ?? undefined,
    tags,
    contentRating: item.attributes.contentRating
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

function boundedLimit(value: number | undefined, fallback: number, max = 100) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(value!)));
}

function boundedOffset(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10_000, Math.floor(value!)));
}

function appendCommonMangaFilters(
  url: URL,
  options: Pick<
    DiscoveryOptions,
    "tagId" | "year" | "creatorId" | "status"
  > = {}
) {
  url.searchParams.append("includes[]", "cover_art");
  url.searchParams.append("availableTranslatedLanguage[]", "en");
  url.searchParams.set("hasAvailableChapters", "true");

  if (options.tagId) {
    url.searchParams.append("includedTags[]", options.tagId);
    url.searchParams.set("includedTagsMode", "AND");
  }

  if (options.year) {
    url.searchParams.set("year", String(options.year));
  }

  if (options.creatorId) {
    url.searchParams.set("authorOrArtist", options.creatorId);
  }

  if (options.status) {
    url.searchParams.append("status[]", options.status);
  }
}

async function fetchOrderedManga(
  kind: Exclude<MangaDiscoveryKind, "hot">,
  options: DiscoveryOptions = {}
): Promise<MangaListPage> {
  const limit = boundedLimit(options.limit, 24);
  const offset = boundedOffset(options.offset);
  const tagId = options.tagId?.trim() || undefined;
  const year =
    Number.isInteger(options.year) &&
    Number(options.year) >= 1900 &&
    Number(options.year) <= 2100
      ? Number(options.year)
      : undefined;
  const creatorId = options.creatorId?.trim() || undefined;
  const status = options.status;
  const cacheKey = [
    kind,
    limit,
    offset,
    tagId ?? "all",
    year ?? "any-year",
    creatorId ?? "any-creator",
    status ?? "any-status"
  ].join(":");

  const cached = readCache(discoveryCache, cacheKey);
  if (cached) return cached;

  const orderField =
    kind === "popular"
      ? "followedCount"
      : kind === "top"
        ? "rating"
        : "latestUploadedChapter";

  const url = new URL("/manga", BASE);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set(`order[${orderField}]`, "desc");
  appendCommonMangaFilters(url, {
    tagId,
    year,
    creatorId,
    status
  });

  const response = await mangaDexFetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `MangaDex ${kind} discovery failed with ${response.status}`
    );
  }

  const payload = response.json<MangaDexCollection<MangaEntity>>();
  const page: MangaListPage = {
    items: payload.data.map(mangaSummary),
    total: payload.total ?? payload.data.length,
    limit: payload.limit ?? limit,
    offset: payload.offset ?? offset
  };

  writeCache(discoveryCache, cacheKey, page, DISCOVERY_TTL_MS);
  return page;
}

async function buildHotPool(
  options: DiscoveryOptions = {}
) {
  const cacheKey = [
    options.tagId?.trim() || "all",
    options.year ?? "any-year",
    options.creatorId?.trim() || "any-creator",
    options.status ?? "any-status"
  ].join(":");
  const cached = readCache(hotPoolCache, cacheKey);
  if (cached) return cached;

  const [latest, popular] = await Promise.all([
    fetchOrderedManga("latest", {
      limit: 100,
      offset: 0,
      tagId: options.tagId,
      year: options.year,
      creatorId: options.creatorId,
      status: options.status
    }),
    fetchOrderedManga("popular", {
      limit: 100,
      offset: 0,
      tagId: options.tagId,
      year: options.year,
      creatorId: options.creatorId,
      status: options.status
    })
  ]);

  const ranked = new Map<
    string,
    { item: MangaSummary; score: number }
  >();

  latest.items.forEach((item, index) => {
    ranked.set(item.id, {
      item,
      score: ((100 - index) / 100) * 0.62
    });
  });

  popular.items.forEach((item, index) => {
    const current = ranked.get(item.id);
    const score = ((100 - index) / 100) * 0.38;

    ranked.set(item.id, {
      item: current?.item ?? item,
      score: (current?.score ?? 0) + score
    });
  });

  const pool = [...ranked.values()]
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.item);

  writeCache(hotPoolCache, cacheKey, pool, HOT_TTL_MS);
  return pool;
}

async function discoverManga(
  kind: MangaDiscoveryKind,
  options: DiscoveryOptions = {}
): Promise<MangaListPage> {
  if (kind !== "hot") {
    return fetchOrderedManga(kind, options);
  }

  const limit = boundedLimit(options.limit, 24);
  const offset = boundedOffset(options.offset);
  const pool = await buildHotPool(options);

  return {
    items: pool.slice(offset, offset + limit),
    total: pool.length,
    limit,
    offset
  };
}

async function listTags(): Promise<MangaTag[]> {
  if (tagsCache && tagsCache.expiresAt > Date.now()) {
    return tagsCache.value;
  }

  const url = new URL("/manga/tag", BASE);
  const response = await mangaDexFetch(url.toString());

  if (!response.ok) {
    throw new Error(`MangaDex tags failed with ${response.status}`);
  }

  const payload = response.json<MangaDexCollection<MangaTagEntity>>();
  const tags = payload.data
    .map((tag) => ({
      id: tag.id,
      name: pickText(tag.attributes.name) ?? "Unnamed",
      group: tag.attributes.group
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  tagsCache = {
    value: tags,
    expiresAt: Date.now() + TAGS_TTL_MS
  };

  return tags;
}

async function probeMangaDex(): Promise<SourceHealth> {
  if (healthCache && healthCache.expiresAt > Date.now()) {
    return healthCache.value;
  }

  const startedAt = Date.now();
  let value: SourceHealth;

  try {
    const url = new URL("/manga", BASE);
    url.searchParams.set("limit", "1");

    const response = await mangaDexFetch(url.toString());
    const latencyMs = Date.now() - startedAt;

    value = {
      id: "mangadex",
      name: "MangaDex",
      status: response.ok ? "operational" : "degraded",
      latencyMs,
      checkedAt: new Date().toISOString()
    };
  } catch {
    value = {
      id: "mangadex",
      name: "MangaDex",
      status: "unavailable",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    };
  }

  healthCache = {
    value,
    expiresAt: Date.now() + HEALTH_TTL_MS
  };

  return value;
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

  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<MangaSummary[]> {
    const limit = boundedLimit(options.limit, 24, 24);
    const cacheKey = `${query.trim().toLowerCase()}:${limit}`;
    const cached = readCache(searchCache, cacheKey);
    if (cached) return cached;

    const url = new URL("/manga", BASE);
    url.searchParams.set("title", query);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("order[relevance]", "desc");
    appendCommonMangaFilters(url);

    const response = await mangaDexFetch(url.toString());
    if (!response.ok) {
      throw new Error(`MangaDex search failed with ${response.status}`);
    }

    const payload = response.json<MangaDexCollection<MangaEntity>>();
    const items = payload.data.map(mangaSummary);
    writeCache(searchCache, cacheKey, items, SEARCH_TTL_MS);
    return items;
  },

  async discover(kind, options): Promise<MangaListPage> {
    return discoverManga(kind, options);
  },

  async tags(): Promise<MangaTag[]> {
    return listTags();
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
      originalLanguage: item.attributes.originalLanguage,
      authors: relationshipNames(item, "author"),
      artists: relationshipNames(item, "artist"),
      creators: creatorDetails(item),
      tagDetails: (item.attributes.tags ?? []).map((tag) => ({
        id: tag.id,
        name: pickText(tag.attributes.name) ?? "Unnamed",
        group: tag.attributes.group
      })),
      externalUrl: `https://mangadex.org/title/${item.id}`
    };

    writeCache(detailsCache, id, details, DETAILS_TTL_MS);
    return details;
  },

  async related(id: string): Promise<MangaRelated[]> {
    const cached = readCache(relatedCache, id);
    if (cached) return cached;

    type RelationEntity = {
      attributes?: {
        relation?: string;
      };
      relationships?: Relationship[];
    };

    const relationUrl = new URL(
      `/manga/${encodeURIComponent(id)}/relation`,
      BASE
    );

    const relationResponse = await mangaDexFetch(
      relationUrl.toString()
    );

    if (!relationResponse.ok) {
      throw new Error(
        `MangaDex relations failed with ${relationResponse.status}`
      );
    }

    const relationPayload =
      relationResponse.json<MangaDexCollection<RelationEntity>>();

    const relationByManga = new Map<string, string>();

    for (const relation of relationPayload.data) {
      const label =
        relation.attributes?.relation?.replaceAll("_", " ") ??
        "related";

      for (const relationship of relation.relationships ?? []) {
        if (relationship.type === "manga") {
          relationByManga.set(relationship.id, label);
        }
      }
    }

    const ids = [...relationByManga.keys()].slice(0, 24);

    if (!ids.length) {
      writeCache(relatedCache, id, [], RELATED_TTL_MS);
      return [];
    }

    const mangaUrl = new URL("/manga", BASE);
    mangaUrl.searchParams.set("limit", String(ids.length));
    mangaUrl.searchParams.append("includes[]", "cover_art");

    for (const relatedId of ids) {
      mangaUrl.searchParams.append("ids[]", relatedId);
    }

    const mangaResponse = await mangaDexFetch(
      mangaUrl.toString()
    );

    if (!mangaResponse.ok) {
      throw new Error(
        `MangaDex related titles failed with ${mangaResponse.status}`
      );
    }

    const mangaPayload =
      mangaResponse.json<MangaDexCollection<MangaEntity>>();

    const items = mangaPayload.data.map((item) => ({
      ...mangaSummary(item),
      relation: relationByManga.get(item.id) ?? "related"
    }));

    writeCache(relatedCache, id, items, RELATED_TTL_MS);
    return items;
  },

  async health(): Promise<SourceHealth> {
    return probeMangaDex();
  },

  async chapterPage(
    id: string,
    options: ChapterOptions = {}
  ): Promise<ChapterListPage> {
    const language = options.language?.trim() || "en";
    const limit = boundedLimit(options.limit, 50, 100);
    const offset = boundedOffset(options.offset);
    const order = options.order === "asc" ? "asc" : "desc";
    const chapter = options.chapter?.trim() || undefined;
    const cacheKey = [
      id,
      language.toLowerCase(),
      limit,
      offset,
      order,
      chapter ?? "all"
    ].join(":");

    const cached = readCache(chapterPageCache, cacheKey);
    if (cached) return cached;

    const url = chapter
      ? new URL("/chapter", BASE)
      : new URL(`/manga/${encodeURIComponent(id)}/feed`, BASE);

    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.append("translatedLanguage[]", language);
    url.searchParams.append("includes[]", "scanlation_group");

    if (chapter) {
      url.searchParams.set("manga", id);
      url.searchParams.append("chapter[]", chapter);
      url.searchParams.set("order[createdAt]", order);
    } else {
      url.searchParams.set("order[chapter]", order);
    }

    const response = await mangaDexFetch(url.toString());
    if (!response.ok) {
      throw new Error(`MangaDex chapters failed with ${response.status}`);
    }

    const payload = response.json<MangaDexCollection<ChapterEntity>>();
    const page: ChapterListPage = {
      items: payload.data.map((item) => chapterFromEntity(item, id)),
      total: payload.total ?? payload.data.length,
      limit: payload.limit ?? limit,
      offset: payload.offset ?? offset,
      order
    };

    writeCache(chapterPageCache, cacheKey, page, CHAPTERS_TTL_MS);
    return page;
  },

  async chapters(id, options): Promise<Chapter[]> {
    const page = await this.chapterPage(id, {
      ...options,
      limit: options?.limit ?? 100,
      offset: options?.offset ?? 0
    });

    return page.items;
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
