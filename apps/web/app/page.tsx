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
      <section className="hero home-hero">
        <p className="eyebrow">manga.kenncode.me</p>
        <h1>MangaFlux</h1>
        <p className="lede">
          A mobile-first manga reader with fast chapter navigation, synced
          reading progress, and a source-adapter architecture.
        </p>
        <div className="hero-status-row">
          <div className="status">v0.6.0 — Mobile UX Foundation</div>
          <div className="status status-subtle">MangaDex · V1 source</div>
        </div>
      </section>

      {!initialQuery ? <LibraryClient /> : null}

      <SearchClient initialQuery={initialQuery} />

      <section className="panel compact v1-scope-card">
        <p className="eyebrow">V1 direction</p>
        <h2>Read first. Everything else gets out of the way.</h2>
        <p>
          Search, bookmark, read, and resume on mobile with account-backed
          progress in Neon and transactional account recovery through Resend.
        </p>
      </section>
    </main>
  );
}
