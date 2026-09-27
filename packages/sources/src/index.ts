export * from "./types.js";
export {
  MANGADEX_SOURCE_ID,
  createChapterRef,
  createMangaRef,
  getSource,
  getSourceDescriptor,
  isAllowedSourceImageUrl,
  isSourceId,
  listSourceDescriptors,
  requireSource,
  requireSourceCapability,
  sourceSupports,
  sourceSupportsDiscoveryKind,
  sourceSupportsLanguage,
  validateSourceChapterId,
  validateSourceMangaId
} from "./registry.js";
export {
  fetchMangaDexPageImage,
  getMangaDexCacheStats,
  mangaDexSource
} from "./mangadex.js";
