# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Authentication and account-backed library ownership
- Device-state migration/sync into authenticated accounts
- Large-series chapter pagination
- Final V1 production and mobile QA

## 0.4.0 - 2026-09-24 — Neon Persistence

### Added
- Neon HTTP database client through Drizzle ORM.
- Checked-in Drizzle runtime migration journal and initial persistence migration.
- Automatic migration run before the Render API starts.
- Device-scoped HttpOnly reader identity issued by the Next.js server.
- Neon-backed bookmarks.
- Neon-backed reading progress and recent-reading history.
- Continue Reading card with page resume.
- Bookmark controls on manga details.
- Debounced page-progress saves in the vertical reader.
- Migration journal verification in CI.

### Security
- Reader identifiers remain HttpOnly and are proxied server-to-server by Vercel.
- No account claims are made before authentication exists.
- Persistence endpoints validate reader UUIDs, MangaDex UUIDs, titles, page bounds, and cover hosts.
- Persistence reads/writes have independent API rate limits.
- Database failures return generic persistence errors without leaking connection information.

## 0.3.0 - 2026-09-24 — Reader UX

### Added
- URL-backed search queries so returning from a manga or chapter restores the search and result list.
- Live Page X / Y tracking with IntersectionObserver.
- Sticky chapter progress bar.
- Previous and next chapter navigation with duplicate scanlation entries skipped where possible.
- Reader-wide data-saver toggle stored as a browser preference.

### Improved
- Search clear/reload behavior and preserved query links.
- Reader loading and failure states.
- Small-screen reader header, chapter navigation, manga details, and search controls.

## 0.2.1 - 2026-09-24 — Security Patch

### Security
- Removed the unused browser runtime from the V1 dependency tree.
- Expanded CI to audit the complete dependency tree.
- Verified zero npm vulnerabilities at release time.

## 0.2.0 - 2026-09-24 — Security Preview

### Security
- Added per-IP route rate limiting and strict request validation.
- Hardened HTTPS source fetching and redirect handling.
- Removed raw upstream errors from public responses.
- Added security headers, secret scanning, CI, and Dependabot.

## 0.1.0 - 2026-09-24 — Reader Prototype

### Added
- Next.js frontend and Fastify API.
- MangaDex search, details, chapter listing, At-Home page resolution, and image proxy.
- Vercel, Render, and Neon-ready project structure.
