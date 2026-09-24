# MangaFlux Roadmap

## v0.7.x — Product Experience — complete

- discovery and signed-in dashboard
- chapter scale and reader controls
- community and profiles
- explainable recommendations

## v0.8.x — Reliability + Operations — current

### v0.8.0 — Reliability & Source Health
- public system-status page
- MangaDex and Neon health probes
- safe-read retry/backoff
- request timeouts and Retry-After handling

### v0.8.1 — Admin Operations
- server-side admin allowlist
- protected admin console
- operational/account/community overview
- comment removal
- user session revocation

### v0.8.2 — Diagnostics & Observability
- privacy-minimized rolling runtime metrics
- request/error/rate-limit counters
- average and p95 latency
- normalized route diagnostics
- process uptime/memory
- recent 429/5xx visibility
- admin-configuration state on public status

### Remaining v0.8.x
- cache/revalidation review
- rate-limit review
- performance/cold-start review
- optional external error monitoring
- shared rate limiting only if multiple API instances are introduced

## v0.9.x — V1 release candidate

- iPhone/tablet/desktop regression QA
- accessibility audit
- auth/email/session review
- admin/community/avatar security review
- dependency/migration/security audit
- production smoke tests
- branch/repository cleanup
- release documentation

## v1.0.0 — Stable V1

A stable mobile-first MangaDex reader with discovery, all chapters, verified accounts, recovery, account-backed library/progress, community features, recommendations, operations visibility, accessibility, and production-grade error/security handling.
