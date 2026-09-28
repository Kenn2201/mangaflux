import type {
  Chapter, ChapterListPage, ChapterOptions, ChapterPages, DiscoveryOptions,
  MangaDetails, MangaDiscoveryKind, MangaListPage, MangaRelated, MangaSource,
  MangaSummary, MangaTag, PageOptions, SearchOptions, SourceHealth
} from "./types.js";
import { UnsupportedSourceCapabilityError } from "./types.js";

const BASE = "https://ahm7xmakki.com/api/manga";
const HOME = "https://ahm7xmakki.com/manga";
const TIMEOUT_MS = 15_000;

type Json = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeId(value: unknown) {
  const id = text(value);
  return id && id.length <= 500 ? id : "";
}

async function request(params: Record<string, string>): Promise<Json> {
  const url = new URL(BASE);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MangaFlux/2.1.7 (+https://manga.kenncode.me)" },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`MangaSter upstream returned ${response.status}`);
  const body = await response.json();
  if (!body || typeof body !== "object") throw new Error("Invalid MangaSter response");
  return body as Json;
}

function searchItems(body: Json): MangaSummary[] {
  const rows = Array.isArray(body.results) ? body.results : [];
  return rows.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Json;
    const id = safeId(row.sourceId ?? row.id);
    const title = text(row.name ?? row.title);
    if (!id || !title) return [];
    const coverUrl = text(row.cover ?? row.coverUrl) || undefined;
    return [{ id, source: "mangaster", title, coverUrl }];
  });
}

function chapterRows(body: Json, mangaId: string): Chapter[] {
  const rows = Array.isArray(body.chapters) ? body.chapters : [];
  return rows.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Json;
    const id = safeId(row.chapterId ?? row.id ?? row.sourceId);
    if (!id) return [];
    const number = text(row.chapter ?? row.number ?? row.chapterNumber) || undefined;
    const title = text(row.title ?? row.name) || (number ? `Chapter ${number}` : `Chapter ${index + 1}`);
    return [{ id: `${mangaId}::${id}`, mangaId, source: "mangaster", title, chapter: number, language: "en" }];
  });
}

async function allChapters(id: string) {
  return chapterRows(await request({ action: "chapters", id }), id);
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
    return {
      id,
      source: "mangaster",
      title: text(body.name ?? body.title ?? body.mangaName) || id,
      coverUrl: text(body.cover ?? body.coverUrl) || undefined,
      description: text(body.description) || undefined,
      status: text(body.status) || undefined,
      externalUrl: HOME
    };
  },

  async chapterPage(id: string, options?: ChapterOptions): Promise<ChapterListPage> {
    let items = await allChapters(id);
    if (options?.chapter) items = items.filter((item) => item.chapter === options.chapter);
    const order = options?.order ?? "desc";
    if (order === "desc") items = [...items].reverse();
    const total = items.length;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    return { items: items.slice(offset, offset + limit), total, limit, offset, order };
  },

  async chapters(id: string, options?: ChapterOptions) {
    return (await this.chapterPage(id, options)).items;
  },

  async pages(chapterId: string, _options?: PageOptions): Promise<ChapterPages> {
    const separator = chapterId.lastIndexOf("::");
    const mangaId = separator >= 0 ? chapterId.slice(0, separator) : "";
    const upstreamChapterId = separator >= 0 ? chapterId.slice(separator + 2) : chapterId;
    const body = await request({ action: "pages", id: upstreamChapterId });
    const rawPages = Array.isArray(body.pages) ? body.pages : [];
    const pages = rawPages.flatMap((raw, index) => {
      const imageUrl = typeof raw === "string"
        ? raw
        : raw && typeof raw === "object"
          ? text((raw as Json).url ?? (raw as Json).imageUrl ?? (raw as Json).src)
          : "";
      if (!imageUrl || !/^https:\/\//i.test(imageUrl)) return [];
      return [{ index: index + 1, imageUrl }];
    });
    if (!pages.length) throw new Error("MangaSter returned no readable pages");
    return {
      chapter: { id: chapterId, mangaId: mangaId || text(body.mangaId ?? body.sourceId), source: "mangaster", title: text(body.title) || "Chapter" },
      pages,
      dataSaver: false,
      attribution: { sourceName: "MangaSter", sourceUrl: HOME, scanlationGroups: [] }
    };
  },

  async health(): Promise<SourceHealth> {
    const started = Date.now();
    try {
      const items = searchItems(await request({ action: "search", q: "naruto" }));
      return { id: "mangaster", name: "MangaSter", status: items.length ? "operational" : "degraded", latencyMs: Date.now() - started, checkedAt: new Date().toISOString() };
    } catch {
      return { id: "mangaster", name: "MangaSter", status: "unavailable", latencyMs: Date.now() - started, checkedAt: new Date().toISOString() };
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
