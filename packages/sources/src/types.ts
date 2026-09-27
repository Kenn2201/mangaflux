export type SourceId = string & { readonly __sourceId: unique symbol };

export type SourceDescriptor = {
  id: SourceId;
  name: string;
  enabled: boolean;
  homepageUrl: string;
  capabilities: SourceCapabilities;
  policy: SourcePolicy;
};

export type MangaRef = {
  source: SourceId;
  mangaId: string;
};

export type ChapterRef = {
  source: SourceId;
  chapterId: string;
};

export type SourceCapability =
  | "search"
  | "discovery"
  | "tags"
  | "details"
  | "related"
  | "chapters"
  | "pages"
  | "health";

export type SourceContentClass = "general" | "explicit";
export type SourceRole = "primary" | "coverage" | "experimental";
export type SourceMediaType = "manga" | "manhwa" | "manhua";
export type SourceFailureMode = "critical" | "isolated";

export type SourceCapabilities = Readonly<{
  search: boolean;
  discovery: boolean;
  tags: boolean;
  details: boolean;
  related: boolean;
  chapters: boolean;
  pages: boolean;
  health: boolean;
  discoveryKinds: readonly MangaDiscoveryKind[];
  languages: readonly string[];
}>;

export type SourcePolicy = Readonly<{
  attributionRequired: boolean;
  attributionName: string;
  attributionUrl: string;
  contentClass: SourceContentClass;
  role: SourceRole;
  mediaTypes: readonly SourceMediaType[];
  failureMode: SourceFailureMode;
  allowedImageHosts: readonly string[];
  cache: {
    searchSeconds: number;
    metadataSeconds: number;
    chaptersSeconds: number;
  };
  requests: {
    publicApiOnly: boolean;
    htmlAdapterAllowed: boolean;
    bypassProtectedAccess: false;
    minIntervalMs: number;
    maxConcurrentRequests: number;
  };
}>;

export class UnsupportedSourceCapabilityError extends Error {
  constructor(
    public readonly sourceId: string,
    public readonly capability: SourceCapability
  ) {
    super(`Source ${sourceId} does not support ${capability}`);
    this.name = "UnsupportedSourceCapabilityError";
  }
}

export type MangaSummary = {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
  altTitles?: string[];
  year?: number;
  tags?: string[];
  contentRating?: string;
};

export type MangaCreator = {
  id: string;
  name: string;
  role: "author" | "artist";
};

export type MangaRelated = MangaSummary & {
  relation: string;
};

export type MangaDetails = MangaSummary & {
  description?: string;
  status?: string;
  originalLanguage?: string;
  authors?: string[];
  artists?: string[];
  creators?: MangaCreator[];
  externalUrl?: string;
  tagDetails?: MangaTag[];
};

export type MangaTag = {
  id: string;
  name: string;
  group?: string;
};

export type MangaDiscoveryKind =
  | "popular"
  | "top"
  | "latest"
  | "hot"
  | "trending";

export type MangaPublicationStatus =
  | "ongoing"
  | "completed"
  | "hiatus"
  | "cancelled";

export type SourceHealth = {
  id: string;
  name: string;
  status: "operational" | "degraded" | "unavailable";
  latencyMs: number;
  checkedAt: string;
};

export type MangaListPage = {
  items: MangaSummary[];
  total: number;
  limit: number;
  offset: number;
};

export type SearchOptions = {
  limit?: number;
};

export type DiscoveryOptions = {
  limit?: number;
  offset?: number;
  tagId?: string;
  year?: number;
  creatorId?: string;
  status?: MangaPublicationStatus;
  language?: string;
};

export type Chapter = {
  id: string;
  mangaId: string;
  source: string;
  title: string;
  chapter?: string;
  volume?: string;
  language?: string;
  publishedAt?: string;
  scanlationGroups?: string[];
  externalUrl?: string;
};

export type ChapterOrder = "asc" | "desc";

export type ChapterOptions = {
  language?: string;
  limit?: number;
  offset?: number;
  order?: ChapterOrder;
  chapter?: string;
};

export type ChapterListPage = {
  items: Chapter[];
  total: number;
  limit: number;
  offset: number;
  order: ChapterOrder;
};

export type Page = {
  index: number;
  imageUrl: string;
  dataSaverUrl?: string;
};

export type ChapterPages = {
  chapter: Chapter;
  pages: Page[];
  dataSaver: boolean;
  attribution: {
    sourceName: string;
    sourceUrl: string;
    scanlationGroups: string[];
  };
};

export type PageOptions = {
  dataSaver?: boolean;
};

export interface MangaSource {
  id: string;
  name: string;
  search(query: string, options?: SearchOptions): Promise<MangaSummary[]>;
  discover(
    kind: MangaDiscoveryKind,
    options?: DiscoveryOptions
  ): Promise<MangaListPage>;
  tags(): Promise<MangaTag[]>;
  details(id: string): Promise<MangaDetails>;
  related(id: string): Promise<MangaRelated[]>;
  health(): Promise<SourceHealth>;
  chapterPage(id: string, options?: ChapterOptions): Promise<ChapterListPage>;
  chapters(id: string, options?: ChapterOptions): Promise<Chapter[]>;
  pages(chapterId: string, options?: PageOptions): Promise<ChapterPages>;
}
