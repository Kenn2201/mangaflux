import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import { canonicalManga, mangaSourceMappings } from "./schema.js";

export type CanonicalIdentityInput = {
  source: string;
  mangaId: string;
  title: string;
  mappingMethod?: "observed" | "manual" | "matched";
  provenance?: string;
};

export type CanonicalIdentity = {
  canonicalId: string;
  displayTitle: string;
  edition: {
    source: string;
    mangaId: string;
    sourceTitle: string;
    mappingMethod: string;
    provenance: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export async function getCanonicalIdentityBySource(
  db: MangaFluxDatabase,
  source: string,
  mangaId: string
): Promise<CanonicalIdentity | null> {
  const [row] = await db
    .select({
      canonicalId: mangaSourceMappings.canonicalId,
      displayTitle: canonicalManga.displayTitle,
      source: mangaSourceMappings.source,
      mangaId: mangaSourceMappings.mangaId,
      sourceTitle: mangaSourceMappings.sourceTitle,
      mappingMethod: mangaSourceMappings.mappingMethod,
      provenance: mangaSourceMappings.provenance,
      createdAt: mangaSourceMappings.createdAt,
      updatedAt: mangaSourceMappings.updatedAt
    })
    .from(mangaSourceMappings)
    .innerJoin(
      canonicalManga,
      eq(mangaSourceMappings.canonicalId, canonicalManga.id)
    )
    .where(
      and(
        eq(mangaSourceMappings.source, source),
        eq(mangaSourceMappings.mangaId, mangaId)
      )
    )
    .limit(1);

  if (!row) return null;

  return {
    canonicalId: row.canonicalId,
    displayTitle: row.displayTitle,
    edition: {
      source: row.source,
      mangaId: row.mangaId,
      sourceTitle: row.sourceTitle,
      mappingMethod: row.mappingMethod,
      provenance: row.provenance,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  };
}

export async function ensureCanonicalIdentity(
  db: MangaFluxDatabase,
  input: CanonicalIdentityInput
): Promise<CanonicalIdentity> {
  const existing = await getCanonicalIdentityBySource(
    db,
    input.source,
    input.mangaId
  );

  if (existing) {
    if (existing.edition.sourceTitle !== input.title) {
      await db
        .update(mangaSourceMappings)
        .set({
          sourceTitle: input.title,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(mangaSourceMappings.source, input.source),
            eq(mangaSourceMappings.mangaId, input.mangaId)
          )
        );
    }

    return (
      (await getCanonicalIdentityBySource(
        db,
        input.source,
        input.mangaId
      )) ?? existing
    );
  }

  const canonicalId = randomUUID();

  await db.insert(canonicalManga).values({
    id: canonicalId,
    displayTitle: input.title
  });

  const inserted = await db
    .insert(mangaSourceMappings)
    .values({
      canonicalId,
      source: input.source,
      mangaId: input.mangaId,
      sourceTitle: input.title,
      mappingMethod: input.mappingMethod ?? "observed",
      provenance: input.provenance ?? "source-details"
    })
    .onConflictDoNothing({
      target: [mangaSourceMappings.source, mangaSourceMappings.mangaId]
    })
    .returning({ canonicalId: mangaSourceMappings.canonicalId });

  if (inserted.length === 0) {
    await db
      .delete(canonicalManga)
      .where(eq(canonicalManga.id, canonicalId));

    const raced = await getCanonicalIdentityBySource(
      db,
      input.source,
      input.mangaId
    );

    if (raced) return raced;
    throw new Error("Canonical identity mapping race could not be resolved.");
  }

  const identity = await getCanonicalIdentityBySource(
    db,
    input.source,
    input.mangaId
  );

  if (!identity) {
    throw new Error("Canonical identity was created but could not be read.");
  }

  return identity;
}

export async function listCanonicalEditions(
  db: MangaFluxDatabase,
  canonicalId: string
) {
  return db
    .select({
      source: mangaSourceMappings.source,
      mangaId: mangaSourceMappings.mangaId,
      sourceTitle: mangaSourceMappings.sourceTitle,
      mappingMethod: mangaSourceMappings.mappingMethod,
      provenance: mangaSourceMappings.provenance,
      createdAt: mangaSourceMappings.createdAt,
      updatedAt: mangaSourceMappings.updatedAt
    })
    .from(mangaSourceMappings)
    .where(eq(mangaSourceMappings.canonicalId, canonicalId));
}
