# MangaFlux Roadmap

MangaFlux follows Semantic Versioning while pre-1.0 milestones are still being completed.

## v0.5.0 — Authentication — current milestone

- email/password signup, login, logout
- salted scrypt password hashing
- opaque HttpOnly account sessions
- session-token hashes stored in Neon
- internal Vercel → Render auth proxy boundary
- account-backed bookmarks/progress/history
- one-time device-library import
- account page and session status
- auth-specific rate limits

Known follow-up: email verification/password recovery are still missing.

## v0.6.0–v0.9.x — V1 stabilization — next

Planned work:

- large-series chapter pagination / incremental loading
- language preference controls
- source health/status UI
- clearer downstream error and retry states
- auth recovery/verification strategy
- session management polish
- optional Sentry production monitoring
- iPhone/mobile regression QA
- accessibility QA
- migration/backward-compatibility QA
- final security/dependency audit
- production smoke tests and release checklist

## v1.0.0 — Stable single-source reader

V1 is complete when users can search MangaDex, browse/read chapters reliably, preserve navigation state, track page progress, move between chapters, sign in, bookmark titles, save and resume account-backed progress, and use the site comfortably on mobile with production-grade error/security handling.

## v1.x — Reader polish

Compatible improvements may include themes, width controls, richer library sorting/collections, notification preferences, and reader customization.

## v2.0.0 — Multi-source architecture

- source registry/capabilities
- health checks
- unified search
- normalized identifiers/metadata
- deduplication
- source selection/fallback
- per-source rate/caching policies
- admin/source status page
- additional permitted APIs/adapters
- optional Discord followed-series notifications

## v3.0.0+

Potential work includes semantic metadata search, recommendations, custom reading lists, release notifications, PWA/native clients, richer accessibility controls, adapter fixtures, and public source-adapter documentation.
