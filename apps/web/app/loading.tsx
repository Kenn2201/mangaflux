import { SearchSkeleton } from "./Skeletons";

export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading MangaFlux">
      <section className="hero">
        <p className="eyebrow">MangaFlux</p>
        <h1 className="title-small">Loading…</h1>
        <p className="lede">Preparing the next page.</p>
      </section>
      <SearchSkeleton />
    </main>
  );
}
