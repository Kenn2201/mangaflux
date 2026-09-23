# MangaFlux

> A modular manga reader and source-adapter platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.4.0--Neon_Persistence-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?logo=nextdotjs)
![Fastify](https://img.shields.io/badge/Fastify-5-black.svg?logo=fastify)
![Render](https://img.shields.io/badge/Render-API-46E3B7.svg?logo=render)
![Vercel](https://img.shields.io/badge/Vercel-Web-black.svg?logo=vercel)
![Neon](https://img.shields.io/badge/Neon-Postgres-00E599.svg)

---

## Version and release status

- Current version: **v0.4.0 Neon Persistence**
- Version policy: [VERSIONING.md](VERSIONING.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Security policy: [SECURITY.md](SECURITY.md)
- Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)

MangaFlux is still pre-1.0. v0.4 adds device-scoped bookmarks, reading history, page progress, and Continue Reading backed by Neon before account authentication is introduced.

## Architecture

~~~text
manga.kenncode.me
      |
      v
Next.js / Vercel
  |   same-origin metadata routes
  |   HttpOnly anonymous reader cookie
  v
api.manga.kenncode.me
Fastify / Render
  |
  +--> validation + per-IP rate limits
  +--> short-lived source cache
  +--> bounded MangaDex image proxy
  +--> device library / progress API
  |
  +----------> Neon Postgres
  |            bookmarks
  |            reading progress/history
  |            source cache table
  |
  v
MangaDex API / At-Home
~~~

The public API URL is not a secret. Database credentials, auth secrets, platform tokens, and future signing keys stay in server environment settings.

## Current reader capabilities

- MangaDex search with cover art
- manga details, tags, authors, and artists
- English chapter listing with scanlation-group metadata
- MangaDex At-Home chapter resolution
- bounded server-side image proxy with normal/data-saver fallback
- responsive manga details and vertical reader
- preserved search state across details and reader navigation
- current Page X / Y tracking with a live progress bar
- previous/next chapter navigation
- persistent data-saver preference
- device-scoped bookmarks
- Neon-backed reading progress and recent history
- Continue Reading with page resume
- MangaDex and scanlation-group attribution

## Persistence model before auth

v0.4 deliberately does **not** pretend that the anonymous reader cookie is an account. Vercel issues a random HttpOnly reader UUID and uses it server-to-server when requesting saved state from Render. Only manga IDs, titles, cover URLs, chapter/page progress, and timestamps are stored.

v0.5 will replace this device-only ownership model with authenticated account ownership and migration/sync behavior.

## Database migrations

Render runs the checked-in Drizzle runtime migrations before the API starts:

~~~text
npm run db:migrate
~~~

Migration SQL lives in `packages/db/drizzle`. CI validates the journal and SQL files without needing production database credentials.

## Security baseline

The v0.2+ hardening line includes explicit CORS origins, strict input validation, route-specific rate limits, HTTPS-only source requests, redirect host revalidation, bounded timeouts/response sizes, generic public errors, secret scanning, migration checks, typechecks, builds, dependency audits, and Dependabot.

See [SECURITY.md](SECURITY.md).

## Repository layout

~~~text
apps/
  web/        Next.js frontend + same-origin state proxy
  api/        Fastify API + persistence endpoints
packages/
  runtime/    restricted HTTP runtime
  sources/    source contract and MangaDex adapter
  db/         Neon/Drizzle schema, repository and migrations
scripts/
  check-secrets.mjs
  check-migrations.mjs
docs/
  ARCHITECTURE.md
  ROADMAP.md
  V1-TASKS.md
~~~

## Local development

Requirements:

- Node.js 22+
- npm 10+
- Neon/Postgres connection string for persistence features

~~~bash
npm install
cp .env.example .env
npm run check:secrets
npm run check:migrations
npm run typecheck
npm run build
npm run db:migrate
npm run dev:api
npm run dev:web
~~~

Keep `DATABASE_URL` server-side. Never place it in a `NEXT_PUBLIC_*` variable.

## Deployment

- Frontend: Vercel at `manga.kenncode.me`
- API: Render at `api.manga.kenncode.me`
- Database: Neon Postgres
- Wake and health check: cron-job.org
- Future monitoring: optional Sentry during V1 stabilization

## Source policy

MangaFlux prefers official/public APIs and permitted integrations. It is not intended to bypass CAPTCHAs, paywalls, login walls, or anti-bot protections.

The MangaDex integration must follow MangaDex API terms and attribution requirements. MangaFlux does not keep permanent manga-page archives in Neon/Object Storage.

## Roadmap

The next milestone is **v0.5 authentication**, which binds the current library/progress model to authenticated users and adds account sync/security.

V2 remains the multi-source milestone with source manifests, health checks, unified search, deduplication, and permitted-source fallback.
