# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- V1 release-candidate regression and accessibility audit
- Final security/dependency/migration review
- Repository/branch cleanup
- Optional external error monitoring

## 0.8.3 - 2026-09-24 — Cache, Rate Limits & Performance Hardening

### Added
- MangaDex identical in-flight request coalescing.
- Bounded MangaDex cache maps with expired/old-entry eviction.
- Admin diagnostics for MangaDex cache hits, entry count, and deduplicated requests.
- `RateLimit-Policy` response header.
- Bounded in-memory rate-limit bucket storage.
- Shared-cache directives for public source data.
- Vercel public API proxies now preserve safe upstream cache-control headers.

### Changed
- Search responses cache for 30 seconds.
- Discovery/home and chapter-list responses cache for 60 seconds.
- Manga details and related titles cache for 5 minutes.
- Genres/tags cache for 6 hours.
- Public cache responses include `s-maxage` and stale-while-revalidate.
- Error responses remain no-store.
- MangaDex source adapter user-agent/version updated to v0.8.3.

### Security / privacy
- No authenticated state, account data, admin responses, or mutations are publicly cached.
- Cache diagnostics contain counters only and no user/request content.
- The in-memory limiter remains bounded to reduce memory-growth risk.

## 0.8.2 - 2026-09-24 — Diagnostics & Observability
## 0.8.1 - 2026-09-24 — Admin Operations
## 0.8.0 - 2026-09-24 — Reliability & Source Health
## 0.7.3 - 2026-09-24 — Recommendations
## 0.7.2 - 2026-09-24 — Community & Profiles
## 0.7.1 - 2026-09-24 — Chapter Scale & Reader Controls
## 0.7.0 - 2026-09-24 — Discovery & Dashboard
## 0.6.0 - 2026-09-24 — Mobile UX Foundation
## 0.5.1 - 2026-09-24 — Transactional Email
## 0.5.0 - 2026-09-24 — Authentication
## 0.4.0 - 2026-09-24 — Neon Persistence
## 0.3.0 - 2026-09-24 — Reader UX
## 0.2.1 - 2026-09-24 — Security Patch
## 0.2.0 - 2026-09-24 — Security Preview
## 0.1.0 - 2026-09-24 — Reader Prototype
