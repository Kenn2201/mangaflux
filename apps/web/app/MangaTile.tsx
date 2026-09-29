import Link from "next/link";

export type MangaTileItem = {
  id: string;
  source: string;
  title: string;
  coverUrl?: string;
  year?: number;
  tags?: string[];
  contentRating?: string;
};

export default function MangaTile({
  item,
  query,
  className = ""
}: {
  item: MangaTileItem;
  query?: string;
  className?: string;
}) {
  const params = new URLSearchParams({ source: item.source });
  if (query) params.set("q", query);
  const suffix = `?${params.toString()}`;

  const sourceName =
    item.source === "mangaster"
      ? "MangaSter"
      : item.source === "mangadex"
        ? "MangaDex"
        : item.source;

  const meta = [
    sourceName,
    item.year ? String(item.year) : undefined,
    ...(item.tags ?? []).slice(0, 2)
  ].filter(Boolean);

  return (
    <Link
      className={`discovery-card ${className}`.trim()}
      href={`/manga/${encodeURIComponent(item.id)}${suffix}`}
    >
      <div className="discovery-cover">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="cover-placeholder">No cover</div>
        )}
      </div>

      <div className="discovery-card-copy">
        <strong>{item.title}</strong>
        <span>{meta.length ? meta.join(" · ") : "Manga"}</span>
      </div>
    </Link>
  );
}
