import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import {
  clearProgress,
  clearProgressBefore,
  clearUserProgress,
  clearUserProgressBefore,
  deleteBookmark,
  deleteProgress,
  deleteUserBookmark,
  deleteUserProgress,
  getBookmark,
  getReaderSummary,
  getUserBookmark,
  getUserReaderPreferences,
  getUserSummary,
  upsertBookmark,
  upsertProgress,
  upsertUserBookmark,
  upsertUserProgress,
  upsertUserReaderPreferences
} from "@mangaflux/db";
import type { MangaFluxDatabase } from "@mangaflux/db";
import { authenticateSession } from "./auth.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LimitHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<unknown>;

type BookmarkBody = {
  source?: string;
  mangaId?: string;
  title?: string;
  coverUrl?: string | null;
};

type ReaderPreferencesBody = {
  mangaId?: string;
  language?: string;
  dataSaver?: boolean;
  showAlternateReleases?: boolean;
  preferredScanlationGroup?: string | null;
  imageFit?: string;
  pageGap?: string;
  updatedAt?: string;
};

type ProgressBody = {
  source?: string;
  mangaId?: string;
  mangaTitle?: string;
  coverUrl?: string | null;
  chapterId?: string;
  chapterLabel?: string | null;
  page?: number;
  totalPages?: number;
};

type ProgressDeleteQuery = {
  source?: string;
  mangaId?: string;
  all?: string;
  olderThanDays?: string;
};

function validReaderId(value: string) {
  return UUID_RE.test(value);
}

const LANGUAGE_RE = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i;
const READER_IMAGE_FITS = new Set(["width", "screen"]);
const READER_PAGE_GAPS = new Set(["none", "small", "large"]);

function validMangaDexId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function validText(value: unknown, min: number, max: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= min &&
    value.trim().length <= max
  );
}

function validateReaderPreferencesBody(
  body: ReaderPreferencesBody,
  reply: FastifyReply
) {
  if (!validMangaDexId(body.mangaId)) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "mangaId must be a valid MangaDex UUID"
    });
    return null;
  }

  if (
    typeof body.language !== "string" ||
    !LANGUAGE_RE.test(body.language)
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "language is invalid"
    });
    return null;
  }

  if (
    typeof body.dataSaver !== "boolean" ||
    typeof body.showAlternateReleases !== "boolean"
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "reader preference toggles are invalid"
    });
    return null;
  }

  if (
    body.preferredScanlationGroup !== undefined &&
    body.preferredScanlationGroup !== null &&
    (
      typeof body.preferredScanlationGroup !== "string" ||
      body.preferredScanlationGroup.trim().length > 120
    )
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "preferredScanlationGroup is invalid"
    });
    return null;
  }

  if (
    typeof body.imageFit !== "string" ||
    !READER_IMAGE_FITS.has(body.imageFit)
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "imageFit is invalid"
    });
    return null;
  }

  if (
    typeof body.pageGap !== "string" ||
    !READER_PAGE_GAPS.has(body.pageGap)
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "pageGap is invalid"
    });
    return null;
  }

  if (typeof body.updatedAt !== "string") {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "updatedAt is required"
    });
    return null;
  }

  const updatedAt = new Date(body.updatedAt);
  const now = Date.now();

  if (
    Number.isNaN(updatedAt.getTime()) ||
    updatedAt.getTime() > now + 5 * 60_000
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "updatedAt is invalid"
    });
    return null;
  }

  return {
    mangaId: body.mangaId,
    language: body.language.toLowerCase(),
    dataSaver: body.dataSaver,
    showAlternateReleases: body.showAlternateReleases,
    preferredScanlationGroup:
      body.preferredScanlationGroup?.trim() || undefined,
    imageFit: body.imageFit,
    pageGap: body.pageGap,
    updatedAt
  };
}

function normalizeCoverUrl(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return { ok: true as const, value: undefined };
  }

  if (typeof value !== "string" || value.length > 1000) {
    return { ok: false as const };
  }

  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "uploads.mangadex.org"
    ) {
      return { ok: false as const };
    }

    return { ok: true as const, value: parsed.toString() };
  } catch {
    return { ok: false as const };
  }
}

function historyCutoff(
  value: string | undefined,
  reply: FastifyReply
) {
  if (value === undefined) return null;

  const days = Number(value);

  if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 3650
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "olderThanDays must be an integer from 1 to 3650"
    });
    return false as const;
  }

  return {
    days,
    before: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  };
}

function databaseRequired(
  database: MangaFluxDatabase | null,
  reply: FastifyReply
): database is MangaFluxDatabase {
  if (database) return true;

  reply.code(503).send({
    error: "PERSISTENCE_UNAVAILABLE",
    message: "Reading persistence is temporarily unavailable."
  });
  return false;
}

function validateIdentity(
  readerId: string,
  reply: FastifyReply
) {
  if (validReaderId(readerId)) return true;

  reply.code(400).send({
    error: "INVALID_REQUEST",
    message: "readerId must be a valid UUID"
  });
  return false;
}

