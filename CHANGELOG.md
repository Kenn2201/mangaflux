# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Neon database client and migrations
- Bookmarks, reading progress, and Continue Reading
- Authentication after persistence endpoints are hardened
- Final V1 production and mobile QA

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
- Manga description width and long-text wrapping.

## 0.2.1 - 2026-09-24 — Security Patch

### Security
- Removed Playwright from the V1 dependency tree because no browser-backed source is currently enabled.
- Changed the browserSource compatibility function to fail closed until a future permitted browser source explicitly reintroduces the runtime.
- Expanded CI to audit both production and development dependencies at high severity or above.
- Verified the complete installed dependency tree reports zero npm vulnerabilities at release time.

## 0.2.0 - 2026-09-24 — Security Preview

### Security
- Added per-IP rate limiting for search, metadata, and image-proxy routes.
- Added strict request validation for UUIDs, query length, language, data-saver flags, and page indexes.
- Hardened source fetching with HTTPS-only URLs, credential rejection, redirect revalidation, response-size limits, and private/literal host blocking.
- Disabled browser-backed source execution by default.
- Removed raw upstream error messages from public API responses.
- Added secure response headers for the API and Next.js frontend.
- Added a repository secret-pattern scanner and CI verification workflow.

### Reliability
- Added short-lived in-memory caches for MangaDex search, details, chapters, and At-Home manifests.
- Added conservative pacing for MangaDex metadata requests to reduce accidental upstream bursts.
- Hardened the MangaDex image proxy with bounded image sizes and host-validated redirects.
- Added Dependabot configuration for weekly npm dependency review.

## 0.1.0 - 2026-09-24 — Reader Prototype

### Added
- Next.js frontend and Fastify API.
- MangaDex search, details, chapter listing, and At-Home page resolution.
- Vercel and Render deployment configuration.
- Neon-ready database schema.
- Manga details, chapter list, and vertical reader UI.
- MangaDex image proxy for anti-hotlink compatibility.
