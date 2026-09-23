# MangaFlux

MangaFlux is a modular manga reader and source-adapter platform intended to power **manga.kenncode.me**.

The project is inspired by the adapter pattern used by multi-source readers, but the runtime and source integrations here are original implementations. Each source exposes the same interface so the web app does not need to understand each upstream site's API or HTML structure.

## Planned architecture

```text
manga.kenncode.me
      |
      v
Next.js web app (Vercel)
      |
      v
MangaFlux API (Render)
      |
      +--> fetchSource()    normal HTTPS / JSON / HTML
      +--> browserSource()  Playwright, only when necessary
      |
      v
Source adapters
      |
      v
Normalized manga / chapter / page data
      |
      +--> Neon Postgres for bookmarks, progress and cache metadata
```

## Goals

- Pluggable source adapters with a common contract
- Prefer official/public APIs where available
- Direct HTTPS fetching first; browser automation only when required
- Server-side host allowlists, response limits and timeouts
- Cache metadata instead of mirroring manga image files
- User library, bookmarks and reading progress
- Optional Discord notifications later
- Deploy the frontend on Vercel and the API on Render

## Initial sources

- MangaDex — official/public API integration
- Internet Archive — experimental metadata adapter

Only use sources in ways permitted by their API terms, robots/access rules, and content licenses. MangaFlux is not intended to bypass CAPTCHAs, paywalls, login walls, or anti-bot protections.

## Repository layout

```text
apps/
  web/        Next.js frontend
  api/        Node.js API
packages/
  runtime/    HTTP/browser runtime and cache primitives
  sources/    source contracts and adapters
  db/         Neon/Drizzle database schema
```

## Local development

Requirements:

- Node.js 22+
- npm 10+

```bash
npm install
cp .env.example .env
npm run dev
```

The starter ships with MangaDex enabled. Browser-backed fetching is available as a runtime primitive but should only be used for sources that explicitly allow the required access pattern.

## Deployment target

- **Frontend:** Vercel → `manga.kenncode.me`
- **API:** Render
- **Database:** Neon Postgres
- **Scheduled refreshes:** not required for V1; use lazy cache refresh first
- **Discord bot:** optional client/notification layer, not a dependency of the website

## Status

Early scaffold. Authentication, production database migrations, reader UX, caching policy, and deployment configuration are the next milestones.
