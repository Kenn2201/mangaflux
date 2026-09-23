# Architecture

MangaFlux separates web UX, source acquisition, and persistence/authentication.

## Request path

~~~text
Browser
  |
  v
Next.js / Vercel
  |
  +--> same-origin source/state/auth routes
  +--> HttpOnly reader + account session cookies
  |
  v
Fastify / Render
  |
  +--> source validation/rate limiting/cache
  +--> account/session validation
  +--> bounded MangaDex image proxy
  |
  +--------> Neon / Drizzle
  |
  v
MangaDex API / At-Home
~~~

## Authentication boundary

The browser calls only the MangaFlux web origin for signup/login/logout/session and saved-state operations.

Vercel forwards auth/account requests to Render with a server-only `MANGAFLUX_AUTH_PROXY_SECRET`. Render accepts those routes only when the matching `AUTH_PROXY_SECRET` header is present.

Authenticated account-state requests also include the opaque session token from the HttpOnly cookie. Render hashes that token and performs the Neon lookup by hash.

## Persistence tables

- `bookmarks`: anonymous-device bookmarks
- `reading_progress`: anonymous-device latest manga progress/history
- `users`: account identity/password hash
- `sessions`: session-token hashes and expiry
- `user_bookmarks`: account bookmarks
- `user_reading_progress`: account progress/history
- `reader_imports`: one-time device → account import ledger
- `source_cache`: optional persistent source cache metadata

## Source contract

Every source adapter implements search, details, chapters, and pages.

## Security baseline

- source HTTPS only
- explicit source host allowlists
- redirect host revalidation
- bounded response sizes/timeouts
- request validation
- metadata/image/state/auth rate limits
- generic public errors
- secret scan + migration check + typecheck + build + npm audit in CI
- HttpOnly session identifiers
- salted password hashing
- raw session tokens never stored in Neon
- internal auth proxy boundary
- no CAPTCHA/paywall/login/anti-bot bypass logic

See [../SECURITY.md](../SECURITY.md).
