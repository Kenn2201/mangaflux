import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  createDatabase,
  createNewChapterNotificationEvent,
  getNotificationCheckpoint,
  getNotificationEligibleFollows,
  getNotificationDeliveryUser,
  probeDatabase,
  upsertNotificationCheckpoint
} from "@mangaflux/db";
import { registerAdminRoutes } from "./admin.js";
import { isAdminConfigured } from "./adminAccess.js";
import { registerAuthRoutes } from "./auth.js";
import { registerCommunityRoutes } from "./community.js";
import {
  isEmailConfigured,
  sendNewChapterNotificationEmail
} from "./email.js";
import { registerStateRoutes } from "./state.js";
import { attachDiagnostics } from "./diagnostics.js";
import {
  fetchMangaDexPageImage,
  getSourceDescriptor,
  listSourceDescriptors,
  requireSourceCapability,
  sourceSupportsDiscoveryKind,
  sourceSupportsLanguage,
  validateSourceChapterId,
  validateSourceMangaId,
  UnsupportedSourceCapabilityError
} from "@mangaflux/sources";
import type {
  MangaDiscoveryKind,
  MangaSummary
} from "@mangaflux/sources";

const APP_VERSION = "2.0.5";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANGUAGE_RE = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i;
const DISCOVERY_KINDS = new Set<MangaDiscoveryKind>([
  "popular",
  "top",
  "latest",
  "hot",
  "trending"
]);
const MANGA_STATUSES = new Set([
  "ongoing",
  "completed",
  "hiatus",
  "cancelled"
]);
const DISCOVERY_LANGUAGES = new Set([
  "en",
  "ja",
  "ko",
  "zh",
  "zh-hk",
  "es",
  "fr",
  "de",
  "it",
  "pt-br",
  "id",
  "vi",
  "th"
]);

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

attachDiagnostics(app);

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

const MAX_RATE_BUCKETS = 10_000;

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

    if (!current && buckets.size >= MAX_RATE_BUCKETS) {
      const oldestKey = buckets.keys().next().value as string | undefined;
      if (oldestKey) buckets.delete(oldestKey);
    }

    const remaining = Math.max(0, limit - bucket.count);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000)
    );

    reply.header("RateLimit-Limit", String(limit));
    reply.header("RateLimit-Remaining", String(remaining));
    reply.header("RateLimit-Reset", String(retryAfterSeconds));
    reply.header(
      "RateLimit-Policy",
      `${limit};w=${Math.max(1, Math.ceil(windowMs / 1000))}`
    );

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

const statusRateLimit = makeRateLimit("status", 30);
const searchRateLimit = makeRateLimit("search", 30);
const discoveryRateLimit = makeRateLimit("discovery", 60);
const metadataRateLimit = makeRateLimit("metadata", 90);
const imageRateLimit = makeRateLimit("images", 240);
const stateReadRateLimit = makeRateLimit("state-read", 120);
const stateWriteRateLimit = makeRateLimit("state-write", 60);
const authSignupRateLimit = makeRateLimit("auth-signup", 5, 10 * 60_000);
const authLoginRateLimit = makeRateLimit("auth-login", 10, 10 * 60_000);
const authSessionRateLimit = makeRateLimit("auth-session", 120);
const authEmailRateLimit = makeRateLimit("auth-email", 8, 15 * 60_000);
const communityReadRateLimit = makeRateLimit("community-read", 120);
const communityWriteRateLimit = makeRateLimit(
  "community-write",
  30,
  5 * 60_000
);
const adminReadRateLimit = makeRateLimit("admin-read", 60);
const adminWriteRateLimit = makeRateLimit(
  "admin-write",
  20,
  5 * 60_000
);
const notificationCheckRateLimit = makeRateLimit(
  "notification-check",
  4,
  10 * 60_000
);
const MAX_NOTIFICATION_EMAILS_PER_CHECK = 20;

function isNotificationQuietNow(
  input: { enabled: boolean; start: string; end: string; timeZone: string },
  now = new Date()
) {
  if (!input.enabled || input.start === input.end) return false;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: input.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(now);
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    const minute = Number(parts.find((part) => part.type === "minute")?.value);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return false;
    const current = hour * 60 + minute;
    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const start = toMinutes(input.start);
    const end = toMinutes(input.end);
    return start < end
      ? current >= start && current < end
      : current >= start || current < end;
  } catch {
    return false;
  }
}

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

function parseBoundedInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  if (value === undefined) return fallback;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

function requestedSource(value: string | undefined, capability: Parameters<typeof requireSourceCapability>[1]) {
  return requireSourceCapability(value?.trim() || "mangadex", capability);
}

function sourceCacheControl(sourceId: string, kind: "search" | "metadata" | "chapters") {
  const seconds = getSourceDescriptor(sourceId)?.policy.cache[
    kind === "search" ? "searchSeconds" : kind === "chapters" ? "chaptersSeconds" : "metadataSeconds"
  ] ?? 0;
  return `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${Math.max(seconds, seconds * 2)}`;
}

function parseDiscoveryKind(
  value: string | undefined
): MangaDiscoveryKind | null {
  if (!value || !DISCOVERY_KINDS.has(value as MangaDiscoveryKind)) {
    return null;
  }

  return value as MangaDiscoveryKind;
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
      : error instanceof UnsupportedSourceCapabilityError
        ? 501
        : error instanceof RangeError
          ? 404
        : errorName === "AbortError" || errorName === "TimeoutError"
          ? 504
          : 502;

  return reply.code(statusCode).send({
    error:
      statusCode === 501
        ? "SOURCE_CAPABILITY_UNAVAILABLE"
        : statusCode === 404
          ? "NOT_FOUND"
        : authRequest
          ? "AUTH_UNAVAILABLE"
          : persistenceRequest
            ? "PERSISTENCE_UNAVAILABLE"
            : "UPSTREAM_ERROR",
    message:
      statusCode === 501
        ? "The selected source does not support this operation."
        : statusCode === 404
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
  sources: listSourceDescriptors().filter((source) => source.enabled).map((source) => source.id),
  persistence: database ? "configured" : "disabled",
  auth:
    database && authProxySecret
      ? "configured"
      : "disabled",
  email: isEmailConfigured() ? "configured" : "disabled",
  admin: isAdminConfigured() ? "configured" : "disabled"
}));

app.get(
  "/api/status",
  { preHandler: statusRateLimit },
  async (_request, reply) => {
    const sourceDescriptors = listSourceDescriptors().filter((source) => source.enabled);
    const [sourceHealth, databaseHealth] = await Promise.all([
      Promise.all(sourceDescriptors.map(async (descriptor) => {
        const source = requireSourceCapability(descriptor.id, "health");
        return source.health();
      })),
      database
        ? probeDatabase(database)
        : Promise.resolve({
            status: "disabled" as const,
            latencyMs: 0,
            checkedAt: new Date().toISOString()
          })
    ]);

    const persistenceStatus = databaseHealth.status;
    const overall =
      sourceHealth.every((source) => source.status === "operational") &&
      persistenceStatus === "operational"
        ? "operational"
        : "degraded";

    reply.header(
      "Cache-Control",
      "public, max-age=15, s-maxage=15, stale-while-revalidate=30"
    );

    return {
      ok: overall === "operational",
      status: overall,
      service: "mangaflux-api",
      version: APP_VERSION,
      checkedAt: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      components: {
        api: {
          status: "operational"
        },
        sources: sourceHealth,
        persistence: databaseHealth,
        auth: {
          status:
            database && authProxySecret
              ? "configured"
              : "disabled"
        },
        email: {
          status: isEmailConfigured()
            ? "configured"
            : "disabled"
        },
        admin: {
          status: isAdminConfigured()
            ? "configured"
            : "disabled"
        }
      }
    };
  }
);

registerAuthRoutes(app, database, authProxySecret, {
  signup: authSignupRateLimit,
  login: authLoginRateLimit,
  session: authSessionRateLimit,
  email: authEmailRateLimit
});

registerStateRoutes(app, database, authProxySecret, {
  read: stateReadRateLimit,
  write: stateWriteRateLimit
});

registerCommunityRoutes(app, database, authProxySecret, {
  read: communityReadRateLimit,
  write: communityWriteRateLimit
});

registerAdminRoutes(app, database, authProxySecret, {
  read: adminReadRateLimit,
  write: adminWriteRateLimit
});

