export * from "./matching.js";
export * from "./types.js";
export {
  MANGADEX_SOURCE_ID,
  MANGASTER_SOURCE_ID,
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
export { mangaSterSource } from "./mangaster.js";
export {
  fetchMangaDexPageImage,
  getMangaDexCacheStats,
  mangaDexSource
} from "./mangadex.js";

export {
  getSourceCandidate,
  listSourceCandidates
} from "./candidates.js";
export type {
  SourceCandidate,
  SourceCandidateCheck,
  SourceCandidateState
} from "./candidates.js";
