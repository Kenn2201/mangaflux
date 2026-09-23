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
        <div className="status">v0.2.1 — Security Patch</div>
      </section>

      <SearchClient />

      <section className="panel compact">
        <h2>V1 scope</h2>
        <p>
          Search MangaDex, open a title, choose an English chapter, and read
          through MangaFlux&apos;s bounded image proxy with MangaDex attribution.
        </p>
      </section>

      <footer className="footer">
        MangaFlux credits MangaDex and displays scanlation-group attribution
        when provided by the API.
      </footer>
    </main>
  );
}
