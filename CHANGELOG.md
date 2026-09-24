# Changelog

All notable changes to MangaFlux are documented here.

The format follows Keep a Changelog, and MangaFlux follows Semantic Versioning.

## Unreleased

### Planned
- Source health/status UI
- Better downstream retry/degraded states
- Production reliability and monitoring work

## 0.7.3 - 2026-09-24 — Recommendations

### Added
- Explicit MangaDex related-title rail where title relations exist.
- MangaFlux "More like this" recommendations on manga details.
- Personalized "Because you read…" dashboard recommendations.
- Metadata recommendation scoring using creator, genre/theme, and release-year signals.
- Creator-filtered discovery.
- Release-year-filtered discovery.

### Changed
- Manga publication status is now clickable.
- Manga release year is now clickable.
- Manga authors are now clickable.
- Manga artists are now clickable.
- Personalized recommendations exclude titles already present in recent reading/bookmarks.
- Final mobile styling pass for recommendation rails and clickable metadata.

### Architecture
- Recommendations remain explainable metadata ranking; no embeddings or external AI service are required.
- MangaDex relation lookup is cached and normalized through the source adapter.

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
