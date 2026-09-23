# MangaFlux Roadmap

This roadmap is directional. Versions follow Semantic Versioning; features can move between releases based on reliability and source-policy requirements.

## v1.0.0 — Stable single-source reader

V1 is complete when a user can reliably search MangaDex, open manga details and chapters, read chapter pages with Page X / Y tracking, navigate back without losing the search, move to previous and next chapters, sign in, bookmark manga, save reading progress in Neon, resume from Continue Reading, use the site comfortably on mobile, and receive clear source errors without raw internal details.

V1 also requires CI, secret checks, rate limiting, caching, and production QA.

## v1.x — Reader polish

Compatible improvements after V1 may include reader themes and width controls, a data-saver toggle, language preferences, chapter pagination, library sorting and collections, source-health messaging, and optional Sentry error monitoring.

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
