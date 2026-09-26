"use client";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <section className="panel app-state-card" role="alert">
        <p className="eyebrow">MangaFlux</p>
        <h1 className="title-small">Something went wrong.</h1>
        <p className="lede">The page could not finish loading. Your saved account and reader data were not cleared.</p>
        <button className="state-action" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
