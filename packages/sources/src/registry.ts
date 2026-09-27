import { mangaDexSource } from "./mangadex.js";
import type { ChapterRef, MangaRef, MangaSource, SourceDescriptor, SourceId } from "./types.js";

export const MANGADEX_SOURCE_ID = "mangadex" as SourceId;

type RegisteredSource = { descriptor: SourceDescriptor; source: MangaSource };

const registeredSources = new Map<SourceId, RegisteredSource>([
  [MANGADEX_SOURCE_ID, {
    descriptor: {
      id: MANGADEX_SOURCE_ID,
      name: "MangaDex",
      enabled: true,
      homepageUrl: "https://mangadex.org"
    },
    source: mangaDexSource
  }]
]);

export function listSourceDescriptors(): SourceDescriptor[] {
  return [...registeredSources.values()].map(({ descriptor }) => ({ ...descriptor }));
}

export function isSourceId(value: string): value is SourceId {
  return registeredSources.has(value as SourceId);
}

export function getSourceDescriptor(id: string): SourceDescriptor | undefined {
  const entry = registeredSources.get(id as SourceId);
  return entry ? { ...entry.descriptor } : undefined;
}

export function getSource(id: string): MangaSource | undefined {
  const entry = registeredSources.get(id as SourceId);
  return entry?.descriptor.enabled ? entry.source : undefined;
}

export function requireSource(id: string): MangaSource {
  const source = getSource(id);
  if (!source) throw new RangeError(`Unknown or disabled manga source: ${id}`);
  return source;
}

export function createMangaRef(source: string, mangaId: string): MangaRef {
  if (!isSourceId(source)) throw new RangeError(`Unknown manga source: ${source}`);
  if (!mangaId.trim()) throw new RangeError("mangaId must not be empty");
  return { source, mangaId };
}

export function createChapterRef(source: string, chapterId: string): ChapterRef {
  if (!isSourceId(source)) throw new RangeError(`Unknown manga source: ${source}`);
  if (!chapterId.trim()) throw new RangeError("chapterId must not be empty");
  return { source, chapterId };
}
