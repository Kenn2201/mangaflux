import Fastify from "fastify";
import cors from "@fastify/cors";
import { createDatabase } from "@mangaflux/db";
import { registerAuthRoutes } from "./auth.js";
import { registerStateRoutes } from "./state.js";
import {
  fetchMangaDexPageImage,
  mangaDexSource
} from "@mangaflux/sources";

const APP_VERSION = "0.5.0";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANGUAGE_RE = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i;

const app = Fastify({
  logger: true,
  trustProxy: true,
  bodyLimit: 64 * 1024
});

const allowedOrigins = new Set(
  [
    "https://manga.kenncode.me",
    "http://localhost:3000",
    ...(process.env.WEB_ORIGIN ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ].map((origin) => origin.replace(/\/$/, ""))
);

await app.register(cors, {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    const allowed = allowedOrigins.has(normalizedOrigin);

    if (!allowed) {
      app.log.warn({ origin }, "Blocked CORS origin");
    }

    callback(null, allowed);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400
});

app.addHook("onSend", async (_request, reply, payload) => {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-Frame-Options", "DENY");
  reply.header("Referrer-Policy", "no-referrer");
  reply.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  reply.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  if (!reply.hasHeader("Cache-Control")) {
    reply.header("Cache-Control", "no-store");
  }

  return payload;
});

type RateBucket = {
  count: number;
  resetAt: number;
};

function makeRateLimit(name: string, limit: number, windowMs = 60_000) {
  const buckets = new Map<string, RateBucket>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, Math.max(windowMs, 60_000));
  cleanup.unref();

  return async (request: any, reply: any) => {
    const now = Date.now();
    const key = `${request.ip}:${name}`;
    const current = buckets.get(key);

    const bucket =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(0, limit - bucket.count);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000)
    );

    reply.header("RateLimit-Limit", String(limit));
    reply.header("RateLimit-Remaining", String(remaining));
    reply.header("RateLimit-Reset", String(retryAfterSeconds));

    if (bucket.count > limit) {
      reply.header("Retry-After", String(retryAfterSeconds));
      return reply.code(429).send({
        error: "RATE_LIMITED",
        message: "Too many requests. Try again shortly.",
        retryAfterSeconds
      });
    }
  };
}

const searchRateLimit = makeRateLimit("search", 30);
const metadataRateLimit = makeRateLimit("metadata", 90);
const imageRateLimit = makeRateLimit("images", 240);
const stateReadRateLimit = makeRateLimit("state-read", 120);
const stateWriteRateLimit = makeRateLimit("state-write", 60);
const authSignupRateLimit = makeRateLimit("auth-signup", 5, 10 * 60_000);
const authLoginRateLimit = makeRateLimit("auth-login", 10, 10 * 60_000);
const authSessionRateLimit = makeRateLimit("auth-session", 120);

function requireUuid(value: string, reply: any, field = "id") {
  if (UUID_RE.test(value)) return true;

  reply.code(400).send({
    error: "INVALID_REQUEST",
    message: `${field} must be a valid UUID`
  });
  return false;
}

function parseDataSaver(value: string | undefined, reply: any) {
  if (value === undefined) return false;
  if (value === "true") return true;
  if (value === "false") return false;

  reply.code(400).send({
    error: "INVALID_REQUEST",
    message: "dataSaver must be true or false"
  });
  return null;
}

const database = process.env.DATABASE_URL?.trim()
  ? createDatabase(process.env.DATABASE_URL.trim())
  : null;
const authProxySecret = process.env.AUTH_PROXY_SECRET?.trim() ?? "";

app.setErrorHandler((error, request, reply) => {
  request.log.error(
    { err: error, requestId: request.id },
    "Request failed"
  );

  const errorName = error instanceof Error ? error.name : "UnknownError";

  const authRequest = request.url.startsWith("/api/auth/");
  const persistenceRequest =
    request.url.startsWith("/api/state/") ||
    request.url.startsWith("/api/account/state/");

  const statusCode =
    authRequest || persistenceRequest
      ? 503
      : error instanceof RangeError
        ? 404
        : errorName === "AbortError" || errorName === "TimeoutError"
          ? 504
          : 502;

  return reply.code(statusCode).send({
    error:
      statusCode === 404
        ? "NOT_FOUND"
        : authRequest
          ? "AUTH_UNAVAILABLE"
          : persistenceRequest
            ? "PERSISTENCE_UNAVAILABLE"
            : "UPSTREAM_ERROR",
    message:
      statusCode === 404
        ? "The requested resource was not found."
        : authRequest
          ? "Authentication is temporarily unavailable."
          : persistenceRequest
            ? "Reading persistence is temporarily unavailable."
            : statusCode === 504
              ? "The upstream source timed out."
              : "The upstream source request failed.",
    requestId: request.id
  });
});

