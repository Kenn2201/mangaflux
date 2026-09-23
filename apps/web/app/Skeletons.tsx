import Link from "next/link";

function Line({
  width = "100%"
}: {
  width?: string;
}) {
  return <span className="skeleton skeleton-line" style={{ width }} />;
}

export function AccountSkeleton() {
  return (
    <div className="panel account-panel account-skeleton" aria-busy="true">
      <div className="skeleton-account-head">
        <span className="skeleton skeleton-avatar" />
        <div>
          <Line width="92px" />
          <Line width="220px" />
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat skeleton-stat">
          <Line width="42px" />
          <Line width="78px" />
        </div>
        <div className="profile-stat skeleton-stat">
          <Line width="42px" />
          <Line width="92px" />
        </div>
      </div>

      <div className="skeleton skeleton-block" />
      <div className="skeleton skeleton-button" />
    </div>
  );
}

export function LibrarySkeleton() {
  return (
    <section
      id="library"
      className="library-panel panel"
      aria-label="Loading library"
      aria-busy="true"
    >
      <div className="skeleton-section-head">
        <div>
          <Line width="84px" />
          <Line width="126px" />
        </div>
      </div>

      <div className="skeleton-continue">
        <span className="skeleton skeleton-cover-small" />
        <div className="skeleton-copy">
          <Line width="110px" />
          <Line width="72%" />
          <Line width="48%" />
          <span className="skeleton skeleton-progress" />
        </div>
      </div>

      <div className="skeleton-card-row">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton-card" key={index}>
            <span className="skeleton skeleton-cover" />
            <Line width="86%" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SearchSkeleton({
  count = 6
}: {
  count?: number;
}) {
  return (
    <div className="manga-grid skeleton-search-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span className="skeleton skeleton-cover" />
          <Line width={index % 2 ? "72%" : "88%"} />
          <Line width="44%" />
        </div>
      ))}
    </div>
  );
}

export function MangaDetailsSkeleton({
  backHref
}: {
  backHref: string;
}) {
  return (
    <main>
      <Link className="back-link" href={backHref}>← Search</Link>
      <section className="details manga-details-skeleton" aria-busy="true">
        <span className="skeleton skeleton-details-cover" />

        <div className="skeleton-copy">
          <Line width="88px" />
          <Line width="82%" />
          <Line width="58%" />
          <div className="skeleton skeleton-paragraph" />
          <div className="skeleton skeleton-paragraph short" />
          <div className="skeleton skeleton-button" />
        </div>
      </section>

      <section className="panel chapters-panel">
        <Line width="150px" />
        <div className="skeleton-chapter-list">
          {Array.from({ length: 5 }).map((_, index) => (
            <span className="skeleton skeleton-chapter" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

export function ReaderSkeleton({
  backHref
}: {
  backHref: string;
}) {
  return (
    <div className="reader reader-loading" aria-busy="true">
      <header className="reader-header reader-loading-header">
        <div>
          <Link className="back-link" href={backHref}>← MangaFlux</Link>
          <span className="skeleton skeleton-reader-title" />
        </div>
        <span className="skeleton skeleton-reader-pill" />
      </header>

      <div className="reader-loading-pages">
        <span className="skeleton skeleton-reader-page" />
        <span className="skeleton skeleton-reader-page second" />
      </div>
    </div>
  );
}
