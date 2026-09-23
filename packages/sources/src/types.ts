export type MangaSummary = {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
  altTitles?: string[];
};

export type MangaDetails = MangaSummary & {
  description?: string;
  status?: string;
  year?: number;
  originalLanguage?: string;
  tags?: string[];
  authors?: string[];
  artists?: string[];
  externalUrl?: string;
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

export type ChapterOptions = {
  language?: string;
};

export type PageOptions = {
  dataSaver?: boolean;
};

export interface MangaSource {
  id: string;
  name: string;
  search(query: string): Promise<MangaSummary[]>;
  details(id: string): Promise<MangaDetails>;
  chapters(id: string, options?: ChapterOptions): Promise<Chapter[]>;
  pages(chapterId: string, options?: PageOptions): Promise<ChapterPages>;
}
