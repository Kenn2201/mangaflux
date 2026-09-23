# Architecture

MangaFlux separates the web experience, source acquisition, and user-owned reading state.

1. The Next.js frontend requests normalized metadata through same-origin Next.js routes.
2. Vercel proxies source requests to the MangaFlux Fastify API.
3. The API selects a registered source adapter.
4. Source adapters use bounded HTTPS requests with explicit host allowlists.
5. MangaDex chapter images pass through the bounded MangaFlux image proxy.
6. The browser runtime is not bundled in V1 and its compatibility interface fails closed.
7. Vercel issues an HttpOnly anonymous reader UUID for pre-auth device state.
8. The Fastify persistence API validates that identifier and stores bookmarks/progress in Neon.
9. Neon stores user-owned reading state and cache metadata, not chapter-image archives.

## Source contract

Every adapter implements:

- `search(query)`
- `details(id)`
- `chapters(id)`
- `pages(chapterId)`

## Persistence flow

~~~text
Browser
  |
  | HttpOnly mf_reader_v1 cookie
  v
Next.js state route (Vercel)
  |
  | server-to-server reader UUID
  v
Fastify state API (Render)
  |
  v
Neon / Drizzle
  |- bookmarks
  |- reading_progress
  '- source_cache
~~~

The v0.4 reader UUID is device-scoped convenience state, not authentication. v0.5 replaces this ownership boundary with authenticated sessions.

## Security baseline

- HTTPS only for source acquisition
- explicit source host allowlists
- redirect host revalidation
- bounded response sizes and timeouts
- private/literal source address blocking
- no credentials embedded in source URLs or adapters
- request validation at public API boundaries
- separate metadata/image/state rate limits
- generic client errors with request IDs
- CI secret scan, migration verification, typecheck, build, and dependency audit
- no CAPTCHA/paywall/login/anti-bot bypass logic

See [../SECURITY.md](../SECURITY.md) for operational guidance.