function validateSourceAndManga(
  source: unknown,
  mangaId: unknown,
  reply: FastifyReply
) {
  if (source !== "mangadex" || !validMangaDexId(mangaId)) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "Only valid MangaDex manga identifiers are accepted."
    });
    return false;
  }

  return true;
}

function validateBookmarkBody(
  body: BookmarkBody,
  reply: FastifyReply
) {
  if (!validateSourceAndManga(body.source, body.mangaId, reply)) {
    return null;
  }

  if (!validText(body.title, 1, 300)) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "title must contain between 1 and 300 characters"
    });
    return null;
  }

  const cover = normalizeCoverUrl(body.coverUrl);
  if (!cover.ok) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "coverUrl is invalid"
    });
    return null;
  }

  return {
    source: body.source!,
    mangaId: body.mangaId!,
    title: body.title!.trim(),
    coverUrl: cover.value
  };
}

function validateProgressBody(
  body: ProgressBody,
  reply: FastifyReply
) {
  if (!validateSourceAndManga(body.source, body.mangaId, reply)) {
    return null;
  }

  if (!validMangaDexId(body.chapterId)) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "chapterId must be a valid MangaDex UUID"
    });
    return null;
  }

  if (!validText(body.mangaTitle, 1, 300)) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "mangaTitle must contain between 1 and 300 characters"
    });
    return null;
  }

  if (
    body.chapterLabel !== undefined &&
    body.chapterLabel !== null &&
    !validText(body.chapterLabel, 1, 120)
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "chapterLabel is invalid"
    });
    return null;
  }

  if (
    !Number.isInteger(body.page) ||
    !Number.isInteger(body.totalPages) ||
    body.page! < 1 ||
    body.totalPages! < 1 ||
    body.totalPages! > 500 ||
    body.page! > body.totalPages!
  ) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "page and totalPages are invalid"
    });
    return null;
  }

  const cover = normalizeCoverUrl(body.coverUrl);
  if (!cover.ok) {
    reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "coverUrl is invalid"
    });
    return null;
  }

  return {
    source: body.source!,
    mangaId: body.mangaId!,
    mangaTitle: body.mangaTitle!.trim(),
    coverUrl: cover.value,
    chapterId: body.chapterId!,
    chapterLabel: body.chapterLabel?.trim() || undefined,
    page: body.page!,
    totalPages: body.totalPages!
  };
}

