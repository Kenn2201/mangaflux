import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import type { MangaFluxDatabase } from "./client.js";
import {
  canonicalManga,
  canonicalMappingAudit,
  mangaSourceMappings
} from "./schema.js";
import { getCanonicalIdentityBySource } from "./canonicalIdentity.js";

export type CanonicalMappingReviewErrorCode =
  | "MAPPING_NOT_FOUND"
  | "TARGET_NOT_FOUND"
  | "ALREADY_MAPPED"
  | "MAPPING_CONFLICT"
  | "AUDIT_NOT_FOUND"
  | "ALREADY_ROLLED_BACK";

export class CanonicalMappingReviewError extends Error {
  constructor(
    public readonly code: CanonicalMappingReviewErrorCode,
    message: string
  ) {
    super(message);
    this.name = "CanonicalMappingReviewError";
  }
}

export type MappingActorInput = {
  actorUserId: string;
  reason?: string;
};

export type MergeCanonicalEditionInput = MappingActorInput & {
  source: string;
  mangaId: string;
  targetCanonicalId: string;
};

export type SplitCanonicalEditionInput = MappingActorInput & {
  source: string;
  mangaId: string;
  displayTitle?: string;
};

export type RollbackCanonicalMappingInput = MappingActorInput & {
  eventId: string;
};

async function canonicalExists(
  db: MangaFluxDatabase,
  canonicalId: string
) {
  const [row] = await db
    .select({ id: canonicalManga.id })
    .from(canonicalManga)
    .where(eq(canonicalManga.id, canonicalId))
    .limit(1);

  return Boolean(row);
}

export async function listCanonicalMappingAudit(
  db: MangaFluxDatabase,
  source: string,
  mangaId: string,
  limit = 20
) {
  const boundedLimit = Math.max(1, Math.min(50, Math.floor(limit)));

  return db
    .select({
      id: canonicalMappingAudit.id,
      source: canonicalMappingAudit.source,
      mangaId: canonicalMappingAudit.mangaId,
      sourceTitle: canonicalMappingAudit.sourceTitle,
      action: canonicalMappingAudit.action,
      fromCanonicalId: canonicalMappingAudit.fromCanonicalId,
      toCanonicalId: canonicalMappingAudit.toCanonicalId,
      actorUserId: canonicalMappingAudit.actorUserId,
      reason: canonicalMappingAudit.reason,
      rollbackOf: canonicalMappingAudit.rollbackOf,
      createdAt: canonicalMappingAudit.createdAt
    })
    .from(canonicalMappingAudit)
    .where(
      and(
        eq(canonicalMappingAudit.source, source),
        eq(canonicalMappingAudit.mangaId, mangaId)
      )
    )
    .orderBy(desc(canonicalMappingAudit.createdAt))
    .limit(boundedLimit);
}

export async function mergeCanonicalEdition(
  db: MangaFluxDatabase,
  input: MergeCanonicalEditionInput
) {
  const current = await getCanonicalIdentityBySource(
    db,
    input.source,
    input.mangaId
  );

  if (!current) {
    throw new CanonicalMappingReviewError(
      "MAPPING_NOT_FOUND",
      "The source edition does not have a canonical mapping."
    );
  }

  if (current.canonicalId === input.targetCanonicalId) {
    throw new CanonicalMappingReviewError(
      "ALREADY_MAPPED",
      "The source edition is already mapped to that canonical manga."
    );
  }

  if (!(await canonicalExists(db, input.targetCanonicalId))) {
    throw new CanonicalMappingReviewError(
      "TARGET_NOT_FOUND",
      "The target canonical manga does not exist."
    );
  }

  const updated = await db
    .update(mangaSourceMappings)
    .set({
      canonicalId: input.targetCanonicalId,
      mappingMethod: "matched",
      provenance: "admin-review",
      updatedAt: new Date()
    })
    .where(
      and(
        eq(mangaSourceMappings.source, input.source),
        eq(mangaSourceMappings.mangaId, input.mangaId),
        eq(mangaSourceMappings.canonicalId, current.canonicalId)
      )
    )
    .returning({ canonicalId: mangaSourceMappings.canonicalId });

  if (updated.length !== 1) {
    throw new CanonicalMappingReviewError(
      "MAPPING_CONFLICT",
      "The mapping changed while it was being reviewed. Reload and try again."
    );
  }

  let event;
  try {
    [event] = await db
      .insert(canonicalMappingAudit)
      .values({
        source: input.source,
        mangaId: input.mangaId,
        sourceTitle: current.edition.sourceTitle,
        action: "merge",
        fromCanonicalId: current.canonicalId,
        toCanonicalId: input.targetCanonicalId,
        actorUserId: input.actorUserId,
        reason: input.reason?.trim() || null
      })
      .returning();
  } catch (error) {
    await db
      .update(mangaSourceMappings)
      .set({
        canonicalId: current.canonicalId,
        mappingMethod: current.edition.mappingMethod,
        provenance: current.edition.provenance,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(mangaSourceMappings.source, input.source),
          eq(mangaSourceMappings.mangaId, input.mangaId),
          eq(mangaSourceMappings.canonicalId, input.targetCanonicalId)
        )
      );
    throw error;
  }

  const identity = await getCanonicalIdentityBySource(
    db,
    input.source,
    input.mangaId
  );

  return { event, identity };
}

