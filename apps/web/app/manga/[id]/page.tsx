import Link from "next/link";

const API_URL =
  process.env.MANGAFLUX_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.manga.kenncode.me";

type MangaDetails = {
  id: string;
  title: string;
  coverUrl?: string;
  description?: string;
  status?: string;
  year?: number;
  tags?: string[];
  authors?: string[];
  artists?: string[];
  externalUrl?: string;
};

type Chapter = {
  id: string;
  title: string;
  chapter?: string;
  volume?: string;
  language?: string;
  publishedAt?: string;
  scanlationGroups?: string[];
};

async function getManga(id: string) {
  const detailsPromise = fetch(
    `${API_URL}/api/manga/mangadex/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  const chaptersPromise = fetch(
    `${API_URL}/api/manga/mangadex/${encodeURIComponent(id)}/chapters?language=en`,
    { cache: "no-store" }
  );

  const [detailsResult, chaptersResult] = await Promise.allSettled([
    detailsPromise,
    chaptersPromise
  ]);

  if (detailsResult.status !== "fulfilled" || !detailsResult.value.ok) {
    throw new Error("Manga details are temporarily unavailable.");
  }

  const details = (await detailsResult.value.json()) as { item: MangaDetails };

  let chapters: Chapter[] = [];
  let chapterWarning = "";

  if (
    chaptersResult.status === "fulfilled" &&
    chaptersResult.value.ok
  ) {
    const payload = (await chaptersResult.value.json()) as { items: Chapter[] };
    chapters = payload.items;
  } else {
    chapterWarning = "Chapter list is temporarily unavailable. Try again shortly.";
  }

  return { manga: details.item, chapters, chapterWarning };
}

export default async function MangaPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const { manga, chapters, chapterWarning } = await getManga(id);

    return (
      <main>
        <Link className="back-link" href="/">
          ← Search
        </Link>

        <section className="details">
          <div className="details-cover">
            {manga.coverUrl ? (
              <img src={manga.coverUrl} alt="" referrerPolicy="no-referrer" />
            ) : null}
          </div>

          <div>
            <p className="eyebrow">MangaDex</p>
            <h1 className="title-small">{manga.title}</h1>
            <div className="meta-row">
              {manga.status ? <span>{manga.status}</span> : null}
              {manga.year ? <span>{manga.year}</span> : null}
            </div>

            {manga.authors?.length ? (
              <p className="muted">Author: {manga.authors.join(", ")}</p>
            ) : null}

            {manga.description ? (
              <p className="description">{manga.description}</p>
            ) : null}

            {manga.tags?.length ? (
              <div className="tag-row">
                {manga.tags.slice(0, 12).map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {manga.externalUrl ? (
              <a
                className="source-link"
                href={manga.externalUrl}
                target="_blank"
                rel="noreferrer"
              >
                View on MangaDex ↗
              </a>
            ) : null}
          </div>
        </section>

        <section className="panel chapters-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">English</p>
              <h2>Recent chapters</h2>
            </div>
            <span>{chapters.length} loaded</span>
          </div>

          {chapterWarning ? <p className="message">{chapterWarning}</p> : null}

          <div className="chapter-list">
            {chapters.map((chapter) => (
              <Link
                className="chapter-row"
                href={`/read/${chapter.id}`}
                key={chapter.id}
              >
                <div>
                  <strong>
                    {chapter.chapter ? `Chapter ${chapter.chapter}` : chapter.title}
                  </strong>
                  {chapter.title &&
                  chapter.title !== `Chapter ${chapter.chapter}` ? (
                    <span className="chapter-title">{chapter.title}</span>
                  ) : null}
                </div>
                <div className="chapter-meta">
                  {chapter.scanlationGroups?.length
                    ? chapter.scanlationGroups.join(", ")
                    : "Unknown group"}
                </div>
              </Link>
            ))}

            {!chapterWarning && chapters.length === 0 ? (
              <p className="message">No English chapters were returned.</p>
            ) : null}
          </div>
        </section>
      </main>
    );
  } catch {
    return (
      <main>
        <Link className="back-link" href="/">
          ← Search
        </Link>

        <section className="panel">
          <p className="eyebrow">MangaDex</p>
          <h2>Couldn&apos;t load this manga</h2>
          <p className="message">
            The source request failed temporarily. Go back and try the title again.
          </p>
        </section>
      </main>
    );
  }
}