app.post(
  "/api/internal/notifications/check",
  { preHandler: notificationCheckRateLimit },
  async (request, reply) => {
    const configuredSecret =
      process.env.NOTIFICATION_CRON_SECRET?.trim() ?? "";
    const suppliedSecret =
      typeof request.headers.authorization === "string" &&
      request.headers.authorization.startsWith("Bearer ")
        ? request.headers.authorization.slice(7).trim()
        : "";

    if (
      !database ||
      !configuredSecret ||
      suppliedSecret !== configuredSecret
    ) {
      return reply.code(404).send({ error: "NOT_FOUND" });
    }

    const users = await database.query.users.findMany({
      columns: { id: true }
    });

    let eligible = 0;
    let seeded = 0;
    let unchanged = 0;
    let created = 0;
    let emailSent = 0;
    let emailSkipped = 0;
    let emailFailed = 0;
    let emailRateLimited = 0;
    let emailQuietHours = 0;
    let advanced = 0;
    let skipped = 0;
    let failed = 0;

    for (const user of users) {
      const follows = await getNotificationEligibleFollows(
        database,
        user.id
      );

      for (const follow of follows) {
        eligible += 1;

        const descriptor = getSourceDescriptor(follow.source);
        if (!descriptor?.enabled || !descriptor.capabilities.chapters) {
          skipped += 1;
          continue;
        }

        try {
          const notificationSource = requireSourceCapability(follow.source, "chapters");
          const page = await notificationSource.chapterPage(
            follow.mangaId,
            {
              language: "en",
              limit: 1,
              offset: 0,
              order: "desc"
            }
          );
          const latest = page.items[0];

          if (!latest) {
            skipped += 1;
            continue;
          }

          const publishedAt = latest.publishedAt
            ? new Date(latest.publishedAt)
            : null;
          const sourcePublishedAt =
            publishedAt && !Number.isNaN(publishedAt.getTime())
              ? publishedAt
              : null;
          const checkpoint = await getNotificationCheckpoint(
            database,
            user.id,
            follow.source,
            follow.mangaId
          );

          if (!checkpoint) {
            await upsertNotificationCheckpoint(database, {
              userId: user.id,
              source: follow.source,
              mangaId: follow.mangaId,
              lastChapterId: latest.id,
              lastPublishedAt: sourcePublishedAt
            });
            seeded += 1;
            continue;
          }

          if (checkpoint.lastChapterId === latest.id) {
            await upsertNotificationCheckpoint(database, {
              userId: user.id,
              source: follow.source,
              mangaId: follow.mangaId,
              lastChapterId: latest.id,
              lastPublishedAt: sourcePublishedAt
            });
            unchanged += 1;
            continue;
          }

          const result = await createNewChapterNotificationEvent(
            database,
            {
              userId: user.id,
              source: follow.source,
              mangaId: follow.mangaId,
              mangaTitle: follow.title,
              coverUrl: follow.coverUrl,
              chapterId: latest.id,
              chapterLabel: latest.chapter ?? latest.title,
              chapterTitle: latest.title,
              sourcePublishedAt
            }
          );

          await upsertNotificationCheckpoint(database, {
            userId: user.id,
            source: follow.source,
            mangaId: follow.mangaId,
            lastChapterId: latest.id,
            lastPublishedAt: sourcePublishedAt
          });

          if (result.created) {
            created += 1;
            if (result.event) {
              const deliveryUser = await getNotificationDeliveryUser(database, user.id);
              if (deliveryUser?.notificationEmailEnabled && deliveryUser.emailVerifiedAt && isEmailConfigured()) {
                const quietNow = isNotificationQuietNow({
                  enabled: deliveryUser.notificationQuietHoursEnabled,
                  start: deliveryUser.notificationQuietHoursStart,
                  end: deliveryUser.notificationQuietHoursEnd,
                  timeZone: deliveryUser.notificationTimeZone
                });
                if (quietNow) {
                  emailQuietHours += 1;
                } else if (emailSent >= MAX_NOTIFICATION_EMAILS_PER_CHECK) {
                  emailRateLimited += 1;
                } else {
                  try {
                    const sent = await sendNewChapterNotificationEmail(deliveryUser.email, {
                      eventId: result.event.id,
                      mangaTitle: result.event.mangaTitle,
                      chapterId: result.event.chapterId,
                      chapterLabel: result.event.chapterLabel,
                      chapterTitle: result.event.chapterTitle
                    });
                    if (sent) emailSent += 1;
                    else emailFailed += 1;
                  } catch (error) {
                    emailFailed += 1;
                    request.log.warn({ err: error, userId: user.id, eventId: result.event.id }, "New chapter email delivery failed");
                  }
                }
              } else {
                emailSkipped += 1;
              }
            }
          }
          advanced += 1;
        } catch (error) {
          failed += 1;
          request.log.warn(
            {
              err: error,
              userId: user.id,
              mangaId: follow.mangaId
            },
            "Notification chapter check failed"
          );
        }
      }
    }

    return {
      ok: failed === 0,
      users: users.length,
      eligible,
      seeded,
      unchanged,
      created,
      emailSent,
      emailSkipped,
      emailFailed,
      emailRateLimited,
      emailQuietHours,
      advanced,
      skipped,
      failed
    };
  }
);

