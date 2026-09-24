import GenreDirectoryClient from "../GenreDirectoryClient";

export const metadata = {
  title: "Genres"
};

export default function GenresPage() {
  return (
    <main className="genres-page">
      <section className="browse-heading">
        <p className="eyebrow">Browse MangaDex</p>
        <h1>Genres & themes</h1>
        <p>
          Explore MangaFlux discovery by genre, theme, and supported MangaDex
          tags.
        </p>
      </section>

      <GenreDirectoryClient />
    </main>
  );
}
