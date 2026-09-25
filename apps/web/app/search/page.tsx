import SearchResultsClient from "../SearchResultsClient";

export const metadata = {
  title: "Search"
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (
    Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? ""
  )
    .trim()
    .slice(0, 120);

  return (
    <main className="search-results-page">
      <section className="browse-heading">
        <p className="eyebrow">Search MangaDex</p>
        <h1>
          {query ? <>Results for “{query}”</> : "Search MangaFlux"}
        </h1>
        <p>
          Search suggestions appear as you type. Explicit searches are remembered on this device so you can run them again quickly.
        </p>
      </section>

      <SearchResultsClient query={query} />
    </main>
  );
}
