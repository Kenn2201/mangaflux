import AccountStatus from "./AccountStatus";
import LibraryClient from "./LibraryClient";
import SearchClient from "./SearchClient";

type HomeSearchParams = {
  q?: string | string[];
};

export default async function Home({
  searchParams
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.q)
    ? params.q[0] ?? ""
    : params.q ?? "";

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">manga.kenncode.me</p>
        <h1>MangaFlux</h1>
        <p className="lede">
          A modular manga reader powered by source adapters. V1 currently uses
          the public MangaDex API.
        </p>
        <div className="hero-status-row">
          <div className="status">v0.5.0 — Authentication</div>
          <AccountStatus />
        </div>
      </section>

      {!initialQuery ? <LibraryClient /> : null}

      <SearchClient initialQuery={initialQuery} />

      <section className="panel compact">
        <h2>V1 scope</h2>
        <p>
          Search, read, bookmark, and resume manga with device-scoped progress
          stored in Neon. Sign in to sync your library and progress through
          an account instead of only this browser.
        </p>
      </section>

      <footer className="footer">
        MangaFlux credits MangaDex and displays scanlation-group attribution
        when provided by the API.
      </footer>
    </main>
  );
}
