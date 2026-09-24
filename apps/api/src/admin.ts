import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import {
  deleteCommunityCommentAsAdmin,
  deleteUserSessions,
  getAdminOverview
} from "@mangaflux/db";
import type { MangaFluxDatabase } from "@mangaflux/db";
import { authenticateSession } from "./auth.js";
import { isAdminEmail } from "./adminAccess.js";
import { getDiagnosticsSnapshot } from "./diagnostics.js";
import { getMangaDexCacheStats } from "@mangaflux/sources";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
