import { mangaDexSource } from "./mangadex.js";
import type {
  ChapterRef,
  MangaDiscoveryKind,
  MangaRef,
  MangaSource,
  SourceCapability,
  SourceDescriptor,
  SourceId
} from "./types.js";
import { UnsupportedSourceCapabilityError } from "./types.js";

export const MANGADEX_SOURCE_ID = "mangadex" as SourceId;

const MANGADEX_DISCOVERY_KINDS = [
  "popular", "top", "latest", "hot", "trending"
] satisfies readonly MangaDiscoveryKind[];

const MANGADEX_LANGUAGES = [
  "en", "ja", "ko", "zh", "zh-hk", "es", "fr", "de", "it", "pt-br", "id", "vi", "th"
] as const;

type RegisteredSource = {
  descriptor: SourceDescriptor;
  source: MangaSource;
  validateMangaId: (id: string) => boolean;
  validateChapterId: (id: string) => boolean;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const registeredSources = new Map<SourceId, RegisteredSource>([
  [MANGADEX_SOURCE_ID, {
    descriptor: {
      id: MANGADEX_SOURCE_ID,
      name: "MangaDex",
      enabled: true,
      homepageUrl: "https://mangadex.org",
      capabilities: {
        search: true,
        discovery: true,
        tags: true,
        details: true,
        related: true,
        chapters: true,
        pages: true,
        health: true,
        discoveryKinds: MANGADEX_DISCOVERY_KINDS,
        languages: MANGADEX_LANGUAGES
      },
      policy: {
        attributionRequired: true,
        attributionName: "MangaDex",
        attributionUrl: "https://mangadex.org",
        contentClass: "general",
        role: "primary",
        mediaTypes: ["manga", "manhwa", "manhua"],
        failureMode: "critical",
        allowedImageHosts: ["uploads.mangadex.org"],
        cache: {
          searchSeconds: 30,
          metadataSeconds: 300,
          chaptersSeconds: 60
        },
        requests: {
          publicApiOnly: true,
          htmlAdapterAllowed: false,
          bypassProtectedAccess: false,
          minIntervalMs: 250,
          maxConcurrentRequests: 1
        }
      }
    },
    source: mangaDexSource,
    validateMangaId: (id) => UUID_RE.test(id),
    validateChapterId: (id) => UUID_RE.test(id)
  }]
]);

function cloneDescriptor(descriptor: SourceDescriptor): SourceDescriptor {
  return {
    ...descriptor,
    capabilities: {
      ...descriptor.capabilities,
      discoveryKinds: [...descriptor.capabilities.discoveryKinds],
      languages: [...descriptor.capabilities.languages]
    },
    policy: {
      ...descriptor.policy,
      mediaTypes: [...descriptor.policy.mediaTypes],
      allowedImageHosts: [...descriptor.policy.allowedImageHosts],
      cache: { ...descriptor.policy.cache },
      requests: { ...descriptor.policy.requests }
    }
  };
}

export function listSourceDescriptors(): SourceDescriptor[] {
  return [...registeredSources.values()].map(({ descriptor }) => cloneDescriptor(descriptor));
}

export function isSourceId(value: string): value is SourceId {
  return registeredSources.has(value as SourceId);
}

export function getSourceDescriptor(id: string): SourceDescriptor | undefined {
  const entry = registeredSources.get(id as SourceId);
  return entry ? cloneDescriptor(entry.descriptor) : undefined;
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

export function sourceSupports(id: string, capability: SourceCapability): boolean {
  const descriptor = getSourceDescriptor(id);
  return Boolean(descriptor?.enabled && descriptor.capabilities[capability]);
}

export function requireSourceCapability(id: string, capability: SourceCapability): MangaSource {
  const source = requireSource(id);
  if (!sourceSupports(id, capability)) {
    throw new UnsupportedSourceCapabilityError(id, capability);
  }
  return source;
}

export function sourceSupportsDiscoveryKind(id: string, kind: MangaDiscoveryKind): boolean {
  const descriptor = getSourceDescriptor(id);
  return Boolean(
    descriptor?.enabled &&
    descriptor.capabilities.discovery &&
    descriptor.capabilities.discoveryKinds.includes(kind)
  );
}

export function sourceSupportsLanguage(id: string, language: string): boolean {
  const descriptor = getSourceDescriptor(id);
  return Boolean(
    descriptor?.enabled &&
    descriptor.capabilities.languages.includes(language.toLowerCase())
  );
}

export function validateSourceMangaId(source: string, mangaId: unknown): mangaId is string {
  if (typeof mangaId !== "string") return false;
  return registeredSources.get(source as SourceId)?.validateMangaId(mangaId) ?? false;
}

export function validateSourceChapterId(source: string, chapterId: unknown): chapterId is string {
  if (typeof chapterId !== "string") return false;
  return registeredSources.get(source as SourceId)?.validateChapterId(chapterId) ?? false;
}

export function isAllowedSourceImageUrl(source: string, value: string): boolean {
  const descriptor = getSourceDescriptor(source);
  if (!descriptor) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && descriptor.policy.allowedImageHosts.includes(url.hostname);
  } catch {
    return false;
  }
}

export function createMangaRef(source: string, mangaId: string): MangaRef {
  if (!isSourceId(source)) throw new RangeError(`Unknown manga source: ${source}`);
  if (!validateSourceMangaId(source, mangaId)) throw new RangeError(`Invalid manga identifier for source: ${source}`);
  return { source, mangaId };
}

export function createChapterRef(source: string, chapterId: string): ChapterRef {
  if (!isSourceId(source)) throw new RangeError(`Unknown manga source: ${source}`);
  if (!validateSourceChapterId(source, chapterId)) throw new RangeError(`Invalid chapter identifier for source: ${source}`);
  return { source, chapterId };
}