app.get(
  "/api/sources",
  { preHandler: metadataRateLimit },
  async () => ({
    sources: listSourceDescriptors()
  })
);

app.get<{ Querystring: { q?: string; limit?: string; source?: string } }>(
  "/api/search",
  { preHandler: searchRateLimit },
  async (request, reply) => {
    const query = request.query.q?.trim();
    const limit = parseBoundedInt(request.query.limit, 24, 1, 24);

    if (!query || query.length > 120 || limit === null) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message:
          "q must contain between 1 and 120 characters and limit must be 1-24"
      });
    }

    const source = requestedSource(request.query.source, "search");
    const items = await source.search(query, { limit });

    reply.header(
      "Cache-Control",
      sourceCacheControl(source.id, "search")
    );

    return { source: source.id, items };
  }
);

app.get<{
  Querystring: {
    kind?: string;
    limit?: string;
    offset?: string;
    tag?: string;
    year?: string;
    creator?: string;
    status?: string;
    language?: string;
    source?: string;
  };
}>(
  "/api/discovery",
  { preHandler: discoveryRateLimit },
  async (request, reply) => {
    const kind = parseDiscoveryKind(request.query.kind);
    const source = requestedSource(request.query.source, "discovery");
    const limit = parseBoundedInt(request.query.limit, 24, 1, 50);
    const offset = parseBoundedInt(request.query.offset, 0, 0, 10_000);
    const tagId = request.query.tag?.trim();
    const creatorId = request.query.creator?.trim();
    const status = request.query.status?.trim();
    const language =
      request.query.language?.trim().toLowerCase() || "en";
    const year =
      request.query.year === undefined
        ? undefined
        : parseBoundedInt(request.query.year, 0, 1900, 2100);

    if (
      !kind ||
      limit === null ||
      offset === null ||
      year === null ||
      (tagId && !UUID_RE.test(tagId)) ||
      (creatorId && !UUID_RE.test(creatorId)) ||
      (status && !MANGA_STATUSES.has(status)) ||
      !DISCOVERY_LANGUAGES.has(language) ||
      (kind && !sourceSupportsDiscoveryKind(source.id, kind)) ||
      !sourceSupportsLanguage(source.id, language)
    ) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message:
          "Invalid discovery kind, pagination, genre tag, year, creator, status, or language."
      });
    }

    const page = await source.discover(kind, {
      limit,
      offset,
      tagId,
      year,
      creatorId,
      status: status as
        | "ongoing"
        | "completed"
        | "hiatus"
        | "cancelled"
        | undefined,
      language
    });

    reply.header(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=120"
    );

    return {
      source: source.id,
      kind,
      ...page
    };
  }
);

app.get<{
  Querystring: { language?: string; status?: string; source?: string };
}>(
  "/api/discovery/home",
  { preHandler: discoveryRateLimit },
  async (request, reply) => {
    const language =
      request.query.language?.trim().toLowerCase() || "en";
    const source = requestedSource(request.query.source, "discovery");
    const status = request.query.status?.trim();

    if (
      !DISCOVERY_LANGUAGES.has(language) ||
      !sourceSupportsLanguage(source.id, language) ||
      (status && !MANGA_STATUSES.has(status))
    ) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message: "Invalid discovery language or preferred status."
      });
    }

    const preferredStatus = status as
      | "ongoing"
      | "completed"
      | "hiatus"
      | "cancelled"
      | undefined;

    const [hot, popular, trending, top, latest] = await Promise.all([
      source.discover("hot", {
        limit: 10,
        language,
        status: preferredStatus
      }),
      source.discover("popular", {
        limit: 10,
        language,
        status: preferredStatus
      }),
      source.discover("trending", {
        limit: 10,
        language,
        status: preferredStatus
      }),
      source.discover("top", { limit: 10, language }),
      source.discover("latest", { limit: 10, language })
    ]);

    reply.header(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=120"
    );

    return {
      source: source.id,
      language,
      preferredStatus: preferredStatus ?? null,
      sections: { hot, popular, trending, top, latest }
    };
  }
);

