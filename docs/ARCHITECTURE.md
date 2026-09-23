# Architecture

MangaFlux separates the website from source acquisition.

1. The Next.js frontend requests normalized metadata through same-origin Next.js API routes.
2. The Next.js server proxies metadata requests to the MangaFlux Fastify API.
3. The API selects a registered source adapter.
4. The adapter uses fetchSource for bounded HTTPS, JSON, or HTML requests.
5. MangaDex chapter images are fetched by the MangaFlux API because direct third-party hotlinking is not used.
6. browserSource exists for future permitted browser-required integrations, but it is disabled by default.
7. Neon stores user-owned state and cache metadata, not mirrored chapter archives.

## Source contract

Every adapter implements search, details, chapters, and pages.

## Security baseline

- HTTPS only
- explicit host allowlists
- redirect host revalidation
- bounded response sizes and timeouts
- private or literal address blocking
- no credentials embedded in source URLs or adapters
- browser runtime disabled unless explicitly enabled
- request validation at public API boundaries
- per-IP rate limits
- generic client errors with request IDs
- short-lived in-memory caching to reduce upstream pressure
- CI secret-pattern scan, typecheck, build, and production dependency audit
- no CAPTCHA, paywall, login, or anti-bot bypass logic

See SECURITY.md at the repository root for operational guidance.
