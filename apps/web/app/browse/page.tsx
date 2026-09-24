import BrowseClient from "../BrowseClient";

type DiscoveryKind = "hot" | "popular" | "top" | "latest";
const kinds = new Set<DiscoveryKind>([
  "hot",
  "popular",
  "top",
  "latest"
]);

export const metadata = {
  title: "Browse"
};

export default async function BrowsePage({
  searchParams
}: {
  searchParams: Promise<{
    kind?: string | string[];
    page?: string | string[];
    tag?: string | string[];
    name?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const rawKind = Array.isArray(params.kind)
    ? params.kind[0]
    : params.kind;
  const kind = kinds.has(rawKind as DiscoveryKind)
    ? (rawKind as DiscoveryKind)
    : "popular";

  const rawPage = Number(
    Array.isArray(params.page) ? params.page[0] : params.page
  );
  const page =
    Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 400
      ? rawPage
      : 1;

  const tagId = (
    Array.isArray(params.tag) ? params.tag[0] : params.tag
  )?.slice(0, 80);
  const tagName = (
    Array.isArray(params.name) ? params.name[0] : params.name
  )?.slice(0, 80);

  return (
    <main className="browse-page">
      <BrowseClient
        kind={kind}
        page={page}
        tagId={tagId}
        tagName={tagName}
      />
    </main>
  );
}
