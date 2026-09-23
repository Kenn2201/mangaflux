import Fastify from "fastify";
import cors from "@fastify/cors";
import { mangaDexSource } from "@mangaflux/sources";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN ?? "http://localhost:3000"
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const statusCode = error.name === "AbortError" ? 504 : 502;

  return reply.code(statusCode).send({
    error: "UPSTREAM_ERROR",
    message: error.message
  });
});

app.get("/health", async () => ({
  ok: true,
  service: "mangaflux-api",
  source: "mangadex"
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

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
