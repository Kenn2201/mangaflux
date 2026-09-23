# MangaFlux

> A modular manga reader and source-adapter platform powering manga.kenncode.me.

![Version](https://img.shields.io/badge/version-v0.5.0--Authentication-indigo.svg)
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

## Current release

**v0.5.0 — Authentication**

MangaFlux now supports account-backed bookmarks and reading progress while preserving the anonymous device library for signed-out readers.

## Current flow

~~~text
Search
  ↓
Manga details
  ↓
Bookmark / choose chapter
  ↓
Vertical reader
  ↓
Page X / Y + autosaved progress
  ↓
Continue Reading

Signed out:
HttpOnly device reader UUID → Neon device state

Signed in:
HttpOnly session token → Vercel auth/state proxy
                      → Render
                      → Neon account state
~~~

## Authentication architecture

The browser never receives a usable database credential or Render auth proxy secret.

~~~text
Browser
  |
  | same-origin HTTPS
  | HttpOnly mf_session_v1 cookie
  v
Next.js / Vercel
  |
  | X-MangaFlux-Auth-Proxy
  | Authorization: Bearer <opaque session>
  v
Fastify / Render
  |
  | hashes session token before DB lookup
  v
Neon
  |- users
  |- sessions (token hashes only)
  |- user_bookmarks
  |- user_reading_progress
  '- reader_imports
~~~

Passwords are salted and hashed with Node scrypt. Raw session tokens are generated from cryptographically secure random bytes, stored only in the HttpOnly web cookie, and represented in Neon only by SHA-256 hashes.

## Required auth environment setup

Generate one strong random secret locally and set the same value in both places:

~~~text
Render:
AUTH_PROXY_SECRET=<same secret>

Vercel:
MANGAFLUX_AUTH_PROXY_SECRET=<same secret>
~~~

Do **not** prefix either secret with `NEXT_PUBLIC_`.

The Render health response reports `auth: "configured"` only when both the database and Render auth proxy secret are available. The Vercel account routes also require their corresponding proxy secret.

## Current reader features

- MangaDex search, covers, metadata, authors/artists/tags
- English chapter feed and scanlation attribution
- bounded MangaDex At-Home image proxy
- responsive vertical reader
- Page X / Y tracking and chapter progress bar
- previous/next chapter controls
- data-saver mode
- URL-backed search restoration
- bookmarks
- reading history
- Continue Reading with page resume
- anonymous device persistence
- email/password accounts
- account-backed bookmarks/progress/history
- one-time import of each device library after sign-in

## Security baseline

MangaFlux uses explicit CORS origins, source allowlists, bounded fetches, redirect revalidation, route-specific rate limits, generic error handling, secret scanning, migration checks, typechecks, builds, dependency audits, HttpOnly cookies, account session token hashing, and an internal auth proxy boundary.

See [SECURITY.md](SECURITY.md).

## Known pre-1.0 auth limitation

Email verification and password recovery are not implemented in v0.5.0. Accounts are therefore functional but not yet considered production-complete. Do not reuse a sensitive password.

## Deployment

- Frontend: Vercel at `manga.kenncode.me`
- API: Render at `api.manga.kenncode.me`
- Database: Neon Postgres
- Health/wake: cron-job.org

Render continues to run checked-in migrations before starting the API.

## Roadmap

The next phase is **v0.6–v0.9 V1 stabilization**: large-series chapter pagination, better source health/error UI, auth hardening/recovery planning, optional monitoring, iPhone/accessibility QA, and final security/deployment validation before `v1.0.0`.

V2 remains the multi-source architecture milestone.
