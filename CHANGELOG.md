# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Operational diagnostics and optional production monitoring
- Cache/revalidation and rate-limit review
- Production performance hardening

## 0.8.0 - 2026-09-24 — Reliability & Source Health

### Added
- Public MangaFlux system-status page.
- Cached MangaDex source-health probe with latency reporting.
- Neon persistence-health probe with latency reporting.
- Footer system-status indicator.
- Shared browser reliability helper for safe GET requests.
- Bounded retry/backoff for transient 408, 425, 429, 500, 502, 503, and 504 responses.
- Bounded Retry-After handling and per-attempt timeouts.

### Changed
- Discovery, search, genre, and recommendation reads now retry short transient failures.
- Discovery/search failure states link to the system-status page.
- The API status response distinguishes source, persistence, authentication, and email configuration.
- MangaDex source adapter user-agent/version updated to v0.8.0.

### Reliability
- Source-health checks are cached for 30 seconds to avoid unnecessary upstream traffic.
- Browser retries remain abort-aware so navigation/search cancellation does not create stale requests.
- Lightweight `/health` remains separate from deeper `/api/status` diagnostics.

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
