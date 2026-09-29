import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import {
  CanonicalMappingReviewError,
  deleteCommunityCommentAsAdmin,
  deleteUserSessions,
  getAdminOverview,
  getCanonicalIdentityBySource,
  listCanonicalMappingAudit,
  mergeCanonicalEdition,
  rollbackCanonicalMapping,
  setUserCommunityRestricted,
  splitCanonicalEdition
} from "@mangaflux/db";
import type { MangaFluxDatabase } from "@mangaflux/db";
import { authenticateSession } from "./auth.js";
import { isAdminEmail } from "./adminAccess.js";
import { getDiagnosticsSnapshot } from "./diagnostics.js";
import { getMangaDexCacheStats } from "@mangaflux/sources";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SOURCE_RE = /^[a-z0-9-]{1,40}$/;

function validSourceMangaRef(source: unknown, mangaId: unknown) {
  return (
    typeof source === "string" &&
    SOURCE_RE.test(source) &&
    typeof mangaId === "string" &&
    mangaId.length > 0 &&
    mangaId.length <= 500 &&
    !/[\u0000-\u001f\u007f]/.test(mangaId)
  );
}

function mappingReviewFailure(
  error: unknown,
  reply: FastifyReply
) {
  if (!(error instanceof CanonicalMappingReviewError)) {
    throw error;
  }

  const status =
    error.code === "MAPPING_NOT_FOUND" ||
    error.code === "TARGET_NOT_FOUND" ||
    error.code === "AUDIT_NOT_FOUND"
      ? 404
      : error.code === "ALREADY_MAPPED" ||
          error.code === "ALREADY_ROLLED_BACK"
        ? 400
        : 409;

  return reply.code(status).send({
    error: error.code,
    message: error.message
  });
}

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
    error: "ADMIN_UNAVAILABLE",
    message: "The admin console is temporarily unavailable."
  });
  return false;
}

async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
  database: MangaFluxDatabase | null,
  authProxySecret: string
) {
  if (!databaseRequired(database, reply)) return null;

  const session = await authenticateSession(
    request,
    reply,
    database,
    authProxySecret
  );

  if (!session) return null;

  if (!session.emailVerifiedAt || !isAdminEmail(session.email)) {
    reply.code(403).send({
      error: "ADMIN_REQUIRED",
      message: "Administrator access is required."
    });
    return null;
  }

  return session;
}

