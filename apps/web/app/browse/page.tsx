import BrowseClient from "../BrowseClient";

type DiscoveryKind = "hot" | "popular" | "top" | "latest" | "trending";
const kinds = new Set<DiscoveryKind>([
  "hot",
  "popular",
  "top",
  "latest",
  "trending"
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
    year?: string | string[];
    creator?: string | string[];
    creatorName?: string | string[];
    status?: string | string[];
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

  const rawYear = Number(
    Array.isArray(params.year) ? params.year[0] : params.year
  );
  const year =
    Number.isInteger(rawYear) && rawYear >= 1900 && rawYear <= 2100
      ? rawYear
      : undefined;

  const creatorId = (
    Array.isArray(params.creator)
      ? params.creator[0]
      : params.creator
  )?.slice(0, 80);

  const creatorName = (
    Array.isArray(params.creatorName)
      ? params.creatorName[0]
      : params.creatorName
  )?.slice(0, 100);

  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const status = [
    "ongoing",
    "completed",
    "hiatus",
    "cancelled"
  ].includes(rawStatus ?? "")
    ? rawStatus
    : undefined;

  return (
    <main className="browse-page">
      <BrowseClient
        kind={kind}
        page={page}
        tagId={tagId}
        tagName={tagName}
        year={year}
        creatorId={creatorId}
        creatorName={creatorName}
        status={status}
      />
    </main>
  );
}
