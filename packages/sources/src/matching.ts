import type { MangaDetails, MangaSummary } from "./types.js";

export type MatchConfidence = "high" | "medium" | "low";

export type MangaMatchEvidence = Readonly<{
  exactPrimaryTitle: boolean;
  titleKeyOverlap: boolean;
  alternateTitleOverlap: boolean;
  year: "match" | "conflict" | "unknown";
  creator: "match" | "conflict" | "unknown";
  originalLanguage: "match" | "conflict" | "unknown";
}>;

export type MangaMatchCandidate = Readonly<{
  score: number;
  confidence: MatchConfidence;
  autoMerge: false;
  evidence: MangaMatchEvidence;
  warnings: readonly string[];
}>;

export type MatchableManga = MangaSummary & Partial<
  Pick<MangaDetails, "authors" | "artists" | "originalLanguage">
>;

export function normalizeMatchText(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleKeys(item: MatchableManga) {
  return new Set(
    [item.title, ...(item.altTitles ?? [])]
      .map(normalizeMatchText)
      .filter(Boolean)
  );
}

function alternateTitleKeys(item: MatchableManga) {
  return new Set(
    (item.altTitles ?? [])
      .map(normalizeMatchText)
      .filter(Boolean)
  );
}

function creatorKey(value: string) {
  return normalizeMatchText(value)
    .split(" ")
    .filter(Boolean)
    .sort()
    .join(" ");
}

function creatorKeys(item: MatchableManga) {
  return new Set(
    [...(item.authors ?? []), ...(item.artists ?? [])]
      .map(creatorKey)
      .filter(Boolean)
  );
}

function overlap(left: Set<string>, right: Set<string>) {
  for (const value of left) {
    if (right.has(value)) return true;
  }
  return false;
}

function confidenceFor(score: number): MatchConfidence {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function scoreMangaMatch(
  left: MatchableManga,
  right: MatchableManga
): MangaMatchCandidate {
  const leftPrimary = normalizeMatchText(left.title);
  const rightPrimary = normalizeMatchText(right.title);
  const exactPrimaryTitle =
    Boolean(leftPrimary) && leftPrimary === rightPrimary;

  const leftTitles = titleKeys(left);
  const rightTitles = titleKeys(right);
  const titleKeyOverlap = overlap(leftTitles, rightTitles);

  const alternateTitleOverlap =
    overlap(alternateTitleKeys(left), rightTitles) ||
    overlap(alternateTitleKeys(right), leftTitles);

  let score = exactPrimaryTitle ? 60 : titleKeyOverlap ? 45 : 0;

  const year =
    left.year === undefined || right.year === undefined
      ? "unknown"
      : left.year === right.year
        ? "match"
        : "conflict";

  if (year === "match") score += 15;
  if (year === "conflict") score -= 20;

  const leftCreators = creatorKeys(left);
  const rightCreators = creatorKeys(right);
  const creator =
    leftCreators.size === 0 || rightCreators.size === 0
      ? "unknown"
      : overlap(leftCreators, rightCreators)
        ? "match"
        : "conflict";

  if (creator === "match") score += 20;
  if (creator === "conflict") score -= 15;

  const leftLanguage = left.originalLanguage
    ? normalizeMatchText(left.originalLanguage)
    : "";
  const rightLanguage = right.originalLanguage
    ? normalizeMatchText(right.originalLanguage)
    : "";
  const originalLanguage =
    !leftLanguage || !rightLanguage
      ? "unknown"
      : leftLanguage === rightLanguage
        ? "match"
        : "conflict";

  if (originalLanguage === "match") score += 5;
  if (originalLanguage === "conflict") score -= 5;

  score = Math.max(0, Math.min(100, score));

  const warnings: string[] = [];
  if (!exactPrimaryTitle && titleKeyOverlap) {
    warnings.push("Match depends on an alternate-title overlap.");
  }
  if (year === "conflict") {
    warnings.push("Publication years conflict.");
  }
  if (creator === "conflict") {
    warnings.push("Known creator metadata conflicts.");
  }
  if (originalLanguage === "conflict") {
    warnings.push("Original-language metadata conflicts.");
  }

  return {
    score,
    confidence: confidenceFor(score),
    autoMerge: false,
    evidence: {
      exactPrimaryTitle,
      titleKeyOverlap,
      alternateTitleOverlap,
      year,
      creator,
      originalLanguage
    },
    warnings
  };
}
