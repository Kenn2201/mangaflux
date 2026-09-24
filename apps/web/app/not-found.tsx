import Link from "next/link";

export default function NotFound() {
  return (
    <main className="release-state-page">
      <section className="panel release-state-card">
        <p className="eyebrow">404 · MangaFlux</p>
        <h1 className="title-small">That page is not here.</h1>
        <p>
          The manga, chapter, or MangaFlux page may have moved or the link may
          be incomplete.
        </p>
        <div className="release-state-actions">
          <Link href="/">Go home</Link>
          <Link href="/browse?kind=popular">Browse manga</Link>
        </div>
      </section>
    </main>
  );
}