export async function splitCanonicalEdition(
  db: MangaFluxDatabase,
  input: SplitCanonicalEditionInput
) {
  const current = await getCanonicalIdentityBySource(
    db,
    input.source,
    input.mangaId
  );

  if (!current) {
    throw new CanonicalMappingReviewError(
      "MAPPING_NOT_FOUND",
      "The source edition does not have a canonical mapping."
    );
  }

  const newCanonicalId = randomUUID();
  await db.insert(canonicalManga).values({
    id: newCanonicalId,
    displayTitle:
      input.displayTitle?.trim() || current.edition.sourceTitle
  });

  const updated = await db
    .update(mangaSourceMappings)
    .set({
      canonicalId: newCanonicalId,
      mappingMethod: "manual",
      provenance: "admin-split",
      updatedAt: new Date()
    })
    .where(
      and(
        eq(mangaSourceMappings.source, input.source),
        eq(mangaSourceMappings.mangaId, input.mangaId),
        eq(mangaSourceMappings.canonicalId, current.canonicalId)
      )
    )
    .returning({ canonicalId: mangaSourceMappings.canonicalId });

  if (updated.length !== 1) {
    await db.delete(canonicalManga).where(eq(canonicalManga.id, newCanonicalId));
    throw new CanonicalMappingReviewError(
      "MAPPING_CONFLICT",
      "The mapping changed while it was being reviewed. Reload and try again."
    );
  }

  let event;
  try {
    [event] = await db
      .insert(canonicalMappingAudit)
      .values({
        source: input.source,
        mangaId: input.mangaId,
        sourceTitle: current.edition.sourceTitle,
        action: "split",
        fromCanonicalId: current.canonicalId,
        toCanonicalId: newCanonicalId,
        actorUserId: input.actorUserId,
        reason: input.reason?.trim() || null
      })
      .returning();
  } catch (error) {
    await db
      .update(mangaSourceMappings)
      .set({
        canonicalId: current.canonicalId,
        mappingMethod: current.edition.mappingMethod,
        provenance: current.edition.provenance,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(mangaSourceMappings.source, input.source),
          eq(mangaSourceMappings.mangaId, input.mangaId),
          eq(mangaSourceMappings.canonicalId, newCanonicalId)
        )
      );
    await db.delete(canonicalManga).where(eq(canonicalManga.id, newCanonicalId));
    throw error;
  }

  const identity = await getCanonicalIdentityBySource(
    db,
    input.source,
    input.mangaId
  );

  return { event, identity };
}

export async function rollbackCanonicalMapping(
  db: MangaFluxDatabase,
  input: RollbackCanonicalMappingInput
) {
  const [event] = await db
    .select()
    .from(canonicalMappingAudit)
    .where(eq(canonicalMappingAudit.id, input.eventId))
    .limit(1);

  if (!event) {
    throw new CanonicalMappingReviewError(
      "AUDIT_NOT_FOUND",
      "The mapping audit event does not exist."
    );
  }

  const [existingRollback] = await db
    .select({ id: canonicalMappingAudit.id })
    .from(canonicalMappingAudit)
    .where(eq(canonicalMappingAudit.rollbackOf, event.id))
    .limit(1);

  if (existingRollback) {
    throw new CanonicalMappingReviewError(
      "ALREADY_ROLLED_BACK",
      "That mapping change has already been rolled back."
    );
  }

  const current = await getCanonicalIdentityBySource(
    db,
    event.source,
    event.mangaId
  );

  if (!current) {
    throw new CanonicalMappingReviewError(
      "MAPPING_NOT_FOUND",
      "The audited source edition no longer has a canonical mapping."
    );
  }

  if (current.canonicalId !== event.toCanonicalId) {
    throw new CanonicalMappingReviewError(
      "MAPPING_CONFLICT",
      "The source edition has changed since this audit event. Rollback was not applied."
    );
  }

  if (!(await canonicalExists(db, event.fromCanonicalId))) {
    throw new CanonicalMappingReviewError(
      "TARGET_NOT_FOUND",
      "The previous canonical manga no longer exists."
    );
  }

  const updated = await db
    .update(mangaSourceMappings)
    .set({
      canonicalId: event.fromCanonicalId,
      mappingMethod: "manual",
      provenance: "admin-rollback",
      updatedAt: new Date()
    })
    .where(
      and(
        eq(mangaSourceMappings.source, event.source),
        eq(mangaSourceMappings.mangaId, event.mangaId),
        eq(mangaSourceMappings.canonicalId, event.toCanonicalId)
      )
    )
    .returning({ canonicalId: mangaSourceMappings.canonicalId });

  if (updated.length !== 1) {
    throw new CanonicalMappingReviewError(
      "MAPPING_CONFLICT",
      "The mapping changed while rollback was being applied."
    );
  }

  let rollbackEvent;
  try {
    [rollbackEvent] = await db
      .insert(canonicalMappingAudit)
      .values({
        source: event.source,
        mangaId: event.mangaId,
        sourceTitle: event.sourceTitle,
        action: "rollback",
        fromCanonicalId: event.toCanonicalId,
        toCanonicalId: event.fromCanonicalId,
        actorUserId: input.actorUserId,
        reason: input.reason?.trim() || null,
        rollbackOf: event.id
      })
      .returning();
  } catch (error) {
    await db
      .update(mangaSourceMappings)
      .set({
        canonicalId: event.toCanonicalId,
        mappingMethod: current.edition.mappingMethod,
        provenance: current.edition.provenance,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(mangaSourceMappings.source, event.source),
          eq(mangaSourceMappings.mangaId, event.mangaId),
          eq(mangaSourceMappings.canonicalId, event.fromCanonicalId)
        )
      );
    throw error;
  }

  const identity = await getCanonicalIdentityBySource(
    db,
    event.source,
    event.mangaId
  );

  return { event: rollbackEvent, identity };
}
