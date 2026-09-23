# MangaFlux Roadmap

## v0.5.1 — Transactional Email — current patch

- Resend outbound email
- branded verification/reset templates
- email verification
- resend verification
- password recovery
- one-time hashed email tokens
- reset session revocation
- account recovery UI

Resend inbound receiving is enabled externally but is not part of the application yet; a verified inbound webhook can be added later for support workflows.

## v0.6.0–v0.9.x — V1 stabilization — next

- large-series chapter pagination/incremental loading
- language preferences
- source health/status
- better retry/downstream-error UI
- richer session controls
- optional Sentry monitoring
- iPhone/mobile regression QA
- accessibility QA
- final auth/email/security/migration audit
- production smoke tests

## v1.0.0 — Stable single-source reader

Stable MangaDex reader with verified accounts, account-backed library/progress, recovery, mobile usability, and production security/error handling.

## v2.0.0 — Multi-source architecture

Source registry, health checks, unified search, metadata normalization, deduplication, permitted-source fallback, and per-source policies.

## v3.0.0+

Semantic metadata search, recommendations, PWA/native clients, richer accessibility, notifications, and adapter tooling.