export function registerStateRoutes(
  app: FastifyInstance,
  database: MangaFluxDatabase | null,
  authProxySecret: string,
  limits: {
    read: LimitHandler;
    write: LimitHandler;
  }
) {
  app.get<{
    Params: { readerId: string };
  }>(
    "/api/state/:readerId/summary",
    { preHandler: limits.read },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!databaseRequired(database, reply)) return;

      return getReaderSummary(database, request.params.readerId);
    }
  );

  app.get<{
    Params: { readerId: string };
    Querystring: { source?: string; mangaId?: string };
  }>(
    "/api/state/:readerId/bookmark",
    { preHandler: limits.read },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!databaseRequired(database, reply)) return;

      const source = request.query.source ?? "mangadex";
      const mangaId = request.query.mangaId;

      if (!validateSourceAndManga(source, mangaId, reply)) return;

      const item = await getBookmark(
        database,
        request.params.readerId,
        source,
        mangaId!
      );

      return {
        bookmarked: Boolean(item),
        item
      };
    }
  );

  app.put<{
    Params: { readerId: string };
    Body: BookmarkBody;
  }>(
    "/api/state/:readerId/bookmark",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!databaseRequired(database, reply)) return;

      const body = validateBookmarkBody(
        request.body ?? {},
        reply
      );
      if (!body) return;

      const item = await upsertBookmark(database, {
        readerId: request.params.readerId,
        ...body
      });

      return { bookmarked: true, item };
    }
  );

  app.delete<{
    Params: { readerId: string };
    Querystring: { source?: string; mangaId?: string };
  }>(
    "/api/state/:readerId/bookmark",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!databaseRequired(database, reply)) return;

      const source = request.query.source ?? "mangadex";
      const mangaId = request.query.mangaId;

      if (!validateSourceAndManga(source, mangaId, reply)) return;

      await deleteBookmark(
        database,
        request.params.readerId,
        source,
        mangaId!
      );

      return { bookmarked: false };
    }
  );

  app.put<{
    Params: { readerId: string };
    Body: ProgressBody;
  }>(
    "/api/state/:readerId/progress",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!databaseRequired(database, reply)) return;

      const body = validateProgressBody(
        request.body ?? {},
        reply
      );
      if (!body) return;

      const item = await upsertProgress(database, {
        readerId: request.params.readerId,
        ...body
      });

      return { saved: true, item };
    }
  );

  app.delete<{
    Params: { readerId: string };
    Querystring: ProgressDeleteQuery;
  }>(
    "/api/state/:readerId/progress",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!databaseRequired(database, reply)) return;

      const cutoff = historyCutoff(
        request.query.olderThanDays,
        reply
      );
      if (cutoff === false) return;

      if (cutoff) {
        const removed = await clearProgressBefore(
          database,
          request.params.readerId,
          cutoff.before
        );

        return {
          cleared: true,
          removed,
          olderThanDays: cutoff.days,
          before: cutoff.before.toISOString()
        };
      }

      if (request.query.all === "1") {
        await clearProgress(database, request.params.readerId);
        return { cleared: true };
      }

      const source = request.query.source ?? "mangadex";
      const mangaId = request.query.mangaId;

      if (!validateSourceAndManga(source, mangaId, reply)) return;

      await deleteProgress(
        database,
        request.params.readerId,
        source,
        mangaId!
      );

      return { removed: true };
    }
  );

  app.get<{
    Params: { readerId: string };
    Querystring: { mangaId?: string };
  }>(
    "/api/state/:readerId/reader-preferences",
    { preHandler: limits.read },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!validMangaDexId(request.query.mangaId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "mangaId must be a valid MangaDex UUID"
        });
      }

      return { synced: false, item: null };
    }
  );

  app.put<{
    Params: { readerId: string };
    Body: ReaderPreferencesBody;
  }>(
    "/api/state/:readerId/reader-preferences",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      const body = validateReaderPreferencesBody(
        request.body ?? {},
        reply
      );
      if (!body) return;

      return { synced: false, item: null };
    }
  );

  app.get<{
    Querystring: { mangaId?: string };
  }>(
    "/api/account/state/reader-preferences",
    { preHandler: limits.read },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      if (!validMangaDexId(request.query.mangaId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "mangaId must be a valid MangaDex UUID"
        });
      }

      const item = await getUserReaderPreferences(
        database,
        session.userId,
        request.query.mangaId
      );

      return { synced: true, item };
    }
  );

  app.put<{ Body: ReaderPreferencesBody }>(
    "/api/account/state/reader-preferences",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      const body = validateReaderPreferencesBody(
        request.body ?? {},
        reply
      );
      if (!body) return;

      const item = await upsertUserReaderPreferences(database, {
        userId: session.userId,
        ...body
      });

      return { synced: true, item };
    }
  );

  app.get(
    "/api/account/state/summary",
    { preHandler: limits.read },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      return getUserSummary(database, session.userId);
    }
  );

  app.get<{
    Querystring: { source?: string; mangaId?: string };
  }>(
    "/api/account/state/bookmark",
    { preHandler: limits.read },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      const source = request.query.source ?? "mangadex";
      const mangaId = request.query.mangaId;

      if (!validateSourceAndManga(source, mangaId, reply)) return;

      const item = await getUserBookmark(
        database,
        session.userId,
        source,
        mangaId!
      );

      return {
        bookmarked: Boolean(item),
        item
      };
    }
  );

  app.put<{ Body: BookmarkBody }>(
    "/api/account/state/bookmark",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      const body = validateBookmarkBody(
        request.body ?? {},
        reply
      );
      if (!body) return;

      const item = await upsertUserBookmark(database, {
        userId: session.userId,
        ...body
      });

      return { bookmarked: true, item };
    }
  );

  app.delete<{
    Querystring: { source?: string; mangaId?: string };
  }>(
    "/api/account/state/bookmark",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      const source = request.query.source ?? "mangadex";
      const mangaId = request.query.mangaId;

      if (!validateSourceAndManga(source, mangaId, reply)) return;

      await deleteUserBookmark(
        database,
        session.userId,
        source,
        mangaId!
      );

      return { bookmarked: false };
    }
  );

  app.delete<{
    Querystring: ProgressDeleteQuery;
  }>(
    "/api/account/state/progress",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      const cutoff = historyCutoff(
        request.query.olderThanDays,
        reply
      );
      if (cutoff === false) return;

      if (cutoff) {
        const removed = await clearUserProgressBefore(
          database,
          session.userId,
          cutoff.before
        );

        return {
          cleared: true,
          removed,
          olderThanDays: cutoff.days,
          before: cutoff.before.toISOString()
        };
      }

      if (request.query.all === "1") {
        await clearUserProgress(database, session.userId);
        return { cleared: true };
      }

      const source = request.query.source ?? "mangadex";
      const mangaId = request.query.mangaId;

      if (!validateSourceAndManga(source, mangaId, reply)) return;

      await deleteUserProgress(
        database,
        session.userId,
        source,
        mangaId!
      );

      return { removed: true };
    }
  );

  app.put<{ Body: ProgressBody }>(
    "/api/account/state/progress",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await authenticateSession(
        request,
        reply,
        database,
        authProxySecret
      );
      if (!session || !database) return;

      const body = validateProgressBody(
        request.body ?? {},
        reply
      );
      if (!body) return;

      const item = await upsertUserProgress(database, {
        userId: session.userId,
        ...body
      });

      return { saved: true, item };
    }
  );
}
