import Fastify from "fastify";
import cors from "@fastify/cors";
import { mangaDexSource } from "@mangaflux/sources";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN ?? "http://localhost:3000"
});

app.get("/health", async () => ({ ok: true, service: "mangaflux-api" }));

app.get<{ Querystring: { q?: string } }>("/api/search", async (request, reply) => {
  const query = request.query.q?.trim();
  if (!query) return reply.code(400).send({ error: "Missing q query parameter" });

  const items = await mangaDexSource.search(query);
  return { source: mangaDexSource.id, items };
});

const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
