import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import {
  createCommunityComment,
  deleteOwnCommunityComment,
  getCommunityReactionSummary,
  getLastUserComment,
  getCommunityProfile,
  getSessionUser,
  getUserCommunityReaction,
  listCommunityComments,
  listCommunityProfileActivity,
  setCommunityReaction
} from "@mangaflux/db";
import type { MangaFluxDatabase } from "@mangaflux/db";
import {
  getBearerToken,
  hashSessionToken,
  requireAuthProxy
} from "./authSecurity.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COMMENT_COOLDOWN_MS = 5 * 60 * 1000;
const COMMENT_MAX_LENGTH = 1000;
const TARGET_TYPES = new Set(["manga", "chapter"]);
const REACTIONS = new Set([
  "like",
  "funny",
  "wow",
  "sad",
  "fire"
]);

type LimitHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<unknown>;

function databaseRequired(
  database: MangaFluxDatabase | null,
  reply: FastifyReply
): database is MangaFluxDatabase {
  if (database) return true;

  reply.code(503).send({
    error: "COMMUNITY_UNAVAILABLE",
    message: "Community features are temporarily unavailable."
  });
  return false;
}

function validTarget(targetType: string, targetId: string) {
  return TARGET_TYPES.has(targetType) && UUID_RE.test(targetId);
}

async function optionalSession(
  request: FastifyRequest,
  database: MangaFluxDatabase
) {
  const token = getBearerToken(request);
  if (!token) return null;

  return getSessionUser(database, hashSessionToken(token));
}

async function requiredSession(
  request: FastifyRequest,
  reply: FastifyReply,
  database: MangaFluxDatabase,
  allowRestricted = false
) {
  const session = await optionalSession(request, database);

  if (!session) {
    reply.code(401).send({
      error: "UNAUTHENTICATED",
      message: "Sign in to use MangaFlux community features."
    });
    return null;
  }

  if (!session.emailVerifiedAt) {
    reply.code(403).send({
      error: "EMAIL_NOT_VERIFIED",
      message: "Verify your email before posting."
    });
    return null;
  }

  if (session.communityRestricted && !allowRestricted) {
    reply.code(403).send({
      error: "COMMUNITY_RESTRICTED",
      message:
        "Community posting and reactions are restricted for this account. Reading and account access are still available."
    });
    return null;
  }

  return session;
}

