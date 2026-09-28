export type SourceCandidateState =
  | "qualified"
  | "blocked"
  | "rejected";

export type SourceCandidateCheck =
  | "pass"
  | "fail"
  | "unverified"
  | "not-applicable";

export type SourceCandidate = Readonly<{
  id: string;
  name: string;
  homepageUrl: string;
  state: SourceCandidateState;
  intendedRole: "coverage" | "experimental";
  mediaTypes: readonly ("manga" | "manhwa" | "manhua")[];
  checks: {
    documentedDeveloperApi: SourceCandidateCheck;
    liveHealth: SourceCandidateCheck;
    search: SourceCandidateCheck;
    details: SourceCandidateCheck;
    chapters: SourceCandidateCheck;
    pages: SourceCandidateCheck;
    stableIds: SourceCandidateCheck;
    protectedAccessBypass: SourceCandidateCheck;
  };
  blocker?: string;
  lastCheckedAt: string;
}>;

const candidates: readonly SourceCandidate[] = [
  {
    id: "mangapdf",
    name: "MangaPDF",
    homepageUrl: "https://mangapdf.org",
    state: "blocked",
    intendedRole: "experimental",
    mediaTypes: ["manga", "manhwa", "manhua"],
    checks: {
      documentedDeveloperApi: "pass",
      liveHealth: "unverified",
      search: "unverified",
      details: "unverified",
      chapters: "unverified",
      pages: "unverified",
      stableIds: "pass",
      protectedAccessBypass: "not-applicable"
    },
    blocker:
      "Public developer API is documented, but both advertised API hosts timed out during the 2026-09-28 live qualification probe. Do not enable until the complete reader path is verified live.",
    lastCheckedAt: "2026-09-28"
  },
  {
    id: "manhwa-reader",
    name: "Manhwa Reader API",
    homepageUrl: "https://manhwa-reader.vercel.app/api/",
    state: "blocked",
    intendedRole: "experimental",
    mediaTypes: ["manhwa"],
    checks: {
      documentedDeveloperApi: "pass",
      liveHealth: "fail",
      search: "unverified",
      details: "fail",
      chapters: "fail",
      pages: "fail",
      stableIds: "unverified",
      protectedAccessBypass: "unverified"
    },
    blocker:
      "Documented reader endpoints returned HTTP 500 during the 2026-09-28 live qualification probe.",
    lastCheckedAt: "2026-09-28"
  },
  {
    id: "nyora",
    name: "Nyora",
    homepageUrl: "https://github.com/Nyora-Manga/nyora-js",
    state: "blocked",
    intendedRole: "experimental",
    mediaTypes: ["manga", "manhwa", "manhua"],
    checks: {
      documentedDeveloperApi: "pass",
      liveHealth: "unverified",
      search: "unverified",
      details: "unverified",
      chapters: "unverified",
      pages: "unverified",
      stableIds: "unverified",
      protectedAccessBypass: "unverified"
    },
    blocker:
      "The JavaScript SDK identifies itself as no longer maintained and aggregates many parser-backed upstreams. Individual upstream provenance/access must pass MangaFlux policy before use.",
    lastCheckedAt: "2026-09-28"
  }
];

function cloneCandidate(candidate: SourceCandidate): SourceCandidate {
  return {
    ...candidate,
    mediaTypes: [...candidate.mediaTypes],
    checks: { ...candidate.checks }
  };
}

export function listSourceCandidates(): SourceCandidate[] {
  return candidates.map(cloneCandidate);
}

export function getSourceCandidate(id: string): SourceCandidate | undefined {
  const candidate = candidates.find((entry) => entry.id === id);
  return candidate ? cloneCandidate(candidate) : undefined;
}
