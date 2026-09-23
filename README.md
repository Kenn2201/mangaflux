# MangaFlux

> A modular manga reader and source-adapter platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.2.1--Security_Patch-indigo.svg)
[![Versioning](https://img.shields.io/badge/policy-VERSIONING.md-blue.svg)](VERSIONING.md)
[![Changelog](https://img.shields.io/badge/changelog-CHANGELOG.md-emerald.svg)](CHANGELOG.md)
[![Security](https://img.shields.io/badge/security-SECURITY.md-red.svg)](SECURITY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=nextdotjs)
![Fastify](https://img.shields.io/badge/Fastify-5-black.svg?logo=fastify)
![Render](https://img.shields.io/badge/Render-API-46E3B7.svg?logo=render)
![Vercel](https://img.shields.io/badge/Vercel-Web-black.svg?logo=vercel)
![Neon](https://img.shields.io/badge/Neon-Postgres-00E599.svg)

---

## Version and release status

- Current version: v0.2.1 Security Patch
- Version policy: VERSIONING.md
- Changelog: CHANGELOG.md
- Security policy: SECURITY.md
- Roadmap: docs/ROADMAP.md

MangaFlux is still pre-1.0. The current milestone hardens the reader and runtime before authentication and user-owned state are added.

## Architecture

~~~text
manga.kenncode.me
      |
      v
Next.js / Vercel
same-origin metadata routes
      |
      v
api.manga.kenncode.me
Fastify / Render
      |
      +--> validation + per-IP rate limits
      +--> short-lived metadata cache
      +--> bounded MangaDex image proxy
      |
      v
MangaDex API / At-Home
      |
      v
Neon Postgres
bookmarks / progress / cache (next milestone)
~~~

The public API URL is not a secret. Database credentials, auth secrets, platform tokens, and future signing keys are secrets and stay in Render/Vercel environment settings.

## Current reader capabilities

- MangaDex search with cover art
- manga details, tags, authors, and artists
- English chapter listing with scanlation-group metadata
- MangaDex At-Home chapter resolution
- bounded server-side image proxy with normal/data-saver fallback
- responsive manga details and vertical reader
- MangaDex and scanlation-group attribution

## Security baseline

The v0.2.x hardening line adds explicit CORS origins, strict input validation, route-specific in-memory rate limits, HTTPS-only source requests, redirect host revalidation, bounded timeouts and response sizes, disabled-by-default browser execution, generic public errors with request IDs, short-lived source caches, CI secret scanning/typechecks/builds/npm audits, and weekly Dependabot review.

See SECURITY.md for credential-handling rules and limitations.

## Repository layout

~~~text
apps/
  web/        Next.js frontend
  api/        Fastify API
packages/
  runtime/    restricted HTTP + optional gated browser runtime
  sources/    source contract and MangaDex adapter
  db/         Neon/Drizzle schema
scripts/
  check-secrets.mjs
docs/
  ARCHITECTURE.md
  ROADMAP.md
  V1-TASKS.md
~~~

## Local development

Requirements:

- Node.js 22+
- npm 10+

~~~bash
npm install
cp .env.example .env
npm run check:secrets
npm run typecheck
npm run build
npm run dev:api
npm run dev:web
~~~

Environment variables are documented in .env.example. Never copy real credentials into that file.

## Deployment

- Frontend: Vercel at manga.kenncode.me
- API: Render at api.manga.kenncode.me
- Database: Neon Postgres
- Wake and health check: cron-job.org
- Future monitoring: optional Sentry after the V1 reader/security baseline is stable

## Source policy

MangaFlux prefers official/public APIs and permitted integrations. It is not intended to bypass CAPTCHAs, paywalls, login walls, or anti-bot protections.

The MangaDex integration must follow MangaDex API terms and attribution requirements. MangaFlux does not store permanent chapter archives in Neon Object Storage.

## Roadmap

V1 finishes the stable MangaDex reader, navigation state, page progress, Neon persistence, authentication, bookmarks, and Continue Reading.

V2 introduces the real multi-source layer: source manifests, unified search, health checks, deduplication, and source fallback.

See docs/ROADMAP.md for later ideas such as Discord notifications, semantic metadata search, PWA/mobile clients, and adapter tooling.
