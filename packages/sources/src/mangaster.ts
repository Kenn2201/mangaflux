import type {
  Chapter, ChapterListPage, ChapterOptions, ChapterPages, DiscoveryOptions,
  MangaDetails, MangaDiscoveryKind, MangaListPage, MangaRelated, MangaSource,
  MangaSummary, MangaTag, PageOptions, SearchOptions, SourceHealth
} from "./types.js";
import { UnsupportedSourceCapabilityError } from "./types.js";

const BASE = "https://ahm7xmakki.com/api/manga";
const ORIGIN = "https://ahm7xmakki.com";
const HOME = "https://ahm7xmakki.com/manga";
const TIMEOUT_MS = 15_000;
const MIN_INTERVAL_MS = 500;
const coverCache = new Map<string, string>();
let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

type Json = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeId(value: unknown) {
  const id = text(value);
  return id && id.length <= 500 ? id : "";
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.map(text).filter(Boolean)
    : [];
}

function absoluteHttpsUrl(value: unknown) {
  const candidate = text(value);
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate, ORIGIN);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function encodeChapterRef(mangaId: string, upstreamChapterId: string) {
  const payload = JSON.stringify([mangaId, upstreamChapterId]);
  return `ms_${Buffer.from(payload, "utf8").toString("base64url")}`;
}

function decodeChapterRef(value: string) {
  if (value.startsWith("ms_")) {
    try {
      const decoded = JSON.parse(
        Buffer.from(value.slice(3), "base64url").toString("utf8")
      ) as unknown;

      if (
        Array.isArray(decoded) &&
        decoded.length === 2 &&
        typeof decoded[0] === "string" &&
        typeof decoded[1] === "string" &&
        decoded[0] &&
        decoded[1]
      ) {
        return {
          mangaId: decoded[0],
          upstreamChapterId: decoded[1]
        };
      }
    } catch {
      // Fall through to legacy compatibility below.
    }
  }

  const legacySeparator = value.lastIndexOf("::");
  if (legacySeparator >= 0) {
    return {
      mangaId: value.slice(0, legacySeparator),
      upstreamChapterId: value.slice(legacySeparator + 2)
    };
  }

  return { mangaId: "", upstreamChapterId: value };
}

async function request(params: Record<string, string>): Promise<Json> {
  let release!: () => void;
  const previous = requestQueue;
  requestQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    const waitFor = Math.max(
      0,
      MIN_INTERVAL_MS - (Date.now() - lastRequestAt)
    );

    if (waitFor > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitFor));
    }

    const url = new URL(BASE);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    lastRequestAt = Date.now();

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MangaFlux/2.3.0 (+https://manga.kenncode.me)"
      },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });

    if (!response.ok) {
      throw new Error(`MangaSter upstream returned ${response.status}`);
    }

    const body = await response.json();
    if (!body || typeof body !== "object") {
      throw new Error("Invalid MangaSter response");
    }

    return body as Json;
  } finally {
    release();
  }
}

function searchItems(body: Json): MangaSummary[] {
  const rows = Array.isArray(body.results) ? body.results : [];

  return rows.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Json;
    const id = safeId(row.sourceId ?? row.id);
    const title = text(row.name ?? row.title);

    if (!id || !title) return [];

    const coverUrl = absoluteHttpsUrl(row.cover ?? row.coverUrl);
    if (coverUrl) coverCache.set(id, coverUrl);

    return [{
      id,
      source: "mangaster",
      title,
      coverUrl
    }];
  });
}

function chapterRows(body: Json, mangaId: string): Chapter[] {
  const rows = Array.isArray(body.chapters) ? body.chapters : [];

  return rows.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Json;
    const upstreamChapterId = safeId(row.chapterId ?? row.id ?? row.sourceId);

    if (!upstreamChapterId) return [];

    const number =
      text(row.chapter ?? row.number ?? row.chapterNumber) || undefined;
    const title =
      text(row.title ?? row.name) ||
      (number ? `Chapter ${number}` : `Chapter ${index + 1}`);

    return [{
      id: encodeChapterRef(mangaId, upstreamChapterId),
      mangaId,
      source: "mangaster",
      title,
      chapter: number,
      language: "en"
    }];
  });
}

async function allChapters(id: string) {
  return chapterRows(await request({ action: "chapters", id }), id);
}

