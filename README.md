# MangaFlux

MangaFlux is a modular manga reader and source-adapter platform powering **manga.kenncode.me**.

The project uses an original adapter/runtime architecture: each source implements the same normalized contract while the web app talks only to the MangaFlux API.

## V1 architecture

```text
manga.kenncode.me
      |
      v
Next.js web app (Vercel)
      |
      v
api.manga.kenncode.me
Fastify API (Render)
      |
      v
Source adapters
      |
      +--> MangaDex API
      +--> future permitted sources
      |
      v
Neon Postgres
bookmarks / progress / cache (next milestone)
```

## V1 reader flow

The MangaDex adapter now supports:

- Search with cover art
- Manga details, tags, authors and artists
- English chapter listing with scanlation-group metadata
- MangaDex At-Home chapter page resolution
- Normal and data-saver page URL support
- Source and scanlation-group attribution

API routes:

```text
GET /health
GET /api/sources
GET /api/search?q=one+piece
GET /api/manga/mangadex/:id
GET /api/manga/mangadex/:id/chapters?language=en
GET /api/chapter/mangadex/:chapterId/pages
```

The Next.js app includes a searchable home page, manga-details page, chapter list, and vertical reader.

## Repository layout

```text
apps/
  web/        Next.js frontend
  api/        Fastify API
packages/
  runtime/    restricted HTTP + optional browser runtime
  sources/    source contract and MangaDex adapter
  db/         Neon/Drizzle schema
docs/
  ARCHITECTURE.md
  V1-TASKS.md
```

## Local development

Requirements:

- Node.js 22+
- npm 10+

```bash
npm install
cp .env.example .env
npm run dev:api
npm run dev:web
```

Environment variables:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=
MANGADEX_BASE_URL=https://api.mangadex.org
```

## Deployment

- **Frontend:** Vercel → `manga.kenncode.me`
- **API:** Render → `api.manga.kenncode.me`
- **Database:** Neon Postgres
- **Wake/health check:** cron-job.org
- **Discord:** optional client/notification layer later

## Source policy

MangaFlux should prefer official/public APIs and permitted integrations. It is not intended to bypass CAPTCHAs, paywalls, login walls, or anti-bot protections.

The MangaDex integration must follow the MangaDex API acceptable-use policy, including MangaDex attribution and scanlation-group attribution/removal requirements. MangaFlux does not mirror chapter image files into its own object storage.

## Status

**V0.1 reader milestone:** MangaDex search → details → chapters → page URLs → vertical reader is implemented.

Next milestones are Neon persistence/caching, authentication, bookmarks, reading progress, continue-reading, and reader navigation/polish.
