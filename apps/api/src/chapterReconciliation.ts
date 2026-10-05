import type { Chapter, MangaSource } from "@mangaflux/sources";

const PAGE_SIZE = 100;
const MAX_RELEASES_PER_EDITION = 1000;

export type ReconciledEditionInput = {
  source: string;
  mangaId: string;
  sourceTitle: string;
  provider: MangaSource;
};

export type EnumeratedEdition = {
  source: string;
  mangaId: string;
  sourceTitle: string;
  status: "complete" | "incomplete" | "error";
  totalReported: number | null;
  fetchedReleases: number;
  uniqueNumberedChapters: number;
  duplicateNumberedReleases: number;
  unnumberedReleases: number;
  complete: boolean;
  reason: string | null;
  chapters: Chapter[];
};

export type AvailabilityDifference = {
  chapter: string;
  availableIn: Array<{
    source: string;
    mangaId: string;
    sourceTitle: string;
    chapterId: string;
    chapterTitle: string;
    releaseCount: number;
  }>;
  notReportedBy: Array<{
    source: string;
    mangaId: string;
    sourceTitle: string;
  }>;
};

export function normalizeChapterNumber(value: string | undefined) {
  const raw = value?.trim();
  if (!raw || !/^\d+(?:\.\d+)?$/.test(raw)) return null;

  const [integerRaw, fractionRaw] = raw.split(".");
  const integer = integerRaw.replace(/^0+(?=\d)/, "") || "0";
  const fraction = fractionRaw?.replace(/0+$/, "") ?? "";

  return fraction ? `${integer}.${fraction}` : integer;
}

function compareChapterNumbers(left: string, right: string) {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (
    Number.isFinite(leftNumber) &&
    Number.isFinite(rightNumber) &&
    leftNumber !== rightNumber
  ) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

export async function enumerateEditionChapters(
  edition: ReconciledEditionInput,
  language: string
): Promise<EnumeratedEdition> {
  const releases: Chapter[] = [];
  let offset = 0;
  let expectedTotal: number | null = null;
  let reason: string | null = null;

  try {
    while (offset < MAX_RELEASES_PER_EDITION) {
      const page = await edition.provider.chapterPage(edition.mangaId, {
        language,
        limit: PAGE_SIZE,
        offset,
        order: "asc"
      });

      const pageTotal = Math.max(0, page.total);
      expectedTotal =
        expectedTotal === null
          ? pageTotal
          : Math.max(expectedTotal, pageTotal);

      if (page.items.length === 0) {
        if (offset < expectedTotal) {
          reason =
            "The provider returned an empty page before its reported feed ended.";
        }
        break;
      }

      releases.push(...page.items);
      offset += page.items.length;

      if (offset >= expectedTotal) break;

      if (page.items.length < Math.min(PAGE_SIZE, page.limit)) {
        reason =
          "The provider returned a short page before its reported feed ended.";
        break;
      }
    }

    if (
      expectedTotal !== null &&
      expectedTotal > MAX_RELEASES_PER_EDITION
    ) {
      reason =
        `The feed reports more than the ${MAX_RELEASES_PER_EDITION}-release safety cap.`;
    }

    const complete =
      reason === null &&
      expectedTotal !== null &&
      expectedTotal <= MAX_RELEASES_PER_EDITION &&
      releases.length >= expectedTotal;

    const numbered = new Map<string, number>();
    let unnumberedReleases = 0;

    for (const chapter of releases) {
      const number = normalizeChapterNumber(chapter.chapter);
      if (!number) {
        unnumberedReleases += 1;
        continue;
      }

      numbered.set(number, (numbered.get(number) ?? 0) + 1);
    }

    const duplicateNumberedReleases = [...numbered.values()].reduce(
      (total, count) => total + Math.max(0, count - 1),
      0
    );

    return {
      source: edition.source,
      mangaId: edition.mangaId,
      sourceTitle: edition.sourceTitle,
      status: complete ? "complete" : "incomplete",
      totalReported: expectedTotal,
      fetchedReleases: releases.length,
      uniqueNumberedChapters: numbered.size,
      duplicateNumberedReleases,
      unnumberedReleases,
      complete,
      reason:
        reason ??
        (complete
          ? null
          : "The provider feed could not be proven complete."),
      chapters: releases
    };
  } catch {
    return {
      source: edition.source,
      mangaId: edition.mangaId,
      sourceTitle: edition.sourceTitle,
      status: "error",
      totalReported: expectedTotal,
      fetchedReleases: releases.length,
      uniqueNumberedChapters: 0,
      duplicateNumberedReleases: 0,
      unnumberedReleases: 0,
      complete: false,
      reason: "The provider chapter feed failed during full enumeration.",
      chapters: []
    };
  }
}

export function reconcileChapterAvailability(
  editions: EnumeratedEdition[]
) {
  const completeEditions = editions.filter((edition) => edition.complete);

  if (completeEditions.length < 2) {
    return {
      ready: false,
      comparedSources: completeEditions.map((edition) => edition.source),
      differences: [] as AvailabilityDifference[]
    };
  }

  const byEdition = new Map<
    string,
    Map<string, { representative: Chapter; releaseCount: number }>
  >();

  for (const edition of completeEditions) {
    const chapters = new Map<
      string,
      { representative: Chapter; releaseCount: number }
    >();

    for (const release of edition.chapters) {
      const number = normalizeChapterNumber(release.chapter);
      if (!number) continue;

      const current = chapters.get(number);
      chapters.set(number, {
        representative: current?.representative ?? release,
        releaseCount: (current?.releaseCount ?? 0) + 1
      });
    }

    byEdition.set(
      `${edition.source}:${edition.mangaId}`,
      chapters
    );
  }

  const allNumbers = new Set<string>();
  for (const chapters of byEdition.values()) {
    for (const number of chapters.keys()) allNumbers.add(number);
  }

  const differences: AvailabilityDifference[] = [];

  for (const chapter of [...allNumbers].sort(compareChapterNumbers)) {
    const availableIn: AvailabilityDifference["availableIn"] = [];
    const notReportedBy: AvailabilityDifference["notReportedBy"] = [];

    for (const edition of completeEditions) {
      const key = `${edition.source}:${edition.mangaId}`;
      const release = byEdition.get(key)?.get(chapter);

      if (release) {
        availableIn.push({
          source: edition.source,
          mangaId: edition.mangaId,
          sourceTitle: edition.sourceTitle,
          chapterId: release.representative.id,
          chapterTitle: release.representative.title,
          releaseCount: release.releaseCount
        });
      } else {
        notReportedBy.push({
          source: edition.source,
          mangaId: edition.mangaId,
          sourceTitle: edition.sourceTitle
        });
      }
    }

    if (availableIn.length > 0 && notReportedBy.length > 0) {
      differences.push({
        chapter,
        availableIn,
        notReportedBy
      });
    }
  }

  return {
    ready: true,
    comparedSources: completeEditions.map((edition) => edition.source),
    differences
  };
}