app.get<{ Querystring: { source?: string } }>(
  "/api/genres",
  { preHandler: discoveryRateLimit },
  async (request, reply) => {
    const source = requestedSource(request.query.source, "tags");
    const tags = await source.tags();

    reply.header(
      "Cache-Control",
      "public, max-age=21600, s-maxage=21600, stale-while-revalidate=43200"
    );

    return {
      source: source.id,
      items: tags
    };
  }
);

app.get<{ Params: { source: string; id: string } }>(
  "/api/manga/:source/:id",
  { preHandler: metadataRateLimit },
  async (request, reply) => {
    const source = requestedSource(request.params.source, "details");
    if (!validateSourceMangaId(source.id, request.params.id)) {
      return reply.code(400).send({ error: "INVALID_REQUEST", message: "id is invalid for the selected source" });
    }

    const item = await source.details(request.params.id);

    reply.header(
      "Cache-Control",
      sourceCacheControl(source.id, "metadata")
    );

    return { source: source.id, item };
  }
);

app.get<{ Params: { source: string; id: string } }>(
  "/api/manga/:source/:id/related",
  { preHandler: metadataRateLimit },
  async (request, reply) => {
    const source = requestedSource(request.params.source, "related");
    if (!validateSourceMangaId(source.id, request.params.id)) {
      return reply.code(400).send({ error: "INVALID_REQUEST", message: "id is invalid for the selected source" });
    }

    const items = await source.related(request.params.id);

    reply.header(
      "Cache-Control",
      sourceCacheControl(source.id, "metadata")
    );

    return {
      source: source.id,
      items
    };
  }
);

app.get<{
  Params: { source: string; id: string };
  Querystring: {
    language?: string;
    limit?: string;
    offset?: string;
    order?: string;
    chapter?: string;
  };
}>(
  "/api/manga/:source/:id/chapters",
  { preHandler: metadataRateLimit },
  async (request, reply) => {
    const source = requestedSource(request.params.source, "chapters");
    if (!validateSourceMangaId(source.id, request.params.id)) {
      return reply.code(400).send({ error: "INVALID_REQUEST", message: "id is invalid for the selected source" });
    }

    const language = request.query.language?.trim() || "en";
    const limit = parseBoundedInt(request.query.limit, 50, 1, 100);
    const offset = parseBoundedInt(request.query.offset, 0, 0, 10_000);
    const order =
      request.query.order === "asc"
        ? "asc"
        : request.query.order === undefined ||
            request.query.order === "desc"
          ? "desc"
          : null;
    const chapter = request.query.chapter?.trim();

    if (
      !LANGUAGE_RE.test(language) ||
      limit === null ||
      offset === null ||
      order === null ||
      (chapter && !/^[0-9]+(?:\.[0-9]+)?$/.test(chapter))
    ) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message:
          "Invalid language, chapter pagination, sort order, or chapter number."
      });
    }

    const page = await source.chapterPage(request.params.id, {
      language,
      limit,
      offset,
      order,
      chapter
    });

    reply.header(
      "Cache-Control",
      sourceCacheControl(source.id, "chapters")
    );

    return {
      source: source.id,
      language,
      ...page
    };
  }
);

app.get<{
  Params: { source: string; chapterId: string };
  Querystring: { dataSaver?: string };
}>(
  "/api/chapter/:source/:chapterId/pages",
  { preHandler: metadataRateLimit },
  async (request, reply) => {
    const source = requestedSource(request.params.source, "pages");
    if (!validateSourceChapterId(source.id, request.params.chapterId)) {
      return reply.code(400).send({ error: "INVALID_REQUEST", message: "chapterId is invalid for the selected source" });
    }

    const dataSaver = parseDataSaver(request.query.dataSaver, reply);
    if (dataSaver === null) return;

    return source.pages(request.params.chapterId, { dataSaver });
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
