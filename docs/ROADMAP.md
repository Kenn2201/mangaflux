# MangaFlux Roadmap

This roadmap is directional. Versions follow Semantic Versioning; features can move between releases based on reliability and source-policy requirements.

## v0.4.0 — Neon persistence — current milestone

- Neon/Drizzle database client
- checked-in runtime migrations
- device-scoped HttpOnly reader identity
- bookmarks
- reading progress
- recent-reading history
- Continue Reading with page resume
- migration checks in CI
- no permanent manga-page storage

## v0.5.x — Authentication — next

- signup, login, logout, and secure session handling
- protected user library endpoints
- bind bookmarks/progress/history to authenticated users
- migrate or merge existing device-scoped state after login
- ownership and authorization checks
- session rotation/logout behavior
- account/session security review before release

## v0.6.0–v0.9.x — V1 stabilization

- large-series chapter pagination
- language preferences
- better source/downstream error UI
- source health/status surface
- optional Sentry production error monitoring
- iPhone/mobile QA and accessibility QA
- final security, dependency, migration, and production audit

## v1.0.0 — Stable single-source reader

V1 is complete when a user can reliably search MangaDex, open manga details and chapters, read chapter pages with Page X / Y tracking, navigate back without losing the search, move to previous and next chapters, sign in, bookmark manga, save reading progress in Neon, resume from Continue Reading, use the site comfortably on mobile, and receive clear source errors without raw internal details.

V1 also requires CI, secret checks, rate limiting, caching, migrations, and production QA.

## v1.x — Reader polish

Compatible improvements after V1 may include reader themes/width controls, richer language preferences, chapter pagination/infinite loading, library sorting and collections, source-health messaging, and optional notifications.

## v2.0.0 — Multi-source architecture

V2 is the right time to add additional permitted sources.

Planned concepts:

- source registry with capability manifests
- source health checks
- unified search across enabled providers
- normalized title, author, and identifier matching
- deduplication of the same work across sources
- source selection/fallback when a provider is unavailable
- per-source rate limits and cache policies
- admin/source status page
- additional official/public APIs first; HTML adapters only where permitted
- optional Discord notifications for followed series

If the API grows beyond one Render instance, move rate limiting and hot cache state to shared infrastructure such as Redis/Upstash or an edge layer.

## v3.0.0 and later

Potential later work includes metadata recommendations, semantic search, custom reading lists, release notifications, a PWA/native client, accessibility presets, source diagnostics, adapter test fixtures, and public adapter documentation.
