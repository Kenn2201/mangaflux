import { fetchSource } from "@mangaflux/runtime";
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

  const response = await fetchSource(url.toString(), { allowedHosts: HOSTS });
  if (!response.ok) {
    throw new Error(`MangaDex chapter lookup failed with ${response.status}`);
  }

  return response.json<MangaDexEntityResponse<ChapterEntity>>().data;
}

export const mangaDexSource: MangaSource = {
  id: "mangadex",
  name: "MangaDex",

  async search(query): Promise<MangaSummary[]> {
    const url = new URL("/manga", BASE);
    url.searchParams.set("title", query);
    url.searchParams.set("limit", "24");
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.set("order[relevance]", "desc");

    const response = await fetchSource(url.toString(), { allowedHosts: HOSTS });
    if (!response.ok) {
      throw new Error(`MangaDex search failed with ${response.status}`);
    }

    const payload = response.json<MangaDexCollection<MangaEntity>>();
    return payload.data.map(mangaSummary);
  },

  async details(id): Promise<MangaDetails> {
    const url = new URL(`/manga/${encodeURIComponent(id)}`, BASE);
    url.searchParams.append("includes[]", "cover_art");
    url.searchParams.append("includes[]", "author");
    url.searchParams.append("includes[]", "artist");

    const response = await fetchSource(url.toString(), { allowedHosts: HOSTS });
    if (!response.ok) {
      throw new Error(`MangaDex details failed with ${response.status}`);
    }

    const item = response.json<MangaDexEntityResponse<MangaEntity>>().data;
    const summary = mangaSummary(item);

    return {
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
  },

  async chapters(id, options): Promise<Chapter[]> {
    const language = options?.language?.trim() || "en";
    const url = new URL(`/manga/${encodeURIComponent(id)}/feed`, BASE);

    url.searchParams.set("limit", "100");
    url.searchParams.set("offset", "0");
    url.searchParams.append("translatedLanguage[]", language);
    url.searchParams.append("includes[]", "scanlation_group");
    url.searchParams.set("order[chapter]", "desc");

    const response = await fetchSource(url.toString(), { allowedHosts: HOSTS });
    if (!response.ok) {
      throw new Error(`MangaDex chapters failed with ${response.status}`);
    }

    const payload = response.json<MangaDexCollection<ChapterEntity>>();
    return payload.data.map((chapter) => chapterFromEntity(chapter, id));
  },

  async pages(chapterId, options): Promise<ChapterPages> {
    const atHomeUrl = new URL(
      `/at-home/server/${encodeURIComponent(chapterId)}`,
      BASE
    );
    atHomeUrl.searchParams.set("forcePort443", "true");

    const [chapter, atHomeResponse] = await Promise.all([
      getChapter(chapterId),
      fetchSource(atHomeUrl.toString(), { allowedHosts: HOSTS })
    ]);

    if (!atHomeResponse.ok) {
      throw new Error(`MangaDex At-Home lookup failed with ${atHomeResponse.status}`);
    }

    const atHome = atHomeResponse.json<AtHomeResponse>();
    const base = new URL(atHome.baseUrl);
    if (base.protocol !== "https:") {
      throw new Error("MangaDex returned a non-HTTPS image server");
    }

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
      chapter.relationships?.find((relationship) => relationship.type === "manga")?.id ?? ""
    );

    return {
      chapter: normalizedChapter,
      pages,
      dataSaver,
      attribution: {
        sourceName: "MangaDex",
        sourceUrl: normalizedChapter.externalUrl ?? "https://mangadex.org",
        scanlationGroups: normalizedChapter.scanlationGroups ?? []
      }
    };
  }
};
