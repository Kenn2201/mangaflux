import { redirect } from "next/navigation";
import DiscoverySections from "./DiscoverySections";
import GenreShelf from "./GenreShelf";
import LandingSessionCta from "./LandingSessionCta";

type HomeSearchParams = {
  q?: string | string[];
};

export default async function Home({
  searchParams
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const oldQuery = Array.isArray(params.q)
    ? params.q[0] ?? ""
    : params.q ?? "";

  if (oldQuery.trim()) {
    redirect(`/search?q=${encodeURIComponent(oldQuery.trim())}`);
  }

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">Mobile-first manga discovery</p>
          <h1>Find it. Read it. Never lose your page.</h1>
          <p className="lede">
            MangaFlux turns MangaDex discovery, a focused vertical reader,
            bookmarks, and synced reading progress into one fast mobile
            experience.
          </p>

          <LandingSessionCta />

          <div className="landing-trust-row">
            <span>Verified accounts</span>
            <span>Cross-device progress</span>
            <span>MangaDex attribution</span>
          </div>
        </div>

        <div className="landing-preview" aria-hidden="true">
          <div className="landing-phone">
            <div className="landing-phone-top">
              <span>MangaFlux</span>
              <span>Page 7 / 18</span>
            </div>
            <div className="landing-phone-art">
              <span className="landing-art-block one" />
              <span className="landing-art-block two" />
              <span className="landing-art-block three" />
            </div>
            <div className="landing-phone-progress">
              <span />
            </div>
          </div>
        </div>
      </section>

      <DiscoverySections />
      <GenreShelf />

      <section className="landing-feature-grid">
        <article>
          <p className="eyebrow">Continue anywhere</p>
          <h2>Your place follows you.</h2>
          <p>
            Reading progress, bookmarks, and Continue Reading stay connected
            to your MangaFlux account.
          </p>
        </article>

        <article>
          <p className="eyebrow">Reader first</p>
          <h2>Less chrome. More manga.</h2>
          <p>
            The reader stays focused on pages while keeping progress, quality,
            and chapter navigation close by.
          </p>
        </article>

        <article>
          <p className="eyebrow">Open architecture</p>
          <h2>Built for source adapters.</h2>
          <p>
            MangaDex powers V1 while MangaFlux keeps a modular path toward
            additional permitted providers later.
          </p>
        </article>
      </section>

      <div className="landing-version">
        v1.1.4 · Reader Typography & Accessibility
      </div>
    </main>
  );
}
