# MangaFlux Roadmap

## v0.7.x — Product Experience — complete

- discovery and signed-in dashboard
- chapter scale and reader controls
- community and profiles
- explainable recommendations

## v0.8.x — Reliability + Source Health — current

### v0.8.0 — Reliability & Source Health
- public system-status page
- MangaDex source probe
- Neon persistence probe
- footer status indicator
- transient GET retry/backoff
- Retry-After handling
- request timeouts
- degraded-state status links

### Remaining v0.8.x
- richer operational diagnostics
- optional Sentry production monitoring
- cache/revalidation review
- rate-limit review
- performance and cold-start review
- horizontally-scaled shared rate limiting if/when multiple API instances are introduced

## v0.9.x — V1 release candidate

- iPhone/tablet/desktop regression QA
- accessibility audit
- auth/email/session review
- community/avatar security review
- dependency/migration/security audit
- production smoke tests
- release documentation
- branch/repository cleanup

## v1.0.0 — Stable V1

A stable mobile-first MangaDex reader with discovery, all chapters, verified accounts, recovery, account-backed library/progress, community features, recommendations, accessibility, and production-grade error/security handling.

## v2.0.0 — Multi-source architecture

Source registry, capabilities, unified search, normalized metadata, deduplication, permitted-source fallback, and per-source policies.

## v3.0.0+

Semantic search, smarter recommendations, richer social profiles, PWA/native clients, push/release notifications, and adapter tooling.