async function resolveCover(id: string, title: string, body: Json) {
  const direct = absoluteHttpsUrl(body.cover ?? body.coverUrl);
  if (direct) {
    coverCache.set(id, direct);
    return direct;
  }

  const cached = coverCache.get(id);
  if (cached) return cached;

  try {
    const matches = searchItems(
      await request({ action: "search", q: title })
    );
    return matches.find((item) => item.id === id)?.coverUrl;
  } catch {
    return undefined;
  }
}

export const mangaSterSource: MangaSource = {
  id: "mangaster",
  name: "MangaSter",

  async search(query: string, options?: SearchOptions) {
    const items = searchItems(await request({ action: "search", q: query }));
    return items.slice(0, options?.limit ?? 24);
  },

  async details(id: string): Promise<MangaDetails> {
    const body = await request({ action: "chapters", id });
    const title = text(body.name ?? body.title ?? body.mangaName) || id;
    const authors = stringList(body.authors);
    const tags = stringList(body.genres);

    return {
      id,
      source: "mangaster",
      title,
      coverUrl: await resolveCover(id, title, body),
      description: text(body.summary ?? body.description) || undefined,
      status: text(body.status) || undefined,
      authors: authors.length ? authors : undefined,
      tags: tags.length ? tags : undefined,
      externalUrl: HOME
    };
  },

  async chapterPage(id: string, options?: ChapterOptions): Promise<ChapterListPage> {
    let items = await allChapters(id);

    if (options?.chapter) {
      items = items.filter((item) => item.chapter === options.chapter);
    }

    const order = options?.order ?? "desc";
    if (order === "desc") items = [...items].reverse();

    const total = items.length;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;

    return {
      items: items.slice(offset, offset + limit),
      total,
      limit,
      offset,
      order
    };
  },

  async chapters(id: string, options?: ChapterOptions) {
    return (await this.chapterPage(id, options)).items;
  },

  async pages(chapterId: string, _options?: PageOptions): Promise<ChapterPages> {
    const { mangaId, upstreamChapterId } = decodeChapterRef(chapterId);
    const body = await request({ action: "pages", id: upstreamChapterId });
    const rawPages = Array.isArray(body.pages) ? body.pages : [];

    const pages = rawPages.flatMap((raw, index) => {
      const imageUrl =
        typeof raw === "string"
          ? raw
          : raw && typeof raw === "object"
            ? text((raw as Json).url ?? (raw as Json).imageUrl ?? (raw as Json).src)
            : "";

      if (!imageUrl || !/^https:\/\//i.test(imageUrl)) return [];

      return [{ index: index + 1, imageUrl }];
    });

    if (!pages.length) {
      throw new Error("MangaSter returned no readable pages");
    }

    const chapterNumber =
      upstreamChapterId.match(/\/c([0-9]+(?:\.[0-9]+)?)$/i)?.[1];

    return {
      chapter: {
        id: chapterId,
        mangaId: mangaId || text(body.mangaId ?? body.sourceId),
        source: "mangaster",
        title: text(body.title) || (chapterNumber ? `Chapter ${chapterNumber}` : "Chapter"),
        chapter: chapterNumber
      },
      pages,
      dataSaver: false,
      attribution: {
        sourceName: "MangaSter",
        sourceUrl: HOME,
        scanlationGroups: []
      }
    };
  },

  async health(): Promise<SourceHealth> {
    const started = Date.now();

    try {
      const body = await request({
        action: "chapters",
        id: "vagabond.3120"
      });
      const chapters = Array.isArray(body.chapters) ? body.chapters : [];

      return {
        id: "mangaster",
        name: "MangaSter",
        status: chapters.length ? "operational" : "degraded",
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString()
      };
    } catch {
      return {
        id: "mangaster",
        name: "MangaSter",
        status: "unavailable",
        latencyMs: Date.now() - started,
        checkedAt: new Date().toISOString()
      };
    }
  },

  async discover(_kind: MangaDiscoveryKind, _options?: DiscoveryOptions): Promise<MangaListPage> {
    throw new UnsupportedSourceCapabilityError("mangaster", "discovery");
  },

  async tags(): Promise<MangaTag[]> {
    throw new UnsupportedSourceCapabilityError("mangaster", "tags");
  },

  async related(_id: string): Promise<MangaRelated[]> {
    throw new UnsupportedSourceCapabilityError("mangaster", "related");
  }
};
