const features = [
  "Pluggable source adapters",
  "Normalized manga/chapter/page contracts",
  "Lazy metadata caching",
  "Neon-ready reading progress",
  "Optional Discord notifications"
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">manga.kenncode.me</p>
        <h1>MangaFlux</h1>
        <p className="lede">One reader interface backed by modular, source-specific adapters.</p>
        <div className="status">V0.1 scaffold — source runtime in progress</div>
      </section>

      <section className="panel">
        <h2>Architecture</h2>
        <div className="flow">Web → API → Source adapter → Upstream API/HTML</div>
      </section>

      <section className="panel">
        <h2>Planned V1</h2>
        <ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      </section>
    </main>
  );
}
