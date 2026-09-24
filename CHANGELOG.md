# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Cache/revalidation review
- Rate-limit scaling review
- Production performance and cold-start hardening
- Optional external error monitoring

## 0.8.2 - 2026-09-24 — Diagnostics & Observability

### Added
- Protected admin runtime diagnostics endpoint.
- Rolling 15-minute request/error/latency metrics.
- Route-level request/error/latency summary using normalized route templates.
- Recent 429/5xx operational failure view.
- API process uptime, Node version, RSS, and heap metrics.
- Runtime diagnostics UI in the admin console.
- Public status indication for whether server-side admin access is configured.

### Privacy / security
- Diagnostics do not store request bodies, query strings, IPs, authorization headers, emails, passwords, tokens, or API keys.
- Runtime diagnostics remain administrator-only.
- Public status reveals only configured/disabled admin state, never allowlisted email addresses.
- Admin authorization remains API-side; setting `ADMIN_EMAILS` only in Vercel does not grant admin access.

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