app.get("/health", async () => ({
  ok: true,
  service: "mangaflux-api",
  version: APP_VERSION,
  source: "mangadex",
  persistence: database ? "configured" : "disabled",
  auth:
    database && authProxySecret
      ? "configured"
      : "disabled"
}));

registerAuthRoutes(app, database, authProxySecret, {
  signup: authSignupRateLimit,
  login: authLoginRateLimit,
  session: authSessionRateLimit
});

registerStateRoutes(app, database, authProxySecret, {
  read: stateReadRateLimit,
  write: stateWriteRateLimit
});

app.get(
  "/api/sources",
  { preHandler: metadataRateLimit },
  async () => ({
    sources: [
      { id: mangaDexSource.id, name: mangaDexSource.name, enabled: true }
    ]
  })
);

app.get<{ Querystring: { q?: string } }>(
  "/api/search",
  { preHandler: searchRateLimit },
  async (request, reply) => {
    const query = request.query.q?.trim();

    if (!query || query.length > 120) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message: "q must contain between 1 and 120 characters"
      });
    }

    const items = await mangaDexSource.search(query);
    return { source: mangaDexSource.id, items };
  }
);

app.get<{ Params: { id: string } }>(
  "/api/manga/mangadex/:id",
  { preHandler: metadataRateLimit },
  async (request, reply) => {
    if (!requireUuid(request.params.id, reply, "id")) return;

    const item = await mangaDexSource.details(request.params.id);
    return { source: mangaDexSource.id, item };
  }
);

app.get<{
  Params: { id: string };
  Querystring: { language?: string };
}>(
  "/api/manga/mangadex/:id/chapters",
  { preHandler: metadataRateLimit },
  async (request, reply) => {
    if (!requireUuid(request.params.id, reply, "id")) return;

    const language = request.query.language?.trim() || "en";
    if (!LANGUAGE_RE.test(language)) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message: "language is invalid"
      });
    }

    const items = await mangaDexSource.chapters(request.params.id, { language });
    return { source: mangaDexSource.id, language, items };
  }
);

app.get<{
  Params: { chapterId: string };
  Querystring: { dataSaver?: string };
}>(
  "/api/chapter/mangadex/:chapterId/pages",
  { preHandler: metadataRateLimit },
  async (request, reply) => {
    if (!requireUuid(request.params.chapterId, reply, "chapterId")) return;

    const dataSaver = parseDataSaver(request.query.dataSaver, reply);
    if (dataSaver === null) return;

    return mangaDexSource.pages(request.params.chapterId, { dataSaver });
  }
);

app.get<{
  Params: { chapterId: string; pageIndex: string };
  Querystring: { dataSaver?: string };
}>(
  "/api/chapter/mangadex/:chapterId/image/:pageIndex",
  { preHandler: imageRateLimit },
  async (request, reply) => {
    if (!requireUuid(request.params.chapterId, reply, "chapterId")) return;

    const pageIndex = Number(request.params.pageIndex);
    if (
      !Number.isInteger(pageIndex) ||
      pageIndex < 1 ||
      pageIndex > 500
    ) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message: "pageIndex must be an integer from 1 to 500"
      });
    }

    const dataSaver = parseDataSaver(request.query.dataSaver, reply);
    if (dataSaver === null) return;

    const image = await fetchMangaDexPageImage(
      request.params.chapterId,
      pageIndex,
      dataSaver
    );

    reply.header("Content-Type", image.contentType);
    reply.header("Cache-Control", "private, max-age=900");
    reply.header("Content-Disposition", "inline");

    return reply.send(Buffer.from(image.bytes));
  }
);

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
