# MangaFlux Roadmap

## v0.7.x — Product Experience — complete

- discovery and signed-in dashboard
- chapter scale and reader controls
- community and profiles
- explainable recommendations

## v0.8.x — Reliability + Operations — complete

### v0.8.0 — Reliability & Source Health
- public system status
- MangaDex/Neon health probes
- safe-read retries, timeouts, Retry-After handling

### v0.8.1 — Admin Operations
- server-side admin allowlist
- protected admin console
- account/community operational controls

### v0.8.2 — Diagnostics & Observability
- privacy-minimized rolling runtime diagnostics
- request/error/rate-limit/latency visibility
- process uptime/memory metrics

### v0.8.3 — Cache, Rate Limits & Performance Hardening
- bounded MangaDex caches
- identical in-flight request coalescing
- cache diagnostics
- public shared-cache policy
- Vercel cache-header propagation
- bounded rate-limit buckets
- RateLimit-Policy headers
- single-instance limiter explicitly retained until scaling requires shared state

## v0.9.x — V1 release candidate — next

- iPhone/tablet/desktop regression QA
- accessibility audit
- auth/email/session review
- admin/community/avatar security review
- dependency/migration/security audit
- production smoke tests
- branch/repository cleanup
- release documentation
- optional external error monitoring decision

## v1.0.0 — Stable V1

A stable mobile-first MangaDex reader with discovery, all chapters, verified accounts, recovery, account-backed library/progress, community features, recommendations, operations visibility, accessibility, and production-grade error/security handling.
