# MangaFlux Roadmap

This roadmap is directional. Versions follow Semantic Versioning; features can move between releases based on reliability and source-policy requirements.

## v0.3.0 — Reader UX — current milestone

- URL-backed search state and restored results on Back
- Page X / Y tracking
- live chapter progress bar
- previous and next chapter navigation
- persistent data-saver reader preference
- mobile reader/header/navigation polish

## v0.4.0 — Neon persistence — next

- wire the Neon database client
- add Drizzle migration tooling and initial migrations
- persist bookmarks
- persist reading history and chapter/page progress
- add Continue Reading
- add safe metadata cache tables where persistence is useful
- keep manga page binaries out of Neon storage

## v0.5.x — Authentication

- signup, login, logout, and session handling
- protected user library endpoints
- bind bookmarks/progress/history to the authenticated user
- ownership and authorization checks
- account/session security review before release

## v0.6.0–v0.9.x — V1 stabilization

- large-series chapter pagination
- language preferences
- better source/downstream error UI
- source health/status surface
- optional Sentry production error monitoring
- iPhone/mobile QA and accessibility QA
- final security, dependency, and production audit

## v1.0.0 — Stable single-source reader

V1 is complete when a user can reliably search MangaDex, open manga details and chapters, read chapter pages with Page X / Y tracking, navigate back without losing the search, move to previous and next chapters, sign in, bookmark manga, save reading progress in Neon, resume from Continue Reading, use the site comfortably on mobile, and receive clear source errors without raw internal details.

V1 also requires CI, secret checks, rate limiting, caching, and production QA.

## v1.x — Reader polish

Compatible improvements after V1 may include reader themes and width controls, richer language preferences, chapter pagination/infinite loading, library sorting and collections, source-health messaging, and optional notifications.

## v2.0.0 — Multi-source architecture

V2 is the right time to add additional permitted sources instead of using another API as a premature fallback.

Planned concepts:

- source registry with capability manifests
- source health checks
- unified search across enabled providers
- normalized title, author, and identifier matching
- deduplication of the same work across sources
- source selection and fallback when a provider is unavailable
- per-source rate limits and cache policies
- admin/source status page
- additional official or public APIs first; HTML adapters only where permitted
- optional Discord notifications for followed series

If the API layer grows beyond one Render instance, move rate limiting and hot cache state to shared infrastructure such as Redis/Upstash or an edge layer.

## v3.0.0 and later

Potential later work includes metadata-based recommendations, semantic search over titles and descriptions, custom reading lists, release notifications, a PWA or native client using the same API, accessibility presets, source diagnostics, adapter test fixtures, and public adapter documentation.

MangaFlux should avoid becoming a permanent manga-file mirror. User-owned state, metadata caches, and site assets belong in MangaFlux storage; upstream chapter images should follow each source's permitted delivery model.
