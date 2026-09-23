import SearchClient from "./SearchClient";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">manga.kenncode.me</p>
        <h1>MangaFlux</h1>
        <p className="lede">
          A modular manga reader powered by source adapters. V1 currently uses
          the public MangaDex API.
        </p>
        <div className="status">V0.1 — MangaDex reader online</div>
      </section>

      <SearchClient />

      <section className="panel compact">
        <h2>V1 scope</h2>
        <p>
          Search MangaDex, open a title, choose an English chapter, and read
          directly from MangaDex&apos;s At-Home image delivery.
        </p>
      </section>

      <footer className="footer">
        MangaFlux credits MangaDex and displays scanlation-group attribution
        when provided by the API.
      </footer>
    </main>
  );
}
