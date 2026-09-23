import {
  createHash,
  timingSafeEqual
} from "node:crypto";
import type {
  FastifyReply,
  FastifyRequest
} from "fastify";

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function safeEqualString(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function requireAuthProxy(
  request: FastifyRequest,
  reply: FastifyReply,
  expectedSecret: string
) {
  if (!expectedSecret) {
    reply.code(503).send({
      error: "AUTH_UNAVAILABLE",
      message: "Authentication is not configured."
    });
    return false;
  }

  const supplied = request.headers["x-mangaflux-auth-proxy"];
  const value = Array.isArray(supplied) ? supplied[0] : supplied;

  if (
    !value ||
    value.length > 512 ||
    !safeEqualString(value, expectedSecret)
  ) {
    reply.code(403).send({
      error: "FORBIDDEN",
      message: "This authentication endpoint is not available directly."
    });
    return false;
  }

  return true;
}

export function getBearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token || token.length > 256) return null;

  return token;
}
