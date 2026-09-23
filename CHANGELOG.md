# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- URL-backed search state and back-navigation restoration
- Reader page indicator and scroll progress
- Neon migrations, bookmarks, reading progress, and Continue Reading
- Authentication after the security baseline is verified

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

### Documentation
- Added SECURITY.md, VERSIONING.md, and a versioned roadmap.
- Updated README architecture and deployment documentation.

## 0.1.0 - 2026-09-24 — Reader Prototype

### Added
- Next.js frontend and Fastify API.
- MangaDex search, details, chapter listing, and At-Home page resolution.
- Vercel and Render deployment configuration.
- Neon-ready database schema.
- Manga details, chapter list, and vertical reader UI.
- MangaDex image proxy for anti-hotlink compatibility.
