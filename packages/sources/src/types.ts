export type MangaSummary = {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
};

export type MangaDetails = MangaSummary & {
  description?: string;
  status?: string;
};

export type Chapter = {
  id: string;
  mangaId: string;
  source: string;
  title: string;
  chapter?: string;
};

export type Page = {
  index: number;
  imageUrl: string;
};

export interface MangaSource {
  id: string;
  name: string;
  search(query: string): Promise<MangaSummary[]>;
  details(id: string): Promise<MangaDetails>;
  chapters(id: string): Promise<Chapter[]>;
  pages(chapterId: string): Promise<Page[]>;
}
