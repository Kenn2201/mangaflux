import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  fetchMangaDexPageImage,
  mangaDexSource
} from "@mangaflux/sources";

const app = Fastify({ logger: true });

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
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const statusCode =
    error instanceof RangeError
      ? 404
      : error.name === "AbortError" || error.name === "TimeoutError"
        ? 504
        : 502;

  return reply.code(statusCode).send({
    error: statusCode === 404 ? "NOT_FOUND" : "UPSTREAM_ERROR",
    message: error.message
  });
});

app.get("/health", async () => ({
  ok: true,
  service: "mangaflux-api",
  source: "mangadex",
  corsOrigins: Array.from(allowedOrigins)
}));

app.get("/api/sources", async () => ({
  sources: [{ id: mangaDexSource.id, name: mangaDexSource.name, enabled: true }]
}));

app.get<{ Querystring: { q?: string } }>("/api/search", async (request, reply) => {
  const query = request.query.q?.trim();
  if (!query) {
    return reply.code(400).send({
      error: "INVALID_REQUEST",
      message: "Missing q query parameter"
    });
  }

  const items = await mangaDexSource.search(query);
  return { source: mangaDexSource.id, items };
});

app.get<{ Params: { id: string } }>(
  "/api/manga/mangadex/:id",
  async (request) => {
    const item = await mangaDexSource.details(request.params.id);
    return { source: mangaDexSource.id, item };
  }
);

app.get<{
  Params: { id: string };
  Querystring: { language?: string };
}>(
  "/api/manga/mangadex/:id/chapters",
  async (request) => {
    const language = request.query.language?.trim() || "en";
    const items = await mangaDexSource.chapters(request.params.id, { language });
    return { source: mangaDexSource.id, language, items };
  }
);

app.get<{
  Params: { chapterId: string };
  Querystring: { dataSaver?: string };
}>(
  "/api/chapter/mangadex/:chapterId/pages",
  async (request) => {
    const dataSaver = request.query.dataSaver === "true";
    return mangaDexSource.pages(request.params.chapterId, { dataSaver });
  }
);

app.get<{
  Params: { chapterId: string; pageIndex: string };
  Querystring: { dataSaver?: string };
}>(
  "/api/chapter/mangadex/:chapterId/image/:pageIndex",
  async (request, reply) => {
    const pageIndex = Number(request.params.pageIndex);

    if (!Number.isInteger(pageIndex) || pageIndex < 1) {
      return reply.code(400).send({
        error: "INVALID_REQUEST",
        message: "pageIndex must be a positive integer"
      });
    }

    const dataSaver = request.query.dataSaver === "true";
    const image = await fetchMangaDexPageImage(
      request.params.chapterId,
      pageIndex,
      dataSaver
    );

    reply.header("Content-Type", image.contentType);
    reply.header("Cache-Control", "private, max-age=300");
    reply.header("X-Content-Type-Options", "nosniff");

    return reply.send(Buffer.from(image.bytes));
  }
);

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
