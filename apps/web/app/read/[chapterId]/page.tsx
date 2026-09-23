import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.manga.kenncode.me";

type ReaderResponse = {
  chapter: {
    id: string;
    mangaId: string;
    title: string;
    chapter?: string;
    scanlationGroups?: string[];
    externalUrl?: string;
  };
  pages: Array<{
    index: number;
    imageUrl: string;
    dataSaverUrl?: string;
  }>;
  attribution: {
    sourceName: string;
    sourceUrl: string;
    scanlationGroups: string[];
  };
};

async function getPages(chapterId: string) {
  const response = await fetch(
    `${API_URL}/api/chapter/mangadex/${encodeURIComponent(chapterId)}/pages`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("MangaFlux could not load this chapter.");
  }

  return (await response.json()) as ReaderResponse;
}

export default async function ReaderPage({
  params
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const data = await getPages(chapterId);

  return (
    <div className="reader">
      <header className="reader-header">
        <div>
          {data.chapter.mangaId ? (
            <Link className="back-link" href={`/manga/${data.chapter.mangaId}`}>
              ← Chapters
            </Link>
          ) : (
            <Link className="back-link" href="/">
              ← MangaFlux
            </Link>
          )}
          <h1 className="reader-title">
            {data.chapter.chapter
              ? `Chapter ${data.chapter.chapter}`
              : data.chapter.title}
          </h1>
        </div>

        <div className="reader-credit">
          <a href={data.attribution.sourceUrl} target="_blank" rel="noreferrer">
            Read via {data.attribution.sourceName} ↗
          </a>
          <span>
            {data.attribution.scanlationGroups.length
              ? `Scanlation: ${data.attribution.scanlationGroups.join(", ")}`
              : "Scanlation group not provided"}
          </span>
        </div>
      </header>

      <div className="reader-pages">
        {data.pages.map((page) => (
          <img
            key={page.index}
            src={page.imageUrl}
            alt={`Page ${page.index}`}
            loading={page.index <= 2 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <footer className="reader-footer">
        <a href={data.attribution.sourceUrl} target="_blank" rel="noreferrer">
          MangaDex source / chapter attribution
        </a>
      </footer>
    </div>
  );
}
