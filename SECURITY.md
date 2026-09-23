# Security Policy

MangaFlux treats public web and API hostnames as public information. The API hostname is not a secret. Credentials, database URLs, auth secrets, provider tokens, and signing keys are secrets and must remain server-side.

## Current supported line

MangaFlux is pre-1.0. Only the latest deployed version is supported for security fixes.

## Secret handling

- Never commit environment files, npm registry credentials, private keys, database URLs with passwords, or platform tokens.
- Never put secrets in variables prefixed with `NEXT_PUBLIC_`.
- Keep `DATABASE_URL` and the future `AUTH_SECRET` in server environment settings only.
- If a credential is ever committed, rotate or revoke it immediately. Deleting it from the current tree does not remove it from Git history.
- `.env.example` must contain placeholders only.

## API hardening

The V1 API uses explicit CORS origins, validation, per-IP rate limits, bounded response sizes/timeouts, HTTPS-only source requests, redirect revalidation, short-lived source caches, generic public errors, and a fail-closed browser-source compatibility interface.

## Pre-auth persistence

v0.4 uses a random HttpOnly browser reader UUID so bookmarks and reading progress can be stored before accounts exist.

This identifier is **not authentication** and must not be treated as proof of account ownership. The pre-auth store contains only manga metadata and reading state: source/manga/chapter IDs, titles, cover URLs, page counts, and timestamps. It should not contain email addresses, names, passwords, tokens, private notes, or other sensitive profile data.

Vercel keeps the anonymous reader UUID out of normal client JavaScript and forwards it server-to-server to the Render persistence endpoints. v0.5 will introduce real authenticated ownership and device-state migration/sync.

## Database

- `DATABASE_URL` is server-only.
- Render runs checked-in Drizzle runtime migrations before API startup.
- CI validates the migration journal and SQL files without using production database credentials.
- Manga chapter image binaries are not stored in Neon.
- Persistence failures return generic errors without connection strings or database internals.

The current in-memory rate limiter is suitable for the single-instance V1 Render deployment. If MangaFlux scales horizontally, move rate limits to shared infrastructure such as Redis/Upstash or an edge/WAF layer.

## Reporting

Do not post working exploits, credentials, or private user data in a public issue. If GitHub private vulnerability reporting is enabled, use the repository Security tab. Otherwise contact the repository owner privately through GitHub before publishing details.