export function registerCommunityRoutes(
  app: FastifyInstance,
  database: MangaFluxDatabase | null,
  authProxySecret: string,
  limits: {
    read: LimitHandler;
    write: LimitHandler;
  }
) {
  app.get<{ Params: { userId: string } }>(
    "/api/community/users/:userId/profile",
    { preHandler: limits.read },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      if (!UUID_RE.test(request.params.userId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid community profile."
        });
      }

      const profile = await getCommunityProfile(
        database,
        request.params.userId
      );

      if (!profile) {
        return reply.code(404).send({
          error: "NOT_FOUND",
          message: "Community profile not found."
        });
      }

      return profile;
    }
  );

  app.get<{
    Params: { userId: string };
    Querystring: { limit?: string; offset?: string };
  }>(
    "/api/community/users/:userId/activity",
    { preHandler: limits.read },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      if (!UUID_RE.test(request.params.userId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid community profile."
        });
      }

      const rawLimit = Number(request.query.limit ?? "10");
      const rawOffset = Number(request.query.offset ?? "0");
      const limit =
        Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 25
          ? rawLimit
          : 10;
      const offset =
        Number.isInteger(rawOffset) && rawOffset >= 0 && rawOffset <= 10_000
          ? rawOffset
          : 0;

      const activity = await listCommunityProfileActivity(
        database,
        request.params.userId,
        limit,
        offset
      );

      if (!activity) {
        return reply.code(404).send({
          error: "NOT_FOUND",
          message: "Community profile not found."
        });
      }

      return activity;
    }
  );

  app.get<{
    Params: { targetType: string; targetId: string };
    Querystring: {
      limit?: string;
      offset?: string;
      order?: string;
    };
  }>(
    "/api/community/:targetType/:targetId",
    { preHandler: limits.read },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const { targetType, targetId } = request.params;

      if (!validTarget(targetType, targetId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid community target."
        });
      }

      const rawLimit = Number(request.query.limit ?? "20");
      const rawOffset = Number(request.query.offset ?? "0");
      const limit =
        Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 50
          ? rawLimit
          : 20;
      const offset =
        Number.isInteger(rawOffset) && rawOffset >= 0 && rawOffset <= 10_000
          ? rawOffset
          : 0;
      const order =
        request.query.order === "asc" ? "asc" : "desc";

      const session = await optionalSession(request, database);

      const [comments, reactions, viewerReaction] = await Promise.all([
        listCommunityComments(
          database,
          targetType,
          targetId,
          limit,
          offset,
          order
        ),
        getCommunityReactionSummary(database, targetType, targetId),
        session
          ? getUserCommunityReaction(
              database,
              targetType,
              targetId,
              session.userId
            )
          : Promise.resolve(null)
      ]);

      return {
        ...comments,
        limit,
        offset,
        order,
        reactions,
        viewerReaction,
        viewerUserId: session?.userId ?? null,
        authenticated: Boolean(session),
        communityRestricted: Boolean(session?.communityRestricted)
      };
    }
  );

  app.post<{
    Params: { targetType: string; targetId: string };
    Body: { body?: string };
  }>(
    "/api/community/:targetType/:targetId/comments",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const { targetType, targetId } = request.params;

      if (!validTarget(targetType, targetId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid community target."
        });
      }

      const session = await requiredSession(request, reply, database);
      if (!session) return;

      const body =
        typeof request.body?.body === "string"
          ? request.body.body.trim()
          : "";

      if (!body || body.length > COMMENT_MAX_LENGTH) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: `Comments must contain 1-${COMMENT_MAX_LENGTH} characters.`
        });
      }

      const lastComment = await getLastUserComment(
        database,
        session.userId
      );

      if (lastComment) {
        const elapsed =
          Date.now() - lastComment.createdAt.getTime();

        if (elapsed < COMMENT_COOLDOWN_MS) {
          const retryAfterSeconds = Math.max(
            1,
            Math.ceil(
              (COMMENT_COOLDOWN_MS - elapsed) / 1000
            )
          );

          reply.header("Retry-After", String(retryAfterSeconds));

          return reply.code(429).send({
            error: "COMMENT_COOLDOWN",
            message: "You can post one comment every 5 minutes.",
            retryAfterSeconds
          });
        }
      }

      const comment = await createCommunityComment(
        database,
        {
          userId: session.userId,
          targetType,
          targetId,
          body
        }
      );

      return reply.code(201).send({
        comment,
        message: "Comment posted."
      });
    }
  );

  app.delete<{
    Params: { commentId: string };
  }>(
    "/api/community/comments/:commentId",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      if (!UUID_RE.test(request.params.commentId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid comment."
        });
      }

      const session = await requiredSession(
        request,
        reply,
        database,
        true
      );
      if (!session) return;

      const deleted = await deleteOwnCommunityComment(
        database,
        request.params.commentId,
        session.userId
      );

      if (!deleted) {
        return reply.code(404).send({
          error: "NOT_FOUND",
          message: "Comment not found."
        });
      }

      return { ok: true };
    }
  );

  app.put<{
    Params: { targetType: string; targetId: string };
    Body: { reaction?: string };
  }>(
    "/api/community/:targetType/:targetId/reaction",
    { preHandler: limits.write },
    async (request, reply) => {
      if (!requireAuthProxy(request, reply, authProxySecret)) return;
      if (!databaseRequired(database, reply)) return;

      const { targetType, targetId } = request.params;
      const reaction = request.body?.reaction;

      if (
        !validTarget(targetType, targetId) ||
        typeof reaction !== "string" ||
        !REACTIONS.has(reaction)
      ) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid community reaction."
        });
      }

      const session = await requiredSession(request, reply, database);
      if (!session) return;

      const selected = await setCommunityReaction(
        database,
        {
          targetType,
          targetId,
          userId: session.userId,
          reaction
        }
      );

      const reactions = await getCommunityReactionSummary(
        database,
        targetType,
        targetId
      );

      return {
        selected,
        reactions
      };
    }
  );
}
