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
        <div className="status">v0.3.0 — Reader UX</div>
      </section>

      <SearchClient initialQuery={initialQuery} />

      <section className="panel compact">
        <h2>V1 scope</h2>
        <p>
          Search MangaDex, open a title, choose an English chapter, and read
          through MangaFlux&apos;s bounded image proxy with page tracking and
          preserved navigation state.
        </p>
      </section>

      <footer className="footer">
        MangaFlux credits MangaDex and displays scanlation-group attribution
        when provided by the API.
      </footer>
    </main>
  );
}
