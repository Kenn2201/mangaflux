import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="panel app-state-card">
        <p className="eyebrow">404 · MangaFlux</p>
        <h1 className="title-small">Page not found.</h1>
        <p className="lede">This MangaFlux route does not exist or is no longer available.</p>
        <Link className="state-action" href="/">Return home</Link>
      </section>
    </main>
  );
}