export function registerAdminRoutes(
  app: FastifyInstance,
  database: MangaFluxDatabase | null,
  authProxySecret: string,
  limits: {
    read: LimitHandler;
    write: LimitHandler;
  }
) {
  app.get(
    "/api/admin/overview",
    { preHandler: limits.read },
    async (request, reply) => {
      const session = await requireAdmin(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session || !database) return;

      const overview = await getAdminOverview(database);

      return {
        admin: {
          id: session.userId,
          email: session.email,
          displayName: session.displayName
        },
        ...overview
      };
    }
  );

  app.get(
    "/api/admin/diagnostics",
    { preHandler: limits.read },
    async (request, reply) => {
      const session = await requireAdmin(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session) return;

      const memory = process.memoryUsage();

      return {
        process: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memory: {
            rssMb: Math.round(memory.rss / 1024 / 1024),
            heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024)
          }
        },
        traffic: getDiagnosticsSnapshot(),
        sourceCache: getMangaDexCacheStats()
      };
    }
  );

  app.get<{
    Querystring: { source?: string; mangaId?: string };
  }>(
    "/api/admin/canonical/mapping",
    { preHandler: limits.read },
    async (request, reply) => {
      const session = await requireAdmin(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session || !database) return;

      const source = request.query.source?.trim();
      const mangaId = request.query.mangaId?.trim();

      if (!validSourceMangaRef(source, mangaId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "A valid source and mangaId are required."
        });
      }

      const identity = await getCanonicalIdentityBySource(
        database,
        source!,
        mangaId!
      );

      if (!identity) {
        return reply.code(404).send({
          error: "MAPPING_NOT_FOUND",
          message: "That source edition does not have a canonical mapping yet."
        });
      }

      const audit = await listCanonicalMappingAudit(
        database,
        source!,
        mangaId!,
        20
      );

      return {
        identity,
        audit
      };
    }
  );

  app.post<{
    Body: {
      action?: "merge" | "split" | "rollback";
      source?: string;
      mangaId?: string;
      targetCanonicalId?: string;
      displayTitle?: string;
      eventId?: string;
      reason?: string;
    };
  }>(
    "/api/admin/canonical/mapping",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await requireAdmin(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session || !database) return;

      const action = request.body?.action;
      const reason = request.body?.reason?.trim();

      if (
        !action ||
        (reason && reason.length > 500)
      ) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "A valid action is required and reason must be 500 characters or less."
        });
      }

      try {
        if (action === "rollback") {
          const eventId = request.body?.eventId?.trim();

          if (!eventId || !UUID_RE.test(eventId)) {
            return reply.code(400).send({
              error: "INVALID_REQUEST",
              message: "A valid audit event id is required for rollback."
            });
          }

          const result = await rollbackCanonicalMapping(database, {
            eventId,
            actorUserId: session.userId,
            reason
          });

          return {
            ok: true,
            action,
            ...result,
            message: "Canonical mapping change rolled back."
          };
        }

        const source = request.body?.source?.trim();
        const mangaId = request.body?.mangaId?.trim();

        if (!validSourceMangaRef(source, mangaId)) {
          return reply.code(400).send({
            error: "INVALID_REQUEST",
            message: "A valid source and mangaId are required."
          });
        }

        if (action === "merge") {
          const targetCanonicalId =
            request.body?.targetCanonicalId?.trim();

          if (!targetCanonicalId || !UUID_RE.test(targetCanonicalId)) {
            return reply.code(400).send({
              error: "INVALID_REQUEST",
              message: "A valid target canonical id is required."
            });
          }

          const result = await mergeCanonicalEdition(database, {
            source: source!,
            mangaId: mangaId!,
            targetCanonicalId,
            actorUserId: session.userId,
            reason
          });

          return {
            ok: true,
            action,
            ...result,
            message: "Source edition merged into the reviewed canonical manga."
          };
        }

        if (action === "split") {
          const displayTitle = request.body?.displayTitle?.trim();

          if (displayTitle && displayTitle.length > 300) {
            return reply.code(400).send({
              error: "INVALID_REQUEST",
              message: "Display title must be 300 characters or less."
            });
          }

          const result = await splitCanonicalEdition(database, {
            source: source!,
            mangaId: mangaId!,
            displayTitle,
            actorUserId: session.userId,
            reason
          });

          return {
            ok: true,
            action,
            ...result,
            message: "Source edition split into a new canonical manga."
          };
        }

        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Unknown canonical mapping action."
        });
      } catch (error) {
        return mappingReviewFailure(error, reply);
      }
    }
  );

  app.delete<{ Params: { commentId: string } }>(
    "/api/admin/comments/:commentId",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await requireAdmin(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session || !database) return;

      if (!UUID_RE.test(request.params.commentId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid comment id."
        });
      }

      const deleted = await deleteCommunityCommentAsAdmin(
        database,
        request.params.commentId
      );

      if (!deleted) {
        return reply.code(404).send({
          error: "NOT_FOUND",
          message: "Comment not found."
        });
      }

      return {
        ok: true,
        message: "Comment removed by administrator."
      };
    }
  );

  app.post<{
    Params: { userId: string };
    Body: { restricted?: boolean };
  }>(
    "/api/admin/users/:userId/community-restriction",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await requireAdmin(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session || !database) return;

      if (
        !UUID_RE.test(request.params.userId) ||
        typeof request.body?.restricted !== "boolean"
      ) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid community restriction request."
        });
      }

      if (request.params.userId === session.userId) {
        return reply.code(400).send({
          error: "SELF_RESTRICTION_BLOCKED",
          message:
            "The active administrator cannot restrict their own community access."
        });
      }

      const user = await setUserCommunityRestricted(
        database,
        request.params.userId,
        request.body.restricted
      );

      if (!user) {
        return reply.code(404).send({
          error: "NOT_FOUND",
          message: "User not found."
        });
      }

      return {
        ok: true,
        communityRestricted: user.communityRestricted,
        message: user.communityRestricted
          ? "Community posting and reactions are restricted for that account."
          : "Community access has been restored for that account."
      };
    }
  );

  app.post<{ Params: { userId: string } }>(
    "/api/admin/users/:userId/revoke-sessions",
    { preHandler: limits.write },
    async (request, reply) => {
      const session = await requireAdmin(
        request,
        reply,
        database,
        authProxySecret
      );

      if (!session || !database) return;

      if (!UUID_RE.test(request.params.userId)) {
        return reply.code(400).send({
          error: "INVALID_REQUEST",
          message: "Invalid user id."
        });
      }

      if (request.params.userId === session.userId) {
        return reply.code(400).send({
          error: "SELF_REVOKE_BLOCKED",
          message:
            "Use Sign out from your account page instead of revoking your own admin session."
        });
      }

      await deleteUserSessions(database, request.params.userId);

      return {
        ok: true,
        message: "All active sessions for that user were revoked."
      };
    }
  );
}
