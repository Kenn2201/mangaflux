import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import {
  clearProgress,
  clearUserProgress,
  deleteBookmark,
  deleteProgress,
  deleteUserBookmark,
  deleteUserProgress,
  getBookmark,
  getReaderSummary,
  getUserBookmark,
  getUserSummary,
  upsertBookmark,
  upsertProgress,
  upsertUserBookmark,
  upsertUserProgress
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

function validReaderId(value: string) {
  return UUID_RE.test(value);
}

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
    Querystring: { source?: string; mangaId?: string; all?: string };
  }>(
    "/api/state/:readerId/progress",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!validateIdentity(request.params.readerId, reply)) return;
      if (!databaseRequired(database, reply)) return;

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
    Querystring: { source?: string; mangaId?: string; all?: string };
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
